chip011 -- Opcodes to push witness info properties to stack

## Abstract

Some Script opcodes check properties of the witness info. For example, OP_CHECKLOCKTIMEVERIFY examines the `nLockTime` field and fails script execution if it does not meet certain criteria. These opcodes are replaced with versions that push the value of the field to the stack. There it may be operated on or verified as desired by the author of the script.

## Motivation

Intuitively, it is more powerful to push the value of that field to the stack.

## Specification

OP_CLTV and OP_CSV are removed.

The following new opcodes are added:

1. OP_PUSHLOCKTIME
3. OP_PUSHRELATIVELOCKTIME
2. OP_PUSHLOCKHEIGHT
4. OP_PUSHRELATIVELOCKHEIGHT

These opcodes push the relevant features of the witness info to the stack. `nLockTime` and `nSequence` are 32 bit numbers in the witness info. OP_PUSHLOCKTIME and OP_PUSHRELATIVELOCKTIME fail script execution if the field is not greater than 500,000,000. OP_PUSHLOCKHEIGHT and OP_PUSHRELATIVELOCKHEIGHT verify that these numbers are 500,000,000 or less.
