CHIP Number   | TBD (to be assigned by Editor)
:-------------|:----
Title         | Titled CAT Standard
Description   | A standard for CATs that carry immutable on-chain identity and provenance, spanning divisible tokens and indivisible editioned assets
Author        | [Evan Winget](https://github.com/EvanWinget)
Editor        | TBD
Comments-URI  | TBD
Status        | Draft
Category      | Standards Track
Sub-Category  | Primitive
Created       | 2026-05-22
Requires      | [CAT2](https://chialisp.com/cats/), [CHIP-40 (`everything_with_singleton` TAIL)](https://github.com/Chia-Network/chips/blob/main/CHIPs/chip-0040.md), Singleton Standard, Offer Standard. Optional layers: [DID1 (CHIP-4)](https://github.com/Chia-Network/chips/blob/main/CHIPs/chip-0004.md) (creator provenance), [CHIP-56 (Fee CATs)](https://github.com/Chia-Network/chips/pull/194) (royalties), [CHIP-38 (Revocable CATs)](https://github.com/Chia-Network/chips/blob/main/CHIPs/chip-0038.md) (revocability)
Replaces      | None
Superseded-By | None


## Abstract

A **Titled CAT** is a Chia Asset Token (CAT) that carries a verifiable, immutable, on-chain *title*: a name, a ticker, content hashes, a creator DID, and supply commitments, bound to the token by construction. An NFT carries its identity on-chain (name, creator DID, content hash) while a CAT carries none, relying on off-chain indexers. Titled CAT closes this asymmetry, giving any CAT (divisible fungibles and indivisible editioned assets alike) the same immutable, DID-rooted on-chain identity an NFT has, without a registry.

The standard is **additive and opt-in**. Titled CATs do not modify, deprecate, or compete with CAT2. An ordinary CAT remains the right choice for any token that wants mutable branding or no identity at all. Titled CAT introduces no new consensus rules, no new CLVM operators, and only one new puzzle: the **Title Singleton** inner puzzle which composes CAT2, the CHIP-40 `everything_with_singleton` TAIL, the CHIP-56 Fee Layer (for optional royalties), and the CHIP-38 revocation layer (for optional revocability).

The Title Singleton is spent only when supply changes, and never on ordinary transfers. This means that a Titled CAT with no royalty layer costs exactly the same to transfer as a bare CAT2 while carrying full on-chain identity.

A single `precision` field on the title spans the whole fungibility spectrum. **`precision = 1` is the indivisible case: one mojo is one whole token, displayed as an integer count.** This is the natural representation for trading cards, tickets, vouchers, and editioned collectibles. Larger powers of ten yield divisible, decimal-displayed tokens for stablecoins, fractional commodities, and other fungibles that want on-chain identity. One primitive, configured by a single field, replaces what would otherwise require CAT2 plus a registry plus a separate indivisible-token standard.


## Definitions

Throughout this document:

- **Title**: The immutable on-chain identity record of a Titled CAT: name, ticker, precision, content hashes, optional creator DID, optional royalty configuration, optional revocability, and supply commitments. By analogy to a property *title*, it names the asset and records its provenance.
- **Title Singleton**: The on-chain singleton whose inner puzzle holds the Title and controls minting and melting of the token's Units via its associated TAIL. Its launcher ID is the asset's permanent identifier. It is spent only at mint, melt, mint-close, URI-append, and ownership transfer. It is not spent on ordinary Unit transfers.
- **Title ID**: A bech32m encoding of the Title Singleton's launcher ID, with the human-readable prefix `tcat`.
- **TAIL Asset ID**: The SHA-256 tree hash of the CHIP-40 `everything_with_singleton` TAIL curried to the Title Singleton. This is the CAT asset ID that CAT-aware tooling (wallets, DEXs) uses to identify the token's Units.
- **Unit**: The base, indivisible unit of a Titled CAT: one mojo of a CAT whose TAIL is bound to the Title Singleton. Units of the same Titled CAT are interchangeable. Holdings, mint/melt counts, and the supply counters are all denominated in Units. A wallet shows a Unit balance divided by `precision` as a whole-token amount.
- **precision**: The number of Units (mojos) that make up one whole displayed token, committed immutably in the Title. `precision = 1` means one Unit is one whole token, shown as an **indivisible** integer count. This is the recommended representation for trading cards, tickets, vouchers, and editioned collectibles. `precision ≥ 10` means a whole token is many Units and is shown **divisible**, with `log10(precision)` decimal places (e.g. `precision = 1000` gives three decimals, matching the CAT2 convention). `precision` SHOULD be a power of ten.
- **Holder**: A wallet or coin that currently controls one or more Units.
- **Issuer**: The person or entity that creates a Titled CAT. The Issuer's DID (when present) is curried into the Title Singleton at creation and is immutable.
- **Title Owner**: The current controller of the Title Singleton, authorized to mint, melt, close the mint, prepend URIs, and transfer the title. Control may move via `transfer_title` (the immutable `creator_did` binding does not change).
- **Edition Cap**: An optional maximum on the total number of Units that may ever be minted. Immutable once set at creation.
- **Mint-Closed Flag**: A boolean on the Title Singleton. Once flipped to true, no further Units may ever be minted. May never be flipped back.
- **Total Minted**: A monotonically increasing counter tracking the cumulative number of Units ever minted. Never decreases, even on melt. Total Minted is a commitment about issuance, not circulating supply.
- **Circulating Supply**: The number of Units currently in existence, equal to the token's total CAT mojo supply and observable directly from the chain. Equals `total_minted` minus the number of Units melted.
- **Must, required, shall / Must not, shall not / Should, recommended / Should not, not recommended / May**: These follow the same meanings as in CHIP-0005.


## Motivation

Chia supports two token primitives with an asymmetry between them. NFT1 (CHIP-5) carries identity *on-chain*: an NFT commits its name, its creator DID, and a hash of its artwork into its own coin, immutably and verifiably. CAT2 carries *none* of this. A CAT is identified solely by its TAIL hash.

This asymmetry is the problem Titled CAT solves: **assets across the fungibility spectrum deserve the same on-chain, immutable, DID-rooted identity that non-fungible assets already have.**

### The CAT identity gap

Because a CAT has no native identity, that identity must be supplied from outside the coin, and every option has a cost:
- **Impersonation.** Anyone can mint a CAT and call it "wUSDC.b" or "Spacebucks." Nothing at the protocol level distinguishes the genuine issuer's token from a counterfeit with the same name and logo. Users are protected only by off-chain allowlists maintained by each wallet and exchange.
- **Dependence on third parties.** To show a name, ticker, or logo for a CAT, a wallet must consult an off-chain indexer or a registry and trust its answer. The token itself cannot vouch for its own identity.
- **Registration friction.** Decentralized registries such as [CATalog (CHIP-55)](https://github.com/Yakuhito/chips/blob/xchandles/CHIPs/chip-0055.md) improve on bare indexers by committing content hashes on-chain, but they require a registration step and a fee per asset (a legitimate anti-DoS measure). For an issuer with many assets (a trading-card game with 1,000 cards has 1,000 distinct TAILs) that is a real, repeated cost to establish basic identity.
- **No protocol provenance.** There is no immutable, on-chain binding from a CAT to the DID that issued it. Provenance, where it exists, is again an off-chain claim.

NFTs face none of this, because their identity is intrinsic. Titled CAT brings that property to the rest of the asset spectrum. Committing identity on-chain rather than to off-chain infrastructure also keeps the data permanent and decentralized while routing value to farmers through transaction fees.

### Registries solve curation, not the primitive gap

A registry solves two distinct problems: it can *store* identity data, and it can *curate* which assets are considered "official." 

Titled CAT makes only the first intrinsic, so a token no longer needs to be *registered* to establish what it is. It does not attempt curation: which DID is the legitimate issuer of a "wUSDC.b" remains an off-chain, venue-specific judgment, exactly as for NFT1 collections. Titled CAT removes the need to *pay to register identity* without removing the ecosystem's ability to curate trusted issuers.

### One primitive across the fungibility spectrum

A *single* standard serves the entire spectrum of assets that want on-chain identity:

- **Fully fungible with identity**: stablecoins, wrapped assets, governance and utility tokens. The issuer wants a verifiable, immutable name/ticker and DID provenance, and typically no royalty. (Divisible, `precision ≥ 10`.)
- **Fractional claims**: tokenized commodities (gold by the gram), carbon credits, fractional real estate, streaming-royalty shares. The metadata describes the underlying asset.
- **Indivisible editioned assets**: trading cards, event tickets, coupons and loyalty rewards, music editions, proof-of-attendance tokens, in-game items at scale, redemption vouchers. The image and metadata are the asset's identity, the supply is finite, and royalties or revocability are often wanted. (Indivisible, `precision = 1`.)

The indivisible end of this range has strong cross-chain precedent. Ethereum's ERC-1155 (the Multi Token Standard), introduced by Enjin in 2017 and finalized in 2019, established the pattern of many interchangeable tokens per class with class-level identity, and saw broad adoption in blockchain gaming, ticketing, and tokenized real-world assets. Solana's Metaplex and Flow's Cadence resources offer comparable primitives. The consistent lesson is that "fungible within a class, distinct across classes" is a useful shape that neither a pure NFT nor a pure fungible token serves well. Titled CAT brings that shape to Chia *and* generalizes it: the same machinery that makes a trading card's identity verifiable makes a stablecoin's identity verifiable.

### Technical feasibility

Titled CAT is feasible today with no protocol changes. Everything the non-royalty core needs already exists and is deployed: CAT2, the CHIP-40 `everything_with_singleton` TAIL (Final, in production for Revocable CATs), the CHIP-38 revocation layer (Final), and the Singleton and Offer standards. The only new puzzle is the Title Singleton inner puzzle for which audited reference patterns exist. The optional royalty path additionally relies on the CHIP-56 Fee Layer, which is still an open proposal (PR #194). The composition occurs entirely at the CLVM / puzzle-hash level, so no consensus or VM change is required.


## Backwards Compatibility

Titled CAT introduces no breaking changes: it does not modify Chia's consensus, the CLVM, or any existing primitive. It is purely additive and opt-in, and neither replaces nor deprecates CAT2.

A wallet that does not implement Titled CAT recognition will see a Titled CAT's Units as ordinary CATs with a recognizable TAIL pattern (`everything_with_singleton` bound to a launcher ID). It will not display the title's name, ticker, precision, or artwork, and lacking the committed `precision` will fall back to its default CAT display. This is a strictly safe degradation: a non-Titled-aware wallet shows a generic CAT, never a misleading identity.

**Alternatives considered.** The principal alternative is to assemble the same outcome from existing pieces: a plain CAT2, identity in a registry (CATalog), royalties via the CHIP-56 Fee Layer, and a wallet display flag. This composition is reasonable and is examined in detail in the Rationale. The short version is that it leaves identity *extrinsic* (a separate, registered, mutable-by-default record keyed to the asset) where Titled CAT makes it *intrinsic and immutable*. 

A second alternative is extending CAT2 itself to carry mandatory on-chain identity. This was rejected because it would force identity machinery onto every CAT, including the many that neither want nor need it, and would constitute a breaking change to the base fungible primitive. Making identity an opt-in standard layered atop an unmodified CAT2 avoids both problems.


## Rationale

### On-chain Identity

On-chain identity matters for a CAT for the same reasons it matters for an NFT. A hash-committed identity lets any party verify, without trusting an indexer or registry, that the artwork and metadata shown are what the issuer committed to, and an immutable creator-DID binding lets any party trace the asset to its issuer and detect impersonation. These guarantees are as valuable for a stablecoin or a tokenized commodity as for a trading card, arguably more so given the sums involved.

### Title Singleton plus a CAT

The design decomposes cleanly along Chia's coin-set model:

- The **immutable identity and supply discipline**: name, ticker, precision, content hashes, creator DID, royalty configuration, edition cap, mint-closed flag, mint authorization lives once, in a single on-chain object.
- The **fungible holdings**: who holds how many Units, and how Units transfer, split, consolidate, and participate in Offers are what CAT2 already represents.
- The Title Singleton and the token's CAT are bound by the CHIP-40 `everything_with_singleton` TAIL, which commits the Title Singleton's launcher ID. This binding is the heart of the design: a Unit's TAIL Asset ID is derivable from the launcher ID, and the only object that can authorize a Unit's existence is its Title Singleton. Identity is therefore *intrinsic*, and there is no separate registry record and no "which object is the canonical identity holder?" question.

The efficiency consequence: the Title Singleton participates only in mint and melt. A Titled CAT with no royalty layer has the *same per-transfer CLVM cost as a bare CAT2*, so on-chain identity comes at no extra cost for everyday use.

### Immutable identity

Immutability is central to the value proposition and is much of what distinguishes Titled CAT from a registry:

- **Asymmetric failure modes.** A hostile or careless change to an asset's identity *after* holders have acquired it is a far worse failure than the inability to fix a typo. A holder cannot defend against a rename or a re-pointed artwork hash, but an issuer can avoid typos by being careful once, at creation.
- **Verify-once trust.** Immutability lets a wallet or buyer verify identity from the Title ID a single time and trust it permanently. Optional mutability would force every consumer to ask "has this changed, and who may change it?" which adds an attack surface.
- **The rebrand case does not require mutability.** An issuer who genuinely needs to change identity mints a new Titled CAT and offers a melt-and-mint migration.

"Immutable" is precise here. The *commitments* freeze: name, ticker, precision, content hashes, creator DID, royalty configuration, revocability, and edition cap may never change. Two things still move, in tightly constrained ways:

- **URI lists are prependable**: an owner may add new locations for the same hash-committed content (e.g., a fallback gateway), latest-first, but may never alter or remove existing entries. This is the NFT1 pattern.
- **Supply state is one-way**: `total_minted` only increases, and `mint_closed` only flips from false to true.

Issuers who want mutable branding are well served by plain CAT2 plus a registry, and should use it. The principled split is: **immutable identity-bearing CAT (Titled CAT) versus mutable registry-backed CAT2.**

### Mutability solutions

Immutability needs an escape hatch for the case where identity genuinely must change, such as a real rebrand or a corrected content hash. That hatch is migration by melt-and-mint, and it is what makes immutability acceptable. The issuer mints a new Titled CAT carrying the corrected identity, closes the old title's mint, and offers holders a swap: a holder melts old Units with `melt_units` and receives an equal count of the new title's Units.

### DID-rooted provenance

A curried creator DID gives a Titled CAT the same provenance guarantee NFT1 provides: any Unit traces cryptographically to the issuer's DID. It does not make names unique, but it lets venues and wallets recognize the genuine issuer's DID and disregard impostors, which is exactly how NFT1 collections are authenticated today. This approach is expected to make curation of assets more straightforward, as one may choose to curate a list of verified DIDs rather than the assets themselves.

### A single `precision` field instead of separate standards

The base unit is always one mojo, and `precision` only states how many mojos constitute one displayed whole token, exactly as CAT2's 1000-mojo convention does. Because identity and divisibility are orthogonal, there is no reason to build two standards. A single `precision` commitment lets the same Title Singleton, TAIL, and layer stack serve an indivisible trading card (`precision = 1`) and a milligram-divisible gold token (`precision = 1000`) alike.

`precision = 1` is used for the indivisible, integer-displayed case. It has distinct enough semantics to warrant a dedicated wallet display rule. Indivisibility is guaranteed mechanically (a coin cannot be smaller than one mojo), and wallets MUST display an integer count, never a fraction. This safety property is precisely why the indivisible case gets its own display rule rather than being treated as just another `precision` value.

### Optional fee layer and revocation layer

Royalties and revocability are wanted by some Titled CATs and not others, and forcing either onto all would impose cost and complexity on assets that do not need it. Making both optional, reused-as-is layered components keeps the common case (a Titled CAT with neither) as cheap as a bare CAT2 while letting richer cases compose exactly the layers they need. Royalties in particular are oriented to the editioned, indivisible case. Divisible fungibles generally want identity without a per-trade fee, so the Specification recommends they omit the Fee Layer (see *Royalty configuration*).

### Regulated and stablecoin issuers

A regulated fungible token such as a fiat-backed stablecoin typically wants three properties at once: verifiable issuer identity, control over who may hold the asset, and the ability to freeze or claw back. Titled CAT supplies identity intrinsically and composes the other two from existing layers. Holding control reuses the deployed Credential Restricted CAT (CR-CAT) pattern, where a credential layer gates each transfer on the receiver proving an on-chain Verifiable Credential from an authorized provider, and claw-back reuses the CHIP-38 revocation layer. Both add to the inner stack as the Fee and revocation layers do (see *Unit layer stack*), with the revocation layer outside the credential layer by default so an issuer's claw-back path stays independent of the credential check while ordinary transfers satisfy both. 

### Why not CAT2 + CATalog + Fee CAT + precision-1?

This is the most important alternative. A plain CAT2 with `precision = 1`, identity registered in CATalog, royalties via the CHIP-56 Fee Layer, and a CATalog display flag is reasonable and reproduces much of the outcome. The distinction is where identity lives and what establishing it costs:

- **Intrinsic versus looked-up.** A Titled CAT's identity *is* its TAIL, bound to the Title Singleton by construction, with no canonical-holder ambiguity. A wallet reads it by resolving the one object the TAIL already commits to: it walks the Title Singleton's lineage to the current coin and reads the curried fields. That lineage is short, because the Title Singleton is spent only at supply changes, and the walk is the same trustless, full-node operation that NFT and DID wallets already perform to resolve a singleton, with every field verifiable against the on-chain commitment. There is thus no registry to consult and no trusted third party. The CATalog composition instead keeps identity in a separate registry entry keyed to the asset ID, whose answer a wallet must trust the registry to resolve.
- **No per-asset registration cost.** A 1,000-card game is 1,000 registrations and 1,000 fees under the registry approach. Under Titled CAT each title is simply a singleton with no third-party registration step.
- **Immutable by default, not by configuration.** CATalog's default metadata updater permits updating a CAT's name and ticker. Immutability requires deliberately selecting the immutable updater. A Titled CAT's identity is immutable by currying.

Titled CAT does not solve curation, and it is not a replacement for a registry where mutable display metadata is appropriate (a utility token that expects to rebrand). For that, CAT2 plus a registry remains the right tool.

### Curation via registries

Making identity intrinsic does not make registries such as CATalog redundant. The proposed registry does two jobs: it stores identity data, and it curates and indexes assets. Titled CAT removes only the first need, because a wallet can read name, ticker, hashes, and creator DID straight from the chain. The second job remains valuable and is not something the primitive attempts. Verified-issuer lists, collection groupings, search, trending and discovery feeds, and human-curated "official" designations are real services, and they are better supplied by a registry or marketplace than baked into a coin.

So Titled CAT and a registry compose rather than compete. Titled CAT provides a trustless identity substrate, and a registry like CATalog can index that substrate and add curation and discovery on top, annotating titles it has vetted without having to be the authoritative source of what a title is. This is consistent with the position taken throughout: paying to register basic identity should not be a precondition for an asset to state what it is, but curation and discovery are genuine services worth offering and worth paying for.

### Relationship to NFT1

Titled CAT is singleton-anchored and DID-rooted, so a natural question is whether it subsumes NFT1: could an NFT simply be a Titled CAT minted with an edition cap of one? For a *single* unique asset (a one-of-one artwork, a deed) the answer is essentially yes, and a Titled CAT with `edition_cap = 1`, `mint_closed`, and a `creator_did` carries the same intrinsic, immutable, DID-rooted identity an NFT does. But NFT1 is not superseded, because the two standards anchor identity at different granularities, and that difference is architectural rather than incidental.

A Titled CAT puts one singleton around a whole *class* (the title) and holds balances as fungible Units, spending the singleton only at supply changes. NFT1 puts a singleton around every *item*, spent on every transfer, which is what lets each item carry distinct metadata and a DID-bound owner. A CAT Unit has no individual identity by construction: any two Units of a title are interchangeable and merge into one coin, so there is no per-Unit slot for distinct artwork or a distinct owner. Identity lives on the title, shared by every Unit.

This decides which standard fits. A 10,000-piece PFP collection of unique artworks needs a per-item identity anchor, and the only anchor is the Title Singleton, so it requires 10,000 titles *plus* 10,000 single-Unit CATs, roughly twice the footprint of NFT1's 10,000 singletons with the fungibility machinery serving no purpose. NFT1 is correct and cheaper. Storing per-item metadata on the title does not help: the obstacle is not where metadata lives but that fungible Units cannot be individually addressed. The reasoning inverts for *interchangeable* items: one hundred identical copies of a card are one hundred singletons under NFT1, but one title and one hundred fungible Units under Titled CAT. The boundary is individuation. Because Units merge indiscriminately, a Titled CAT cannot assign a per-copy serial number, the "#7 of 100" that travels with one specific copy, so an edition of one hundred is one hundred *interchangeable* copies, not copies #1 through #100. The moment individual copies must be distinguished, by serial number, distinct artwork, or a per-copy owner, the asset has crossed back into NFT1's domain. 

Titled CAT is NFT1 turned inside out: NFT1 is native when items are distinct, Titled CAT when items are interchangeable within a class, including the editioned middle NFT1 serves awkwardly.

DID ownership follows the same line. Titled CAT supports DID ownership of the *title*, but deliberately not of each *holding*. Binding an owner DID to every Unit would have to be spent on every transfer, forfeiting the bare-CAT2 transfer cost, and would make Units non-fungible (a Unit owned by one DID could no longer merge with another's). Per-holding DID ownership therefore stays with NFT1, while Titled CAT provides clean collection-level and issuer-level provenance.

The partition is clean and complementary: **NFT1 for assets whose items are individually distinct or individually DID-owned, and Titled CAT for assets whose items share a class identity and are interchangeable within it**, across the spectrum from divisible fungibles to indivisible editioned collectibles.

### Why scope this to the primitive alone?

This CHIP defines the primitive only. Two companions are anticipated and should be developed separately rather than folded in here:

- **Titled CAT Off-Chain Metadata Format** (Process / Tooling): A JSON schema for the document referenced by `metadata_uri_list`, with fields spanning fungible tokens, fractional claims, and indivisible editioned assets. Analogous to CHIP-7 for NFT1. (The existing metadata draft generalizes directly into this companion.)
- **Titled CAT Collections** (Informational / Guideline): Conventions for grouping multiple titles into a collection (a trading-card set, a family of tokenized commodities, a season-ticket bundle).


## Specification

### Title Singleton

Each Titled CAT shall be anchored by a singleton conforming to the existing Chia Singleton Standard. The Title Singleton's launcher ID is the asset's permanent identifier. The **Title ID** shall be a bech32m encoding of the launcher ID with the human-readable prefix `tcat`.

The Title Singleton's inner puzzle shall curry in the following values. All values marked immutable are committed at creation and may never change. The reference inner puzzle published with this CHIP is the canonical implementation.

#### Identity (immutable)

- **`name`**: UTF-8 string, maximum 256 bytes. The asset's full display name. Immutable.
- **`ticker`**: UTF-8 string, maximum 32 bytes. The asset's short symbol. Immutable. Tickers are not protocol-enforced as unique. Uniqueness is a curation concern.
- **`precision`**: Unsigned integer, the number of Units (mojos) per whole displayed token. Immutable. `precision = 1` selects the indivisible, integer-displayed case. Larger powers of ten (`precision ≥ 10`) make a whole token divisible into `precision` Units, displayed with decimals. Implementations SHOULD reject a `precision` that is not a power of ten.
- **`creator_did`** *(optional)*: 32-byte launcher ID of the issuer's DID singleton. Once set, immutable. If omitted, provenance is traceable only to the puzzle hash of the original Issuer.

#### Content commitments (immutable hashes, prependable URI lists)

Each URI list follows NFT1's pattern: the hash is a one-time commitment, while the URI list may be prepended to (latest-first) but never modified or removed. Wallets should verify fetched content against the hash before rendering.

- **`data_hash`**: 32-byte SHA-256 hash of the asset's primary content (e.g., the card image or token logo). Immutable.
- **`data_uri_list`**: One or more URIs locating the primary content.
- **`metadata_hash`**: 32-byte SHA-256 hash of the off-chain metadata document at creation. Immutable.
- **`metadata_uri_list`**: One or more URIs locating the off-chain metadata document (richer fields per a companion metadata-format CHIP).
- **`license_hash`**: 32-byte SHA-256 hash of the licensing terms at creation. Immutable.
- **`license_uri_list`**: One or more URIs locating licensing and legal terms.

#### Royalty configuration (present only if the fee layer is used)

These values must match exactly the parameters curried into the CHIP-56 Fee Layer that wraps each Unit, so any wallet can reconstruct the expected Unit puzzle hash from the Title Singleton alone.

- **`royalty_puzzle_hash`**: 32-byte puzzle hash to which royalties are directed. Immutable.
- **`royalty_basis_points`**: Unsigned integer in basis points (1 bps = 0.01%). Zero means no proportional royalty. No protocol cap.
- **`royalty_min_fee`**: Unsigned integer, the minimum royalty in mojos of the quote asset. Zero disables the floor.
- **`allow_zero_price`**: Boolean. When `false`, even direct-send transfers must declare a trade price and pay at least `royalty_min_fee`. When `true`, free transfers (gifting) are permitted.

The Fee Layer is oriented to the indivisible, editioned case (`precision = 1`), where a royalty on resale is an established expectation. Divisible titles (`precision ≥ 10`) SHOULD set `royalty_basis_points = 0` and SHOULD NOT set `allow_zero_price: false`. A per-trade royalty interferes with the price discovery and arbitrage that fungible tokens depend on (notably automated market makers), and a floor charged on every transfer makes a circulating fungible impractical to use. A divisible Titled CAT therefore typically omits the Fee Layer entirely, carrying on-chain identity without royalties.

#### Revocability (present only if the revocation layer is used)

- **`revocable`**: Boolean. When `true`, every Unit is wrapped in a CHIP-38 revocation layer between the Fee Layer (or the CAT layer, if no Fee Layer) and the holder's `p2` puzzle, and any Fee Layer present is curried with `has_hidden_revoke_layer: true` and `allow_revoke_fee_bypass: true`.
- **`hidden_puzzle_hash`** *(present only if `revocable`)*: The hidden puzzle hash used by the revocation layer. Immutable.

#### Supply commitments

- **`edition_cap`** *(optional)*: Unsigned integer maximum on `total_minted`. If set, immutable. If omitted, supply is uncapped (subject to `mint_closed`).
- **`total_minted`**: Unsigned integer, the cumulative count of Units ever minted. Strictly monotonically increasing. Melts reduce Circulating Supply but not `total_minted`.
- **`mint_closed`**: Boolean. When `true`, no further mints are permitted, ever. May be flipped from `false` to `true` by the Title Owner.

Wallets and explorers can display supply state in plain language:

| `edition_cap` | `mint_closed` | Display                                       |
| ------------- | ------------- | --------------------------------------------- |
| Set           | false         | `Supply: N / cap C (mint open)`               |
| Set           | true          | `Supply: N final (capped at C, mint closed)`  |
| Not set       | false         | `Supply: N (uncapped, mint open)`             |
| Not set       | true          | `Supply: N final (mint closed)`               |

where `N` is Circulating Supply and `C` is the `edition_cap`, both in Units and shown divided by the title's `precision`.

#### Title Singleton inner puzzle actions

The inner puzzle accepts the following spend actions, identified by a selector in the solution.

- **`mint_units(count, target_puzzle_hash)`**: Authorizes the TAIL to mint `count` Units (i.e., `count` mojos) and send them to `target_puzzle_hash` wrapped in the canonical Unit layer stack. The action derives the canonical Unit puzzle hash from the title's own immutable parameters (the TAIL Asset ID, the declared royalty and revocation layers, and `target_puzzle_hash`) and constrains issuance to coins bearing exactly that puzzle hash, so it cannot authorize a Unit assembled from a non-canonical stack (see *Mint-time stack binding* below). Requires `mint_closed == false` and, if `edition_cap` is set, `total_minted + count ≤ edition_cap`. Updates `total_minted` in the recreated singleton.
- **`melt_units(count)`**: Authorizes the TAIL to melt (burn) `count` Units presented for melting in the same spend bundle. Because the `everything_with_singleton` TAIL requires the Title Singleton to authorize every melt, *and* melting any CAT requires control of the Units being melted, neither the Holder alone nor the Issuer alone can destroy a Unit: melting requires both. This suits issuer-driven redemption (a ticket melted at venue scan) and retirement flows (a carbon credit retired on use), while preventing an Issuer from unilaterally burning a Holder's Units. Does not decrease `total_minted`. Circulating Supply decreases as the burned mojos leave the CAT supply. Titles that wish to forbid melting may omit this action.
- **`close_mint()`**: Sets `mint_closed` to `true`. Permanently disables further minting.
- **`add_uri(key, uri)`**: Prepends a URI to one of the three URI lists (`key` ∈ {`data`, `metadata`, `license`}). Does not modify any hash commitment.
- **`transfer_title(new_owner_p2_puzzle_hash, optional_new_did)`**: Transfers Title Singleton ownership. If the title has a `creator_did`, the spend follows the same DID-aware transfer pattern as NFT1.
- **`update_inner_puzzle(new_inner_puzzle_hash)`** *(optional)*: If included, allows swapping the inner puzzle for a published variant that preserves all immutable curried values, enforced by the inner puzzle itself. Titles that do not need upgradability should omit this action entirely. Wallets should treat any inner puzzle hash not on the canonical-variants list with caution.

### Unit layer stack

Each Unit is one mojo of a CAT2 coin whose TAIL is `everything_with_singleton` (CHIP-40), curried to the Title Singleton via the singleton module hash, the singleton struct (which commits the launcher ID `L`), and a nonce. The puzzle stack is built from the optional layers the title declares:

Minimal (no royalties, no revocation):

```
├ CAT outer layer (cat_v2)
├── TAIL (everything_with_singleton, bound to Title Singleton L)
├──── p2 puzzle (holder's standard transaction puzzle)
```

With royalties:

```
├ CAT outer layer (cat_v2)
├── TAIL (everything_with_singleton, bound to Title Singleton L)
├──── Fee Layer (CHIP-56, curried with the title's royalty parameters)
├────── p2 puzzle
```

With royalties and revocation:

```
├ CAT outer layer (cat_v2)
├── TAIL (everything_with_singleton, bound to Title Singleton L)
├──── Fee Layer (CHIP-56, ... has_hidden_revoke_layer: true, allow_revoke_fee_bypass: true)
├────── Revocation Layer (CHIP-38, curried with the title's hidden_puzzle_hash)
├──────── p2 puzzle
```

Revocation without royalties places the revocation layer directly under the CAT layer. The layer parameters curried into every Unit must match exactly the values committed on the Title Singleton. This gives wallets a complete verification path: from the Title ID, derive the expected stack and the expected Unit puzzle hash, and given a coin claimed to be a Unit, verify the puzzle hash matches.

**Mint-time stack binding.** A Unit's CAT Asset ID is the hash of the TAIL alone, so it is identical whether or not the optional Fee and revocation layers are present: those layers live in the inner puzzle, beneath the CAT layer. Nothing at the CAT layer can therefore distinguish a canonical Unit from one assembled with a missing or altered layer. The Title Singleton's `mint_units` action is the only thing that can, and it is the linchpin of the verifiable-stack guarantee. The action recomputes the canonical Unit puzzle hash `H` (the CAT layer curried with the TAIL Asset ID, wrapping the title's declared Fee and revocation layers and the holder's `p2` puzzle) from the title's immutable parameters, and authorizes issuance only for created coins whose puzzle hash equals `H`. Because the `everything_with_singleton` TAIL delegates all issuance authorization to the Title Singleton, a coin minted with any other stack is never authorized and is not a Unit. The exact condition wiring by which the singleton scopes its authorization to `H` (a committed announcement that each issued coin's spend must assert, or a direct assertion over the created coins) is fixed by the reference inner puzzle against the CHIP-40 authorization interface. This single derive-and-constrain step is the most security-critical code in the standard and the focus of reference-implementation review.

**Persistence across transfers.** Mint-time binding establishes a Unit's stack. The Fee Layer, when present, must preserve it. Titled CAT relies on the CHIP-56 Fee Layer re-wrapping itself on every spend, including ordinary non-Offer transfers, and rejecting any spend that would drop it. A Fee Layer that permitted a plain transfer to settle to a bare `p2` puzzle would let a holder strip the layer and produce a royalty-free coin that shares the title's CAT Asset ID. The royalty-stripping consequences are treated under Security.

### Precision and display

- **Indivisible (`precision = 1`).** One Unit is one whole token. Wallets display an integer count, never decimals.
- **Divisible (`precision ≥ 10`).** A whole token is `precision` Units. Wallets display the Unit balance divided by `precision`, with `log10(precision)` decimal places.

Both cases share the same Title Singleton, TAIL, and Unit-stack mechanics. They differ only in the committed `precision` and the resulting wallet display rule.

### Wallet recognition and display

A wallet implementing this standard shall recognize a CAT coin as a Titled CAT Unit when: 
1. The outer layer is `cat_v2`
2. The TAIL is `everything_with_singleton` committing some launcher ID `L`
3. `L` resolves to a Title Singleton with a valid inner puzzle
4. The Unit's inner stack matches the stack derived from the title's curried parameters

When recognized, the wallet shall display the holding using the title's `name` and `ticker`, sourced from the Title Singleton, formatted at the title's `precision`. Wallets should verify `data_hash` against fetched content before rendering imagery, should surface the `creator_did` when present, and should display royalty configuration and revocability before any Offer involving Units is accepted.

### Offer integration

Offers involving Titled CAT Units that carry a Fee Layer follow the CHIP-56 Offer integration pattern unchanged: the maker's wallet computes the royalty per trade price from the title's parameters, includes royalty settlement payments in the bundle, injects `SetCatTradeContext(trade_nonce, trade_prices)` into each Unit lock-leg spend, and the taker's wallet must include the royalty payments to complete the Offer. Units with no Fee Layer trade as ordinary CATs. Per-Offer royalty cost is bounded per title regardless of Unit quantity.

### RPC calls

Wallets may expose the following RPCs:

- **`titled_cat_create`**: Create a Title Singleton and optionally mint an initial batch. Parameters include `name`, `ticker`, `precision`, the three URI/hash sets, optional `royalty_*`, optional `revocable`/`hidden_puzzle_hash`, optional `edition_cap`, optional `initial_mint_count`, optional `did_id`, `target_address`, and `fee`. Returns `title_id` (`tcat…`), `title_singleton_coin_id`, `tail_asset_id`, and transaction info.
- **`titled_cat_mint`**: Mint additional Units. Parameters: `title_id`, `count`, `target_address`, optional `fee`.
- **`titled_cat_melt`**: Melt Units. Parameters: `title_id`, `count`, optional `fee`. Requires both Title Singleton authorization and control of the Units. The title must expose `melt_units`.
- **`titled_cat_close_mint`**: Permanently disable minting. Parameters: `title_id`, optional `fee`.
- **`titled_cat_add_uri`**: Prepend a URI. Parameters: `title_id`, `key`, `uri`, optional `fee`.
- **`titled_cat_transfer`**: Transfer Units to an address. Parameters: `title_id`, `amount`, `target_address`, optional `trade_price`, optional `fee`.
- **`titled_cat_get_info`**: Return a title's on-chain state (all curried fields, `total_minted`, `mint_closed`, derived Circulating Supply). Parameters: `title_id`.
- **`titled_cat_get_balances`**: Return the wallet's holdings aggregated per title. Parameters: optional `wallet_id`.
- **`titled_cat_revoke`** *(revocable titles only)*: Revoke specified Units. Parameters: `title_id`, `coin_ids[]`, `destination_puzzle_hash`, optional `fee`.


## Test Cases

Test cases will be added to `assets/chip-<assigned-number>/tests/` and will cover, at minimum:

- Title creation across the precision range and option combinations. Indivisible (`precision = 1`) and divisible (`precision ≥ 10`), with and without DID, royalties, edition cap, and revocability.
- Verification that Unit puzzle hashes derived from the title's curried fields match the actual on-chain Units, for each layer-stack variant.
- Initial mint and subsequent mints respecting and exceeding the edition cap (must fail when exceeding). Minting after `close_mint` (must fail).
- Melting via `melt_units`: Circulating Supply decreases while `total_minted` is unchanged. Melt without Title Singleton authorization (must fail). Melt without control of the Units (must fail).
- Ordinary transfers, splits, and consolidations of Units.
- Verification that a minimal (no-Fee-Layer) Titled CAT transfer has the same structure and per-transfer cost as a bare CAT2 transfer.
- Decimal display correctness across `precision` values. Assurance that the indivisible case (`precision = 1`) never produces a fractional display.
- Offer settlement with royalties correctly enforced (CHIP-56), underpaid royalty (must fail), CAT-denominated trades, multiple titles in one bundle, and a Titled CAT alongside an NFT1 royalty (all must settle).
- Title ownership transfer between DIDs.
- URI prepend on each list. Attempted modification or removal of existing URIs (must fail).
- Attempted modification of any immutable field: name, ticker, precision, hashes, royalty parameters, revocability, edition cap, creator DID (all must fail).
- Revocable titles: hidden-puzzle revocation succeeds. Normal transfers continue to work. Revocation by a non-controller fails.
- A non-Titled-aware wallet displays Units as ordinary CATs with the TAIL asset ID (no scam vector introduced by the standard's existence).


## Reference Implementation

The reference implementation will be provided in:

- `chia-wallet-sdk/crates/chia-sdk-puzzles/puzzles/titled_cat_inner_puzzle.rue` will contain the Title Singleton inner puzzle, written in [Rue](https://github.com/Rigidity/rue) and compiled to CLVM. Following the convention established by the CHIP-56 Fee Layer (`fee_layer_v1.rue`), the `chia-sdk-puzzles` crate owns the Rue source alongside the embedded compiled bytes and serialized tree hash.
- `chia-wallet-sdk` will contain the typed Rust bindings and the driver layer for Title Singleton construction/spending and Unit parsing/construction.
- `chia-blockchain/chia/wallet/titled_cat/` will contain the wallet integration, RPC handlers, and indexing.

The Title Singleton inner puzzle composes with the existing Singleton, CAT2, CHIP-40 TAIL, and CHIP-38 revocation layer (Chialisp) and the CHIP-56 Fee Layer (Rue). Each layer curries the hash of the layer it wraps, meaning that the source language of each layer is immaterial: a Rue-authored inner puzzle interoperates with Chialisp-authored layers transparently. This mixed-language stack is the same one already used in production by Revocable Fee CATs.


## Security

### Duplicate Titled CAT names

Titled CAT does not make names unique, and it does not decide which issuer is legitimate. An attacker may mint a Titled CAT with a `name` and `ticker` identical to a genuine one. Mitigations are the same as for NFT1 collections: wallets should surface the `creator_did` prominently, and wallets and marketplaces should maintain reputation overlays (verified DIDs, allowlists, denylists).

### Title Singleton key compromise or loss

An attacker controlling the Title Singleton key (or its DID) can mint additional Units up to `edition_cap` (or without bound if uncapped), prepend URIs, transfer title ownership, and close the mint. They cannot modify any immutable field, change royalty parameters, alter the creator DID, or revoke held Units. Issuers should set an explicit `edition_cap`, close the mint once the intended supply is reached, custody the controlling key in a vault/multisig/hardware wallet, and keep it separate from the revocation hidden-puzzle key for revocable titles.

Key *loss* is the opposite failure. With no controller, the title freezes in its current state (no mint, melt, mint-close, URI prepend, or transfer), while existing Units keep transferring normally because ordinary transfers never touch the singleton. For an already-closed mint this is benign and even makes the supply cap more credible, since not even the issuer can add to it. For an open or actively managed title it is a permanent loss of control, so issuers should custody the key durably and close the mint once issuance is complete.

### Creator DID over time

The curried `creator_did` is immutable, but the DID singleton it names is not frozen by it. That DID can be transferred, abandoned, or compromised over the asset's life. The binding therefore proves which DID issued the title at creation, not who controls that DID today, exactly as for an NFT1 collection's creator DID. Wallets and curators should treat the DID as a provenance anchor whose reputation is tracked over time, not as a permanent endorsement.

### Royalty integrity and bypass

For titles using the Fee Layer, royalty integrity rests on a two-link chain, and each link has a distinct failure mode.

*Mint-time binding.* A Unit's CAT Asset ID does not depend on the presence of the Fee Layer, so the guarantee that minted Units actually carry it comes entirely from the Title Singleton's `mint_units` action constraining the issued puzzle hash (see *Mint-time stack binding*). This makes the inner puzzle's derive-and-constrain step the most security-critical code in the standard: a flaw there would let the Title Owner issue royalty-free coins indistinguishable by Asset ID from royalty-bearing ones.

*Transfer-time persistence.* Even a correctly minted Unit stays royalty-bearing only if the CHIP-56 Fee Layer re-wraps itself on every spend and rejects spends that drop it (see *Persistence across transfers*). If it does not, a holder can strip the layer in a single ordinary transfer.

A stripped or non-canonically minted coin does not disappear: it carries the title's CAT Asset ID under a bare inner puzzle. A Titled-aware wallet rejects it, because its stack fails the recognition rule, and so will not trade it as a Unit. This is the backstop. But a CAT-only or non-Titled-aware wallet sees a generic CAT of that Asset ID and may accept it, so wallet recognition bounds the damage without eliminating it. Issuers for whom royalty integrity is critical should weigh this. It is inherent to placing royalties in a strippable inner layer beneath a shared Asset ID, and is not specific to Titled CAT.

Finally, even with both links sound, two cooperating parties can arrange an off-chain payment and use the transfer path to move Units without an Offer, bypassing the royalty. The CHIP-56 mitigations apply unchanged: `allow_zero_price: false` forces every transfer to declare a trade price and pay the royalty floor, and `royalty_min_fee` deters nominal-price evasion.

### Offer reliability for revocable titles

For revocable titles, the CHIP-38 and CHIP-56 offer-reliability considerations apply: an attacker controlling the hidden puzzle could revoke Units mid-settlement, causing buyer-side Offer execution to fail. Wallets accepting Offers for revocable titles must display revocability prominently so users can judge the issuer's revocation risk.

One ambiguity is *removed* with Titled CATs. CHIP-38's "revocability confusion scam" exists because a bare revocable CAT shares its asset ID with a non-revocable one, so a wallet must heuristically guess whether coins are revocable. A Titled CAT commits `revocable` on the title, and recognition requires a Unit's stack to match that commitment. A Titled-aware wallet knows definitively whether Units must carry the revocation layer and rejects any that disagree, rather than guessing.

### Update path

The optional `update_inner_puzzle` action lets future variants be adopted by existing titles, but a compromised key could swap to a malicious inner puzzle. The reference inner puzzle requires any replacement to preserve all immutable curried values, and wallets must verify a new inner puzzle hash against the canonical-variants list before treating the title as conformant. Titles that omit this action eliminate the attack surface entirely.


## Additional Assets

The following additional assets are anticipated as the reference implementation progresses:

- `assets/chip-<assigned-number>/titled_cat_inner_puzzle.rue`: canonical inner puzzle source (Rue), to be added during Draft.
- `assets/chip-<assigned-number>/titled_cat_inner_puzzle.clsp.hex` and its tree hash: compiled CLVM bytes mirroring the source, following the CHIP-56 Fee Layer convention.


## Copyright

Copyright and related rights waived via [CC0](https://creativecommons.org/publicdomain/zero/1.0/).
