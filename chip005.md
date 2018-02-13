# New Opcodes

## Scaffolding and notation

Bigendian `n` is specified by the bytes after the opcode as follows
-- length encoding: 0 - 127 verbatim
-- leading 10 is a two byte encoding
-- leading 110 is a threebyte encoding
-- leading 1110 is a four byte encoding

In Chia Script you need to put an OP_VERIFY at the end because of the concept of Abort+Success. Chia CANNOT support tailcall semantics or anything that evaluates stack items as Script.

Chia does not use scriptSigs. Your signature is a stack. There's no opcodes in the signatures.

## New Opcodes

#### OP_IFJUMP
    Consumes 1 stack item. if true, jump forward `n` bytes.

#### OP_IFNJUMP
    Consumes 1 stack item. if  not true, jump forward `n` bytes

#### OP_JUMP
    Doesn't consume. Just jumps

#### OP_PULL -- OP_PICKBUTBETTER
    interpret next `n` bytes as index from top of stack
    copy item at index to top of stack

#### OP_DEREFERENCE
    interpret next `n` bytes as index from bottom of stack
    copy item at index to top of stack

#### OP_ABORTSUCCESS
    does what it says on the tin.
    Reserved non-changing.
    other opcodes will implement this feature, for soft-fork compatibility.

#### OP_CLTVDROP
    As CLTV, but consumes

#### OP_CSVDROP
    AS CSV, but consumes argument.

#### OP_BLSAGGREGATE
    see chip006

#### OP_BLSAGGREGATEFROMSTACK
    see chip006
