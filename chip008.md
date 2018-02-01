# Reverse BLS signature scheme

## Abstract

Chia will use the BLS12-381 pairing as described [here](https://github.com/ebfull/pairing/tree/master/src/bls12_381). However, rather than instantiating public keys on G1 and signatures on G2, as is typical in BLS signature schemes, Chia's signature scheme will instantiate signatures on G1 and public keys on G2. This preserves the security and aggregation properties of the signature scheme.

### Motivation

One of the main advantages of the BLS signature scheme is space saving via aggregation. Any number of signatures may be aggregated into a single curve point. In the BLS12-381 instantiations, signatures are exceptionally short, 48 bytes, while pubkeys are long, 96 bytes. As in Bitcoin, pubkeys must be revealed during transaction validation and are included on chain. The long pubkey negates much of the advantage of signature aggregation. Placing the signature on G2 and the pubkey on G1, on the other hand, means that Chia transaction will contain many 48 byte pubkeys (50% larger than ECDSA's 33 byte pubkey), and a single 96 byte signature. This is more space-efficient so long as at least 2 signatures are aggregated.

### Specification

As in [BLS](https://cseweb.ucsd.edu/~hovav/dist/sigs.pdf) with the following exceptions:

```
privkeygen: x <-R- Z_p
pubkeygen: v <- g_1^x
hashing: h <- H(M) ∈ G_2
signing: σ <- h^x
verification: e(v, h) =? e(g_1, σ)
```
