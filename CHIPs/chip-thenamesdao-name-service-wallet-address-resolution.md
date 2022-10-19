CHIP Number   | < Creator must leave this blank. Editor will assign a number.>
:-------------|:----
Title         | Name Service Wallet Address Resolution
Description   | A standard for NFTs to provide resolution of a name into a Chia address
Author        | Right Sexy Orc: Keybase @rightsexyorc
Editor        | < Creator must leave this blank. Editor will be assigned.>
Comments-URI  | < Creator must leave this blank. Editor will assign a URI.>
Status        | < Creator must leave this blank. Editor will assign a status.>
Category      | Informational
Sub-Category  | Guideline
Created       | 2022-10-18
Requires      | 0007
Replaces      |
Superseded-By |

## Abstract
This CHIP provides a method for an NFT to indicate a name that can map, or resolve, to a Chia blockchain address, with an optional expiry block number.

## Motivation
Chia blockchain addresses are long and hard for humans to memorize, communicate and transcribe.

Name services such as Domain Name Service (DNS) and Ethereum Name Service (ENS) are examples of methods for solving this problem for IP addresses and Ethereum blockchain addresses.

This proposal benefits the ecosystem by facilitating transaction creation, as well as Chia adoption by a larger number of humans.

Use cases for this address resolution include helping people communicate their payment address to others using their memory when they don't have their address available, and helping people transcribe their address when communicated verbally. It can also reduce error rates when copied and pasted in a computer manually, by making verification easier.

This proposal has already been implemented by Namesdao and our team has received confirmation by name holders of instances where it helped them communicate a payment address to others, so technical feasibility has been demonstrated and there has been some validation of use cases.

## Backwards Compatibility
No backwards incompatibilities

## Rationale
We looked to leverage existing patterns and designs when we designed this approach.

We looked especially to the Ethereum Name Service, which also uses an NFT approach.

We also looked to integrate with and leverage the existing primitives and design of the Chia blockchain.

A Chia NFT-based approach would leverage the existing infrastructure built throughout the ecosystem as well as existing primitives such as offers. Various wallets already support transfers and display of NFT's, and various NFT and blockchain explorers already support the standard as well. Additionally, various participants in the Chia community already are owners of NFT's and in many cases, have experience transferring or purchasing NFT's.

For design decisions, we decided to embed the name and expiry block into the metadata URI, and also to use DID-backed NFT's.

We considered exploring DID based possibilities, but there is very limited DID adoption beyond DID-backed NFT's, and no Accepted status CHIP specification.

One objective raised was based on the belief that name resolution required loading of the offchain metadata, but that is not the case, since the data is in the NFT's URI's itself. The design has been integrated into the [chia-crypto-utils developer toolkit](https://github.com/irulast/chia-crypto-utils), which is a toolkit used by many wallet developers, and thousands of Names have been registered through [Namesdao](https://www.namesdao.org/).


## Specification

Names are referenced in lowercase. If there is no dot extension at the end of the name, e.g. .xch, They will be interpreted as .xch extension names, e.g. _namesdaotime will reference  _namesdaotime.xch.

A Wallet Address-resolving Name Record on the Chia blockchain is a NFT1 coin minted by the Namespace's DID. A name record consists of five important values:

    1. the NFT coin id (provided per NFT1)
    2. The name, which is lowercase (required)
    3. The expiry block, an integer (optional)
    4. The Chia blockchain NFT owner address, per the NFT1 specification (provided per NFT1)
    5. Minter DID (per NFT1)

A. To extract the Name and Expiry Block from a Name NFT:

    1. Extract the second-to-last URI for the metadata file.
    2. Remove the .json ending
    3. Separate the text following the last "/" and split by the last "-" into two fields.
    4. The (optional) expiry block is the second field.
    5. URL-decode the first field to obtain the name.

B. The Wallet address for the name is the NFT owner address, per the NFT1 specification (CHIP-0005).

## Test Cases
  * Most Standards Track proposals will require a suite of test cases, which you may add to the `assets/chip-<CHIP>` folder.
  * Some Process proposals will require test cases, depending on the significance of new features being added.
  * Informational proposals typically will not require test cases.

Your proposal will have a greater chance of success if you err on the side of including more test cases. Use your best judgment.

## Reference Implementation
We will provide a code sample for parsing the name and expiry block from a URI.

Additional information is available in [Namesdao's NDIP-0002](https://github.com/theNamesdao/ndips/blob/main/ndips/ndip-0002.md).

## Security

A compromise of the Namespace's DID would let an attacker issue new Names. Each Namespace must take measures to secure its DID, as must any DID-backed NFT minter.


This section is mandatory for all CHIPs. List all considerations relevant to the security of this proposal if it is implemented. This section may be modified as the proposal moves toward consensus. Make sure to include:
  * Security-related design decisions
  * Important discussions
  * Any security-related guidance
  * All threats and risks, as well as how you are addressing them

## Additional Assets
Give a listing of files associated with this CHIP. This list will be added upon as the CHIP moves along the process of approval. All new files should be added to the `assets/chip-<CHIP>` folder. You should link to each individual file here, using relative links.

## Copyright
Copyright and related rights waived via [CC0](https://creativecommons.org/publicdomain/zero/1.0/).
