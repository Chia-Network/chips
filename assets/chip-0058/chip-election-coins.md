# Election, Ballot, Registration, and Voting coins (companion to CHIP draft)

**What this doc is:** **puzzle-level** detail for election-facing coins: fields, inner actions, and where **`finalize`** is *not* allowed. Lifecycle order lives in [chip-protocol-flow.md](./chip-protocol-flow.md). CHIP-0050 routing for singleton inners: [`puzzles/action.rue`](https://github.com/DIG-Network/chia-scaled-parallel-voting/blob/main/puzzles/action.rue).

**Code:** [DIG-Network/chia-scaled-parallel-voting](https://github.com/DIG-Network/chia-scaled-parallel-voting) on `main`.

---

## Election state (`ElectionState`)

| Field | Description |
|--------|-------------|
| `registration_merkle_root` | Root of registration sparse Merkle tree (voters + weights). |
| `registration_count` | Registered voter count. |
| `registration_vote_weight` | Sum of locked CAT weight. |
| `election_start_height` | Block height at election genesis. |
| `ceremony_launcher_id` | Ceremony Singleton launcher for this VK. |
| `max_voters` | Capacity upper bound (with `TREE_DEPTH`). |
| `vk_hash` | SHA-256 of Groth16 verification key bytes. |
| `vote_mode_lock` | `0xFF…FF` (32 bytes): each ballot chooses `vote_options_root`; otherwise all ballots **MUST** use that fixed restricted root. |

Shared types and election constants: [`puzzles/election/shared.rue`](https://github.com/DIG-Network/chia-scaled-parallel-voting/blob/main/puzzles/election/shared.rue).

**Deploy curries** (VK, IC, threshold pack, `MAX_SIGNERS`, `election_launcher_id`, CHIP-0050 action roots) **MUST** stay consistent across all Ballot Coins from `createBallot`.

This CHIP does **not** specify an on-chain XCH fee in `register` or `accumulated_fees` on the singleton.

**Ballot close time** is **`VOTE_CLOSE_HEIGHT`** on each Ballot Coin, not one global election timer.

---

## Election Singleton: inner actions

| Action | Behavior |
|--------|----------|
| **`register`** | Empty SPT slot proof; leaf `sha256(pubkey || locked_cat_mojos_be8)` (8-byte BE mojos); voter signature; increment counts and weight; mint Registration CAT with empty per-ballot tree; `release_destination` unset. |
| **`createBallot`** | **Only** path for valid Ballot Coin lineage. Forward VK, IC, threshold, `MAX_SIGNERS`, ids; **snapshot** `registration_merkle_root` and `registration_vote_weight` for Groth16 public inputs; set `vote_close_height`, `vote_options_root`, outcome domain. `ElectionState` counts do not change solely from creating a ballot. Reference: **2-mojo** launcher eve for morph safety. |
| **`deregister`** | Leaf → `EMPTY_LEAF_HASH`; deregister announcement; decrement counts and weight. |

*Rue:* [`register.rue`](https://github.com/DIG-Network/chia-scaled-parallel-voting/blob/main/puzzles/election/register.rue), [`create_ballot.rue`](https://github.com/DIG-Network/chia-scaled-parallel-voting/blob/main/puzzles/election/create_ballot.rue), [`deregister.rue`](https://github.com/DIG-Network/chia-scaled-parallel-voting/blob/main/puzzles/election/deregister.rue). *Deploy / orchestration:* [`sdk/src/actors/deployer.rs`](https://github.com/DIG-Network/chia-scaled-parallel-voting/blob/main/sdk/src/actors/deployer.rs).

`finalize`, `oracle`, `announce_finalization` **MUST NOT** appear on the Election Singleton; they belong on the Ballot Coin.

---

## Ballot Coin

**State:** `(finalized, vote_outcome, agg_signers)`.

Inner action Merkle **MUST** be exactly `{ finalize, oracle, announce_finalization }` (helpers in [`puzzles/ballot_coin/shared.rue`](https://github.com/DIG-Network/chia-scaled-parallel-voting/blob/main/puzzles/ballot_coin/shared.rue)).

**`finalize` curries:** VK, IC, `BALLOT_LAUNCHER_ID`, `ELECTION_LAUNCHER_ID`, `VOTE_CLOSE_HEIGHT`, `VOTE_OPTIONS_ROOT`, `VOTE_THRESHOLD_NUM`, `VOTE_THRESHOLD_DEN`, `REGISTRATION_MERKLE_ROOT_SNAPSHOT`, `REGISTRATION_VOTE_WEIGHT_SNAPSHOT`. **8** public inputs; **9** IC points.

| Action | Behavior |
|--------|----------|
| **`finalize`** | `height ≥ VOTE_CLOSE_HEIGHT`; Groth16 on eight scalars; `bls_verify` on canonical `vote_message`; recreate with `finalized = true` and outcome fields. |
| **`oracle`** | Recreate unchanged; **open** announcement binds `VOTE_CLOSE_HEIGHT` and `VOTE_OPTIONS_ROOT`; **closed** includes `vote_outcome`, `agg_signers`. `mint_voting_coin` / `update_vote` **MUST** assert oracle (Groth16 does not bind close height). |
| **`announce_finalization`** | After finalize, permissionless re-announce for late consumers. |

*Rue:* [`finalize.rue`](https://github.com/DIG-Network/chia-scaled-parallel-voting/blob/main/puzzles/ballot_coin/finalize.rue), [`oracle.rue`](https://github.com/DIG-Network/chia-scaled-parallel-voting/blob/main/puzzles/ballot_coin/oracle.rue), [`announce_finalization.rue`](https://github.com/DIG-Network/chia-scaled-parallel-voting/blob/main/puzzles/ballot_coin/announce_finalization.rue). *Ballot actor:* [`sdk/src/actors/ballot.rs`](https://github.com/DIG-Network/chia-scaled-parallel-voting/blob/main/sdk/src/actors/ballot.rs).

---

## Registration Coin

**State:** `(voter_pubkey, election_launcher_id, voted_ballots_root, release_destination)`.

| Action | Behavior |
|--------|----------|
| **`mint_voting_coin`** | Assert Ballot `oracle` (open). Restricted mode: prove `vote_data` ∈ `vote_options_root`. Non-membership + insert `sha256(ballot_launcher_id)` in per-ballot tree; mint 1-mojo Voting CAT. Fail if `release_destination` set. |
| **`release`** | Assert Election `deregister` announcement; set `release_destination`. Gated by deregister, **not** ballot finalize. |

*Rue:* [`mint_voting_coin.rue`](https://github.com/DIG-Network/chia-scaled-parallel-voting/blob/main/puzzles/registration_coin/mint_voting_coin.rue), [`release.rue`](https://github.com/DIG-Network/chia-scaled-parallel-voting/blob/main/puzzles/registration_coin/release.rue); shared: [`registration_coin/shared.rue`](https://github.com/DIG-Network/chia-scaled-parallel-voting/blob/main/puzzles/registration_coin/shared.rue).

---

## Voting Coin

**State:** `(voter_pubkey, ballot_launcher_id, vote_data, registration_coin_id)`; 1 mojo lineage token; stake on Registration Coin.

| Action | Behavior |
|--------|----------|
| **`update_vote`** | Assert Ballot `oracle` (open); height checks per reference; restricted mode proofs if needed; BLS memo for `vote_message`; **does not** spend Election Singleton. |

*Rue:* [`update_vote.rue`](https://github.com/DIG-Network/chia-scaled-parallel-voting/blob/main/puzzles/voting_coin/update_vote.rue), [`voting_coin/shared.rue`](https://github.com/DIG-Network/chia-scaled-parallel-voting/blob/main/puzzles/voting_coin/shared.rue) (`vote_message` preimage). *Voter actor:* [`sdk/src/actors/voter.rs`](https://github.com/DIG-Network/chia-scaled-parallel-voting/blob/main/sdk/src/actors/voter.rs).

Witness builders **MUST** use the **current** Voting Coin tip per `(registration_coin_id, ballot_launcher_id)`.

---

## Lineage (normative)

- Registration ← `register` (Election Singleton).
- Ballot ← `createBallot` only.
- Voting ← `mint_voting_coin` (Registration Coin).

**Compiled bytecode** (run [`build.sh`](https://github.com/DIG-Network/chia-scaled-parallel-voting/blob/main/build.sh) / [`build.ps1`](https://github.com/DIG-Network/chia-scaled-parallel-voting/blob/main/build.ps1)): [`puzzles/compiled/election/`](https://github.com/DIG-Network/chia-scaled-parallel-voting/tree/main/puzzles/compiled/election), [`ballot_coin/`](https://github.com/DIG-Network/chia-scaled-parallel-voting/tree/main/puzzles/compiled/ballot_coin), [`registration_coin/`](https://github.com/DIG-Network/chia-scaled-parallel-voting/tree/main/puzzles/compiled/registration_coin), [`voting_coin/`](https://github.com/DIG-Network/chia-scaled-parallel-voting/tree/main/puzzles/compiled/voting_coin). **Loader:** [`sdk/src/puzzles.rs`](https://github.com/DIG-Network/chia-scaled-parallel-voting/blob/main/sdk/src/puzzles.rs). **Finalize bundles:** [`sdk/src/actors/aggregator.rs`](https://github.com/DIG-Network/chia-scaled-parallel-voting/blob/main/sdk/src/actors/aggregator.rs).

---

Companion index: [README.md](./README.md).
