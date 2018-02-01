chip009 -- TXO bitfield

## Abstract

The UTXO set may be replaced by a TXO bitfield. As new TXOs are created, a 1 bit is appended to the bitfield. As those TXOs are spent, the corresponding bit is flipped to 0. This creates an accurate record of the TXO set, and places the burden of proof of inclusion in the set on the creator of a transaction.

## Motivation

Nodes hold the entire UTXO set in memory at all times. A much smaller data structure in memory can provide many of the same functionality with much lower overhead.

## Specification

Nodes maintain the current state of the ledger in a bitfield describing TXOs. The bitfield grows in length as TXOs are created. Each time a TXO is created, a new bit is appended to the field, and set to 1. This bitfield is stored in memory, and written to disk regularly.

Output order within a block is committed to in the block header via the `hashStateChanges` tree root. Therefore, the location of any TXO in the bitfield can be easily establishd. As such, transactions can be accompanied by a succinct proof of their position in the bitfield. Nodes using the bitfield instead of the UTXO set may require these proofs before relaying transactions.

Once a TXOs position in the bitfield is determined, its state may be easily updated when the TXO is spent in a block. As such, an up-to-date bitfield is a canonical record of the state of each TXO (both UTXOs and STXOs), and can be used in place of an in-memory UTXO set. 
