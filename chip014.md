---
layout: markdown
---

# chip014 -- Non Outsourceability (DRAFT)

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
- `S = H(F(s, x1, x2, x3, x4))`
- `Tm(H(F(s, x1, x2, x3, x4))) = C`
- `Tm(H(F(s, x1, x2))) = Tm(H(F(s, x3, x4))) + 1`
- `Tm(H(F(s, x1))) = Tm(H(F(s, x2))) + 1  AND Tm(H(F(s, x3))) = Tm(H(F(s, x4))) + 1}`

Where:
- `B` is the block data that the farmer commits to in the proof, it can be the `tx_root` or the hash of the rest of the block header
- `C` is the truncated challenge from the previous proof of time
- `S` is the solution to the puzzle, the hash of the proof of space
- `n` is a large number like 2^128
- `k` is the number of levels deep of the proof of space, here it is set to 3 for clarity. In the paper these levels correspond to `f`, `g`, `h`, etc.
- `m` is the number of bits in the output of `Tm(H)`, plot size is proportional to `2^m`
- `H` is a hash function with a large output, `H: {0,1}* -> Zn`
- `F` is a function that takes a salt and x values, and combines them in some way, to prevent attack 3.
- `Tm: {0,1}* -> Z2^m` is a truncation function that outputs the first `m` bits of the input.
- `s` is a salt witness used as input in hash functions, generated randomly to ensure different proofs of space for each farmer.
- `x_1 ... x_2^k` are `2^k` witnesses that are stored by the farmer, that are used to prove space.

The relation above implies:
- The solution `S` must be the hash of `F` applied to the salt and all the x witnesses
- The solution `S` must be exactly identical to the challenge `C` when both are truncated to `m` bits
- Every level of the proof of space must validate, making it computationally unfeasible to find a proof of space without storing tables for all of these levels.


When looking at a new proof, a node must check that the ZKP validates correctly, that the block that is being validated corresponds to the value B, and
that the proof of time performs `(d (C - S) / m) + t0 ` iterations. `d` and `t0` are constants that ensure that it takes 5 minutes on average, and 1 minute even with a perfect PoSpace.

The hash function is truncated to a smaller size for smaller plots, so the circuit to satisfy the above relation depends of the size of the plot, and thus on `m`.
This means we will need to create multiple circuits for each valid bit length `m`, or the relation will need to additionally prove that length `m` is used.

### Optimizations
1. Use secq (secp256k1 with n and p flipped). This allows fast EC arithmetic in circuit.
2. Batch verify a bunch of these proofs at once
3. Check truncated equality by subtracting a and b and then producing a rangeproof of the result. If this rangeproof could be separate (different bulletproof), this would be more efficient.

### Attacks

1. Encryption attack: a pool encrypts a plot and uploads it to the farmers space. The farmer now cannot see anything in the plot, and just responds with lookups. This can also happen with the farmer being a manufacturer or reseller that preplots the drive before selling.
2. Obfuscated computation attack: The pool encrypts a program, and user uses this program to perform plotting, without seeing the key. A variant of this can be performed with secure hardware like the intel SGX. A pool can put the salt in the intel SGX, and give it to the farmer, and it performs all the plotting. So farmer basically cannot see the secret key/salt, and thus cannot control their own plot.
3. Partial hash computation: If using H(salt || x) for plotting, and if using a hash function like pedersen or merkle damgard, the pool can compute a partial computation of the hash function, and give this to the user. The user can then perform the rest of the plotting, without finding out the key. This means pooling can happen easily. We need to create a function F and perform H(F(salt, x)) instead.

##  Questions / Notes
- Q1: Which hash functions do we use? Could use pedersen hash function with jub jub like zcash, maybe MiMC. Pedersen hash function cannot be done within curve25519, and it also is very slow to compute. MiMc is not well studied yet.
- Q2: Do we need a different hash function for the final function?
- Q3: Which ZKP technique to use? Bulletproofs require no trusted setup, are fast to prove, but are relatively large and slow to verify. zkSnarks are small and fast to verify, but require a trusted setup and take a long time to prove. Starks have no trusted setup but are very large. Also need to decide on curves..
- Q4: How fast does the hash function need to be? Pedersen hash is quite slow.
- Q5: Collision resistance necessary?
- Q6: Upper limit for verification time and size of proof? 1kb and 100 ms? If we can batch proofs between multiple blocks that would be great. SPV needs to download and verify every header.
- Q7: Attack where encryption is done client side with pool operator's public keys, encryption function is hard to compute on the fly for one value, forcing the farmer to actually store all values encrypteds.. (but encryption function is easy to do for the whole table.. Not sure if such an encryption scheme exists)
- Q8: Maybe something that requires many reads/writes, to make encrypted outsourcing more difficult, if we assume a minimum latency between farmer and pool. For example if round trip is 100ms, and there are 10000 round trips, then it will take 1000 seconds for the pool operator to check get their proof of space.
- Q9: Can the pool brute force the proof of space? Pool knows salt, and knows S and C, but does not know x1..x4. I think so, since x1 might be small, but all of the together is quite large.
