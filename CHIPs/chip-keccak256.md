CHIP Number   | < Creator must leave this blank. Editor will assign a number.>
:-------------|:----
Title         | keccak256 CLVM operator
Description   | Add a CLVM operator to support Ethereum addresses
Author        | [Arvid Norberg](https://github.com/arvidn)
Editor        | < Creator must leave this blank. Editor will be assigned.>
Comments-URI  | < Creator must leave this blank. Editor will assign a URI.>
Status        | < Creator must leave this blank. Editor will assign a status.>
Category      | Standards Track
Sub-Category  | Chialisp
Created       | 2024-10-25
Requires      | None
Replaces      | None
Superseded-By | None

## Abstract
This CHIP will add a new `keccak256` operator to the CLVM in order to enable the support of Ethereum addresses. This operator could be added in one of two ways, depending on timing:
1. It could be made accessible from behind the `softfork` guard, which would require a soft fork of Chia's consensus.
2. It could be added to the core CLVM, which would require a hard fork.

## Definitions

Throughout this document, we'll use the following terms:
* **Chialisp** - The high-level [programming language](https://chialisp.com/) from which Chia coins are constructed
* **CLVM** - [Chialisp Virtual Machine](https://chialisp.com/clvm), where the bytecode from compiled Chialisp is executed. Also commonly refers to the compiled bytecode itself
* **Keccak-256** - The same hashing standard Ethereum uses. A few notes on this standard:
  * The Keccak-256 standard referred to in this CHIP is specifically version 3 of the [winning submission](https://keccak.team/files/Keccak-submission-3.pdf) to the NIST SHA-3 contest by Bertoni, Daemen, Peeters, and Van Assche in 2011
  * This standard is _not_ the same as the final [SHA-3 standard](https://en.wikipedia.org/wiki/SHA-3), which NIST released in 2015
  * The EVM uses an opcode called `SHA3`, and Solidity has an instruction called `sha3`. However, these _do not_ refer to the final SHA-3 standard. They _do_ refer to the the same `Keccak-256` standard used in this CHIP
  * In order to avoid confusion, we will not use the terms `SHA3`, `sha3`, or `SHA-3` further in this CHIP. Instead, the terms `Keccak-256` and `keccak256` will be used to denote the cryptographic standard used in Ethereum

## Motivation

CLVM currently includes an atomic operator called [`sha256`](https://chialisp.com/operators/#atoms). This operator calculates and returns the SHA-256 hash of the input atom(s).

This CHIP will add an atomic operator to the CLVM called `keccak256`, which will calculate and return the Keccak-256 hash of the input atom(s). The primary reason to add this operator is to support Ethereum addresses, which also rely on Keccak-256.

## Backwards Compatibility

If this CHIP is accepted, the new operator will be added to the CLVM. If the operator could be called directly, it would break compatibility, and therefore would require a hard fork of Chia's blockchain. However, CLVM includes a [softfork operator](https://chialisp.com/operators/#softfork) specifically to define new CLVM operators without requiring a hard fork.

One option for this CHIP is therefore to use `softfork` operator, which itself requires a soft fork of Chia's blockchain. If this method is chosen, then after the the fork's activation, the operator will need to be called from inside the `softfork` guard. It will use a numbered extension, as will eventually be detailed in the [softfork usage](#softfork-usage) section.

Another option is to use a hard fork, which would add the `keccak256` operator to the core CLVM operator set.

As with all forks, there will be a risk of a chain split. The soft fork could also fail to be adopted. This might happen if an insufficient number of nodes have upgraded to include the changes introduced by this CHIP prior to the fork's block height.

If the soft-fork method is chosen, then the operator will be introduced in multiple phases:
* **Pre-CHIP**: Prior to a yet-to-be-chosen block height, the new operator will be undefined. Any attempt to call it will return `NIL`.
* **Soft fork**: A soft fork will activate at the yet-to-be-chosen block. From that block forward, the new operator will exhibit the functionality laid out in this CHIP. It will need to be called from inside the `softfork` guard. 
* **Hard fork** (hypothetical): In the event that a hard fork is enacted after the code from this CHIP has been added to the codebase, this hypothetical hard fork could include adding the operator from this CHIP to the core CLVM operator set. If this were to happen, the operator could be also be called from outside the `softfork` guard. (Note that the operator would still be callable from inside the `softfork` guard if desired.)

If the hard-fork method is chosen, then the operator will immediately be accessible from outside the `softfork` guard (no soft fork will be performed).

## Rationale

This CHIP's design was primarily chosen to support Ethereum addresses. It was implemented in a manner consistent with the Keccak-256 standard.

The new operator will incur a CLVM cost, as detailed below. If this CHIP is adopted, the new operator will be optional when designing Chia coins.

## Specification

### `keccak256`

Opcode: 64

Functionality: Calculate and return the Keccak-256 hash of the input atom(s)

Arguments:
* If zero arguments, the Keccak-256 hash of an empty string will be returned
* If one or more arguments:
  1. Each argument (if more than one) will be concatenated
  2. The Keccak-256 hash of the resulting string will be returned

Usage: `(keccak256 A B …)`

CLVM Cost: `50` base, `160` per argument, `2` per byte

### `softfork` usage

This section will be added if the soft fork method is chosen.

## Test Cases

[todo]

## Reference Implementation

[todo]

## Security

[todo]

## Additional Assets

None

## Copyright
Copyright and related rights waived via [CC0](https://creativecommons.org/publicdomain/zero/1.0/).




