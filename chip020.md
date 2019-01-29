---
layout: markdown
---

# chip020 -- Pooling Protocol

## Abstract

The pooling protocol allows farmers to join a pool, and smoothe out their rewards. With the plot key, farmers can still choose the transactions that go into their blocks, and with the pool key, pools can spend the coins and pay farmers. Only one Proof of Space per block is required as a share in the pooling protocol, and HD keys protect against double-dipping farmers.

## Motivation
Pooling is a very valuable part of cryptocurrencies, as it allows miners or farmers to get paid more frequently. This pooling protocol will be designed to provide this feature, at minimum cost to bandwidth, CPU, and centralization.

## Explanation
Plot IDs are generated using a hash of two keys: the plot key and the pool key. The plot key is the public key used for authenticating the provider of foliage blocks. I.e., in order for a block to be added to the blockchain for at a certain height, it must contain a signature that validates against the plot public key in the proof of space at that height. The pool key is used to spend the coinbase reward. This separation allows farmers to control creation of blocks, and allows pools to control the distribution of rewards.


When creating a plot, farmers first generate a root HD key, which is the root plot key, and obtain a pool key from the pool. For each plot, farmers derive a new child HD key at exactly height h (for example h can be 20). Each plot now has a plot key derived from the root key, and a pool key obtained from the pool. These are hashed into the plot ID, and integrated into the newly generated plots. Finally, the farmer registers their root public key with the pool. The pool checks that this pk is unique.

For providing a partial, at each block the farmer sends their best proof of space among all plots, along with a signature using the plot key. The pool verifies that the pool key is correct, and increments the balance of the owner of the plot, based on the quality formula. The owner is determined by the ancestor of the plot key. Double dipping is impossible since there can only be one ancestor at height h. Furthermore, this allows farmers to submit at most one proof of space for all of their plots, saving bandwidth.

## Specification

# TODO

## References
[1] https://github.com/TheBlueMatt/bips/blob/betterhash/bip-XXXX.mediawiki
