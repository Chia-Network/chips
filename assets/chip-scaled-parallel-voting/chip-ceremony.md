# Ceremony layer (companion to CHIP draft)

**What this doc is:** the **Ceremony Singleton** and its helper coins (marker, voucher): state, deploy fields, and what **`contribute`** / **`finalize`** actually require. High-level flow is [chip-protocol-flow.md](./chip-protocol-flow.md) Phase 0; election binding is summarized in [chip-scaled-parallel-voting.md](../../CHIPs/chip-scaled-parallel-voting.md) (Specification).

**Code:** [DIG-Network/chia-scaled-parallel-voting](https://github.com/DIG-Network/chia-scaled-parallel-voting) on `main`.

---

## State (`CeremonyState`)

**Five on-chain fields** (see [`puzzles/ceremony_singleton/shared.rue`](https://github.com/DIG-Network/chia-scaled-parallel-voting/blob/main/puzzles/ceremony_singleton/shared.rue) and `CeremonyState` in [`sdk/src/state.rs`](https://github.com/DIG-Network/chia-scaled-parallel-voting/blob/main/sdk/src/state.rs)):

| Field | Meaning |
|--------|---------|
| `contribution_count` | Number of accepted `contribute` spends. |
| `last_contribution_hash` | Hash of latest public contribution payload; equals `vk_seed` before first contribution. |
| `finalized` | Set by `finalize`; further `contribute` rejected. |
| `vk_hash` | `sha256(VK bytes)`; zero until finalize. |
| `marker_root` | Merkle root over **sorted** per-contribution marker coin ids; zero until finalize. |

---

## Deploy curries (minimum)

**You need at least:** `START_BLOCK_HEIGHT`, `CEREMONY_LENGTH_BLOCKS`, `MIN_PARTICIPANTS`, `MAX_VOTERS`, `vk_seed`, `CEREMONY_COIN_MOD_HASH`, `CEREMONY_VOUCHER_MOD_HASH`. Exact layouts live under [`puzzles/ceremony_singleton/`](https://github.com/DIG-Network/chia-scaled-parallel-voting/tree/main/puzzles/ceremony_singleton); the two inner spend paths are [`contribute.rue`](https://github.com/DIG-Network/chia-scaled-parallel-voting/blob/main/puzzles/ceremony_singleton/contribute.rue) and [`finalize.rue`](https://github.com/DIG-Network/chia-scaled-parallel-voting/blob/main/puzzles/ceremony_singleton/finalize.rue).

---

## Inner actions

| Action | Requirements | Source (`main`) |
|--------|----------------|-----------------|
| **`contribute`** | Rejected if `finalized` is set. Allowed only while `START_BLOCK_HEIGHT ≤ height < START_BLOCK_HEIGHT + CEREMONY_LENGTH_BLOCKS`. `prev_contribution_hash` **MUST** equal current `last_contribution_hash` (first contributor uses `vk_seed`). `AggSigUnsafe` **MUST** bind the domain-separated ceremony contribution message (string **MUST** match reference implementation). Creates a **Ceremony Marker Coin** with **even** output amount so the singleton outer has exactly one odd `CreateCoin` (recreation). Increments `contribution_count` and updates `last_contribution_hash`. Large parameters: committed by hash on-chain; payloads recovered off-chain from spends and memos. | [`contribute.rue`](https://github.com/DIG-Network/chia-scaled-parallel-voting/blob/main/puzzles/ceremony_singleton/contribute.rue) |
| **`finalize`** | Only after `height ≥ START_BLOCK_HEIGHT + CEREMONY_LENGTH_BLOCKS`. Requires `finalized` unset and `contribution_count ≥ MIN_PARTICIPANTS`. Sets `finalized`, `vk_hash`, `marker_root` from solution. Mints **Ceremony Voucher** and summary marker(s) with VK-related memos. **Not** authenticated by a designated key: first valid spend wins. Verifiers **SHOULD** independently derive or verify `vk_hash` and `marker_root` from marker chain before relying on an election. | [`finalize.rue`](https://github.com/DIG-Network/chia-scaled-parallel-voting/blob/main/puzzles/ceremony_singleton/finalize.rue) |

**Off-chain / tests:** [`sdk/src/actors/ceremony.rs`](https://github.com/DIG-Network/chia-scaled-parallel-voting/blob/main/sdk/src/actors/ceremony.rs), [`sdk/src/ceremony/`](https://github.com/DIG-Network/chia-scaled-parallel-voting/tree/main/sdk/src/ceremony). Examples: [`sdk/tests/ceremony_contribute_e2e.rs`](https://github.com/DIG-Network/chia-scaled-parallel-voting/blob/main/sdk/tests/ceremony_contribute_e2e.rs), [`sdk/tests/ceremony_deploy_e2e.rs`](https://github.com/DIG-Network/chia-scaled-parallel-voting/blob/main/sdk/tests/ceremony_deploy_e2e.rs), more under [`sdk/tests/`](https://github.com/DIG-Network/chia-scaled-parallel-voting/tree/main/sdk/tests).

---

## Ceremony Marker Coin

- **Source:** [`puzzles/ceremony_coin/marker.rue`](https://github.com/DIG-Network/chia-scaled-parallel-voting/blob/main/puzzles/ceremony_coin/marker.rue).
- **Curried:** `CEREMONY_LAUNCHER_ID`, `PARTICIPANT_PUBKEY`, `CONTRIBUTION_HASH`, `PREV_CONTRIBUTION_HASH`.
- **Created by** ceremony `contribute` only. Even amount (reference: 2 mojos) for singleton morph rules.
- **Spend:** may return no conditions; coin remains an on-chain commitment until removed.
- **Discovery:** launcher id as hint for indexers.

---

## Ceremony Voucher Coin

- **Source:** [`puzzles/ceremony_singleton/ceremony_voucher.rue`](https://github.com/DIG-Network/chia-scaled-parallel-voting/blob/main/puzzles/ceremony_singleton/ceremony_voucher.rue).
- **Minted only** from ceremony [`finalize.rue`](https://github.com/DIG-Network/chia-scaled-parallel-voting/blob/main/puzzles/ceremony_singleton/finalize.rue).
- Anyone-can-spend with self-recreation at same puzzle hash and amount so **many** election deploys can reuse one ceremony.
- **`CANONICAL_MSG`:**

`sha256("chip:ceremony:voucher" || vk_hash || max_voters_u64_be8 || ceremony_launcher_id)`

Election deploy **SHOULD** co-spend the voucher and assert this announcement.

**Contributions MUST NOT** be voucher-gated; the contribution window is **permissionless** at the puzzle level. Allow-lists are deployment policy only.

---

Companion index: [README.md](./README.md).
