---
layout: markdown
---

chip010 -- OP_CHECKINPUTVERIFY & OP_CHECKOUTPUTVERIFY

## Abstract

Introduces two new opcodes: OP_CHECKINPUTVERIFY and OP_CHECKOUTPUTVERIFY (CIV and COV). These outputs pop one argument from the stack, and check its membership in the input or output list of the transaction, respectively.

## Motivation

Similar to chip005. Allows for functionality upgrade without breaking monotonicity or creating undue verification burden. COV in particular may be used to create covenants.

## Specification

CIV pops 1 input from the stack.
CIV fails script execution if any of the following are true:
1. The stack is empty (nothing to pop)
2. The popped item is not a TXO-identifier (bad format)
3. The TXO identified by the popped item is not committed to in the inputs list of the witness.

COV pops 1 input from the stack
COV fails script execution if any of the following are true:
1. The stack is empty (nothing to pop)
2. The popped item is not a TXO-identifier (bad format)
3. The TXO identified by the popped item is not committed to in the outputs list of the witness.
