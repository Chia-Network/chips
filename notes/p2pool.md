P2Pool

P2Pool is a decentralized mining pool for Bitcoin, BCH, Dash, Litecoin, etc. The
purpose of P2Pool is to provide a decentralized alternative to centralized mining pools.
P2Pool requires miners to run their own full node, and create a coinbase transaction
paying everyone that has been contributing to the pool.

In order to come to consensus on how much each miner should be paid in the
coinbase transaction, a separate blockchain, called the sharechain, is created. The
sharechain is composed of Bitcoin shares / blocks, that have a lower difficulty requirement
than the main blockchain. It also has a much smaller block time, in order to reduce
variance. For example, the Bitcoin P2Pool has a 30 second block time. If 1% of the miners
are in the pool, the expected time to reward is 0.01 * 30/600 = 0.0005 times in P2Pool, as it is on the main chain. While this variance is not as low as in centralized pools, it is much better than solo mining.

When miners find a block that is good enough to make it into the sharechain, they submit it to the sharechain network. Some of these will be good enough to make it into the main chain. If so, the reward pays out to last 8640 shares.

Benefits of P2Pool:
* Decentralized minining, reduce the potential attack surface by large pools

P2Pool has several major issues, that may or may not have solutions:
1. It does not prevent centralized mining. They can always pool together, even if P2Pool is used. Actually, miners today, in Bitcoin, are pooling into one node, which participated in P2Pool.
2. No incentive to join P2P pool vs joining a centralized pool.
3. It can be 51% attacked (someone with more than 51% of the pools hashpower can claim all
of the rewards. This is easy to obtain, assuming the P2Pool only has a very small fraction of the entire network's hashpower. If it has a large fraction of the hashpower, then the variance of the rewards will be very high, and therefore miners will want to join a centralized pool instead). It seems like P2Pool is not practical for small miners. This is what we see currently in Bitcoin.
4. Block times: with Bitcoin, 10 min is a long time, so even 30 second block times provides a large decrease in reward variabiliy. For shorter main chain block times, P2Pool provides less benefits.
5. Large coinbase transaction, there is probably an upper limit on how many miners can join
such a pool since you need to pay everyone in the coinbase transaction.
6. Dust transaction: if you are receiving only a few cents of rewards, then it might become dust / unspendable.
7. High stale rate: reducing the block time significantly causes high orphan/stale rate.
