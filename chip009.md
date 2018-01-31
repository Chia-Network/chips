chip009 -- TXO bitfield

## Abstract

The UTXO set may be replaced by a TXO bitfield. As new TXOs are created, a 1 bit is appended to the bitfield. As those TXOs are spent, the corresponding bit is flipped

## Motivation

Nodes hold the entire UTXO set in memory at all times. It would be good to hold a much smaller data structure in memory that can provide the same benefits.

## Specification
