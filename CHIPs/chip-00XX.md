CHIP Number   | < Creator must leave this blank. Editor will assign a number.>
:-------------|:----
Title         | Pooling Protocol v2
Description   | A modernization of the pooling chialisp and the protocol between farmers and pools.
Author        | Quexington
Editor        | < Creator must leave this blank. Editor will be assigned.>
Comments-URI  | < Creator must leave this blank. Editor will assign a URI.>
Status        | < Creator must leave this blank. Editor will assign a status.>
Category      | Standards Track
Sub-Category  | < Add according to Category>
Created       | <Date created, using yyyy-mm-dd format (ISO 8601)>
Requires      | CHIP-0043
Replaces      | <CHIP number, (optional)>
Superseded-By | <CHIP number (only allowed for Obsolete CHIPs)>

## Abstract

This CHIP proposes a new set of Chialisp puzzles to be used for plot NFTs and the p2 singletons that uses modern paradigms to construct a more flexible and robust pooling protocol.  The Chialisp is designed to resemble the existing vault standard with only a couple of extra puzzles that enable the partial custody characteristic of the pooling protocol. This redesign will allow greater flexibility for upgrades should they be needed in the future and will benefit in robustness due to sharing code with vaults.

## Motivation

With the upcoming hard fork, we are presented with the unprecendented and one-time opportunity to modernize the pooling chialisp.  This opportunity has come about because, with a necessary replot across the entire network, the cost of launching a new standard is very minimal compared to before.  The pooling chialisp as it stands uses an outdated singleton without support for hints and a more expensive overhead.  The chialisp puzzles also contain some outdated concepts like p2_singletons that self-destruct and an emergency escape hatch in case the singleton is lost (a feature that might be feasibly said has never been used).  Removing this legacy code and bringing the chialisp up to modern standards can have benefits for future extensibility as well as potential cost savings due to compression being more effective since the chialisp resembles existing standards like vaults.  The addition of hints to the standard also enables the transfer and removal of plot NFTs from the wallet which has been a consistent pain point.

## Backwards Compatibility

It's important to be clear that these new plot NFTs are entirely independent of the plot format.  The change in plot format presents us an opportunity to upgrade with a minimal amount of pain, but is not a requirement in any way for the functioning of these new plot NFTs.

These are of course new plot NFTs which means they need to be created from scratch and therefore will need new plots dedicated to them.  They are "incompatible" with any previous plot NFT chialisp, but every plot NFT is incompatible with other plot NFTs in any case so this is not a concern.

The main question of compatibility to consider is whether the old standard should remain supported.  It's tantalizing to have the ability to delete support for the old standard and keep farming code as simple as possible.  There's no reason, if everyone adopts the new standard during the replot, that anyone should be using the old standard and therefore a removal of support would make sense.  This does, however, place responsibility on all pools to upgrade to the new standard when they could, in theory, just not change anything and only support users who plot to the old standard.  The author of this CHIP would prefer that mandatory upgrade be the case, but it is, of course, open to discussion.

Outside of just the discovery of singletons by the new puzzles, the pooling protocol itself will be upgraded when pooling with a newer plot NFT.  Here's a summary of the changes that a pool will have to implement to support these v2 users:
* New plot NFT v2 users will submit to all endpoints with the same name but under a `/v2/` prefix.  If there is a period where pools need to support both types of users, this helps to distinguish between the logic that the pool should be using for that user.  It's possible to just have the pool side figure out what version a user is each time, but one can imagine this is the simpler route. 
* (placeholder for summary of partial payload change)
* The `GET /pool_info` needs to return one extra item `pool_memoization`. This key is basically "what should come after the first two arguments to `CREATE_COIN`? Like `target_puzzle_hash` and `relative_lock_height`, this cannot change without all existing users leaving and returning to the pool".
* A new endpoint called `get_auth` that actually provides support for real authentication tokens.  The idea behind the endpoint is to provide a hook to send a signature and receive a string token in return that you use with the other endpoints `POST /partial`, `PUT /farmer`, and `GET /farmer`.
* The `authentication_key` submitted as part of a `POST /farmer` request will now also correspond to the synthetic pubkey that the singleton uses to sign the spends, and when messages are signed as part of the protocol, an extra derivation is performed on the key before signing just to protect against potential shenanigans (see specification section)

## Rationale

The design rationale for the new chialisp puzzles were to mimic as close as possible the existing vault standard while adding the necessary features for pooling.  The MIPS custody spec is designed to be quite flexible and in the future it should be possible to extend it to support additional custody of plot NFTs besides just BLS keys.  If the vault standard is extended in these ways, it should be possible in turn to extend the plot NFT standard.  This also reduces burden on explorer type applications which can look up plot NFTs with similar code to looking up vaults.

Special attention was paid to make sure that pools can pretty flexibly specify what happens to rewards, although they are still restricted to simply fowarding the rewards to a puzzle hash.  However, now they can specify additional hints and memos as part of this process which should enable custody by such things as vaults.

Rationale for changes to the protocol itself is a little bit squishier, many were conveniences noticed while implementing a reference pool that supports the new plot NFTs.  The initial pool standard was somewhat rushed and since we have this opportunity, it's maybe not such a terrible idea to try to make some logic a bit more paradigmatic and robust.

## Specification

### New Plot NFT Chialisp

As mentioned, the new chialisp puzzles borrow from the MIPS and vault standards as much as possible.

The p2 singletons are a simple MIPS puzzle with a nonce of `0`, no restrictions, and a [singleton member](https://github.com/Chia-Network/chia_puzzles/blob/main/puzzles/mips_puzzles/member_puzzles/singleton_member.clsp).

The plot nfts while self pooling are, of course, at the outermost layer a [singleton v1.1](https://github.com/Chia-Network/chia_puzzles/blob/main/puzzles/singleton_top_layer_v1_1.clsp) then -> a MIPS puzzle with a nonce of `0`, no restrictions, and a [member puzzle mimicking the functionality of the standard puzzle](https://github.com/Chia-Network/chia_puzzles/blob/main/puzzles/mips_puzzles/member_puzzles/bls_with_taproot_member.clsp).

The plot nfts while pooling are, again, a singleton v1.1 then -> a MIPS puzzle with a nonce of `0`, no restrictions, and an MofN (N == 1) layer containing two members (in this order):
* a MIPS puzzle with a nonce of `0`, the same BLS member as when self pooling, and a "validator stack" restriction which has two sub restrictions (in this order):
  * [A restriction which forces all create coins to go to the same puzzle hash](https://github.com/Chia-Network/chia-blockchain/blob/main/chia/wallet/puzzles/custody/fixed_create_coin_destinations.clsp) (TODO better link) when actively pooling and a [restriction that forces a relative height lock to be present](https://github.com/Chia-Network/chia-blockchain/blob/main/chia/wallet/puzzles/custody/heightlock.clsp) (TODO better link) when in the "waiting room".
  * [A restriction which bans all `SEND_MESSAGE` conditions](https://github.com/Chia-Network/chia-blockchain/blob/main/chia/wallet/puzzles/custody/send_message_banned.clsp) (TODO better link)
* a MIPS puzzle with a nonce of `0`, no restrictions, and a ["fixed puzzle" member](https://github.com/Chia-Network/chia_puzzles/blob/main/puzzles/mips_puzzles/member_puzzles/fixed_puzzle_member.clsp) where the fixed puzzle to run is [a custom puzzle](https://github.com/Chia-Network/chia-blockchain/blob/0d4f962e32b4c885ff6b96f58639612cb112ddca/chia/pools/claim_pool_rewards_dpuz.clsp) which populates its `REWARD_MESSAGE` that it sends with a [delegated puzzle](https://github.com/Chia-Network/chia-blockchain/blob/0d4f962e32b4c885ff6b96f58639612cb112ddca/chia/pools/plotnft_drivers.py#L54) (TODO better link)

The design of the pooling state is admittedly a little bit arcane but the surface area of each individual puzzle is quite small and the majority of the complexity comes from their assembly which uses the well tested MIPS rails.  A diagram of this construction can be found [here](https://github.com/Chia-Network/chips/blob/quex.pooling_v2/assets/chip-00XX/Pooling%20V2%20Chialisp.png).

### Plot NFT v2 Wallet

Python drivers for the above chialisp puzzles can be found [here](https://github.com/Chia-Network/chia-blockchain/pull/20352) (TODO better link). The question then arises how to sync these plot NFTs.

First thing to note is that the reference wallet chooses to rev the singleton with a minimal puzzle once after creation to get the "eve" spend out of the way and keep the drivers simple both from the spending and syncing perspective (don't need a separate `if_eve` branch everywhere).

After this eve spend, a hint to a standard wallet address is used just to get the wallet's attention from something it is already subscribed to.  Every hint after this point will be a tree hash of the "singleton struct" `(SINGLETON_MOD_HASH . (LAUNCHER_ID . LAUNCHER_PUZZLE_HASH))`. This is done for optimization purposes within the `claim_pool_rewards_dpuz.clsp` puzzle.  It's not semantically different from hinting to the launcher ID which is what you would usually use for a singleton that needs multiple parties to track it.

Also included in that first `CREATE_COIN` is a [MIPS style memo](https://github.com/Chia-Network/chips/blob/main/CHIPs/chip-0043.md#memo-spec) with some extension in the spec to include some additional memos.  The additonal memos are as follows:
* If self-pooling: `(bls_member_synthetic_key)`
* If pooling: `(bls_member_synthetic_key pool_puzzle_hash pool_relative_lock_height pool_memoization)`
These additional memos are used only when transitioning between singleton configurations (launching, joining a pool, and exiting the waiting room).  They are not needed for operations where the previous spend does not imply a configuration change (claiming/forwarding rewards, and entering the waiting room).  This actually means that a pool need not really worry about these additional memos because a singleton, when relevant to them, is always configured to be pooling to them.  The farmer will hand them the `bls_member_synthetic_key` as part of the pooling protocol.

### Pooling Protocol

The existing pooling protocol remains largely untouched.  Here's a rundown of the changes:
* (placeholder for potential partial changes)
* As mentioned above, when using v2 plotnfts, the farmer will attempt to communicate with the pool using a `/v2/` prefix on the endpoint URLs.
* A new endpoint `GET /v2/auth` which takes `{launcher_id: str, timestamp: int, signature: str}` and returns `{authentication_token: str, expiration: int}`.  This authentication token is responsible for the main change to the other endpoints.  The required message for signing will be <the timestamp as 64 bytes> + <the launcher_id> + <the pools target_puzzle_hash>.  The signature will be verified against the authentication key of record for the farmer.  The "expiration" value in the response is unix timestamp.
* `POST /v2/partial`, `PUT /v2/farmer`, `GET /v2/farmer` all mimic the previous versions of those endpoints but with an additional `authentication_token_v2: str` parameter.  For the old `authentication_token` parameter, the value of `0` will be passed by the farmer and the `signature` will be `None`.
* `GET /v2/pool_info` mimics the previous version but with an additional `pool_memoization: str` parameter.  The string here representing a serialized clvm blob.  This will be used when forwarding pool rewards to the `target_puzzle_hash` in the following way: `(CREATE_COIN target_puzzle_hash reward_amount . pool_memoization)`.  If a pool does not need any memoization, the value here should be `80` to represent `()`.
* The `authentication_public_key` that is part of the `PUT & POST /farmer` requests will be the key that is part of the user's section of the singleton inner puzzle.  This is to help with syncing which previously required a complete follow of the singleton's lineage.  With this information, pools can calculate the two possible relevant puzzles (pooling/exiting) for the singleton and just look for unspent coins with those puzzle hashes. However, since this value is used to sign the singleton's spends, when used for authentication in the protocol, an extra derivation is used before signing.  The actual authentication key is a single unhardened derivation from the key in the singleton with the path `[12381]`.  This prevents any potential shenanigans where the farmer is tricked into signing something for the singleton.


### Reference RPCs and CLIs

The RPCs and CLIs are largely untouched.  All endpoints that work for v1 plot NFTs should automatically work for v2 plot NFTs as well.  To create a v2 plotNFT, one must use the normal endpoint with an additional `"version": 2` parameter in the request body.  This may become the default as discussed above.

Finally, the capability was added to the `leave_pool` endpoint in v2 to allow the pool owner to specify a separate fee to use for finishing the exiting process rather than starting it.  Previously, the fee specified to leave was just automatically duplicated when finishing the exiting process.  This is still the default behavior if unspecified, but the flexibility has been added.

(placeholder for transferring and discarding endpoints)


## Test Cases

Much testing has been done empirically (more likely still needed) and of course the test code coverage is up to current chia-blockchain standards.  It would be possible to launch v2 plot NFTs before the hard fork if any pool supports it (and maybe if all pools make some effort to fail gracefully when presented with v2 plot NFTs).  This can get some cutting edge users to try it out before a potential mandatory roll out.

## Reference Implementation

Current peak of farmer development: https://github.com/Chia-Network/chia-blockchain/pull/20739

Current implementation of a v2 pool (not so relevant for this CHIP, really just a proof of concept): https://github.com/Chia-Network/pool2-reference

## Security

No security nuances beyond the existing plot NFTs seem apparent to the author at this time.

## Additional Assets

[Puzzle Diagram](https://github.com/Chia-Network/chips/blob/quex.pooling_v2/assets/chip-00XX/Pooling%20V2%20Chialisp.png)

## Copyright
Copyright and related rights waived via [CC0](https://creativecommons.org/publicdomain/zero/1.0/).
