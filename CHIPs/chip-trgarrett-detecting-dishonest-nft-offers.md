CHIP Number   | < Creator must leave this blank. Editor will assign a number.>
:-------------|:----
Title         | Detecting Dishonest NFT Offers
Description   | 
Author        | trgarrett (@trgarrett on Keybase, https://github.com/trgarrett)
Editor        | < Creator must leave this blank. Editor will be assigned.>
Comments-URI  | < Creator must leave this blank. Editor will assign a URI.>
Status        | < Creator must leave this blank. Editor will assign a status.>
Category      | Informational
Sub-Category  | Informative
Created       | 2025-03-08
Requires      | <CHIP number(s), (optional)>
Replaces      | <CHIP number, (optional)>
Superseded-By | <CHIP number (only allowed for Obsolete CHIPs)>

## Abstract
Under a narrow set of circumstances, there are possible bypasses for NFT1 royalty trading via colluding offers. By lying within or completely omitting the `trade_prices_list` from the NFT transfer program solution, an offer maker can under-declare the value transfer involved. An honest taker might simply re-calculate royalties themselves and append them on, while a dishonest taker could omit their royalty payment with no impact to the validity of the spends. The two primary threats that might result are wash trading and NFT "flippers" who are unwilling to pay royalties. To increase trader confidence, it may be necessary to provide special handling to those offers in wallets, offer display services, and in the calculation of trading volumes. Further mitigations are possible but the costs likely outweigh the benefits.

## Motivation
This proposal is meant to inform ecosystem participants how they can provide a favorable environment for honest traders and NFT project creators while decreasing the effectiveness of dishonest traders. This proposal will help in smoothing out a couple of edge cases where the full vision of "royalties guaranteed on-chain" has not yet been realized. While increased user adoption on the Chia blockchain is desirable, this would help ensure that fewer of the new entrants arrive with the intention of scamming.

The core use cases proposed are to 1.) make wash trading involving royalty bypasses ineffective and 2.) make it more difficult for NFT flippers who are willing to collude to bypass royalties to find one another.

Once the underlying limitation involving the NFT transfer program's "trade prices list" is understood, detecting dishonest offers is relatively straightforward for most cases.

## Backwards Compatibility
As an Informational CHIP proposal, there are no impacts to backward compatibility. However, ecosystem participants informed by this proposal should be cautious in making changes that could have side effects.

## Rationale
This proposal is meant to inform users and ecosystem builders on things they should be cautious about and might require mitigation. A change to the default NFT transfer program and settlement layer puzzles was also considered, as was aggressive mempool validation to look for propagated dishonest offers.

Even if a reasonable solution to dishonest offers existed in the form of modifications to the default NFT transfer program and/or settlement layer puzzles (often referred to as OFFER_MOD), the migration process from NFT1 to NFT2 would likely be painful for all ecosystem participants, as it would require extensive modifications of tooling and systems within the ecosystem. It is the opinion of the author that the NFT1 "OG" projects will be the most likely to be targeted for any royalty bypass attacks as they will have the deepest provenance and rarity.

Mempool validation could be effective with higher-powered full nodes but would likely use a lot of energy and resources even if it never found anything to reject. One could relatively quickly determine if an offer was atomically honest (the sum of all buckets of the NFT transfer program's "trade_prices_list" was accounted for 1:1 in the offer's requested value). However, in a more advanced attack, it could be possible to create cyclic announcement dependencies with other spends in the mempool at the same time for unaccounted additional value transfer. This remains distinct from the non-atomic "trust me bro" transfer of NFT and payment because two participants, both who know the other is dishonest (by being willing to bypass royalties) may still be protected from one another.

Objections raised included 1.) we are currently seeing lots of royalties being paid, 2.) guaranteeing royalties is an unsolvable problem, 3.) users can always just fraudulently transfer NFTs in exchange for independent transfers of value, and 4.) we are as good or better as other chains already. There are insights within each of these, but the focus uniquely being carved out by this proposal is making sure that 1.) display of offer-driven trading volume doesn't reflect flagrant wash trading activity, and 2.) honest ecosystem partners don't become complicit in enabling market manipulations.

## Specification
There are two classes of offers that might appear. The first is transparently dishonest, while the other is only suspicious.

### Dishonest Offer
If one or more NFTs is being traded for one or more coins, the summation of all trade_prices_list payments should equal the sum of all value being requested in the offer. If it is not, the offer maker is explicitly under-declaring the pricing that will drive royalty calculation.

Handling dishonest offers would be at the discretion of the offer display service but could include 1.) complete suppression, or 2.) visual/metadata flagging cues. Although collusion with a dishonest taker is required to complete the bypass of royalties, offer display services likely don't want to participate in matchmaking of dishonest parties.

### Suspicious Offer
In an analogous real world scam, ticket scalpers have invented bundling to circumvent rules on the maximum sale price of secondary sales of event tickets. They will offer, for example, a bundle of an event ticket and some sort of "collectible" doodad for a total price well exceeding the allowable selling price of the ticket. Their argument is that the collectible as been valued at the price of the difference, so they are thus not breaking any laws.

In NFT trading, one could throw some value of CAT or undesirable NFT into the offer, regardless of whether those assets have any desirability or market traction, and say that the difference in trade price was attributable to that value being added in the bundle. While it is unknown if dishonest offers are explicitly being used now, there have been clear examples on Dexie and other offer display services of bundling desirable and undesirable tokens in order to manipulate royalty calculations. Since the wallets which serve as takers are independently re-calculating royalties in this case and trying to allocate them across all the NFTs, there is a clear motivation for offer makers to get "creative" in malicious ways.

Offer display services should use their own discretion in how they might interpret and act on such offers. In addition to `trade_prices_list` clues, bundling perceived "blue chip" collections with collections that rarely sell is likely suspicious. While not every complex offer of NFT in exchange for value is suspicious, the more complex offers definitely have more ability to hide gremlins.

## Test Cases
This has been previously exercised on mainnet, and this can be used as an example test case for a dishonest offer: https://dexie.space/offers/DuVV2sKXWTX1qCo8jTNZeQvoyK7mgoDn1hPh2vPNZACB

Offer block:
```
offer1qqr83wcuu2rykcmqvpsxygqqemhmlaekcenaz02ma6hs5w600dhjlvfjn477nkwz369h88kll73h37fefnwk3qqnz8s0lle00rdhtajjcrknl4mnxm0dw6wewfhmj6j5tmaedtw8xtmlc0lavxu4qupx2py5p5ytdn34kje80rn8wfqg9qr5cl03g5l0efl06mgxt6mym6h8umhna4ln80unqvg75s9w4qy06lal5as5vcwn5mxk485krdx3wl67c0ld3lhg9tne4vnsn6axtaex5520e0znvk707lyymztvf0h9n59l28e6x46zvnfwk39wnjpmkl9psx4m3jcws3g6zgwf6jqen4y0j0e6jyeqgf6jyp5hks0a9237plth9ultsau6jdka88fy7lw50n3873re33y2t0w5ul4354n0alc9408kdatl3yl7u4f42dp2as0dw7g9en630l4s73447mvnv4m5jf86uh8slep6nyn8grpgrdr0l9rxkr3d47emy2aw8t2m6mkfc4jhuj7wr6696zd4p2ulqxyah6s56qscnklpn0knxlsqf0mqs8hleupjl7gz2aswqmaha7ekxrjmtv624edfvm9ja6rczlev70jy8vru28a87kj2vfy6y42fdfzcjljpfe3xd8n42f38r25ee8lsx85puynwjj2xycjez3serxy5qanzhp54tf932aqmy36sq9grc0we9z3jcfduytda8hd59nzan2fcxtw2ljxncw5n9jfc9gnjn4adxnfz3dx588wadahlm2xf9y5zvg4hmlvu6tjwcjst8kgg6wvfjk55273en9uan75e08zuj3veq5jen7te0gj32f2q9ajze5z67ejwz9cnhku3xvm5xed6t9ps3p9rg624mtxdtl2kcnmv6nd7x87lllaxmnf0l6ugxuu2kwplpa5ryersk75nsre5xfv9cq3zwve3dl9dew5dm7rhat55a0khldxfy0j2kq26579du30dfah6lh4gs9gmn50vxsh4t7tm08l65frmxl8d370ekx65whaafx2am0tza8nqw0084e0je39a0wa3z3s685mg9q5h2aq6d46p4rvq00lg7n4rzyd5layeg6pegl2827l65h9l3fqn538al6pp8euafmj4klrdjxh03w0e2pgtrhdx004x55r98wew0el9ecen4ka3ttm7whlfr9x34mphdj0ctde5h94m6jjv8l6yg9jtzyun5hf48fwn299x40ld8wftknsd8hfnr7np6n0c0pt8h6vzxrn07ye5anvmx8lnmj703p79k8e7wmrleqjqgvzr0uqnjrlwgz62cdtvx7ggqrw7krs7q6fty866taucfd4ktlnjh0xffh9wnxevhardldv5a36jcda88cgmn5jl4w09pdx87kp7l3c2eawq2dv2nkvqft7jw8rtlutje0xp55fkz5h4kr3u846902xu7valvu9r92rsr2t76n44mpml4cragwcvks8rgpsqwqumd7sgcrs70jcll07qfyuntkd92ltnmawaqg8lm6rvmafjmy6chmths2vu43a0sn3narujmgp2u0lskzqd5xpvcfdgpz0qmfehrkdhjl5t5nuzf7gr2dfuull8lllme5w69e5wt5hntvdmstjlnegt86zqw87nwq27e6tl0948ehs2s77q4tsr8fd4s5k6n03h84md4hrfyhkaa2l0yklfafdmkje4jl5r6e5c7m7m5hzz0f454eh8rct460jrltgfqza00jlxpmjavm
```

Please note that it is important to test with an offer value sufficient that it would trigger royalties, as small royalties for small payments often truncate down to 0 mojos when integer math is applied.

## Reference Implementation
While this has not been produced yet, the community would likely benefit from a reference implementation of an offer verifier that renders an opinion on whether an offer is suspicious or dishonest.

## Security
From the perspective of CNI, this has been identified as explicitly NOT a security issue. From the perspective of NFT project owners who feel they are owed perpetual royalties from their collections, having a way to bypass these payments is considered a security issue, and the ones I talk to welcome a set of community mitigations to the issues.

## Additional Assets
None at this time.

## Copyright
Copyright and related rights waived via [CC0](https://creativecommons.org/publicdomain/zero/1.0/).




