---
layout: markdown
---

# chip015 -- Genesis Block

## Abstract

This chip explains the genesis block and the process for obtaining the first proof of time seed.

## Motivation

In the first block in the Chia blockchain, initial balances have to be allocated. Furthermore, a secure random seed must be used, to start the proof of space and proof of time process. If a properly random seed is not used, someone may have already prepared a very long chain on top of this seed, and reveal it later, since proofs of space and proofs of time are canonical.  
Having a secure random seed based on a Bitcoin hash ensures that everyone is on the same playing field, and nobody is able to farm or perform proof of time in advance of the network launch.

## Specification

The genesis block allocation will be specified in a special genesis block file, which users can specify in their client. This file also includes a field for initial_random_seed. This is a field that will act as the VDF output of the genesis block, so the proofs of space and time will start immediately after this value is known.

initial_random_seed will be set to the Bitcoin block header at a specific miniumum block height, for example, 600000, that is specified in advance of the launch, and that meets certain requirements. This means that nobody will be able to predict what the hash will be, and thus everyone will start proofs of space and proofs of time at the same time (nobody will have an unfair advantage, apart from a negligible advantage to the Bitcoin miner that wins the block, if he withholds the block). The additional requirements can be that the the Bitcoin block hash, in hex, ends with two zeros. This helps prevent the case where there is an orphan block, and there is disagreement on which is the right block at that height.

The genesis block does not contain a proof of space or a block signature, since the proof of space must build on a previous VDF output.

After the Bitcoin block at the specified height is published, users will add this to their gensis file, and from that point, the genesis block will be hardcoded into the source code and checkpointed.

## Questions / Notes
- Q1: Will we allocate trasactions to Chia Inc and then distribute, or give the coins directly to other investors, in the genesis block?
- Q2: Will the premine transactions be in the genesis block, or in the first block that allows users to add transactions?
