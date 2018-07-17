---
layout: markdown
---

# chip016 -- Fraud Proofs for Double Block Signing

## Abstract

Farmers are able to submit fraud proofs: proofs that a block was double signed by a previous farmer, as long as these blocks were within the coinbase spending window parameter.
This allows burning of the coinbase rewards for misbehaving farmers, and incentivezes submitting the fraud proof by allowing the farmer to claim a proportion of the burned coins.

## Motivation

Since proofs of space and proofs of time are canonical, this means that a farmer with a successful proof of space can sign two different blocks at the same height (but not at different heights since the proof of space commits to the previous VDF output).
The canonical nature of these algorithms is required to prevent grinding attacks.
This can lead to an attack where a group of farmers gets a long series of consecutive blocks, and decides to force a reorg by providing an alternate chain with different signatures.
This can be even more problematic when the attacker is bribing other farmers for their proof of space.
Therefore, to disincentivize double signing, we can slash the rewards of double signers, making it very costly to attempt such an attack.

## Specification

An extra field is added to the block header with a list of fraud proofs. Each fraud proof includes the height of the fraudulent block, and an alternate payload + signature.
If the payload is a correct CHIP14 proof for that block, different than the proof on the block, then that farmer can add `v = p * R` to their own coinbase reward, where `p` is a consensus parameter, established to be less than or equal to something like 0.1, and `R` is the reward of the fraudulent block.
The coinbase transactions of the fraudulent blocks are removed from the UTXO set.

After the coinbase rewards get unlocked, the farmers can claim the rewards, and fraud proofs cannot be submitted. However, the coinbase rewards will be locked for far longer than is reasonable for a farmer to obtain consecutive blocks.

The probability of a malicious group of miners obtaining `t` consecutive blocks is `(α)^t`, for a 50% group of miners to obtain 10 consecutive blocks, it's 0.09%, and to obtain 20 consecutive blocks it's 0.000095%, making a reorg that deep, almost impossible.

Therefore, when the coinbase rewards are unlocked, farmers have no reason to double sign, and if they do, they cannot cause any harm.

## Questions / Notes
- Q1: Fraud proofs will be large since they include the whole ZKP, maybe we should organize it in a merkle tree? I think not, since it's a revocation of an output, and not an output itself. Also the equilibrium is a situation where no farmers double sign, so not many fraud proofs will be submitted
