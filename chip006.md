# Cross-input BLS Aggregation

## Abstract

## Motivation

Signatures take up a large portion of each block. Most Bitcoin transactions contain at least on signature. Bitcoin's serialized ECDSA signatures are approximately 65 bytes. As such, signatures are a non-trivial amount of storage and transmission overhead. BLS signatures are shorter than ECDSA signatures, and support signature aggregation, in which multiple signatures are combined and can be represented as a single signature.

## Specification

ECDSA signatures are disabled. This includes `OP_CHECKSIG`, `OP_CHECKSIGVERIFY`, `OP_CHECKMULTISIG`, and `OP_CHECKMULTISIGVERIFY`.

Signatures in witnesses/witness infos are aggregate across the transaction into a single signature. A new opcode to support this is introduced: `OP_BLSAGGREGATE`. This opcode adds pubkeys and messages to an aggregate signature verification staging area. This area enforces that messages cannot repeat.

When executing scripts, `OP_BLSAGGREGATE` pops one argument from the stack. These MUST be the BLS pubkey. `OP_BLSAGGREGATE` causes script execution to fail if the pubkey is malformed. The B12-381 pairing of the signed message (the SHA256 hash of the witness info mapped onto an element of g_1) and the pubkey is computed immediately and cached in the transaction aggregator.

The computational cost of `OP_BLSAGGREGATE` is one pairing for the first pubkey, plus one pairing and one g_t multiplication for each additional pubkey.

`OP_BLSAGGREGATEFROMSTACK` works similarly. It takes two arguments: a message hash mapped to an eliptic curve point and a pubkey.

The aggregator keeps a set of messages, to ensure uniqueness. After all scripts have been executed, the aggregate signature is paired with the generator point of g_2, and the result is compared to the cached aggregate message/pubkey pairing. If they are not equal, transaction validation fails.
