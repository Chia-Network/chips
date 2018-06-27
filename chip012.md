---
layout: markdown
---

# chip012 -- nSequence and relative time lock semantics changes

## Abstract

The format of the `nSequence` field is modified to allow longer relative time locks, remove replace-by-fee (RBF) signalling, and remove the disable flag.

## Motivation

The `nSequence` associated with each input in Bitcoin has significance to absolute time locks, replace-by-fee policy, and consensus-enforced relative lock times. This CHIP removes its significance to absolute lock times and RBF policy. It also changes its name and semantic structure to accurately describe its sole purpose.

## Specification

`nSequence` is renamed to `nRelativeLockTime`.

The disable flag is removed. A value of `0x00000000` indicates that relative time locks are disabled

nSequence no longer signals opt-in replace-by-fee, as RBF is now default behavior.

The type flag is changed to Bit (1 << 31).

The rightmost 24 bits encode the value. If the type flag is set, they specify a timespan in units of 512 second granularity. If the type flag is not set, they specify a number of blocks.

Bits (1<<24) through (1 << 30) are reserved for future use.

A value of `0xFFFFFFFF` no longer disables absolute time locks via the `nLockTime` field.
