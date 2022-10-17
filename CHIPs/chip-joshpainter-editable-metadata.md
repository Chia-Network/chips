CHIP Number   | < Creator must leave this blank. Editor will assign a number.>
:-------------|:----
Title         | Owner-Editable Metadata Format for NFT1
Description   | A standard that allows NFT owners to update some or all of the metadata attributes and store those updates on-chain.
Author        | [Josh Painter](https://github.com/joshpainter)
Editor        | < Creator must leave this blank. Editor will be assigned.>
Comments-URI  | < Creator must leave this blank. Editor will assign a URI.>
Status        | < Creator must leave this blank. Editor will assign a status.>
Category      | Process
Sub-Category  | Informational
Created       | 2022-10-17
Requires      | 0007
Replaces      | 
Superseded-By | 

## Abstract
The Chia NFT1 standard enables an off-chain metadata file to be referenced by Non-Fungible Tokens (NFTs) on chain, along with a hash of the file that ensures its immutability. The format and schema of this metadata file is described by [CHIP-0007](chip-0007.md). This CHIP describes an easy way to allow the owner of the NFT to update some or all of that metadata, depending on which attributes have been marked as editable by the creator. It is intended to supplement the metadata schema described in [CHIP-0007](chip-0007.md).

## Motivation
[CHIP-0007](chip-0007.md) specifies the format and schema of the off-chain metadata file. By design, this metadata file is immutable. If any user attempts to update any of the metadata attributes in the referenced metadata file, the hash of the metadata file will change. The NFT viewer program is responsible for checking this hash to make sure the metadata has not been tampered.

However, the ability for the owner for a NFT to update some or all of the metadata for the NFT has some very interesting use-cases. Of particular interest is a Chia Name Service (CNS) that uses NFTs to resolve records. By allowing the owner to update their own NFT "pointer records," a CNS could enable full self-custody and self-sovereignty of these pointer records.

Another simple use case is the addition of an editable "notes" attribute in an otherwise-normal NFT. The owner could update the notes with any personal information about the NFT, a story about where they got it, etc. The next owner could overwrite or append to these notes, but the full history will always be stored on-chain as an additional bit of provenance!

This CHIP will explain one method of enabling this feature using existing NFT1 and CHIP-0007 standards with no required changes, including full backwards-compatibility.

## Backwards Compatibility
This CHIP is fully backwards-compatible with CHIP-0007. In fact, it proposes to add just a single new attribute to the CHIP-0007 schema. NFT1 standard requires no changes whatsoever.

## Rationale
The method described below is possible today even if this CHIP is never published because it requires no changes to any existing standards. However, by standardizing the "editable" attribute schema, it is hoped that the Chia NFT viewer itself will be able to make use of these editable attributes, along with other future NFT viewers.

Another possible method to accomplish a similar result would involve Chia Data Layer. Data Layer will no doubt be an important addition to these metadata standards in the future and will enable a much higher amount of data storage. However, Data Layer requires more user interaction and the user must opt-in to the data. By contrast, the method described below is much simpler and works with just a full node. For use cases involving small, rarely-updated data, the impact to the blockchain should be low.

Finally, this small addition to the work already done with CHIP-0007 is a good example of [Lateral Thinking with Withered Technology](https://medium.com/@uczlwha/nintendos-philosophy-lateral-thinking-with-withered-technology-f188f371e670). While the Chia NFT1 standard and CHIP-0007 are certainly not already "withered" according to the normally-accepted definition, a big benefit of this standard is that it uses these existing standards in a new way without breaking them.

## Specification

This CHIP proposes a new optional boolean property on the "trait" attribute defined in CHIP-0007 called "editable." Here is an example of an "editable" attribute (surrounding metadata removed for brevity):

```
...
{
    "trait_type": "Target",
    "value": "xch1v96m4cej23hpt4newv8hs9ejcsc760w3p8gh5p6989c7kyaq5juq9hzjgr",
    "editable": true
},
...
```

List the full technical design specification of any new feature you are proposing. This must include details of all syntax and semantics required to implement each new feature.

This section should be _detailed_. It needs to allow for competing interoperable implementations. When applicable, it may include technical diagrams to accompany your design.

## Test Cases
  * Most Standards Track proposals will require a suite of test cases, which you may add to the `assets/chip-<CHIP>` folder.
  * Some Process proposals will require test cases, depending on the significance of new features being added.
  * Informational proposals typically will not require test cases.

Your proposal will have a greater chance of success if you err on the side of including more test cases. Use your best judgment.

## Reference Implementation
Most Standards Track proposals, as well as some Process proposals, also will require a reference implementation to be included. It should be added to the same folder as your test cases, `assets/chip-<CHIP>`.

Regardless of this proposal's category, the reference implementation does not need to be completed in order to move the CHIP into _Draft_. However, it must be provided before the CHIP can be moved into _Review_.

## Security
This section is mandatory for all CHIPs. List all considerations relevant to the security of this proposal if it is implemented. This section may be modified as the proposal moves toward consensus. Make sure to include:
  * Security-related design decisions
  * Important discussions
  * Any security-related guidance
  * All threats and risks, as well as how you are addressing them

## Additional Assets
Give a listing of files associated with this CHIP. This list will be added upon as the CHIP moves along the process of approval. All new files should be added to the `assets/chip-<CHIP>` folder. You should link to each individual file here, using relative links.

## Copyright
Copyright and related rights waived via [CC0](https://creativecommons.org/publicdomain/zero/1.0/).




