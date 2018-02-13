# New Opcodes

## Scaffolding and notation

When Chia scripts are hashed it's with a Merkle root to support only revealing the parts of the script which get executed. This is enabled by the removal of OP_IF, OP_ELSE and OP_ENDIF in favor of OP_IFJUMP, OP_IFNJUMP and OP_JUMP which don't requiring parsing the entire script to execute.

When full nodes validate scripts they do some level of canonicalization by removing items from the stack which were unnecessary, changing elements to zero length which are unreferenced, and canonicalizing elements to their minimum length representation as bools or ints if that's their only use.

Bigendian `n` is specified by the bytes after the opcode as follows
-- length encoding: 0 - 127 verbatim
-- leading 10 is a two byte encoding
-- leading 110 is a threebyte encoding
-- leading 1110 is a four byte encoding

In Chia Script you need to put an OP_VERIFY at the end because of the concept of Abort+Success. Chia CANNOT support tailcall semantics or anything that evaluates stack items as Script.

Chia does not use scriptSigs. Your signature is a stack. There's no opcodes in the signatures.

In Chia script if the execution point gets past the end of the script it succeeds regardless of what's currently on the stack or whether it got their via a jump

Integers are still little-endian and have a sign bit, but their valid range is expanded to allow for numbers between -2^63 and 2^63 non-inclusive. Overflows cause immediate abort fails.

## New Opcodes

New opcodes are taken out of the set of disabled Bitcoin opcodes. Later ones will be taken out of Bitcoin reserved opcodes followed by Bitcoin opcodes which were reclaimed in Chia script.

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

#### OP_AND -- OP_BOOLANDBUTBETTER
    does AND with normal coercion rules

#### OP_OR -- OP_BOOLORBUTBETTER
    does OR with normal coercion rules

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

## Preserved Opcodes

These are opcodes which we have decided of worthy of keeping verbatim from Bitcoin script. All others are changed to abort success.

#### OP_PUSHDATA1

The vast range of opcodes for specific amounts of pushes are removed in favor of this saner approach

#### OP_PUSHDATA2

This is kept despite have a not typical for Chia script length encoding because strings can't be longer than 520 bytes anyway

#### OP_NOP

Necessary to keep the blessed nop because everything else is turning into abort success

#### OP_VERIFY

Tell me it's true

#### OP_RETURN

Keeps its meaning of 'abort fail'

#### OP_DEPTH

Still useful for optional arguments

#### OP_DROP

The only stack manipulation opcode to survive in its original form

#### OP_SIZE

Totally sane

#### OP_EQUAL

Maybe this will be removed in favor of a OP_NOTEQUALVERIFY

#### OP_EQUALVERIFY

Useful for comparing hashes

#### OP_NEGATE

Normal math

#### OP_ABS

Normal math

#### not

Necessary for multi-input boolean operators

#### OP_0NOTEQUAL aka OP_BOOL

Coerces to a bool

#### OP_ADD

Normal math. Overflows now cause immediate abort failure

#### OP_SUB

Normal math. Overflows now cause immediate abort failure

#### OP_NUMEQUAL

Normal math

#### OP_NUMEQUALVERIFY

The common case

#### OP_NUMNOTEQUAL

Normal math

#### OP_LESSTHAN

Normal math

#### OP_GREATERTHAN

Normal math

#### OP_LESSTHANOREQUAL

Normal math

#### OP_GREATERTHANOREQUAL

Normal math

#### OP_MIN

Normal math

#### OP_MAX

Normal math

#### OP_WITHIN

Normal math

#### OP_SHA256

It's tempting to switch some things to a different hash function but better to stick with a single one for simplicity. The double version is removed with much prejudice.
