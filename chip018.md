chip018 -- Rewards Chains

## Abstract

Rewards chains are mostly independent blockchains that run parallel to the main Chia blockchain, similar to sidechains, which give out the same rewards as the main blockchain, in the same coin, in order to reduce variability of rewards and reduce the incentive for pools.
Farmers farm on all chains, and transfer their rewards to the main chain.

## Chia Rewards Chains (Figure 1)
![Chia Rewards Chains](/assets/chip0018/rewards_chains.png "Chia Rewards Chains")

## Specification

In the Chia network, instead of there being only one blockchain that gives out rewards,
as in Bitcoin, there will be one main blockchain, and C rewards blockchains, or rewards chains.

The rewards chains will be identical to the main chain in the number of rewards that they give out, according to the reward schedule.
For example, if the main chain halves rewards at height 100,000, the rewards chains do as well.

The rewards chains are also mostly independent of the main chain.
They have their own difficulty, and difficulty resets, proofs of space, proofs of time, and fraud proofs.
Farmers should mine on all blockchains at once, which will result in similar difficulty and length of each chain. A similar construction can work with Bitcoin, if the chains support some sort of merge mining. With proof of space, a farmer can easily farm on all chains at the same time, by checking their storage whenever a new block is revealed, on any chain.

Transactions can only be included in the main chain. There is no state changes merkle root, or validations merkle root.
This keeps the system simple, although it still requires transferring rewards from the rewards chains into the main chain.


In order to transfer rewards, all Chia nodes maintain a list of blocks from all rewards chains.
Farmers can include blocks (block hash) from other rewards chains in the main chain header, as long as the weight of the included block is greater than the weight of the previous included block from that rewards chain.
For example (Figure 1), if the last included block from rewards chain 2 had height 4, the next included block from that rewards chain must have height of at least 5 (or more work, if there is a work difficulty reset).
This also allows for reorgs. As can be seen in Figure 1, a farmer includes block 5 of rewards chain 2, causing a reorg in that rewards chain, without requiring a reorg in the main chain.
After D blocks, this included block becomes finalized, or checkpointed, and the rewards from that block can be spent.
Note that these are not hard checkpoints: in theory they can be reversed, but they require a long reorg in the main chain.
D will be significantly greater than the lock of the main chain rewards. This is because blocks might take a while to be included in the main chain, so larger reorgs of the rewards chains within the main chain are more likely.


Each node must keep track of the state of all C + 1 chains, but also keep track of the state of the rewards chains as they are included and reorged within the main chain.
SPV clients do not download or verify all of the block headers in the rewards chains, they simply check for inclusion of block hashes within the block headers of the main chain.
The version number of an included rewards chain block must be the same or lower than the main chain in order to be included.

## Parameters
Network parameter C: number of rewards chains

Network parameter D: depth of reward chain block required for spending rewards


## Rationale

The purpose of the rewards chains is to reduce the variability of the farming rewards, without decreasing the security of the system.
The simplest way to do this is to increase the block rate (reduce block time), but this can have a centralizing effect by giving advantages to large miners with zero block propogation time, and also add incentive to pooling.


In most cryptocurrencies, pools are very dangerous centralized entities, that have the power to cause damage to their own, or other coins. Although decentralized pools like P2Pool exist, there is no real incentive to use them, and they suffer from security issues and lower smoothness than centralized pools.
The reason most miners use pools is to increase rewards smoothness, and lower the amount of time that miners/farmers must wait until they get paid. Rewards chains make rewards C + 1 times more common for everyone on chain, without reducing security.


Since proof of space does not require intensive computation or lookups, farmers can easily farm on all rewards chains simultaneously, which will lead to very similar difficulty on all chains.
A similar effect might lead other cryptocurrencies to adopt the same proof of space algorithm, allowing easy "merge farming" without having to adopt complex protocols.
Since there are no transactions or validations on rewards chains, full nodes can easily download all the headers of all chains, without incurring much cost to bandwidth, processing, or storage.

The checkpointing of blocks before their rewards can be spent is important, because it guarantees that a rewards chain reorg will not cause any issues in the main chain.

### Reasons to limit the number of chains
For the following reasons, C (the number of rewards chains) should not be increased too far.
* **Imbalance between block rewards or transaction fees**:
transaction fees are only given in the main chain: they cannot be split between all the chains, because that would lead to users paying farmers under the table, to get their transaction included in the main chain.
Since all transaction fees are given out to farmers that win blocks in the main chain, there can be a scenario where transaction fees are much greater than the block reward in the main chain.
For example, if there are 1000 chains, the main chain rewards will be 1/1000 of the total, and thus transaction fees might be greater than this. This can lead to adverse mining incentives like not following the heavient main chain, but following a main chain which will lead to a greater amount of claimed fees.
Therefore, the total number of rewards chains should be kept relativily small


* **More POT servers**: more proof of time servers are required to keep working on all of the rewards chains.
If there are not enough POT servers, this can lead to a situation where some chains require less space than others for the same rewards, because some have weaker PoT, but the difficulty adjust to the same time.

* **Too many lookups**: Many sequential lookups (10-100) are required to check a proof of space solution, if there are too many chains, the farmer might run out of time, and not be able to check the proofs of space for all chains.

* **Computation**: All farmers will have to compute the ZKP for the proof of space, which might not be trivial.
All full nodes must verify this proof for every chain, as well as verify the PoT for every chain.

* **Bandwidth**: Headers must be transferred for every block or potential block. These are large headers ~(10KB) due to the PoS and PoT.

The first issue can be fixed by allocation a large proportion of the block rewards to the main chain.
For example, 10% of the rewards go to the main chain, and 1% of the rewards go to each of the 90 rewards chains.
However this can cause incentive issues since it's preferrable to farm on the main chain (although it's preferrable anyway, due to the transaction fees).

## Questions / Notes
1. Should we incentivize inclusing of blocks from rewards chains in order to make sure that the main chain is up to date? If the main chain is rarely updated with new reward blocks, this increases the chance that a shorter fork will be finalized/checkpointed.
2. How long do farmers have to wait to claim there rewards? If we reward inclusion, I think this can be relatively short.
3. Is farmer storage fast enough to do all the lookups necessary?
4. Should nodes keep old forks of rewards chains in case there is a massive reorg that "uncheckpoints" blocks?
5. Will a checkpoint ever be reversed? What would be the impact of that?
6. Larger reward for the main chain?