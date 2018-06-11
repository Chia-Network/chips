chip014 -- Non Outsourceability (DRAFT)

## Abstract

In Chia, proof of space solutions should be revealed in a strongly non-oursourceable manner [Miller, 15], such that blocks can be created anonymously and block rewards can be claimed anonymously, deincentivizing
the formation of large farming pools. This is done by not committing to block contents withing a proof of space in the trunk chain, but committing to them in the foliage chain, in a separate zero knowledge proof of proof of space.

## Motivation

Mining in Bitcoin and other proof of work cryptocurrencies has usually ended up in a few large parties having control of the majority of the hashpower, and thus the ability to attack the system. Although replacing proofs of work with proofs of space and time is likely to lead to
 smaller individual miners (farmers), there is still the issue of farmers joining together in large pools. Although the resource itself, storage, is spread out, control of block creation is still held by a few central parties, the pool operators.

With strong non outsourceable puzzles, farmers can claim their block rewards if they find a block, and a pool operator will not be able to detect this. This will enables farmers to secretely steal from pools, which provides an incentive for other farmers in these pools to farm individually, leading to a more decentralized network.

## Specification

The trunk of the Chia blockchain contains only the hashes of the proofs of space, the proofs of elapsed time, and the occasional work difficulty reset. The canonical hash of the proof of space does not commit to any information in the block, therefore allowing the farmer to form her own valid block after finding a solution to the proof of space puzzle, and making it impossible for the farmer to identify herself in the trunk.

Since the trunk does not commit to any block data, and is not an actual proof of space, the foliage must contain a proof that the proof of space is valid, a proof which also 'signs' the block. When a new block is finalized, the farmer will check their storage for a solution, and then create a zero knowledge proof signing their desired block. (More info in CHIP17).

The block signature is a zero knowledge proof of knowledge of the following witnesses, such that the relations hold:

Committed values (message to sign)
- `B ∈ Zn,`

Public inputs
- `C ∈ Zn,`
- `S ∈ Zn,`

Private inputs (witnesses)
- `x1, x2, x3, x4 ∈ Z2^m`
- `s ∈ Zn`

Relations
- `S = H(s, x1, x2, x3, x4)`
- `Tm(H(s, x1, x2, x3, x4)) = C`
- `Tm(H(s, x1, x2)) = Tm(H(s, x3, x4)) + 1`
- `Tm(H(s, x1)) = Tm(H(s, x2)) + 1  AND Tm(H(s, x3)) = Tm(H(s, x4)) + 1}`

Where:
- `B` is the block data that the farmer commits to in the proof, it can be the `tx_root` or the hash of the rest of the block header
- `C` is the truncated challenge from the previous proof of time
- `S` is the solution to the puzzle, the hash of the proof of space
- `n` is a large number like 2^128
- `k` is the number of levels deep of the proof of space, here it is set to 3 for clarity. In the paper these levels correspond to `f`, `g`, `h`, etc.
- `m` is the number of bits in the output of `Tm(H)`, plot size is proportional to `2^m`
- `H` is a hash function with a large output, `H: {0,1}* -> Zn`
- `Tm: {0,1}* -> Z2^m` is a truncation function that outputs the first `m` bits of the input.
- `s` is a salt witness used as input in hash functions, generated randomly to ensure different proofs of space for each farmer.
- `x_1 ... x_2^k` are `2^k` witnesses that are stored by the farmer, that are used to prove space.

The relation above implies:
- The solution `S` must be the hash of the salt and all the x witnesses
- The solution `S` must be exactly identical to the challenge `C` when both are truncated to `m` bits
- Every level of the proof of space must validate, making it computationally unfeasible to find a proof of space without storing tables for all of these levels.


When looking at a new proof, a node must check that the ZKP validates correctly, that the block that is being validated corresponds to the value B, and
that the proof of time performs `(d (C - S) / m) + t0 ` iterations. `d` and `t0` are constants that ensure that it takes 5 minutes on average, and 1 minute even with a perfect PoSpace.

The hash function is truncated to a smaller size for smaller plots, so the circuit to satisfy the above relation depends of the size of the plot, and thus on `m`.
This means we will need to create multiple circuits for each valid bit length `m`, or the relation will need to additionally prove that length `m` is used.

## Non Outsourceability Proof
(Here we must include a proof that the the proof of space puzzle is strongly non-outsourceable. The puzzle itself should be described in detail in another CHIP or paper). It might be impossible to prove, due to the encryption attacks, but maybe we can prove it with some assumptions.

- Prove that the puzzle is weakly non outsourceable:

    - First prove that for every pooling protocol, there exists a strategy A for the farmer, where the farmer can take the rewards with significant probability. Perhaps we can do this by making assumptions on the bandwith of the farmer, or latency.
    - Then prove that an operation of the pooling protocol in an honest way, is indistinguishable from an operation of the pooling protocol in the adversarial (stealing) way. This means that the pool operator will allow the farmer to farm (until rewards are stolen at least).

- Prove that the puzzle has an indistingushability property:
    - Assuming that the zero knowledge proof system used is computationally zero knowledge, the adversary will not be able to obtain any info from the proof. For the foliage, the farmer can just create a block with a brand new public key in the coinbase transaction, and no other differentiating factors that would identify the farmer. For the trunk, since the H(PoSpace) is completely canonical, the adversary cannot differentiate the farmer's H(PoSpace) with any other proofs of space, without knowing `s`  and every ` x_1 ... x_2^k` .

##  Questions / Notes
- Q1: Which hash functions do we use? Could use pedersen hash function with jub jub like zcash, maybe MiMC
- Q2: Do we need a different hash function for the final function?
- Q3: Which ZKP technique to use? Bulletproofs require no trusted setup, are fast to prove, but are relatively large and slow to verify. zkSnarks are small and fast to verify, but require a trusted setup and take a long time to prove. Starks have no trusted setup but are very large. Also need to decide on curves..
- Q4: Should we have different levels of rewards, in order to minimize the variance in rewards?
- Q5: Can we reveal the output of the individual hash functions in the levels of the pyramid?
- Q6: How fast does the hash function need to be? Pedersen hash with jub jub is quite slow.
- Q7: Collision resistance necessary?
- Q8: Upper limit for verification time and size of proof? 1kb and 100 ms? If we can batch proofs between multiple blocks that would be great. SPV needs to download and verify every header.
- Q9: Attack where all values are encrypted with pool operator's keys. Need to address.
- Q10: Attack where only some values are encrypted with pool operator's keys.
- Q11: Attack where encryption is done client side with pool operator's public keys, encryption function is hard to compute on the fly for one value, forcing the farmer to actually store all values encrypteds.. (but encryption function is easy to do for the whole table.. Not sure if such an encryption scheme exists)
- Q12: Maybe something that requires many reads/writes, to make encrypted outsourcing more difficult, if we assume a minimum latency between farmer and pool. For example if round trip is 100ms, and there are 10000 round trips, then it will take 1000 seconds for the pool operator to check get their proof of space.