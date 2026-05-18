# Witnesses, Merkle trees, vote modes, and encodings (companion to CHIP draft)

**What this doc is:** the **bytes and hashes** everything agrees on: registration SPT, per-ballot trees, `vote_message`, the **eight** public inputs in order, and announcement strings. Overview stays in [chip-0058.md](../../CHIPs/chip-0058.md) § Specification. **Groth16 vs CLVM (and why proving can hurt):** [chip-groth16-clvm.md](./chip-groth16-clvm.md).

**Code:** [DIG-Network/chia-scaled-parallel-voting](https://github.com/DIG-Network/chia-scaled-parallel-voting) on `main`.

---

## Sparse Merkle trees

**Puzzle and SDK both use the same hashing rules**; see [`puzzles/merkle_utils.rue`](https://github.com/DIG-Network/chia-scaled-parallel-voting/blob/main/puzzles/merkle_utils.rue) and shared headers ([`election/shared.rue`](https://github.com/DIG-Network/chia-scaled-parallel-voting/blob/main/puzzles/election/shared.rue), [`registration_coin/shared.rue`](https://github.com/DIG-Network/chia-scaled-parallel-voting/blob/main/puzzles/registration_coin/shared.rue)). Off-chain construction: [`sdk/src/merkle.rs`](https://github.com/DIG-Network/chia-scaled-parallel-voting/blob/main/sdk/src/merkle.rs).

### Registration tree (reference `TREE_DEPTH = 32`)

- **Slot:** first four bytes of `sha256(pubkey)` as big-endian `u32`.
- **Occupied leaf:** `sha256(pubkey || locked_cat_mojos_be8)`.
- **Empty leaf:** `EMPTY_LEAF_HASH = sha256(0x00 × 48)` = **0x17b0761f87b081d5cf10757ccc89f12be355c70e2e29df288b65b30710dcbcd1**.
- **Internal node:** `sha256(left || right)`; **not** the CLVM `0x02` serialized-tree prefix.

### Per-registration ballot tree

- **Leaf:** `sha256(ballot_launcher_id)`.
- **Slot (reference):** `sha256(ballot_launcher_id) mod 2^32`.
- **Depth:** **32** in reference. Any change requires matching the Groth16 circuit ([`sdk/src/prover/circuit.rs`](https://github.com/DIG-Network/chia-scaled-parallel-voting/blob/main/sdk/src/prover/circuit.rs)) and puzzle definitions under [`puzzles/registration_coin/`](https://github.com/DIG-Network/chia-scaled-parallel-voting/tree/main/puzzles/registration_coin), [`puzzles/election/`](https://github.com/DIG-Network/chia-scaled-parallel-voting/tree/main/puzzles/election).

---

## Vote modes

- **Unrestricted:** `vote_options_root` is 32 zero bytes; any `vote_data` subject to other checks.
- **Restricted:** `vote_options_root` is root of sorted Merkle tree of allowed outcomes; [`mint_voting_coin.rue`](https://github.com/DIG-Network/chia-scaled-parallel-voting/blob/main/puzzles/registration_coin/mint_voting_coin.rue) and [`update_vote.rue`](https://github.com/DIG-Network/chia-scaled-parallel-voting/blob/main/puzzles/voting_coin/update_vote.rue) **MUST** include inclusion proofs when restricted.

If `vote_mode_lock` on the Election Singleton is not all `0xFF`, every ballot **MUST** use that locked root.

---

## Canonical vote message

`vote_message = sha256(vote_outcome || ballot_launcher_id || election_launcher_id)`

All implementations (puzzles, aggregator, circuit) **MUST** use this exact preimage order. The voting puzzle defines the same ordering in [`voting_coin/shared.rue`](https://github.com/DIG-Network/chia-scaled-parallel-voting/blob/main/puzzles/voting_coin/shared.rue); the ballot finalize verifier recomputes it in [`ballot_coin/finalize.rue`](https://github.com/DIG-Network/chia-scaled-parallel-voting/blob/main/puzzles/ballot_coin/finalize.rue).

---

## Groth16 public inputs (ordered)

**Eight scalars** committed as public inputs to the circuit ([`sdk/src/prover/circuit.rs`](https://github.com/DIG-Network/chia-scaled-parallel-voting/blob/main/sdk/src/prover/circuit.rs)); **ordering MUST match** the header comments in [`finalize.rue`](https://github.com/DIG-Network/chia-scaled-parallel-voting/blob/main/puzzles/ballot_coin/finalize.rue):

1. `registration_merkle_root` (witness-time)
2. `registration_vote_weight`
3. `agg_signers`
4. `vote_message`
5. `threshold_pack`
6. `ballot_launcher_id`
7. `vote_threshold_num` (field element)
8. `vote_threshold_den` (field element)

Threshold **num** / **den** as public inputs allow one VK (fixed `MAX_SIGNERS`) to support multiple rational quorum fractions.

**VK size (reference):** **768** bytes (`336 + 9 × 48`). Proof serialization: [`sdk/src/prover/proof.rs`](https://github.com/DIG-Network/chia-scaled-parallel-voting/blob/main/sdk/src/prover/proof.rs).

---

## Off-chain vs on-chain

- **Off-chain:** Enumerate registrations and Voting Coins; verify lineage; weighted quorum; BLS aggregation; Groth16 witness and proof (aggregator: [`sdk/src/actors/aggregator.rs`](https://github.com/DIG-Network/chia-scaled-parallel-voting/blob/main/sdk/src/actors/aggregator.rs)).
- **On-chain:** Ballot `finalize` in [`finalize.rue`](https://github.com/DIG-Network/chia-scaled-parallel-voting/blob/main/puzzles/ballot_coin/finalize.rue) verifies Groth16 and `bls_verify`. Any actor may submit a valid finalize bundle; incentives are out of scope for this CHIP.

---

## Pinned constants (reference interop)

- `TREE_DEPTH = 32`
- `MAX_SIGNERS = 20_000`
- `PUBLIC_INPUT_COUNT = 8`
- `EMPTY_LEAF_HASH` as above

These align with the circuit and [`sdk/src/puzzles.rs`](https://github.com/DIG-Network/chia-scaled-parallel-voting/blob/main/sdk/src/puzzles.rs). **Bytecode** is emitted under [`puzzles/compiled/`](https://github.com/DIG-Network/chia-scaled-parallel-voting/tree/main/puzzles/compiled) after [`build.sh`](https://github.com/DIG-Network/chia-scaled-parallel-voting/blob/main/build.sh) / [`build.ps1`](https://github.com/DIG-Network/chia-scaled-parallel-voting/blob/main/build.ps1).

---

## Announcement preimages

String layouts and helpers appear in [`puzzles/ballot_coin/shared.rue`](https://github.com/DIG-Network/chia-scaled-parallel-voting/blob/main/puzzles/ballot_coin/shared.rue) and the oracle spend [`oracle.rue`](https://github.com/DIG-Network/chia-scaled-parallel-voting/blob/main/puzzles/ballot_coin/oracle.rue).

| Source | Preimage |
|--------|----------|
| Ballot oracle (open) | `"ballot_oracle_open" || ballot_launcher_id || vote_close_height_u32_be || vote_options_root` |
| Ballot oracle (closed) | open preimage || `vote_outcome || agg_signers` |
| Ballot finalized | `"ballot_finalized" || ballot_launcher_id || vote_outcome || agg_signers` |
| Deregister | `"deregister" || voter_pubkey` |

---

Companion index: [README.md](./README.md).
