| CHIP Number   | < Creator must leave this blank. Editor will assign a number.>             |
| :------------ | :------------------------------------------------------------------------- |
| Title         | Option Contracts                                                           |
| Description   | Put and call options on the Chia blockchain.                               |
| Author        | [Brandon Haggstrom](https://github.com/Rigidity)                           |
| Editor        | < Creator must leave this blank. Editor will be assigned.>                 |
| Comments-URI  | < Creator must leave this blank. Editor will assign a URI.>                |
| Status        | < Creator must leave this blank. Editor will assign a status.>             |
| Category      | Standards Track                                                            |
| Sub-Category  | Chialisp                                                                   |
| Created       | 2025-03-05                                                                 |
| Requires      | [0020](https://github.com/Chia-Network/chips/blob/main/CHIPs/chip-0020.md) |
| Replaces      | None                                                                       |
| Superseded-By | None                                                                       |

## Abstract

American style put and call options for assets (including securities) can be peer-to-peer minted, traded, and exercised on the Chia blockchain, without intermediaries. This makes use of Chia's powerful coin set model and many existing primitives (including offer files) built on top of it.

## Motivation

With more assets coming to the Chia blockchain, including securities such as the certificates issued by Permuto, it's desirable to not only trade them, but also create an options market around these assets. By composing existing primitives, it shouldn't be too difficult to integrate this into the existing ecosystem.

## Backwards Compatibility

Even though option contract singletons are non-fungible, they don't follow the NFT1 standard. This is for a multitude of reasons:

1. NFTs typically include metadata that are undesirable for on-chain options, including images, off-chain JSON files, and licenses. If excluded, there could be subtle incompatibilities with existing display services and wallets.
2. Option contracts do not need royalties to be paid when traded. Once the premium is paid, it's fully owned by the buyer and up to them what to do with it.
3. NFTs cannot be melted, so using a custom singleton puzzle allows options to be melted instead of burned when they have been exercised.
4. Options don't need the ability to be assigned to DID profiles. In fact, if NFTs were used for options, changing the DID owner or metadata would affect the puzzle and therefore prevent them from being exercised (due to burning the NFT being a requirement). In some cases, this could permanently and unintentionally brick the option.
5. It would be relatively trivial to create a fake NFT that looks like an option contract, but doesn't in fact have the correct details (or any coin locked up in it at all). While display services and wallets could help differentiate between the two, backwards compatibility here would actually lead to misleading buyers. Therefore, this puzzle intentionally makes it so websites and apps have to opt-in to displaying them.

## Rationale

The rationale around the backwards incompatibility with the NFT1 standard is described above. However, there are other aspects that were considered but decided against.

It would have been possible to hard code the underlying coin spend paths as a list of conditions rather than a p2_1_of_n with a p2_singleton and clawback path inside. Although it's conceptually simpler, the p2_1_of_n allows revealing only the spend path you actually use, which can save on cost. The minter also automatically has full custody to spend the coin however they choose after it expires, rather than needing an intermediate spend to send it to their address first.

The metadata is stored once in the singleton launcher, so that intermediate transfers of the singleton don't incur additional cost by repeating the curried metadata in each coin spend. However, it's stored on-chain so that display services and wallets don't need to call centralized APIs or access off-chain information to validate the option and construct the offer file for exercising it.

## Specification

There are several moving parts to this standard, and it's important to get the implementation right. It combines many existing primitives rather than using only new Chialisp.

### Option Contract

The option contract itself is represented as a singleton with a custom inner puzzle (the Chialisp source code for this puzzle is attached). It's an asset that can be owned by a puzzle hash, transferred elsewhere, and traded with offer files.

When the option singleton is minted, the following metadata structure is included in the `key_value_list` parameter of the singleton launcher solution:

```
(expiration_seconds strike_type)
```

Where `strike_type` can be one of the following:

1. XCH `(0 amount)`
2. CAT `(1 asset_id amount hidden_puzzle_hash)`

The `hidden_puzzle_hash` can be optionally set to nil, and requires the requested CAT be wrapped in the revocation layer if specified.

Note that these values are proper nil-terminated lists, in order to leave room for extensions to this standard in the future. For example, NFTs could be supported as a new `strike_type`. However, for now this is limited to XCH and CATs.

### Underlying Coin

The underlying asset is locked in a coin with a p2_1_of_n puzzle. These puzzle members must be included in the merkle tree:

1. The exercise p2_singleton puzzle, controlled by the option contract singleton. For the purposes of standardization, the puzzle used by the reference implementation always follows the Meta Inner Puzzle Spec (MIPS), although this isn't strictly required. Specifically, a singleton member with no restrictions and a nonce of 0. Note, the p2_singleton puzzle itself is not wrapped in any conditions, since this is enforced by the option contract with the precommitted delegated puzzle hash.
2. The clawback puzzle, which is the minter's puzzle hash wrapped in augmented_condition to enforce the `ASSERT_SECONDS_ABSOLUTE` timelock. Essentially, the coin can be arbitrarily spent by the minter after it expires (custody automatically changes hands without any actions being taken).

Memos (including the hint) are optional for the underlying coin, because the coin id is directly curried into the option contract singleton's inner puzzle.

### Delegated Puzzle

The delegated puzzle hash used to exercise the underlying coin is precommitted in the option singleton puzzle. It should be reproducible solely from the `strike_type` metadata parameter.

It's a simple quoted list of these conditions:

1. `(ASSERT_BEFORE_SECONDS_ABSOLUTE expiration_timestamp)`
2. `(ASSERT_PUZZLE_ANNOUNCEMENT payment_announcement_id)`
3. `(CREATE_COIN SETTLEMENT_PAYMENT_HASH amount)`

Note that the created coin does not have a memo. This is because it can instead be added to the final coin created when the taker of the offer sends the coin to themselves.

The announcement id consists of the following, hashed together:

1. The requested settlement puzzle hash. For CATs, this is optionally wrapped in the revocation layer, and then wrapped in the CAT layer.
2. The notarized payment tree hash. The nonce is the launcher id of the option contract singleton, and the payment is made to the `minter_puzzle_hash` with a memo if it's a CAT.

### Exercise Spend

The option contract will be exercised if two conditions are output by the inner puzzle at the same time (in any order):

1. `(CREATE_COIN () -113)`
2. `(SEND_MESSAGE 23 underlying_delegated_puzzle_hash underlying_coin_id)`

The `CREATE_COIN` with `-113` amount is the standard singleton melt condition, which means the singleton will not be recreated after exercising it.

The `SEND_MESSAGE` authorizes the p2_singleton puzzle of the underlying coin to be spent, but it must adhere to the specific delegated puzzle that has been precommitted (according to the section above).

The underlying coin also needs to be manually spent to unlock the funds to the offer settlement puzzle. If either of the coins aren't spent, the other won't be valid (due to the message). The p2_singleton is one path of the p2_1_of_n puzzle used by the underlying coin, and it can be spent using MIPS.

The settlement coin must be claimed by the taker of the offer, and its announcement can be asserted by the conditions output by either the singleton inner puzzle or the coin used to pay the requested payment.

And finally, the requested payment must be made to fulfill the taker's side of the bargain. This allows an atomic swap with an offer file, even though there's a bit more complicated machinery going on under the hood than usual.

### Clawback Spend

The clawback spend path is the most straightforward. The sender's spend needs to be wrapped with the `ASSERT_SECONDS_ABSOLUTE` condition, by using the augmented_condition puzzle.

Other than that, this can be used directly in the p2_1_of_n spend to do whatever the sender wants with the coin after expiration.

### Option Contract Puzzle

This is intended to be used as an inner puzzle to singleton_top_layer_v1_1.

```lisp
(mod (
        MOD_HASH
        UNDERLYING_COIN_ID
        UNDERLYING_DELEGATED_PUZZLE_HASH
        INNER_PUZZLE
        inner_solution
    )

    (include curry.clib)
    (include utility_macros.clib)

    (defconstant CREATE_COIN 51)
    (defconstant SEND_MESSAGE 66)

    (defun-inline wrap_puzzle_hash (MOD_HASH UNDERLYING_COIN_ID UNDERLYING_DELEGATED_PUZZLE_HASH inner_puzzle_hash)
        (curry_hashes MOD_HASH
            (sha256 1 MOD_HASH)
            (sha256 1 UNDERLYING_COIN_ID)
            (sha256 1 UNDERLYING_DELEGATED_PUZZLE_HASH)
            inner_puzzle_hash
        )
    )

    (defun-inline wrap_create_coin (MOD_HASH UNDERLYING_COIN_ID UNDERLYING_DELEGATED_PUZZLE_HASH (inner_puzzle_hash . rest))
        (c CREATE_COIN (c (wrap_puzzle_hash MOD_HASH UNDERLYING_COIN_ID UNDERLYING_DELEGATED_PUZZLE_HASH inner_puzzle_hash) rest))
    )

    ; Wraps CREATE_COIN conditions in the option contract layer
    (defun morph_conditions (MOD_HASH UNDERLYING_COIN_ID UNDERLYING_DELEGATED_PUZZLE_HASH conditions melted exercised)
        (if conditions
            (if (= (f (f conditions)) CREATE_COIN)
                (if (= (f (r (r (f conditions)))) -113)
                    ; Allow melting but make sure it's tracked for later
                    (c
                        (f conditions)
                        (morph_conditions MOD_HASH UNDERLYING_COIN_ID UNDERLYING_DELEGATED_PUZZLE_HASH (r conditions) 1 exercised)
                    )
                    ; Wrap the created coin in the option contract layer
                    (c
                        (wrap_create_coin MOD_HASH UNDERLYING_COIN_ID UNDERLYING_DELEGATED_PUZZLE_HASH (r (f conditions)))
                        (morph_conditions MOD_HASH UNDERLYING_COIN_ID UNDERLYING_DELEGATED_PUZZLE_HASH (r conditions) melted exercised)
                    )
                )
                (if (and (= (f (f conditions)) SEND_MESSAGE) (all
                        (= (f (r (f conditions))) 23) ; Puzzle hash => coin id
                        (= (f (r (r (r (f conditions))))) UNDERLYING_COIN_ID) ; Received by underlying coin id
                    ))
                    (assert (= (f (r (r (f conditions)))) UNDERLYING_DELEGATED_PUZZLE_HASH)
                        ; Make note that the option has been exercised
                        (c
                            (f conditions)
                            (morph_conditions MOD_HASH UNDERLYING_COIN_ID UNDERLYING_DELEGATED_PUZZLE_HASH (r conditions) melted 1)
                        )
                    )
                    (c
                        (f conditions)
                        (morph_conditions MOD_HASH UNDERLYING_COIN_ID UNDERLYING_DELEGATED_PUZZLE_HASH (r conditions) melted exercised)
                    )
                )
            )
            (assert (= melted exercised) ; If melted, must also be exercised and vice versa
                ()
            )
        )
    )

    (morph_conditions MOD_HASH UNDERLYING_COIN_ID UNDERLYING_DELEGATED_PUZZLE_HASH (a INNER_PUZZLE inner_solution) () ())
)
```

## Test Cases

## Reference Implementation

## Security

It's important to verify the authenticity of an option contract before displaying it, since although a singleton may adhere to the correct puzzle, the metadata and underlying coin might not line up as expected. This could mislead people into buying something that should be guaranteed but isn't.

## Additional Assets

None

## Copyright

Copyright and related rights waived via [CC0](https://creativecommons.org/publicdomain/zero/1.0/).
