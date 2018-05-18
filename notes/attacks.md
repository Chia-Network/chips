## Possible attacks on Chia

1. 51% attack: A farmer has more than 51% of the total hashpower, they can force arbitrary long reorgs, reverse or censor any transaction, claim all of the rewards, stop the network from running or getting any transactions in. Should not be a problem if network is large enough. However, this means we need a significant proportion of the world's storage on the system, to defend against google, NSA, etc.
2. 49% attack
    - Ask james
3. Fast VDF attack: an attacker has a faster VDF than anyone else, and does not expose it publicly. This means they can get more out of their space than anyone else. This makes a 51% much cheaper for them. Also, it allows them to charge people for the VDF services. 
    - TODO: compute formula for how much advantage attacker gets, with a p% faster VDF.
4. Grinding attack: This is the attack where a farmer can try many possible combinations in order to see which one gives them the best proof of stake.
    - By default, grinding is prevented by making POS and VDF canonical, so you can only come up with one solution with the space that you have. 
    - There is one attack where the farmer replots their hard drive very fast, with a fast CPU and fast drives. They will only have a very short time to do this though.
    - Another grinding option is if the work difficulty can be set arbitrarily, then the attacker can grind on that difficulty field, although it's invalid since it must be computed from all the blocks.
5. Encryption attack: the pool encrypts all of their data and puts it in the farmer's hard drive. 
Then they ask for the data on every block, making it impossible for the farmer to see the proof of space, and thus impossible to steal rewards from pool (See CHIP14). 
    - One variant of this is where the user downloads the encrypted data. This requires a lot of bandwidth, however it might be practical in the future.
    - Another variant is where a reseller or HDD manufacturer ships the HDD with the encrypted data already on there, or user send it by snail mail and gets it back. 
    It might be a practical business model to resell hard drives with plots on them, and get the fees. Luckily thats a low barrier to entry market.
6. Proof of space efficiency innovations: an attacker can figure out a more efficient way to store the tables and get an advantage this way.
7. Selfish farming attack: similar to selfish mining on Bitcoin. A farmer can choose to withhold his solution, and gain some advantage. Not clear if it's exactly the same, needs more analysis.

## Other attacks
1. Eclipse attack: Node surrounds another node and gives them false information, censors transactions, etc.
