---
layout: markdown
---

# chip017 -- Blockchain Structure

## Abstract

Chia's blockchain is based on a trunk and a foliage. The trunk is canonical, and contains proofs of time and proofs of space. The foliage is not canonical, and contains the rest of the block header (CHIP4), and block data (transactions, witnesses).

## Chia Blockchain Structure
![Chia Blockchain](/assets/chip0017/blockchain.png "Chia Blockchain")

## Specification

The trunk and foliage are not a replacement for block headers: block headers are still present, and they contain the trunk and parts of the foliage (all except merkle trees).

In the diagram above, the arrows signify a dependency on (or a commitment to) what is being pointed to. For example, the prevBlockHash is a dependency on the previous block.

The trunk section includes a proof of time and proof of space.
Both take in a challenge from the trunk of the previous block. The challenge can be `H(PoT output || PoSpace || difficultyReset)`
This commits to both the proof of space and proof of time of the previous block.
The Proof of time itself, is two values: the output of the VDF, and the proof that the VDF was correctly computed.
The proof of time uses the challenge as an input to the verifiable delay function.
The proof of space uses the challenge as the target value when looking up the proof of space in the storage. The actual proof of space is not revealed in the trunk: only the hash is.

The trunk will also include an occasional work difficulty reset.

The foliage includes the rest of the block header, and the block data. The signature in the block, is a signature using the pk in the proof of space, signing the rest of the fields in the block header.

During operation of the protocol, farmers build blocks with the PoSpace and signature, and broadcast these. Proof of time servers then add the Proof of Time on top of these blocks, to "finalize" them.

## Rationale

SPV wallets will still download verify the block headers. The purpose of the trunk, is to clarify the canonical nature of the consensus algorithm.

The rationale for splitting up the blockchain into trunk and header, comes from the need for the proofs of space to be ungrindable. In a naive proof of space implementation, the challenge is based on the contents of the block or the previous block, similar to Bitcoin. However, this leads to the attack where the farmer can try many different blocks in order to produce a challenge that benefits her. This is true whenever you have any type of malleability in what goes into the challenge. This includes things like random nonces, ordering of transactions, transaction data, etc. Therefore the proof of space cannot commit to the block data itself.

For the proof of time, a similar issue arises. If the proof of time were to commit to block data, a large farmer can run many proof of time servers, and gian a large advantage by using the result that benefits her the most (provides the best proof of space for the next block). This results in a design where the proofs of space and time are entirely independent of the foliage, or the block contents.

A notable exception is where a work difficulty reset has to happen. In this case, the farmer will add in the new difficulty, based on the data from the timestamps of the foliage. However grinding will still not be possible, since there will be a few discrete options for work difficulty, and they do not happen every block.

The previous block pointer can be a merkle root of all previous blocks, if flyclient (CHIP19) is used.

## Questions / Notes
- Q1: Krzysztof made the point that the VDF does not really have to commit to the previous block's PoSpace, since it already kind of does, from the number of iterations. However, it allows for more flexibility to commit to it. for example, we can allow different number of iterations in the future...
I think the same thing can be said about including the proof of space in the challenge for the next proof of space.
