# Protocol flow (companion to CHIP draft)

**What this doc is:** the **end-to-end story** in order: ceremony, deploy, register, vote, finalize, exit. [chip-0058.md](../../CHIPs/chip-0058.md) stays the spec summary; here you get **which lane each spend lives in** and **where to read code** in [**chia-scaled-parallel-voting**](https://github.com/DIG-Network/chia-scaled-parallel-voting) on `main`.

**Related:** deeper tables live in [chip-ceremony.md](./chip-ceremony.md), [chip-election-coins.md](./chip-election-coins.md), [chip-witnesses-encoding.md](./chip-witnesses-encoding.md), [chip-groth16-clvm.md](./chip-groth16-clvm.md).

---

## Lanes (reminder)

**Three spend classes** keep registration and per-ballot finality from blocking each other.

| Lane | Spends | Role |
|------|--------|------|
| **Election singleton** | `register`, `createBallot`, `deregister` | Enrollment, ballot issuance, collateral release authorization. Serialized by design for registration. |
| **Parallel voting** | `mint_voting_coin`, `update_vote` | Do **not** require the Election Singleton; many voters can progress in the same block (within chain limits). |
| **Per-ballot** | Ballot Coin: `oracle`, `finalize`, `announce_finalization` | Vote mechanics and finality; does **not** spend the Election Singleton. |

---

## Phase 0: Ceremony (trusted setup)

**Goal:** produce a Groth16 **VK** the election can bind to (`vk_hash`), with on-chain markers so people can audit contributions.

1. Deploy the **Ceremony Singleton** with window, `MIN_PARTICIPANTS`, `MAX_VOTERS`, `vk_seed`, and mod hashes for marker / voucher puzzles (see [chip-ceremony.md](./chip-ceremony.md)).
2. During `[start, start + length)`, participants submit **`contribute`** spends. Each accepted contribution creates a **Ceremony Marker Coin** and advances linear `last_contribution_hash` state.
3. After the window closes, **`finalize`** may run when `contribution_count ≥ MIN_PARTICIPANTS`. This seals `vk_hash`, `marker_root`, mints the **Ceremony Voucher** and summary outputs with VK material in memos.
4. Off-chain, verifiers walk markers / spends, verify contribution proofs, and derive the Groth16 VK. Before trusting an election, **independently check** `vk_hash` (and related) against chain data; `finalize` has no single designated signer.

*Implementation:* [`puzzles/ceremony_singleton/contribute.rue`](https://github.com/DIG-Network/chia-scaled-parallel-voting/blob/main/puzzles/ceremony_singleton/contribute.rue), [`finalize.rue`](https://github.com/DIG-Network/chia-scaled-parallel-voting/blob/main/puzzles/ceremony_singleton/finalize.rue); marker [`puzzles/ceremony_coin/marker.rue`](https://github.com/DIG-Network/chia-scaled-parallel-voting/blob/main/puzzles/ceremony_coin/marker.rue); voucher [`ceremony_voucher.rue`](https://github.com/DIG-Network/chia-scaled-parallel-voting/blob/main/puzzles/ceremony_singleton/ceremony_voucher.rue). Rust: [`sdk/src/actors/ceremony.rs`](https://github.com/DIG-Network/chia-scaled-parallel-voting/blob/main/sdk/src/actors/ceremony.rs), [`sdk/src/ceremony/`](https://github.com/DIG-Network/chia-scaled-parallel-voting/tree/main/sdk/src/ceremony).

---

## Phase 1: Election deploy

**Goal:** spin up the **Election Singleton** bound to the ceremony’s VK (and ideally the voucher message).

5. Launch the **Election Singleton** with eight-field `ElectionState`, curried VK/IC, threshold pack, `MAX_SIGNERS`, CHIP-0050 action Merkle roots, etc.
6. **Recommended:** co-spend the **Ceremony Voucher** in the deploy bundle and assert its `CANONICAL_MSG` so the election is bound to `(vk_hash, max_voters, ceremony_launcher_id)` (see [chip-ceremony.md](./chip-ceremony.md)).

*Implementation:* [`sdk/src/actors/deployer.rs`](https://github.com/DIG-Network/chia-scaled-parallel-voting/blob/main/sdk/src/actors/deployer.rs); election puzzles [`puzzles/election/`](https://github.com/DIG-Network/chia-scaled-parallel-voting/tree/main/puzzles/election); CHIP-0050 routing [`puzzles/action.rue`](https://github.com/DIG-Network/chia-scaled-parallel-voting/blob/main/puzzles/action.rue).

---

## Phase 2: Registration and ballots (slow lane)

**Goal:** add voters to the registration tree and mint **Ballot Coins** with snapshotted roots for finalize.

7. Voters call **`register`** on the Election Singleton (one registration coin per voter, CAT staked, registration SPT updated).
8. The operator calls **`createBallot`** to mint each **Ballot Coin** (2-mojo launcher pattern in reference). Ballots carry `vote_close_height`, `vote_options_root`, and **snapshots** of registration root + total weight for Groth16 public inputs at finalize.

*Implementation:* [`puzzles/election/register.rue`](https://github.com/DIG-Network/chia-scaled-parallel-voting/blob/main/puzzles/election/register.rue), [`create_ballot.rue`](https://github.com/DIG-Network/chia-scaled-parallel-voting/blob/main/puzzles/election/create_ballot.rue). Actors: [`sdk/src/actors/voter.rs`](https://github.com/DIG-Network/chia-scaled-parallel-voting/blob/main/sdk/src/actors/voter.rs), [`ballot.rs`](https://github.com/DIG-Network/chia-scaled-parallel-voting/blob/main/sdk/src/actors/ballot.rs).

---

## Phase 3: Voting (parallel lane)

**Goal:** cast or change votes without touching the Election Singleton.

9. To cast or change a vote: **`mint_voting_coin`** (first time for that ballot from this registration) or **`update_vote`** on the **Voting Coin**. Both assert the Ballot Coin **`oracle`** (open) so close height and vote mode are pinned on-chain.
10. BLS signatures over the canonical **`vote_message`** are supplied for off-chain aggregation (e.g. memos); see [chip-witnesses-encoding.md](./chip-witnesses-encoding.md).

*Implementation:* [`puzzles/registration_coin/mint_voting_coin.rue`](https://github.com/DIG-Network/chia-scaled-parallel-voting/blob/main/puzzles/registration_coin/mint_voting_coin.rue), [`puzzles/voting_coin/update_vote.rue`](https://github.com/DIG-Network/chia-scaled-parallel-voting/blob/main/puzzles/voting_coin/update_vote.rue); open oracle spend [`puzzles/ballot_coin/oracle.rue`](https://github.com/DIG-Network/chia-scaled-parallel-voting/blob/main/puzzles/ballot_coin/oracle.rue).

---

## Phase 4: Finalize (per-ballot lane)

**Goal:** prove quorum / threshold off-chain; verify Groth16 + aggregate BLS on the **Ballot Coin**.

11. Off-chain: an **aggregator** collects Voting Coins and registrations, builds witness, runs **Groth16** prover, aggregates BLS (`sdk`: [`sdk/src/actors/aggregator.rs`](https://github.com/DIG-Network/chia-scaled-parallel-voting/blob/main/sdk/src/actors/aggregator.rs), [`sdk/src/prover/circuit.rs`](https://github.com/DIG-Network/chia-scaled-parallel-voting/blob/main/sdk/src/prover/circuit.rs), [`proof.rs`](https://github.com/DIG-Network/chia-scaled-parallel-voting/blob/main/sdk/src/prover/proof.rs)).
12. On-chain: **`finalize`** on the Ballot Coin checks Groth16 and aggregate BLS via [CHIP-0011](https://github.com/Chia-Network/chips/blob/main/CHIPs/chip-0011.md) pairing opcodes ([`puzzles/ballot_coin/finalize.rue`](https://github.com/DIG-Network/chia-scaled-parallel-voting/blob/main/puzzles/ballot_coin/finalize.rue)), then commits `vote_outcome` and `agg_signers`. Intuition and the **informative** 377 note: [chip-groth16-clvm.md](./chip-groth16-clvm.md).
13. Optionally **`announce_finalization`** ([`announce_finalization.rue`](https://github.com/DIG-Network/chia-scaled-parallel-voting/blob/main/puzzles/ballot_coin/announce_finalization.rue)) so downstream logic can assert finality in a later block.

Example tests: [`sdk/tests/finalize_per_ballot_e2e.rs`](https://github.com/DIG-Network/chia-scaled-parallel-voting/blob/main/sdk/tests/finalize_per_ballot_e2e.rs), [`finalize_one_third_threshold_e2e.rs`](https://github.com/DIG-Network/chia-scaled-parallel-voting/blob/main/sdk/tests/finalize_one_third_threshold_e2e.rs).

---

## Phase 5: Exit (slow lane)

**Goal:** clear registration and unlock collateral; **not** the same thing as ballot finalize.

14. **`deregister`** on the Election Singleton clears the voter from the registration SPT and emits the deregister announcement ([`puzzles/election/deregister.rue`](https://github.com/DIG-Network/chia-scaled-parallel-voting/blob/main/puzzles/election/deregister.rue)).
15. **`release`** on the **Registration Coin** (typically same bundle) consumes that announcement and sets `release_destination`; collateral unlock follows puzzle finalizer rules; **not** tied to ballot finalization ([`puzzles/registration_coin/release.rue`](https://github.com/DIG-Network/chia-scaled-parallel-voting/blob/main/puzzles/registration_coin/release.rue)).

**Full-network E2E harness:** [`cli/src/bin/live_integration_test.rs`](https://github.com/DIG-Network/chia-scaled-parallel-voting/blob/main/cli/src/bin/live_integration_test.rs).

---

## Cross-reference

| Topic | Document |
|--------|----------|
| Ceremony puzzles, voucher, markers | [chip-ceremony.md](./chip-ceremony.md) |
| Election / Ballot / Registration / Voting coins and inner actions | [chip-election-coins.md](./chip-election-coins.md) |
| Merkle trees, vote modes, `vote_message`, public inputs, announcements | [chip-witnesses-encoding.md](./chip-witnesses-encoding.md) |
| Groth16 + CLVM / CHIP-0011, finalize soundness, `assets/` figures | [chip-groth16-clvm.md](./chip-groth16-clvm.md) |

---

Companion index: [README.md](./README.md).
