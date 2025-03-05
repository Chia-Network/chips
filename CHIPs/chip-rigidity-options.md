CHIP Number   | < Creator must leave this blank. Editor will assign a number.>
:-------------|:----
Title         | Condition Options Puzzle
Description   | <A short, single-sentence description of this CHIP. Maximum 140 characters.>
Author        | [Brandon Haggstrom](https://github.com/Rigidity), [Cameron Cooper](https://github.com/cameroncooper)
Editor        | < Creator must leave this blank. Editor will be assigned.>
Comments-URI  | < Creator must leave this blank. Editor will assign a URI.>
Status        | < Creator must leave this blank. Editor will assign a status.>
Category      | Standards Track
Sub-Category  | Primitive
Created       | 2025-03-05
Requires      | None
Replaces      | None
Superseded-By | None

## Abstract

This provides a very simple puzzle that can be used to create coins that have multiple spend paths with predefined behavior.

## Motivation

Option contracts and clawbacks both need to commit to a few sets of possible conditions beforehand. Creating a custom puzzle for each use case would likely slightly increase on-chain cost (due to needing to curry arguments and calculate things at runtime), and would certainly mean more Chialisp to maintain and audit. One could instead use this puzzle, which acts as a template for such use cases.

## Backwards Compatibility

Given that this is a new Chialisp puzzle, wallets will have to support it in order to benefit from things built on top of it.

Additionally, while this primitive doesn't mandate a particular memo structure, it's likely that use cases built on top of it will require memos, and this is something that should be kept in mind as the complexity and quantity of memos increases for nested puzzle layers. Display of user specified memos could be affected.

## Rationale

The main reason for this design is that it's very simple both on-chain and conceptually. There are a variety of things that can be done with it.

The alternative would be creating new puzzles for option contracts and clawbacks. But using this primitive for them seems to be a reasonable approach.

## Specification

This is the Chialisp source code for `p2_condition_options.clsp`:

```lisp
; this puzzle takes a list of conditions lists and lets the spender select which one to use
(mod (CONDITIONS_OPTIONS option_index)
    ; helper to pick an item from a list
    (defun select (items idx)
        (if items
            (if idx
                (select (r items) (- idx 1)) ; continue to get the selected index
                (f items) ; idx 0 returns first element
            )
            (x) ; no items to choose from
        )
    )
    ; entry point
    (select CONDITIONS_OPTIONS option_index)
)
```

## Test Cases

Although the primitive itself is quite small, there is a [test for it](https://github.com/xch-dev/chia-wallet-sdk/blob/be9d6c98a02786ae8ba867e3ab7f4f0541a4fa60/crates/chia-sdk-driver/src/layers/p2_condition_options_layer.rs).

## Reference Implementation

There is an implementation of the driver code for the [p2_condition_options layer](https://github.com/xch-dev/chia-wallet-sdk/blob/be9d6c98a02786ae8ba867e3ab7f4f0541a4fa60/crates/chia-sdk-driver/src/layers/p2_condition_options_layer.rs) in the chia-wallet-sdk.

## Security

There aren't really any security considerations to this other than making sure the memos are properly structured to prevent losing the ability to spend coins, and that individual use cases should keep in mind that farmers or mempool observers may modify the solution to pick a different option unless otherwise restricted by the conditions contained within.

## Additional Assets

None

## Copyright

Copyright and related rights waived via [CC0](https://creativecommons.org/publicdomain/zero/1.0/).
