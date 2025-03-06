| CHIP Number   | 0044                                                                       |
| :------------ | :------------------------------------------------------------------------- |
| Title         | Clawback Standard v2                                                       |
| Description   | A modern refresh of clawbacks with a finite time period.                   |
| Author        | [Brandon Haggstrom](https://github.com/Rigidity)                           |
| Editor        | [Dan Perry](https://github.com/danieljperry)                               |
| Comments-URI  | [CHIPs repo, PR #150](https://github.com/Chia-Network/chips/pull/150)      |
| Status        | Draft                                                                      |
| Category      | Standards Track                                                            |
| Sub-Category  | Chialisp                                                                   |
| Created       | 2025-03-05                                                                 |
| Requires      | [0020](https://github.com/Chia-Network/chips/blob/main/CHIPs/chip-0020.md) |
| Replaces      | None                                                                       |
| Superseded-By | None                                                                       |

## Abstract

Now that we have `ASSERT_BEFORE` conditions (for example, `ASSERT_BEFORE_SECONDS_ABSOLUTE`), it's possible to restrict for how long a clawback coin can be reclaimed by its sender. This means that once it expires, the receiver has the assurance that it can't be sent to anyone except themselves, even if they don't explicitly do a spend to claim it. This new clawback standard aims to simplify the process of integrating into wallets while also improving the functionality.

## Motivation

The original clawbacks were designed before `ASSERT_BEFORE_SECONDS_ABSOLUTE` was a condition, so the sender can spend the clawback coin whenever they want up until the receiver manually claims it.

Clawbacks currently encode data on-chain using the streamable protocol, which complicates the design a bit and incurs additional cost on-chain.

Finally, it's important to provide an option for when the receiving wallet doesn't support the clawback standard at all (for example exchanges or other incompatible wallets), to prevent coins from being lost or needing to be claimed back by the sender.

## Backwards Compatibility

This is not compatible with the original clawback standard. However, they are similar and could both be implemented at the same time. For example, a wallet could choose to only allow receiving and claiming old clawbacks, whereas it could both receive and create new clawbacks.

Due to the spend path for forcing the coin through to the intended recipient, it's possible to use these new clawbacks even without completely widespread ecosystem support for them. It would even be possible to create a service for completing stuck clawback transactions. However, it would certainly be ideal if wallets could identify and spend them on their own, hence the importance of making this as simple as possible to implement.

## Rationale

Clawback v2 was originally designed using a list of preset conditions that could be picked from in the solution, but the new design is simpler as it requires fewer coin spends. Instead of receiving a message from a puzzle hash, we can simply embed the sender and receiver puzzle inside of the clawback's merkle tree.

An alternative would be to create a new puzzle specifically for clawbacks, but there isn't really any functionality that would be gained by doing that rather than using 1 of N. It's also easier to audit, and to extend the functionality with minimal changes to the driver code later on.

## Specification

Clawbacks are implemented using the `p2_1_of_n` puzzle, which is a merkle tree of spend paths. Only the merkle root, the specific puzzle you want to spend, and the proof is revealed on-chain, which makes it very efficient by not including code that never gets executed.

The following spend paths are included:

1. Sender
2. Receiver
3. Push-through

The sender path is the sender's puzzle prepended with the `(ASSERT_BEFORE_SECONDS_ABSOLUTE seconds)` condition, using the standard `augmented_condition` puzzle (which was used by the old clawback standard as well).

The receiver path is similarly the receiver's puzzle prepended with the `(ASSERT_SECONDS_ABSOLUTE seconds)` condition.

And finally, the push-through path is a static quoted list of these conditions:

1. `(ASSERT_SECONDS_ABSOLUTE seconds)`
2. `(CREATE_COIN receiver_puzzle_hash amount)`

If the clawback is being used as an inner puzzle to a CAT, NFT, or otherwise wrapped coin, this generally implies that a hint should be used for created coins. Therefore, the above `CREATE_COIN` condition should include a single memo with the `receiver_puzzle_hash` in this case, which is a hint as described by [CHIP-0020](https://github.com/Chia-Network/chips/blob/main/CHIPs/chip-0020.md). If other memos are required (which they won't be in the described examples), just make sure that they can be properly determined by wallets.

### Recovery

The sender can spend the clawback before the timelock expires, to send it back to their puzzle hash.

### Force

Because the sender can spend the clawback arbitrarily before the timelock expires, they can also choose to send it to the receiver early, perhaps because they have verified that the puzzle hash is correct.

This option is also useful if the sender realizes that the receiver is correct but they don't support clawbacks.

### Claim

The receiver can spend the clawback after the timelock expires, and do whatever they want with it. For example, they could send it to their puzzle hash so it's no longer wrapped in the clawback puzzle. Or, they could choose to leave it around and spend it as part of a regular transaction, in order to save on transaction cost.

### Push Through

The clawback can also be spent by _anyone_ after the clawback expires, but in this spend path they don't get to choose how it's spent. It will always enforce the timelock expired and send the coin directly to the receiver's precommitted puzzle hash.

In most cases, it's expected that the receiver will be able to spend it themselves, and thus not need to use the push through path. However, it's useful as an "escape hatch" for when the receiving wallet doesn't support claiming the clawback on its own. Someone else (including the sender) can perform this spend for them, and there could even be services to do so and add fees for convenience.

### Clawback Memos

There is a memo structure that's used to reconstruct the clawback information:

```lisp
(sender_puzzle_hash seconds)
```

This memo is intended to live in the slot after the hint. So therefore this would look like this:

```lisp
(receive_puzzle_hash (sender_puzzle_hash seconds))
```

Where `receiver_puzzle_hash` is the hint.

Note that although the `CREATE_COIN` condition in the clawback _optionally_ include a hint, depending on whether it's XCH or a wrapped asset like a CAT, the clawback coin itself must always be hinted, otherwise the receiver won't be able to easily find the coin.

The memos are intentionally a list, rather than a cons pair, to make it easier to extend the standard with more options in the future if desired.

### UX

Ultimately, to a user these spend paths should be hidden away as an implementation detail. The sender has the option to clawback until the expiration, and always has the option to push it through to the receiver. And the receiver has the option to spend after it expires, but can see it pending until then.

## Test Cases

There are [several tests for clawback v2](https://github.com/xch-dev/chia-wallet-sdk/blob/6aacdde350a0365f980a9224134bcf1852db4d8e/crates/chia-sdk-driver/src/primitives/clawback_v2.rs) spanning:

1. Recovery, where the coin is clawed back to the sender
2. Force, where the coin is sent to the receiver by the sender
3. Finish, where the receiver spends the clawback directly
4. Push-through, where anyone can send the coin to the receiver
5. All of the above for the CAT primitive in addition to XCH

## Reference Implementation

There is an implementation of the driver code for the [clawback layer](https://github.com/xch-dev/chia-wallet-sdk/blob/6aacdde350a0365f980a9224134bcf1852db4d8e/crates/chia-sdk-driver/src/primitives/clawback_v2.rs) in the chia-wallet-sdk.

## Security

The old clawback standard always allowed the coin to be spent (and clawed back) by the sender. As a user it's important to make sure to make sure you're fine with sending the funds prior to the clawback expiration. If not, it should be clawed back.

Censorship is a concern when it comes to things like this. Although unlikely to be an issue, it's ideal to perform the recovery spend well in advance of the expiration timestamp to minimize any games being played. This is a good idea anyways, since the timestamp can be a little bit off what you may expect when making the transaction (especially since it refers to the previous block, not the current one).

Because the push-through spend path can be spent by anyone without authorization, it could theoretically be used to mess with a pending transaction by replacement (though only once, because the push-through spend removes the clawback puzzle). Thankfully, the superset rule should prevent any griefing that could be done with this, since all of the original spend bundle's input coins must also be spent in the replacement spend bundle.

## Additional Assets

None

## Copyright

Copyright and related rights waived via [CC0](https://creativecommons.org/publicdomain/zero/1.0/).
