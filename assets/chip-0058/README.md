# Parallel voting CHIP: companion documents

**Purpose:** These Markdown files accompany **[chip-0058.md](../../CHIPs/chip-0058.md)** in `CHIPs/`. They live here under **`assets/chip-0058/`** with the pedagogical PNG figures (`figure_1.png`, `figure_2.png`) so everything ships as one CHIP asset bundle.

**Reference implementation (executable spec):** [DIG-Network/chia-scaled-parallel-voting](https://github.com/DIG-Network/chia-scaled-parallel-voting), branch `main` (Rue puzzles, compiled CLVM, SDK, CLI, WASM, tests).

---

## Document map

| Document | Contents |
| -------- | -------- |
| [chip-0058.md](../../CHIPs/chip-0058.md) | Main CHIP text: preamble, abstract, motivation, specification summary, reference implementation, security, copyright |
| [chip-protocol-flow.md](./chip-protocol-flow.md) | Phases 0–5 (ceremony through exit); *Implementation* pointers into the reference repo |
| [chip-ceremony.md](./chip-ceremony.md) | Ceremony singleton, marker coin, voucher, inner-action table |
| [chip-election-coins.md](./chip-election-coins.md) | Election, Ballot, Registration, and Voting coins; inner actions and lineage |
| [chip-witnesses-encoding.md](./chip-witnesses-encoding.md) | Merkle rules, vote modes, `vote_message`, eight public inputs, announcements |
| [chip-groth16-clvm.md](./chip-groth16-clvm.md) | Groth16 + CLVM finalize path, soundness intuition, **informative** BLS12-377 note, figures |

**Tests and vectors:** see **Test plan** in [chip-0058.md](../../CHIPs/chip-0058.md) and [`sdk/tests/`](https://github.com/DIG-Network/chia-scaled-parallel-voting/tree/main/sdk/tests) in the reference implementation.
