CHIP Number   | < Creator must leave this blank. Editor will assign a number.>
:-------------|:----
Title         | keccak256 and base64 CLVM operators
Description   | Add CLVM operators to support Ethereum addresses (keccak256) and passkeys (base64).
Author        | [Cameron Cooper](https://github.com/cameroncooper), [Arvid Norberg](https://github.com/arvidn), [Dan Perry](https://github.com/danieljperry)
Editor        | < Creator must leave this blank. Editor will be assigned.>
Comments-URI  | < Creator must leave this blank. Editor will assign a URI.>
Status        | < Creator must leave this blank. Editor will assign a status.>
Category      | Standards Track
Sub-Category  | Chialisp
Created       | 2024-04-26
Requires      | None
Replaces      | None
Superseded-By | None

## Abstract

This CHIP will add three new operators to the CLVM:
* `keccak256` -- for supporting Ethereum addresses
* `base64_encode` -- for Base64 encoding, to support passkeys
* `base64_decode` -- for Base64 decoding

The operators will be accessible from behind the `softfork` guard. Hypothetically, in the event of a planned hard fork, the operators could be added to the core CLVM.

## Definitions

Throughout this document, we'll use the following terms:
* **Chialisp** - The high-level [programming language](https://chialisp.com/) from which Chia coins are constructed
* **CLVM** - [Chialisp Virtual Machine](https://chialisp.com/clvm), where the bytecode from compiled Chialisp is executed. Also commonly refers to the compiled bytecode itself
* **Keccak-256** - The 256-bit encryption standard of the Keccack family, of which [SHA-3](https://en.wikipedia.org/wiki/SHA-3) is a subset
* **Base64** -- A standard for transforming binary data into a sequence of printable characters, drawn from a set of 64 unique characters

## Motivation

CLVM currently includes an atomic operator called [`sha256`](https://chialisp.com/operators/#atoms). This operator calculates and returns the sha-256 hash of the input atom(s).

This CHIP will add an atomic operator to the CLVM called `keccak256`, which will calculate and return the keccak-256 hash of the input atom(s). The primary reason to add this operator is to support Ethereum addresses, which also rely on keccak-256.

This CHIP will also add operators to the CLVM called `base64_encode` and `base64_decode`, which will calculate and return the Base64 encoding/decoding of the input atoms(s). The primary reason to add the `base64_encode` operator is to support passkeys that rely Base64 encoding. `base64_decode` is being added for completeness.

Note that these operators could have other use cases not covered in this CHIP.

## Backwards Compatibility

A few notes regarding this CHIP's compatibility with the current implementation of CLVM:
* The CLVM operators to be added are backwards compatible -- any calls that succeed after the CHIP has been implemented also would have succeeded beforehand.
* The CLVM operators to be added are not forward compatible -- some calls that succeed before the CHIP has been implemented will no longer succeed afterward.
* Because of the forward incompatibility of the operators to be added, this CHIP will require a soft fork of Chia's blockchain.
* The operators to be added are unlikely to be contentious. However, as with all forks, there will be a risk of a chain split.
* The soft fork could also fail to be adopted. This might happen if an insufficient number of nodes have upgraded to include the changes introduced by this CHIP prior to the fork's block height.

The operators will be introduced in multiple phases:
* **Pre-CHIP**: Prior to block `[todo]`, any attempt to call the new operators will result in a successful no-op.
* **Soft fork**: A soft fork will activate at block `[todo]`. From that block forward, the new operators will exhibit the functionality laid out in this CHIP. They will need to be called from inside the `softfork` guard. 
* **Hard fork** (hypothetical): The Chia blockchain currently does not have any planned hard forks. However, in the event that a hard fork is ever enacted, the operators from this CHIP could be added to the core CLVM operator set. If this were to happen, the operators could be also be called from outside the `softfork` guard. (Note that the operators would still be callable from inside the `softfork` guard if desired.)

## Rationale

This CHIP's design was primarily chosen to support Ethereum addresses and passkeys. It was implemented in a manner consistent with the SHA-3/Keccak-256 and Base64 standards.

While the Keccak-256 and Base64 operators are not related, they each require soft forks in order to be made available from inside the `softfork` guard. Therefore, they were grouped together in this CHIP, to be activated with the same soft fork.

Each of the new operators will incur a CLVM cost, as detailed below. If this CHIP is adopted, the new operators will be optional when designing Chia coins.

## Specification

### `keccak256`

Opcode: [todo]

Functionality: Calculate and return the Keccak-256 hash of the input atom(s)

Arguments:
* If zero arguments, the result will be a successful no-op
* If one argument, the Keccak-256 hash of the argument will be returned
* If two or more arguments, each argument will be concatenated, and the Keccak-256 hash of the result will be returned

Usage: `(keccak256 A B …)`

CLVM Cost: `[todo]` base, `[todo]` per argument, `[todo]` per byte

### `base64_encode`

Opcode: [todo]

Functionality: Calculate and return the Base64 encoding of the input atom(s)

Arguments:
* If zero arguments, the result will be a successful no-op
* If one argument, the Base64 encoding of the argument will be returned
* If two or more arguments, each argument will be concatenated, and the Base64 encoding of the result will be returned

Usage: `(base64_encode A B …)`

CLVM Cost: `[todo]` base, `[todo]` per argument, `[todo]` per byte

### `base64_decode`

Opcode: [todo]

Functionality: Calculate and return the Base64 decoding of the input atom(s)

Arguments:
* If zero arguments, the result will be a successful no-op
* If one argument, the Base64 decoding of the argument will be returned
* If two or more arguments, each argument will be concatenated, and the Base64 decoding of the result will be returned

Usage: `(base64_decode A B …)`

CLVM Cost: `[todo]` base, `[todo]` per argument, `[todo]` per byte

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
