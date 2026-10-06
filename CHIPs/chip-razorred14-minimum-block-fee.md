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
This CHIP proposes a farmer-configurable minimum fee rate used only when selecting mempool transactions for inclusion in a block. Transactions below the configured rate remain valid, may enter the mempool, and continue to propagate between peers. A farmer whose configuration enables the threshold will omit those transactions from blocks it creates. This preserves transaction propagation to farmers willing to accept lower fees while allowing individual farmers to set a minimum price for the block space they produce.

## Motivation
The withdrawn CHIP-0003 proposed rejecting transactions below a configurable fee threshold before mempool admission. A prototype of that approach prompted a concern that admission filtering would impair transaction propagation: if enough relaying nodes rejected a low-fee transaction, the transaction might never reach a farmer willing to include it.

This proposal separates transaction relay policy from block construction policy. Full nodes continue to validate, store, and relay transactions according to existing mempool rules. Farmers may independently choose a minimum fee rate for transactions included in their candidate blocks.

This design provides the following benefits:

* Farmers can define the minimum compensation they require for the block space they create.
* Low-fee transactions continue to propagate to farmers whose thresholds permit them.
* The setting does not alter consensus validity. A block containing a transaction below another node's configured threshold remains valid.
* Adoption can be incremental because each farmer's setting affects only blocks produced by that farmer.

This proposal does not eliminate the network, validation, or storage costs of relaying dust transactions. It only limits their inclusion in blocks created by farmers who enable the threshold. Existing dust filters and mempool pressure rules remain responsible for protecting node resources.

## Backwards Compatibility
This proposal does not change Chia consensus rules, transaction validity, peer-to-peer transaction relay, or validation of blocks received from peers. Nodes that do not implement the proposal continue to construct blocks using their existing fee-priority behavior.

The default configuration value is `0`, preserving existing block construction behavior until a farmer explicitly enables a threshold. A farmer that configures a nonzero value may produce blocks that omit transactions which its previous configuration would have included. This is a local policy change, not a network incompatibility.

Wallets are not required to enforce a farmer's threshold. A transaction below one farmer's threshold may still be included by another farmer. Wallets and fee estimators should therefore present the configured value as local block-production policy, not as a network-wide minimum required for transaction validity or relay.

## Rationale
Applying the threshold during block creation addresses the principal objection raised during review of the initial prototype: mempool admission filtering can reduce the probability that low-fee transactions reach low-fee farmers. Keeping those transactions in mempools preserves fee-market choice and transaction propagation.

The threshold is expressed as mojos per million CLVM cost because CLVM cost approximates the block resource consumed by a transaction. A rate is fairer than one flat fee: high-cost transactions must pay proportionally more, while low-cost transactions are not charged as though they consumed an entire standard transaction's resources.

The configuration defaults to `0` because this is an operator policy and should not silently change block contents on upgrade. Farmers may choose the historical CHIP-0003 rate of `1 818 182` mojos per million CLVM cost, or another non-negative value appropriate to their operating policy.

Alternatives considered:

* **Reject below-threshold transactions during mempool admission.** Rejected because it impairs relay to farmers willing to accept lower fees and causes admission behavior to disagree with a transaction's consensus validity.
* **Apply a network-wide consensus minimum.** Rejected because it would invalidate otherwise valid transactions and blocks, require broad coordination, and remove farmer choice.
* **Use a flat fee per transaction.** Rejected because transactions vary substantially in CLVM cost.
* **Require a nonzero default.** Rejected because it would change block construction immediately for every upgraded farmer rather than allowing voluntary adoption.

The proposal incorporates feedback from the discussion and implementation review at [Chia-Network/chia-blockchain#21328](https://github.com/Chia-Network/chia-blockchain/pull/21328).

## Specification

### Configuration

The full node configuration will include:

```yaml
full_node:
  minimum_block_fee_per_cost: 0
```

`minimum_block_fee_per_cost` MUST be a non-negative integer expressed in mojos per `1 000 000` units of CLVM cost. A value of `0` disables the threshold.

Implementations MUST reject invalid configuration values at startup rather than silently substituting another value. Invalid values include negative integers, non-integers, and values outside the implementation's supported integer range.

### Required fee

For a transaction with CLVM cost `cost`, the minimum fee for block inclusion is:

```text
required_fee = ceil(cost * minimum_block_fee_per_cost / 1_000_000)
```

Using integer arithmetic, an implementation may calculate this as:

```text
required_fee = (cost * minimum_block_fee_per_cost + 999_999) // 1_000_000
```

An implementation MUST use checked or sufficiently wide integer arithmetic so multiplication cannot wrap.

### Mempool behavior

The configured threshold MUST NOT be used to reject an otherwise valid transaction from the mempool solely because its fee is below `required_fee`. It MUST NOT prevent fetching or relaying such a transaction. Existing mempool capacity, replacement, validation, and anti-spam rules remain unchanged.

### Block construction

When constructing a transaction block, a full node with a nonzero threshold MUST include only mempool items whose fee is greater than or equal to `required_fee` for that item's CLVM cost.

Items below the threshold MUST remain in the mempool, subject to existing eviction and expiration behavior. They may become eligible after the operator lowers the configured threshold. Aggregating transactions MUST NOT be used to bypass the rule: the aggregate fee and aggregate CLVM cost used by block construction MUST satisfy the same calculation.

The threshold is local policy only. A node MUST continue to accept a consensus-valid block from another farmer even when that block contains transactions below the node's configured threshold.

### Fee reporting

RPC responses that report local block-production fee policy SHOULD expose `minimum_block_fee_per_cost` and MUST identify it as a local farmer policy. Fee-estimation responses MUST NOT describe this value as a network-wide minimum or imply that transactions below it are invalid or will not propagate.

## Test Cases

A conforming implementation should include tests for:

* Configuration value `0`, confirming existing block construction behavior is unchanged.
* A negative, non-integer, or out-of-range configuration value, confirming startup fails with a clear error.
* Exact-boundary inclusion where the transaction fee equals `required_fee`.
* Exclusion where the transaction fee is one mojo below `required_fee`.
* Ceiling division when cost is not evenly divisible by `1 000 000`.
* Multiple transaction costs, confirming the required fee scales linearly with CLVM cost.
* A below-threshold transaction entering the mempool and being relayed normally.
* A below-threshold transaction remaining in the mempool after block creation.
* Inclusion of a previously ineligible transaction after the configured threshold is lowered.
* Acceptance of a consensus-valid peer block containing below-threshold transactions.
* Aggregate transaction selection, confirming aggregate fees and costs cannot bypass the threshold.
* RPC output, confirming the value is reported as local block-production policy.

## Reference Implementation

A conforming prototype is available at [Chia-Network/chia-blockchain#21328](https://github.com/Chia-Network/chia-blockchain/pull/21328). It applies the threshold in both block-construction paths while leaving mempool admission unchanged. Below-threshold transactions remain in the mempool and become eligible for inclusion if the farmer lowers the configured threshold.

## Security

This proposal intentionally leaves mempool admission and peer relay unchanged. It therefore does not protect nodes from the validation, bandwidth, or storage costs of receiving dust transactions. Implementations must retain existing dust filters, validation limits, mempool capacity controls, and peer anti-abuse protections.

A high farmer-configured threshold may delay low-fee transactions when a large portion of block producers use similar settings. This is an explicit local policy choice. The default value of `0`, continued transaction relay, and clear RPC reporting reduce the risk that a local threshold is mistaken for a consensus requirement.

Incorrect arithmetic could undercharge transactions, overcharge them, or wrap to a low value. Implementations must use checked or sufficiently wide integer arithmetic and ceiling division as specified.

Operators or software distributors could set a nonzero value without users understanding its effect. User interfaces and release notes should identify the setting as block-production policy and disclose nonzero defaults.

## Additional Assets

None.

## Copyright
Copyright and related rights waived via [CC0](https://creativecommons.org/publicdomain/zero/1.0/).
