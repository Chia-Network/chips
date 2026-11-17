CHIP Number   | <Creator must leave this blank. Editor will assign a number.>
:-------------|:----
Title         | Minimum Fee for Block Creation
Description   | Allow farmers to configure a minimum fee per CLVM cost when selecting transactions for blocks
Author        | [razorred14](https://github.com/razorred14)
Comments-URI  | <Creator must leave this blank. Editor will assign a URI.>
Status        | <Creator must leave this blank. Editor will assign a status.>
Category      | Process
Sub-Category  | Environment
Created       | 2026-09-23
Requires      | None
Replaces      | 0003
Superseded-By | none

## Abstract
This CHIP proposes a farmer-configurable minimum fee rate used only when selecting mempool transactions for inclusion in a block. The rate defaults to 4 mojos per CLVM cost when not configured and may be overridden or disabled by each farmer. Regardless of configuration, the policy stops applying when the mempool manager's peak transaction-block timestamp is at or after 2027-11-03 00:00:00 UTC. Transactions below the effective rate remain valid and may enter the mempool and propagate according to existing rules. A farmer whose effective threshold is nonzero will omit those transactions from blocks it creates. This preserves transaction propagation to farmers willing to accept lower fees while allowing individual farmers to set a minimum price for the block space they produce.

## Motivation
The withdrawn CHIP-0003 proposed rejecting transactions below a configurable fee threshold before mempool admission. A prototype of that approach prompted a concern that admission filtering would impair transaction propagation: if enough relaying nodes rejected a low-fee transaction, the transaction might never reach a farmer willing to include it.

This proposal separates transaction relay policy from block construction policy. Full nodes continue to validate, store, and relay transactions according to existing mempool rules. By default, farmers apply a minimum fee rate of 4 mojos per CLVM cost to transactions included in their candidate blocks. Each farmer may override or disable this rate. The policy, including any configured rate, expires at the fixed timestamp specified below.

This design provides the following benefits:

* Farmers can define the minimum compensation they require for the block space they create.
* Low-fee transactions continue to propagate to farmers whose thresholds permit them.
* The setting does not alter consensus validity. A block containing a transaction below another node's configured threshold remains valid.
* Adoption can be incremental because each farmer's setting affects only blocks produced by that farmer.

This proposal does not eliminate the network, validation, or storage costs of relaying dust transactions. It only limits their inclusion in blocks created by farmers whose effective threshold is nonzero. Existing dust filters and mempool pressure rules remain responsible for protecting node resources.

## Backwards Compatibility
This proposal does not change Chia consensus rules, transaction validity, peer-to-peer transaction relay, or validation of blocks received from peers. Nodes that do not implement the proposal continue to construct blocks using their existing fee-priority behavior.

The default changes local block construction behavior on upgrade. Before expiration, when `minimum_block_fee_per_cost` is not set, upgraded nodes apply a threshold of 4 mojos per CLVM cost, so they will omit transactions below that rate from blocks they create, including zero-fee transactions. For example, a transaction with a CLVM cost of 5 500 000 requires a fee of at least 22 000 000 mojos to be included by such a node. Farmers can restore the previous behavior by explicitly setting the value to `0`. When the peak transaction-block timestamp is at or after the expiration timestamp, the effective threshold is zero regardless of configuration, and block construction reverts to the existing fee-priority behavior. These are local policy changes, not network incompatibilities.

Transactions are not rejected from the mempool solely for being below this block-production threshold, although existing mempool rules still apply. Such transactions may remain unconfirmed until they are included by a farmer with a lower threshold, the fee is increased, or the policy expires.

The default is applied only when the configuration key is absent. The reference `initial-config.yaml` leaves the key commented out so that nodes use the default unless an operator sets it. Configuration files that already contain an explicit value retain that value.

Wallets are not required to enforce a farmer's threshold. A transaction below one farmer's threshold may still be included by another farmer. Wallets and fee estimators should therefore present the configured value as local block-production policy, not as a network-wide minimum required for transaction validity or relay.

## Rationale
Applying the threshold during block creation addresses the principal objection raised during review of the initial prototype: mempool admission filtering can reduce the probability that low-fee transactions reach low-fee farmers. Keeping those transactions in mempools preserves fee-market choice and transaction propagation.

The threshold is expressed as mojos per million CLVM cost because CLVM cost approximates the block resource consumed by a transaction. A rate is fairer than one flat fee: high-cost transactions must pay proportionally more, while low-cost transactions are not charged as though they consumed an entire standard transaction's resources.

The threshold defaults to 4 mojos per CLVM cost (`4 000 000` mojos per million CLVM cost) so that block space is not given away for free by default, while remaining an operator policy that each farmer can override. Farmers may set `0` to disable it, choose the historical CHIP-0003 rate of `1 818 182` mojos per million CLVM cost, or choose another non-negative value appropriate to their operating policy.

The key is commented out in the initial configuration rather than written with the default value. Nodes therefore track the default supplied by the software and only diverge when an operator deliberately sets a value.

The policy has a fixed expiration timestamp of 2027-11-03 00:00:00 UTC rather than a rolling period after installation or release. The expiration is evaluated against the mempool manager's peak transaction-block timestamp rather than the local clock, tying the decision to chain state. Extending the expiration requires a software release.

Alternatives considered:

* **Reject below-threshold transactions during mempool admission.** Rejected because it impairs relay to farmers willing to accept lower fees and causes admission behavior to disagree with a transaction's consensus validity.
* **Apply a network-wide consensus minimum.** Rejected because it would invalidate otherwise valid transactions and blocks, require broad coordination, and remove farmer choice.
* **Use a flat fee per transaction.** Rejected because transactions vary substantially in CLVM cost.
* **Default to `0` (opt-in only).** Considered in the earlier prototype. Rejected in favor of a nonzero default so the policy has meaningful effect without requiring every farmer to act, while retaining an explicit `0` opt-out.
* **Nonzero default with no expiration.** Rejected because a permanent default would change block construction indefinitely without a scheduled point for re-evaluation.
* **Expire using the local clock.** Rejected because local clocks may be skewed. The peak transaction-block timestamp provides a chain-based reference.

The proposal incorporates feedback from the discussion and implementation review at [Chia-Network/chia-blockchain#21328](https://github.com/Chia-Network/chia-blockchain/pull/21328) and [Chia-Network/chia-blockchain#21641](https://github.com/Chia-Network/chia-blockchain/pull/21641).

## Specification

### Configuration

The full node configuration supports the following key. The initial configuration ships with it commented out, so the default applies unless an operator sets it:

```yaml
full_node:
  # Minimum fee in mojos per million CLVM cost for transactions selected for
  # blocks. Transactions below it stay in the mempool, but aren't included in
  # blocks this node creates. Defaults to 4000000 (4 mojos per cost) if unset.
  # Set to 0 to disable. The minimum stops applying on 2027-11-03 00:00:00 UTC.
  # minimum_block_fee_per_cost: 4000000
```

`minimum_block_fee_per_cost` MUST be a non-negative integer expressed in mojos per `1 000 000` units of CLVM cost.

* If the key is absent, implementations MUST use the default `DEFAULT_MINIMUM_BLOCK_FEE_PER_COST = 4_000_000` (4 mojos per CLVM cost).
* If the key is present, its value MUST override the default, subject to the expiration below.
* A value of `0` disables the threshold.

Simulator and test environments MAY explicitly set the value to `0` so that zero-fee transactions can still be farmed.

Implementations MUST reject invalid configuration values at startup rather than silently substituting another value. Invalid values include negative integers, non-integers, and values outside the implementation's supported integer range.

### Expiration

The threshold is temporary. Implementations MUST define:

```text
MINIMUM_BLOCK_FEE_EXPIRATION = 1_825_200_000  # 2027-11-03 00:00:00 UTC
```

The effective threshold for block construction is:

```text
if peak_transaction_block.timestamp >= MINIMUM_BLOCK_FEE_EXPIRATION:
    effective_minimum_block_fee_per_cost = 0
else:
    effective_minimum_block_fee_per_cost = minimum_block_fee_per_cost
```

The comparison MUST use the timestamp of the mempool manager's peak transaction block, not the node's local clock. At or after the expiration timestamp, the effective threshold MUST be zero regardless of configuration. Before the expiration timestamp, the configured threshold applies. Changing the expiration requires a software release.

### Required fee

For a transaction with CLVM cost `cost`, the minimum fee for block inclusion is:

```text
required_fee = ceil(cost * effective_minimum_block_fee_per_cost / 1_000_000)
```

Using integer arithmetic, an implementation may calculate this as:

```text
required_fee = (cost * effective_minimum_block_fee_per_cost + 999_999) // 1_000_000
```

An implementation MUST use checked or sufficiently wide integer arithmetic so multiplication cannot wrap.

### Mempool behavior

The configured threshold MUST NOT be used to reject an otherwise valid transaction from the mempool solely because its fee is below `required_fee`. It MUST NOT prevent fetching or relaying such a transaction. Existing mempool capacity, replacement, validation, and anti-spam rules remain unchanged.

### Block construction

When constructing a transaction block, a full node with a nonzero effective threshold MUST include only mempool items whose fee is greater than or equal to `required_fee` for that item's CLVM cost. This applies to every block-generation path the implementation uses.

Items below the threshold MUST remain in the mempool, subject to existing eviction and expiration behavior. They may become eligible after the operator lowers the configured threshold or the threshold expires. Aggregating transactions MUST NOT be used to bypass the rule: the aggregate fee and aggregate CLVM cost used by block construction MUST satisfy the same calculation.

The threshold is local policy only. A node MUST continue to accept a consensus-valid block from another farmer even when that block contains transactions below the node's configured threshold.

### Fee reporting

RPC responses that report local block-production fee policy SHOULD expose `minimum_block_fee_per_cost` and MUST identify it as a local farmer policy. If the effective rate is reported, it should be distinguished from the configured rate, which may no longer apply after expiration. Fee-estimation responses MUST NOT describe this value as a network-wide minimum or imply that transactions below it are invalid or will not propagate. This proposal does not require a new RPC endpoint.

## Test Cases

A conforming implementation should include tests for:

* Configuration key absent, confirming the default of `4 000 000` mojos per million CLVM cost is applied.
* The initial configuration leaves `minimum_block_fee_per_cost` commented out.
* Configuration value `0`, confirming existing block construction behavior is unchanged.
* An explicit nonzero configuration value, confirming it overrides the default.
* A negative, non-integer, or out-of-range configuration value, confirming startup fails with a clear error.
* Exact-boundary inclusion where the transaction fee equals `required_fee`.
* Exclusion where the transaction fee is one mojo below `required_fee`.
* Ceiling division when cost is not evenly divisible by `1 000 000`.
* Multiple transaction costs, confirming the required fee scales linearly with CLVM cost.
* A below-threshold transaction entering the mempool and being relayed normally.
* A below-threshold transaction remaining in the mempool after block creation.
* Inclusion of a previously ineligible transaction after the configured threshold is lowered.
* Expiration with a peak transaction-block timestamp one second before, exactly at, and one second after `MINIMUM_BLOCK_FEE_EXPIRATION`, in every block-generation path.
* A nonzero configured threshold being ignored at or after expiration, with a previously ineligible transaction becoming eligible for block selection.
* `MINIMUM_BLOCK_FEE_EXPIRATION` equals 2027-11-03 00:00:00 UTC.
* Acceptance of a consensus-valid peer block containing below-threshold transactions.
* Aggregate transaction selection, confirming aggregate fees and costs cannot bypass the threshold.
* If RPC output reports the policy, confirming it is identified as local block-production policy and distinguishes the effective rate from the configured rate when applicable.

## Reference Implementation

A reference implementation is available in [Chia-Network/chia-blockchain#21641](https://github.com/Chia-Network/chia-blockchain/pull/21641), which was closed without merging. It builds on the earlier prototype in [#21328](https://github.com/Chia-Network/chia-blockchain/pull/21328) and applies the threshold in both block-construction paths while leaving mempool admission, transaction fetching, gossip, fee estimation, and consensus validation unchanged. Below-threshold transactions remain in the mempool and become eligible for inclusion if the farmer lowers the configured threshold or the threshold expires.

| | #21328 | #21641 (this CHIP) |
| --- | --- | --- |
| Default when unset | `0` (disabled) | `4 000 000` (4 mojos per cost) |
| `initial-config.yaml` | `minimum_block_fee_per_cost: 0` | Commented out, so nodes use the default unless set |
| Expiration | None | `MINIMUM_BLOCK_FEE_EXPIRATION = 1_825_200_000` (2027-11-03 00:00:00 UTC) |

## Security

This proposal intentionally leaves mempool admission and peer relay unchanged. It therefore does not protect nodes from the validation, bandwidth, or storage costs of receiving dust transactions. Implementations must retain existing dust filters, validation limits, mempool capacity controls, and peer anti-abuse protections.

A high threshold may delay low-fee transactions when a large portion of block producers use similar settings. Because the default is nonzero, transactions below 4 mojos per CLVM cost, including zero-fee transactions, may wait unconfirmed while the policy is active without being rejected solely by this policy. The explicit `0` opt-out, automatic expiration, continued transaction relay, and clear communication of the policy limit this effect and reduce the risk that the local threshold is mistaken for a consensus requirement.

Incorrect arithmetic could undercharge transactions, overcharge them, or wrap to a low value. Implementations must use checked or sufficiently wide integer arithmetic and ceiling division as specified.

Expiration relies on the peak transaction-block timestamp, not the local clock. Nodes with different peak transaction blocks may therefore apply different effective thresholds around the expiration boundary.

The nonzero default changes block contents on upgrade. User interfaces and release notes should identify the setting as block-production policy and disclose the default, how to disable it, and the expiration date.

## Additional Assets

None.

## Copyright
Copyright and related rights waived via [CC0](https://creativecommons.org/publicdomain/zero/1.0/).
