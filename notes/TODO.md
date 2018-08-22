---
layout: markdown
---

## NOTES

This note keeps track of important things we should remember in the future, and document somewhere

- Other notable changes that we need to document:
- 5 minute target block time
- 3 heads (deckchair reorgs)
    backbone vs body
- Proofs of space
- VDF
    - Classgroup representation
    - Generation of determinant and element
    - VDF construction
    - Proof construction
- Tadge UTreeXO
- get rid of transactions entirely?
    - parent is a TXO that is consumed in the same block this is created.
    - witness info:
        - timelock
        - input list -- these TXOs must consumed in this block
        - output list -- these TXOs must be created in this block
        - consumed input -- reference to specific input this witness info is associated with (1-to-1 correspondance)
- Chip011 would modify the function and structure of chips 005, 007, 010. Update these?
- chip003 needs to be rewritten, probably chip004 too
- Maybe cut IFJUMP in favor of enumerated scripts with MAST
- Need Terminology CHIP
- VDF input takes in previous block's proof of space, but runs for number of iterations of current proof of space.
- ln(c) and how to approximate it
- Need a Chip for work difficulty reset
    - How often
    - When it kicks in
    - formula
    - discrete increments?

## Other random things
- Default farmers should delete their proofs of space as soon as they spend it, to prevent other people from hacking them, and using this proof of space to sign a different block.
