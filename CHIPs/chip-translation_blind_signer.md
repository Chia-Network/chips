CHIP Number   | < Creator must leave this blank. Editor will assign a number.>
:-------------|:----
Title       	| Blind Signer Translation
Description   | Translates the wallet APIs from CHIP-<todo> into a compressed BLOB for blind signers
Author      	| [Matt Hauff](https://github.com/Quexington)
Editor      	| [Dan Perry](https://github.com/danieljperry)
Comments-URI  | < Creator must leave this blank. Editor will assign a URI.>
Status      	| < Creator must leave this blank. Editor will assign a status.>
Category    	| Process
Sub-Category  | Tooling
Created   	  | 2024-03-14
Requires    	| [todo] Wallet Signer Protocol CHIP
Replaces    	| None
Superseded-By | None

## Abstract

This CHIP is a translation layer that reduces the maximal set of wallet protocol APIs from `CHIP-<todo>` into an optimal set of APIs for one or more signers. This CHIP is designed specifically for blind signers, which only include signature targets, and not anything about the spends.

## Motivation

Multiple types of signers will likely use the APIs from `CHIP-<todo>`. Each signer type will require a separate CHIP to standardize a method for translating the APIs into compressed BLOBs. This CHIP focuses narrowly on blind signers.

## Backwards Compatibility

This CHIP does not introduce any backwards incompatibilities.

## Rationale

This CHIP is targeted at developers of blind signers, in order to provide them with a standard method to translate the wallet protocol API into a compressed BLOB.

## Specification

### Types

Each of the following types replaces one or more parameters from the equivalent APIs laid out in CHIP-[todo] (the `-` symbols) with a parameter specifically for blind signers (the `+` symbols).

#### signing_target

```json
{
  - "pubkey": ...
  + "p": ...
  - "message": ...
  + "m": ...
  - "hook": ...
  + "h": ...
}
```

#### sum_hint

```json
{
  - "fingerprints": [...]
  + "f": [...]
  - "synthetic_offset": ...
  + "o": ...
}
```

#### path_hint

```json
{
  - "root_fingerprint": ...
  + "f": ...
  - "path": [...]
  + "p": [...]
}
```

#### signing_instructions

```json
{
  - "key_hints": <key_hints>
  - "targets": [<signing_target>]
  + "s": [<sum_hint>]
  + "p": [<path_hint>]
  + "t": [<signing_target>]
}
```

#### unsigned_transaction

```json
{
  - "transaction_info": <transaction_info>
  - "signing_instructions": <signing_instructions>
  + "s": [<sum_hint>]
  + "p": [<path_hint>]
  + "t": [<signing_target>]
}
```

#### signing_response

```json
{
  - "signature": ...
  "s": ...
  - "hook": ...
  "h": ...
}
```

## Test Cases

[todo]

## Reference Implementation

[todo]

## Security

CNI plans to conduct an internal audit of this code when it is ready.

## Additional Assets

None

## Copyright
Copyright and related rights waived via [CC0](https://creativecommons.org/publicdomain/zero/1.0/).
