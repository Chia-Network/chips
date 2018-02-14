## ALL CHIPS ARE IN EARLY DRAFT. THEY ARE A CONCEPTUAL REFERENCE, NOT AN IMPLEMENTATION GUIDE

## Chip list

chip003 -- Transaction Format Revision
chip004 -- Revised Block Headers
chip005 -- New Script opcodes
chip006 -- Cross-input BLS Aggregation
chip007 -- Precursors (Adoptive parents)
chip008 -- Reverse BLS
chip009 -- UTXO bitfield
chip010 -- OP_CHECKINPUTVERIFY & OP_CHECKOUTPUTVERIFY
chip011 -- Opcodes to push witness info properties to stack
chip012 -- nSequence and relative time lock semantics changes

## Future chips?

Other notable changes that we need to document:
5 minute target block time
3 heads (deckchair reorgs)
    backbone vs body
Proofs of space
VDF
get rid of transactions entirely?
    parent is a TXO that is consumed in the same block this is created.
    witness info:
        timelock
        input list -- these TXOs must consumed in this block
        output list -- these TXOs must be created in this block
        consumed input -- reference to specific input this witness info is associated with (1-to-1 correspondance)

## NOTES

Chip011 would modify the function and structure of chips 005, 007, 010. Update these?
