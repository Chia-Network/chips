---
layout: markdown
---


# Transaction Format Revision

## Abstract

This CHIP describes a new standard format for transactional information. In contrast to Bitcoin, Chia transactions are split into

# NOTES

sort of getting rid of the WI
replace it with a list of conditions

## Condition Formats

the thing that you sign is (not 100% sure) the concatenation of hashes of all conditions
H(C0 || C1 || C2 ... || Ci)

It is normal for the set of conditions to be the same across an entire logical transaction, however, it is not mandatory. Users may vary conditions on a per-input basis.


## Witness

Every witness indirectly references an input, and directly references a list of conditions
Signatures in a witness sign the condition list as above.
It is often the case that all witnesses for a logical tx reference the same list of conditions
AggSig for tx as a whole.


Witnesses have a single byte that gives the witness version.
Initially the pubkeys types listed in outputs are all of the same type:
Reverse BLS 381 pubkey w/ taproot + graftroot
We will allow other types to be softforked in.

If taproot it's a MAST script. Script has a single byte giving the type.
There is no OP_IF or OP_IFJUMP.

Maybe make OP_ASSERT style opcodes
Maybe make OP_PUSHLOCKTIME or similar


### Types of conditions:

Multiple types of coniditions
first byte is type
after that is required values for the condition (fixed length)
optional values (variable length)

If you come across an optional value you don't understand, then abort success on that condition

*Specific input* -- chip must be consumed this block
    req: ID
    opt: amount
    opt: relative locktime

*Specific output* -- chip must be created this block
    req: parent
    req: pubkey
    opt: amount

*Lock time* -- witness is not valid before a specific time
    req: absolute locktime

*Precursor input* -- chip must be consumed this block
    req: ID
    opt: amount
    opt: relative locktime

*Fee*
    req: amount
    opt: salt

Extensible for new conditions


### Locktime possible formats:
wallclock (timestamp)
block height
VDF iterations


### Block

A block is a set of foliage. It has a direct linkage to the current trunk PoSpace. It has a link to the previous foliage block. It has a list of inputs by ID, which are inputs to any transaction, which are spent in this block. It has a list of outputs that are created in this block, which contain a parent, a pubkey, and an amount.

Some parts of the block are prunable: a list of witnesses (which may or may not still have individual IDs), and an aggsig for the whole block
