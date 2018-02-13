chip007 -- Precursors (Adoptive parents) and OP_CHECKPRECURSORVERIFY

## Abstract

Witness infos may specify one or more precursor TXOs. The witness info and its associated witness are not valid unless these TXOs have been created in some block (including the current block). In essence, signers may make the validity of a spend conditional on the state of another UTXO. A new Script opcode, `OP_CHECKPRECURSORVERIFY` may be used to enforce precursor inclusion. This is conceptually related to chip010 -- OP_CHECKINPUTVERIFY & OP_CHECKOUTPUTVERIFY.

## Motivation

Precursors are relatively low-risk route to enabling more complex functionality. They allow complex networks of transactions, without enabling arbitrary shared state. Monotonicity of transaction and script validity are preserved, and the state of precursors may be checked efficiently via the TXO bitfield (chip009).

## Specification

An additional field in the witness info may list precursor TXOs. The witness info is not valid unless all precursors have been created. Nodes check that precursors exist when verifying the state of the witness info's inputs. Nodes receiving a transaction which is invalid due to missing precursors discard it, as with transactions with a future `nLockTime`.

### OP_CHECKPRECURSORVERIFY

OP_CHECKPRECURSORVERIFY (OP_CPV) is a new Script opcode with the following semantics:

OP_CPV consumes 1 stack item.
OP_CPV fails script execution if any of the following are true:
1. The stack is empty (no item to consume)
2. The top stack item is not a TXO identifier (invalid format)
3. The TXO identified by the top stack item is not in the precursor list in the associated witness info.
