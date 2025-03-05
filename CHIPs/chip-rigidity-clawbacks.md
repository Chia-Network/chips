| CHIP Number   | < Creator must leave this blank. Editor will assign a number.>                                            |
| :------------ | :-------------------------------------------------------------------------------------------------------- |
| Title         | Clawback Standard v2                                                                                      |
| Description   | A modern refresh of clawbacks with a finite time period.                                                  |
| Author        | [Brandon Haggstrom](https://github.com/Rigidity)                                                          |
| Editor        | < Creator must leave this blank. Editor will be assigned.>                                                |
| Comments-URI  | < Creator must leave this blank. Editor will assign a URI.>                                               |
| Status        | < Creator must leave this blank. Editor will assign a status.>                                            |
| Category      | Standards Track                                                                                           |
| Sub-Category  | Chialisp                                                                                                  |
| Created       | 2025-03-05                                                                                                |
| Requires      | [0020](https://github.com/Chia-Network/chips/blob/main/CHIPs/chip-0020.md), Condition Options Puzzle CHIP |
| Replaces      | None                                                                                                      |
| Superseded-By | None                                                                                                      |

## Abstract

Now that we have `ASSERT_BEFORE` conditions (for example, `ASSERT_BEFORE_SECONDS_ABSOLUTE`), it's possible to restrict for how long a clawback coin can be reclaimed by its sender. This means that once it expires, the receiver has the assurance that it can't be sent to anyone except themselves, even if they don't explicitly do a spend to claim it. This new clawback standard aims to simplify the process of integrating into wallets while also improving the functionality.

## Motivation

The original clawbacks were designed before `ASSERT_BEFORE_SECONDS_ABSOLUTE` was a condition, so the sender can spend the clawback coin whenever they want up until the receiver manually claims it.

Additionally, clawbacks currently use merkle trees and encode data on-chain using the streamable protocol, both of which complicate the design (making it harder to get widespread adoption beyond the Chia reference wallet) and incur additional cost on-chain.

And finally, it's important to provide an option for when the receiving wallet doesn't support the clawback standard at all (for example exchanges or other incompatible wallets), to prevent coins from being lost or needing to be claimed back by the sender.

## Backwards Compatibility

This is not compatible with the original clawback standard. However, they can both be implemented at the same time. For example, a wallet could choose to only allow receiving and claiming old clawbacks, whereas it could both receive and create new clawbacks.

Due to the two spend paths for forcing the coin through to the intended recipient, it's possible to use these new clawbacks even without completely widespread ecosystem support for them. It would even be possible to create a service for completing stuck clawback transactions. However, it would certainly be ideal if wallets could identify and claim them on their own, hence the importance of making this as simple as possible to implement.

## Rationale

The main alternative design would be to encode these conditions in a custom puzzle rather than using `p2_condition_options`. However, this allows the standard to be relaxed or expanded upon later without much friction, reduces CLVM cost, and makes it easier to audit the Chialisp, at the cost of a bit of complexity in the wallet driver code.

Still, compared to the original design, this is a lot simpler and provides important functionality.

## Specification

Clawbacks are implemented using the `p2_condition_options` puzzle, which essentially provides multiple sets of conditions and allows the spender to pick which set of conditions they want to be output from the puzzle.

Currently, this exact format must be followed in order to be considered a valid clawback puzzle:

1. Recovery
   1. `(RECEIVE_MESSAGE 23 1 sender_puzzle_hash)`
   2. `(CREATE_COIN sender_puzzle_hash amount)`
   3. `(ASSERT_BEFORE_SECONDS_ABSOLUTE seconds)`
2. Force
   1. `(RECEIVE_MESSAGE 23 0 sender_puzzle_hash)`
   2. `(CREATE_COIN receiver_puzzle_hash amount)`
3. Finish
   1. `(CREATE_COIN receiver_puzzle_hash amount)`
   2. `(ASSERT_SECONDS_ABSOLUTE seconds)`

However, the exception to this format is for hinted coins. If the clawback puzzle is being used as an inner puzzle to a CAT, NFT, or otherwise wrapper coin, this generally implies that a hint should be used for created coins. Therefore, each of the `CREATE_COIN` conditions in the above template should include a single memo with the same value as the puzzle hash, which is a hint as described by [CHIP-0020](https://github.com/Chia-Network/chips/blob/main/CHIPs/chip-0020.md).

### Recovery

The recovery spend path enforces that the sender is authorizing the spend with the `RECEIVE_MESSAGE` from their puzzle hash. A flag of `23` means the sender is the provided puzzle hash, and the receiver is this specific clawback coin. The `0` or `1` message indicates whether it's to force the spend through or for recovery, in order to prevent the transaction from being modified by anyone maliciously.

Recovery can only be done until the clawback window expires (enforced by the `ASSERT_BEFORE_SECONDS_ABSOLUTE` condition).

Finally, the coin is spent and the `CREATE_COIN` condition makes a new one with the sender's puzzle hash, effectively reversing the transaction.

It's important to note that the sender needs to spend a coin with the exact `sender_puzzle_hash` specified, and this coin must send a message to the clawback coin. If they don't have a coin with this puzzle hash already, they have two options:

1. Spend an XCH coin with a different `p2_puzzle_hash` in order to create an intermediate coin with the correct `sender_puzzle_hash`. Then, spend this intermediate coin to send the message.
2. Or, spend the clawback, which inherently creates a coin with `sender_puzzle_hash`. Then, spend that ephemerally to both send the message and claim it to your puzzle hash again. This works even if the sender doesn't have any coins in their wallet anymore (however, if fees need to be paid for the transaction, this wouldn't particularly help). It's also important to note that this trick would _not_ work for CATs, NFTs, or any other coin implicitly wraps the puzzle hash in an outer puzzle, since the coin's puzzle hash wouldn't be equal to `sender_puzzle_hash` and the message would fail.

### Force

The force spend path allows the sender to change their mind and directly send the coin to the receiver. Unlike recovery, this can be done without any timelock requirements, since either way the receiver gets the coin as intended.

This spend path is useful for if the sender realizes that the receiver is correct but they don't support clawbacks, or if they simply don't want to wait the full duration to claim the coin.

However, to prevent someone from maliciously revoking the sender's right to recover the funds, this spend path can also only be done with authorization from the sender. It uses an identical `RECEIVE_MESSAGE` condition, except with a message of `0` instead of `1` as described in the recovery section above.

The sender will need to spend a coin with the correct `sender_puzzle_hash`, and with this path there's no way to use the "child authorizes parent" trick, since the sender isn't getting any coins.

### Finish

Finally, the finish spend can be initiated by anyone _after_ the clawback expires (which is enforced with `ASSERT_SECONDS_ABSOLUTE`). It simply sends the coin to the receiver without any authorization being needed.

In most cases, it's expected that the receiver will be able to do this themselves, and optionally pay fees to do so. However, it's also an "escape hatch" for the scenario in which the receiving wallet doesn't support claiming the clawback on its own. Someone else (including the sender) can perform this spend for them.

### UX

Ultimately, to a user these spend paths should be hidden away as an implementation detail. The sender has the option to clawback until the expiration, and always has the option to push it through to the receiver. And the receiver has the option to claim after it expires, but can see it pending until then.

## Test Cases

There are [several tests for clawback v2](https://github.com/xch-dev/chia-wallet-sdk/blob/be9d6c98a02786ae8ba867e3ab7f4f0541a4fa60/crates/chia-sdk-driver/src/layers/clawback_layer.rs) spanning:

1. Recovery, where the coin is clawed back to the sender
2. Force, where the coin is pushed through by the sender to the receiver
3. Finish, where anyone can send the coin to the receiver
4. All of the above for the CAT primitive in addition to XCH

## Reference Implementation

There is an implementation of the driver code for the [clawback layer](https://github.com/xch-dev/chia-wallet-sdk/blob/be9d6c98a02786ae8ba867e3ab7f4f0541a4fa60/crates/chia-sdk-driver/src/layers/clawback_layer.rs) in the chia-wallet-sdk.

## Security

The condition options have been carefully crafted such that malicious farmers or mempool observers:

1. Cannot change which option is being used in the solution
2. Cannot use a message for the wrong clawback coin or spend path
3. Cannot interfere with recovery by means of creating a new spend which replaces the old one (which would be a form of DoS attack), without proper authorization
4. Cannot force the sender's hand on which action is taken

However, censorship is always a concern when it comes to things like this. Although unlikely to be an issue, it's ideal to perform the recovery spend well in advance of the expiration timestamp to minimize any games being played. This is a good idea anyways, since the timestamp can be a little bit off what you may expect when making the transaction (especially since it refers to the previous block, not the current one).

## Additional Assets

None

## Copyright

Copyright and related rights waived via [CC0](https://creativecommons.org/publicdomain/zero/1.0/).
