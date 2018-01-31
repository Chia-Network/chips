# Transaction Format Revision

## Abstract

This CHIP describes a new standard format for transactions, witnesses, and a new data structure: the witness info. The transaction contains information relating to the creation of new UTXOs, the witness commits to the transaction and contains information related to user intent and the consumption of existing UTXOs (e.g. scriptPubkeys and timelock information), and the witness contains the information necessary to validate those spends (e.g. the initial stack). Signatures in the witness sign the hash of the witness info.

## Motivation

Transactions in Bitcoin initially contained all information in one data structure. Segregated Witness split information related to validating out of the transaction data structure and placed it into the witness. This has a number of advantages. Moving additional information out of the transaction and into a new object allows us to make new incremental improvements:

1. SIGHASH flags may be replaced with precise lists of inputs and outputs in the witness info.

2. TODO

## Specification

Transaction ids (`txid`) in Chia are defined as the *single* SHA256 of the serialization format:

```
[nVersion][primaryin][txouts]
```

The formats of `nVersion` and `txouts` are as Bitcoin. `primaryin` is a single input of the transaction.

A new data structure, the witness info is created. Its ID, the `wiid`, is defined as the *single* SHA256 of its serialization format:

```
[nVersion][witnessedin][inputFlag][txins][outputFlag][txouts][nLockTime][primaryinidx]
```

The witness info includes a version number `nVersion`, the index of the input this witnessinfo is associated with `witnessedin`, a bit specifying whether additional inputs may be added `input flag`, a list of inputs `txins`, equivalent info for outputs (specifying their scriptpubkeys and sizes) `outputFlag` and `txouts`, a timelock `nLockTime` and optionally the primary input of the transaction, specified by its index `primaryinidx` in the `txins`. `txins` and `txouts` are merklized lists with fixed-size entries.

The witness info specifies a list of inputs and a list of outputs for the transaction. The witness info and its associated witness are valid if and only if those inputs and outputs are present in the final transaction. If the `inputFlag` is not set, additional inputs may be present (committed to by other witness info structures). If the `outputFlag` is not set, additional outputs may be present (committed to by other witness info structures).

The witness contains the initial stack. For script evaluation, the witness is pushed onto the stack, then the scriptPubkey found in the witnessed input is pushed onto the stack. Script eval occurs as in Bitcoin. Signatures in the witness sign the `wiid`. As such, witnesses commit to the witness info as well as the transaction.

## Commitment Structure
