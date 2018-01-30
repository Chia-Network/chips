# Cross-input BLS Aggregation

## Abstract

## Motivation

Signatures take up a large portion of each block. Most Bitcoin transactions contain at least on signature. Bitcoin's serialized ECDSA signatures are approximately 65 bytes. As such, signatures are a non-trivial amount of storage and transmission overhead. BLS signatures are shorter than ECDSA signatures, and support signature aggregation, in which multiple signatures are combined and can be represented as a single signature.

## Specification

ECDSA signatures are disabled. This includes `OP_CHECKSIG`, `OP_CHECKSIGVERIFY`, `OP_CHECKMULTISIG`, and `OP_CHECKMULTISIGVERIFY`.

Signatures in witnesses/witness infos are aggregate across the transaction into a single signature. A new opcode to support this is introduced: `OP_AGGREGATEBLS`.

When executing scripts, `OP_AGGREGATEBLS` pops two arguments from the stack. These MUST be the BLS pubkey and BLS signature, as in `OP_CHECKSIG`. `OP_AGGREGATEBLS` can never cause script execution to fail. The BLS pairing of the signed message (the SHA256 hash of the witness info mapped onto an element of g_1) and the pubkey is computed immediately and cached. The signature is cached separately. Each time `OP_AGGREGATEBLS` is called by a script, it adds its arguments to their respective caches, and computes the new aggregate signature and aggregate pairing of messages and pubkeys.

After all scripts have been executed, the cached aggregate signature is paired with the generator point of g_2, and the result is compared to the cached aggregate message/pubkey pairing. If they are not equal, transaction validation fails.

The computational cost of `OP_AGGREGATEBLS` is two pairings for the first signature, plus one pairing, one g_t multiplication, and one g_1 multiplication for each signature beyond the first. As such it should be linear with the number of inputs.
