# UTXO set delta commitments

## Abstract
Blocks are required to commit to the sets of UTXOs created and destroyed in the block. Commitments are placed in the block header and nodes on the network verify commitments.

## Motivation

Bitcoin was initially intended to support simplified payment verification via proofs of set inclusion. This is a harder problem than it initially seems. Commitments to the changes in the UTXO set enable limited SPV proofs, as well as a variety of future transaction-level improvements.

## Specification

Each block header MUST include two new 32 byte fields: `hashTXOsCreated` and `hashTXOsDestroyed`. These fields represent the merkle root of the tx outputs created and destroyed. The block header is as follows:

```
[version][hashPrevBlock][blockHeight][hashTxnMerkleRoot][hashTXOsCreated][hashTXOsDestroyed][time][difficultyBits]
```

The leaves of these trees MUST be ordered lexically. When creating these trees, the leaf nodes commit to the UTXO via the single SHA256 hash of the following serialization:

```
[txid][index][value]
```

`txid` is the 32 byte hash of the transaction. `index` is the index of the output within that transaction. `value` is the value of the output.
