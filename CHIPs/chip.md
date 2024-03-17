CHIP Number   | 
:-------------|:----
Title         | Ban NoSSD
Description   | Take back our Nakamoto Coefficient and enforce CHIP-0022 by blocking NoSSD from creating blocks from it's address.
Author        | Dylan Rose, evergreendrose
Editor        | 
Comments-URI  | 
Status        | 
Category      | Standards Track 
Sub-Category  | Core 
Created       | 2024-04-16 
Requires      | None 
Replaces      | None 
Superseded-By | None 


# Abstract
Over the last 12 months, the Nakamoto Coefficient (NC) of Chia has rapidly decreased. The official Chia Pooling Protocol was created to combat this, but closed source software that doesn’t follow the protocol has gained adoption and subsequently reduced the NC from over 100 to 7. This CHIP Introduces a patch to NoSSDs lack of compliance with the official pooling protocol by blocking future block production from their single farmer address. Once the patch is implemented, NoSSD farmers will have to replot in order to continue farming. They will be encouraged to plot to their own keys, instead of a central entity. We would expect a >5x increase in NC, without requiring a replot from farmers who are farming on a compliant plot format.

# Definitions
There are some key concepts we must understand first.
##Nakamoto Coefficient
The Nakamoto Coefficient is a measure of how decentralized a blockchain is by examining the distribution of unique block producers. Chia’s revolutionary pooling protocol enabled Chia to become the most decentralized chain with a NC of over 100, which is now down to 7 due to NoSSD not following the pooling protocol. 
You can monitor Chia’s NC here https://dashboard.chia.net/d/6S16D9AVk/nakamoto-coefficient?orgId=1&var-adjusted_nc=_adjusted%7B

## Block Production
Per Chia’s core principles, farmers, not pools, sign blocks. Centralized block production like in BTC creates opportunities for censorship and concentration of power. Decentralized block production, such as in Chia, is a cornerstone of creating a network that will operate beyond the will of a small group of individuals.

## Pooling
Pools are central to widely distributed consensus mechanisms as they allow farmers of all sizes to get consistent rewards by working together. While this typically leads centralization, Chia’s pooling protocol enables farmers to sign blocks and was the primary contributor to its >100 Nakamoto Coefficient .

## Censorship Resistance
Censorship Resistance is a factor if how easy it is for any one entity, such as a government, to control the contents of blocks. It is almost directly correlated with Nakamato Coefficient and is safe to assume that a high NC translates to high Censorship resistance.
  
# Motivation
This section will discuss why patching NoSSD is needed. First it will discuss proprietary Chia Pools, the risks of NoSSD, and nature of censorship resistance on Chia.

## Proprietary Chia pools (copied from Chip 22 credits to Harold Barnes)

In the time since Chia's mainnet launch, multiple closed-source proprietary pools have been introduced. These pools do not conform to Chia's official pooling protocol. In certain cases, the pools require proprietary plots, thus disallowing users to change pools without replotting. In other cases, the pools create and sign the blocks, while allowing the use of official plots. The thing these pools have in common is that they require a proprietary farmer, which can change the farmer reward address in order to charge a developer fee.

While these proprietary pools do not violate Chia's consensus (they create valid blocks), they are a step backwards in terms of security and decentralization. For example, if a centralized pool stopped creating blocks (due to a number of potential reasons, including simply going out of business), then that pool's portion of the netspace would be taken offline until its users could replot their space (for pools that require proprietary plots), or change to another pool (for pools that allow official plots).

## NoSSD's lack of compliance
NoSSD has failed to communicate their motivations around adoption Chip-22. NoSSD is not a doxxed entity and has sparingly communicated with the community. Many farmers of NoSSD have been warned that due to its centralized nature, their plots are not secure, and at any time NoSSD could render their plots worthless. As we approach a network wide replot with the upcoming compression resistant hard fork, we must consider weather NoSSD will comply, or continue to create software that centralizes block production and leaves Chia vulnerable. If NoSSD has failed to comply with Chip 22, and will not comply after this chip is implemented, it is clear they are not serving the interests of the chain and must be avoided at all costs.

## Improving Censorship Resistance
The Chia pooling protocol is central in preventing censorship on chain, and NoSSD’s plot format has directly deteriorated it. It may seem draconian to enforce compliance through censorship, but consider this as a patch to a bug in consensus rather than a targeted attack to limit speech. By centralizing their plot format, NoSSD has left themselves vulnerable to censorship, and by extension the rest of the network. Patching this bug by preventing their plots from creating blocks actually brings more censorship resistance to the chain, and dissuades entities from creating centralized plot formats in the future.

Proposed solution
This CHIP will add a single change to the node to prevent future block production from the NoSSD address xch1n777zmsr74wgtm8efjezvzplel38xl2wv2dfs8jak04qawvs0t6q6dhf2x.  
If this CHIP is accepted, NoSSD farmers will have to replot and NoSSD will have to create a new plot format, ideally one that is compliant with Chip-22.

## Backwards Compatibility
This Chip will require a soft fork, and farmers will need to upgrade their client to ensure they reject blocks that are signed by NoSSD. NoSSD plots will no longer be compatible and those farmers will need to replot, however all other farmers plots will remain valid.

## Rationale
If NoSSD had adopted Chip 22, we would see a rapid rise in NC. Their failure to adopt chip 22 has left farmers with little choice but to enforce compliance. 
Developers should be able to get paid for their efforts. However, this should not come at a compromise to security or decentralization. Therefore, we are proposing a way to enforce Chip 22 by closing the opportunity for NoSSD to continue to centralize block production.
Chip 22 has been well accepted by the community and plot vendors, and adopting it should not be optional. Those who do not comply leave themselves vulnerable to censorship, and subsequently reduce the security of the entire chain.
The decision to use censorship as a means of increasing decentralization is quite contentious. It requires out of the box thinking to justify executing a hard fork that specifically targets one bad actor to greatly benefit good actors.
There is an argument to be made that NoSSD is not a bad actor and not a threat to the chain, but in my view they have an opportunity now to address their intentions, and act upon them by implementing Chip 22. When it’s clear that the chain supports hard forks as a means of maintaining decentralization, it’s unclear why this specific hard fork to rapidly improve decentralization is not more attractive. 
You can think of this as a security patch rather than censorship of a developer. We’ve identified a bug in consensus which allows NoSSD to rapidly centralize the network, and are forcing a change that will set a precedent against any developer who wishes to centralize block production.
We are not setting a precedent that any developer can be censored. We are setting a precedent that if your system harms the unstoppable nature of Chia, and itself is stoppable, then it should be stopped, much more akin to implementing compression resistant plots, and forking out those who don’t comply. Doing this will make it harder for all actors to be censored as it will achieve a rapid rise in NC.

# Specification
There is a simple change to prevent block production from NoSSD going forward. Changing the node to no longer accept blocks signed by NoSSDs address will mean that the primary chain will no longer recognize NoSSD in its current implementation.
TODO Implement change to full node to prevent nodes from accepting blocks created by NoSSD

If NoSSD were to change their address, farmers would still need to replot, and would have to consider that plotting to NoSSD leaves them vulnerable to getting forked out in the future if they chose to plot to a non-compliant plot format.

There will be a 3 month transition window once the soft fork is accepted by farmers, so NoSSD farmers have time to move to a compliant plot format and all other farmers have time to update their node. 

Other considerations are how long it would take for the soft fork to actually be implemented. In order for this to be effective, it would need to be fast tracked or appended to Chip 22. Failing to do this quickly would give NoSSD time to create a new address and circumvent this patch. 

It is also worth mentioning that alternative plot formats like Gigahorse 3.0 and Dr Plotter may eat away at NoSSD over the next several months. At this time it is pure speculation. We have no way of knowing what they are developing, and if it is compliant with Chip 22. It is too hard to hinge NC on speculation, especially when there is a clear answer. 

# Security
One may be concerned that this act of censorship would signal a lack of security.  However a rapid increase in NC is the strongest indicator of security we have. So a 5x+ increase in security as a result of this Chip seems like a net benefit for security.

# Copyright
Copyright and related rights waived via [CC0](https://creativecommons.org/publicdomain/zero/1.0/).



