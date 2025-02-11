CHIP Number   | < Creator must leave this blank. Editor will assign a number.>
:-------------|:----
Title         | Meta Inner Puzzle Spec (MIPS)
Description   | A specification for how to arrange, develop, and memoize custody puzzles from a high-level perspective
Author        | [Matt Hauff](https://github.com/Quexington)
Editor        | [Dan Perry](https://github.com/danieljperry)
Comments-URI  | < Creator must leave this blank. Editor will assign a URI.>
Status        | < Creator must leave this blank. Editor will assign a status.>
Category      | Standards Track
Sub-Category  | Primitive
Created       | 2025-02-11

## Abstract

So-called "inner" puzzles, or puzzles that deal with individual custody of assets (defined by their "outer" puzzle) are heretofore lawless in their definition and requirements. The semi-standard practice is to make a puzzle that accepts in its solution a "delegated puzzle" to run, and to return the conditions of this delegated puzzle in addition to conditions that assert the identity of the "owner" of the coin. This is the guideline, but is not always followed even so. In addition to this functionality, there's a lot more functionality that can be asked of a puzzle at a higher level than its implementation. It's somewhat unreasonable to _hope_ that all implementors know about and support all of these features. This CHIP provides an outline of these desired features, as well as a specification of a framework for puzzle developers to obtain these features for "free" when imagining new types of custody.

## Motivation

The motivation for this proposal is twofold: to unify the high-level requirements for coin custody, and to provide a framework in which developers can make new types of custody without having to worry about supporting these high-level requirements. This will also allow wallets to partially parse inner puzzles that follow the spec without needing a driver for every puzzle involved. Instead, they only need to identify that a coin follows this spec, after which the on-chain memos can give them everything they need to spend the coin so long as they have drivers for _any_ valid set of members who can spend the puzzle.

## Backwards Compatibility

This specification is not backwards compatible with any existing inner puzzles. You can think of all existing inner puzzles as following a default "lawless" specification where you have to parse them based on a puzzle hash and examination of their parent spend. Making a specification at this point that supports more while still being able to parse these puzzles would be difficult if not impossible.

Thought has been put in, however, to _future_ backwards compatibility. As the list of features I'm about to suggest will likely not be exhaustive, the spec does include a hook for a coin to specify which spec it's conforming to so that wallets can route parsing to the correct drivers should they exist.

## Rationale

The rationale for this change is largely given in the abstract. This design was worked towards from a more complicated starting and slowly simplified until it resembled something like the design of CLVM, which is actually kind of neat. There are more details in the [Specification](#specification) section, but MofN puzzles are analogous to cons boxes, and member puzzles are analogous to atoms, with two additional attributes you can optionally apply to either. The similarity gives me a relatively high degree of confidence that the design is well informed and general enough to support a broad range of use cases.

As for alternative designs, I didn't really consider any others that support similar functionality, but I did draw an arbitrary line at functionality to support for the current iteration. The biggest potential future item to support that I have chosen not to support in this spec is the ability to have global state that any member puzzle can access/edit. This would add a significant degree of complexity and I'd like to see how far the current design can go without that for now.

## Specification

### Terminology

I'm going to start by defining terminology since this can often get confusing when we're talking about Chialisp puzzles:

* An **inner** puzzle is a reference to this whole spec and recursions of it inside itself. This includes the (defined shortly) MofN/Member puzzle + its restrictions + its nonce.
* A **delegated** puzzle is a puzzle that will be run once it has been authorized according to the requirements specified in the inner puzzle. It can be of any form and can take any type of **delegated solution**.
* A **member** puzzle is a terminal node in the tree that makes up an inner puzzle. It describes one way in which a delegated puzzle can be authorized, for example by signature or by singleton announcement. It can be of any form except that it will be required to take the delegated puzzle hash as its first solution argument.
* An **MofN** puzzle is a puzzle that takes a **Merkle root** of N puzzles and a value for M. When the puzzle is run, it will require that you reveal M inner puzzles (_inner_ NOT _member_) which will each have to approve the delegated puzzle.
* A **restriction** puzzle is a puzzle that enforces constraints on what an inner puzzle can approve and how it can approve it. There are two types of restrictions, both "validators" (not allowed to return conditions):
  * **delegated puzzle validators** which look at the delegated puzzle hash and optionally raise. This is used to restrict what actions an inner puzzle is able to approve.
  * **condition validators** which look at the set of conditions returned by the inner puzzle and optionally raise. This is used to place restrictions on how members are allowed to approve the delegated puzzle. In practice, this type of restriction is likely somewhat rare as you usually know exactly how members approve things when you set up the custody arrangement. For more complex types of custody, however, it may be desirable to allow a certain subtree to be flexible within itself as long as it follows a set of rules.
* A **nonce** is an extra value (usually a small integer) that helps inner puzzles with otherwise similar custody arrangements have difference puzzle hashes. This has been noted to be useful for cases like coin splitting and address namespacing. Every inner puzzle is _required_ to have a nonce but the scheme for generating this nonce is up to the individual wallet. From a wallet perspective, puzzles should be able to use nonces in their construction as this adds additional privacy capabilities to the puzzle.
* The **next puzzle** is a relative term to describe the puzzle that is not a restriction inside of the _inner_ puzzle. It might be an MofN or it might be a member puzzle, so we need a term that abstracts at that level.
* A **full puzzle hash** can be applied to any of the puzzles above to mean the hashes of the puzzle that must be revealed on chain to run them. This includes all curried arguments. It can be contrasted with a so called "mod" hash which only contains the puzzle structure without any currying.

### Construction Drivers

To construct an inner puzzle, a wallet should have a driver which includes:
* The nonce of the inner puzzle
* A list of restrictions applied to the inner puzzle (and what type they are)
* Either a member puzzle or an MofN puzzle

To construct an MofN puzzle, a wallet should have a driver which includes:
* The M value
* A list of _inner_ puzzles (again, NOT _member_. This allows the spec to recurse into arbitrarily complex custody arrangements)

### Memo spec

In order for wallets to be able to sync these inner puzzles from the blockchain, coin creations can leave a standard format of memo on chain. This memo goes _after_ the hint in the third argument to `CREATE_COIN` (e.g. `(CREATE_COIN puzhash amount (hint . <this memo spec>))`). The format is as follows:
```
; For "inner" puzzles
(
  <TBD namespace>
  (
    nonce
    <list of restriction hints>
    <1 if next puzzle is MofN and 0 if next puzzle is a Member>
    <hint for next puzzle (defined shortly for both types)>
  )
)

; For restriction hints
(
  <0 if restriction type is validator and 1 if restriction type is morpher>
  <full puzzle hash of the restriction>
  <arbitrary memo for restriction puzzle generation>
)

; For member puzzles
(
  <full puzzle hash of the member>
  <arbitrary memo for member puzzle generation>
)

; For MofN puzzles
(
  <m value>
  <list of memos for the n inner puzzles involved>
)
```
While this spec may seem quite large, in practice many of these values are single atoms and the memos, for simple puzzles are quite small.

### Chialisp

There are four main puzzles that enable this framework:
* The standard MofN puzzle: [m_of_n.clsp](https://github.com/Chia-Network/chia-blockchain/blob/quex.multi_sig_chialisp_drivers/chia/wallet/puzzles/custody/architecture_puzzles/m_of_n.clsp)
* The standard restriction "runner": [restrictions.clsp](https://github.com/Chia-Network/chia-blockchain/blob/quex.multi_sig_chialisp_drivers/chia/wallet/puzzles/custody/architecture_puzzles/restrictions.clsp)
* A top level "delegated puzzle feeder" which handles the running/hashing of the delegated puzzle before it starts getting passed down to member puzzles: [delegated_puzzle_feeder.clsp](https://github.com/Chia-Network/chia-blockchain/blob/quex.multi_sig_chialisp_drivers/chia/wallet/puzzles/custody/architecture_puzzles/delegated_puzzle_feeder.clsp)
* A thin wrapper that adds the nonce to the puzzle reveal but does nothing else: `(mod (INDEX INNER_PUZZLE . inner_solution) (a INNER_PUZZLE inner_solution))`

You construct an inner puzzle with the nonce wrapper on the far outside with a restriction runner inside and a MofN/Member puzzle inside of that.

#### Member puzzles

As mentioned in the compatibility section, existing puzzles that would serve the role of member puzzles in this framework do not fit neatly into this framework. Inside of an MofN, it's far more efficient to assume the member puzzles are of a certain format and to feed them the delegated puzzle than it is to allow them to be of any form. For this reason, member puzzles have exactly one restriction placed on their form, which is that they must accept the delegated puzzle hash as the first argument of their not-curried solution like so:
```
(mod
  (
    CURRIED_1
    CURRIED_2
    delegated_puzzle_hash ; forced by framework
    other_solution_value_1
    other_solution_value_2
  )
  
  ...
)
```

### Optimizations

You may be thinking, "Puzzles I use today don't need restrictions or MofN capability so this is a lot of overhead for the most basic cases". You would be correct. If we were developing a framework for "outer" puzzles, we would want to accommodate as much functionality as possible without concern for overhead because their universal nature makes them much harder to upgrade, and allowing people to turn certain capabilities off actually defeats the purpose of the framework in the first place.

However, we are not dealing with "outer" puzzles, we are dealing with puzzles which belong to a single user and can be upgraded/modified at their convenience so long as they know how to sync it later. This means that while the full hint spec above is necessary to give you an outline of the semantic structure, the _actual_ structure can be constructed on a case-by-case basis. This opens the door for optimizations during puzzle construction and so long as these optimizations are uniformly applied across certain types of inner puzzle structures, they require no additions in on chain memoization. Said otherwise, certain memo structures can _imply_ certain optimizations:
  * An MofN where M=1 does not need all of the overhead associated with proving multiple puzzles at the same time. We can develop a more streamlined 1ofN puzzle that we use instead of the standard MofN puzzle. (Implementation: TBD)
  * Similarly, M=N has no need for the Merkle-ization of the puzzles because they will all necessarily be revealed. We can use a puzzle that just includes the members verbatim to avoid having to hash them. (Implementation: TBD)
  * When no restrictions are present, there's no need to wrap the MofN/Member in the restriction runner that will just be passed through.
  * (Potentially) Stacked MofNs where one of the M puzzles is itself an MofN could prevent the overhead of two MofN puzzles in favor of a slightly more complex one that knows how to deal with further MofNs contained within it. (Implementation: TBD)

## Test Cases

Test cases for this CHIP can be found on the `Chia-Network` GitHub site, in [test_custody_architecture.py](https://github.com/Chia-Network/chia-blockchain/blob/quex.multi_sig_chialisp_drivers/chia/_tests/clvm/test_custody_architecture.py).

## Reference Implementation

This CHIP has been implemented on the `Chia-Network` GitHub site, in [custody_architecture.py](https://github.com/Chia-Network/chia-blockchain/blob/quex.multi_sig_chialisp_drivers/chia/wallet/puzzles/custody/custody_architecture.py).

## Security

The relevant Chialisp has not been audited yet but it was kept as simple as possible for both optimization and security purposes. The less complexity that we lean on the Chialisp for, the more patch-able any issues are. In addition, these puzzles don't necessarily have the same weight of concern placed behind them as "outer" puzzles do because they are not definitions that are difficult to supplant and therefore requiring general buy-in to change. Any individual user of an "inner" puzzle can change it whenever they want (so long as they have allowed themselves) and therefore if issues do crop up, an upgrade requires only a user's own initiative.

## Additional Assets

None

## Copyright
Copyright and related rights waived via [CC0](https://creativecommons.org/publicdomain/zero/1.0/).
