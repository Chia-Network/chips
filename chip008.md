---
layout: markdown
---
chip009 -- BLS Signature Scheme

## Abstract

Chia will use BLS aggregate signatures, using the BLS12-381 curve. This includes two aggregation schemes, an efficient simple one, and a secure one, which works for identical messages under the plain public key model. However, rather than instantiating public keys on G1 and signatures on G2, as is typical in BLS signature schemes, Chia's signature scheme will instantiate signatures on G1 and public keys on G2. This preserves the security and aggregation properties of the signature scheme.

## Motivation

One of the main advantages of the BLS signature scheme is space saving via aggregation. Any number of signatures may be aggregated into a single curve point. In the BLS12-381 instantiations, signatures are exceptionally short, 48 bytes, while pubkeys are long, 96 bytes. As in Bitcoin, pubkeys must be revealed during transaction validation and are included on chain. The long pubkey negates much of the advantage of signature aggregation. Placing the signature on G2 and the pubkey on G1, on the other hand, means that Chia transaction will contain many 48 byte pubkeys (50% larger than ECDSA's 33 byte pubkey), and a single 96 byte signature. This is more space-efficient so long as at least 2 signatures are aggregated. Furthermore, to make verification faster, and reduce the number of pairing computations, we can combine public keys during verification. In order to do this securely, exponents are used on signatures and public keys.

## Specification

The spec that will be followed is the the one from [Boneh, Drijvers, Neven](https://crypto.stanford.edu/~dabo/pubs/papers/BLSmultisig.html).


The curve used is BLS12-381 as described [here](https://github.com/ebfull/pairing/tree/master/src/bls12_381).

However, instead of groups G<sub>0</sub> and G<sub>2</sub>, we will use 1-indexing (G<sub>1</sub> and G<sub>2</sub>), and flip
the curves, so where the above paper uses G<sub>0</sub>, we use G<sub>2</sub>. The generators for G<sub>1</sub> and G<sub>2</sub>
are g<sub>1</sub> and g<sub>2</sub> respectively. Multiplicative notation is used for all groups.

Hashing to G<sub>1</sub> and G<sub>2</sub>, H<sub>1</sub> and H<sub>2</sub>:

SHA256(m) -> TODO

### Signature scheme
There are two aggregation schemes: simple aggregation and secure aggregation.
Simple aggregation of signatures is performed by multiplying all signatures together.
This is not secure in the plain public key model, since an attacker can submit a rogue public
key that cancels out another public key. This attack only works for identical messages,
so using simple aggregation for distinct messages is secure.


The second scheme is secure aggregation. This involves raising each signature (or public key) to
a specific power, determined by the hash of all the public keys. This defends against the rogue
public key attack, so it is suitable for identical messages, in the plain public key model.
This comes at the cost of additional computation to combine the signatures. If this is an issue,
the simple aggregation scheme can be used for identical messages, along with a proof of knowledge
of the secret key.

When performing aggregation on identical messages, public keys (and private keys) can
be aggregated as well. Therefore, verifying an aggregate signature on identical messages, is the
same as aggregating a single signature with a single public key, on that message. This does not apply
for aggregation of distinct messages: in this case, all public keys must be used by the verifier.

The simple and secure schemes can also be combined. When there are many signatures, some of which are identical, the identical ones can be combined using the secure method (which makes all messages distinct), and then the remaining signatures, including these new aggregates, can be combined using the simple aggregation method.

The signature scheme is composed of the following methods: keyGen, sign, aggregate, verify, aggregatePks, aggregateSks.

#### keyGen
* input:
* output: field element in Z<sub>p</sub>, G<sub>1</sub> element
```python
sk = SHA256(random seed) mod p
pk <- g1 ^ sk
```


#### sign
* input: bytes m, Z<sub>p</sub> element sk
* output: G<sub>2</sub> element σ
```python
σ <- H2(m) ^ sk
```


#### verify

* input:
    * G<sub>2</sub> element σ
    * map((bytes m, G<sub>1</sub> pk) -> Z<sub>n</sub> exponent) aggInfo
* output: bool
```python
if aggInfo is empty: return false
pks = []
ms = []
for each distinct messsageHash m in aggInfo:
    pkAgg = g1
    for each pk grouped with m:
        pkAgg *= pk ^ aggInfo[(m, pk)]
    pks.add(pkAgg)
    ms.add(m)
return e(g1, σ) == prod e(pks[i], ms[i])
```

#### aggregate
* input:
    * list of G<sub>2</sub> elements σ
    * list of map((bytes m, G<sub>1</sub> pk) -> Z<sub>n</sub> exponent) aggInfo
* output:
    * G<sub>2</sub> element σ<sub>agg</sub>
    * map((bytes m, G<sub>1</sub> pk) -> Z<sub>n</sub> exponent) newAggInfo
```python



* σ<sub>agg</sub> <- (σ<sub>1</sub> • ...• σ<sub>n</sub>)
```

**pubkey (48 bytes):** 381 bit affine x coordinate, encoded into 48 big-endian bytes. Since we have 3 bits left over in the beginning, the first bit is set to 1 iff affine y = 1.

**signature (96 bytes):** Two 381 bit integers (affine x coordinate), encoded into two 48 big-endian byte arrays. Since we have 3 bits left over in the beginning, the first bit is set to 1 iff affine y = 1.



### HD keys
HD keys will follow Bitcoin's BIP32 specification, with the following exceptions:
* The HMAC key go generate a master private key used is not "Bitcoin seed" it is "BLS HD seed".
* The master secret key is generated mod n from the master seed,
since not all 32 byte sequences are valid BLS private keys
* Instead of SHA512(input), do SHA256(input || 0x00) ||
SHA256(input || 0x01)
* Mod n for the output of key derivation.
* ID of a key is SHA256(pk) instead of HASH160(pk)
* Serialization of extended public key is 94 bytes, since public keys are longer