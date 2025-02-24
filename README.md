# CHia Improvement Proposals (CHIPs)

This repository contains a list of improvements related to Chia. The complete procedure for proposing and managing a CHIP can be found in [CHIP 1](/CHIPs/chip-0001.md).

The [CHIPs backlog project](https://github.com/Chia-Network/chips/projects/1) provides the list of on-going proposals and their status. 

## Meetings
**Purpose:**

The CHIPs community meetings provide a forum for the community to gather and discuss CHIPs proposals and support each other in building a secure, sustainable, and compliant blockchain technology. 

**Agenda:**

The agenda of each meeting should focus on the CHIPs proposals, and it should include two main topics: 
- Author to present the CHIP
- Feedback and discussion

**Logistics**
- The meeting information will be tracked with GitHub [project](https://github.com/Chia-Network/dev-community-meetings/projects/1). 
- The agenda should be published two weeks before the actual meeting to give the community ample time to suggest agenda items or post questions about the CHIP. 


## CHIP list
The rest of this document is a summary of all notable CHIPs, organized by status.

### Living
* [1 - CHia Improvement Proposal (CHIP) process](/CHIPs/chip-0001.md)

### Draft
* [39 - Fee Service Standard](https://github.com/Chia-Network/chips/pull/138)
* [42 - Protected Single Sided Offers](https://github.com/Chia-Network/chips/pull/143)
* [43 - Meta Inner Puzzle Spec (MIPS)](https://github.com/Chia-Network/chips/pull/145)

### Review
* [27 - Signer Protocol Wallet APIs](https://github.com/Chia-Network/chips/pull/102)
* [28 - Blind Signer Translation](https://github.com/Chia-Network/chips/pull/103)
* [29 - Signer Protocol Serialization](https://github.com/Chia-Network/chips/pull/104)
* [30 - Wallet Signer BLOB Subdivision](https://github.com/Chia-Network/chips/pull/105)
* [31 - Wallet Signer QR Transportation](https://github.com/Chia-Network/chips/pull/106)
* [37 - EIP-712 Wallet Puzzle](https://github.com/Chia-Network/chips/pull/147)
* [38 - Revocable CATs](https://github.com/Chia-Network/chips/pull/136)
* [40 - everything_with_singleton TAIL](https://github.com/Chia-Network/chips/pull/139)
* [41 - Streaming Puzzle](https://github.com/Chia-Network/chips/pull/142)

### Review (Fast Track)
* None

### Last Call
* None

### Final
* [2 - dApp Protocol](/CHIPs/chip-0002.md)
* [4 - DID1](/CHIPs/chip-0004.md)
* [5 - NFT1](/CHIPs/chip-0005.md)
* [7 - Off-Chain metadata format for NFT1](/CHIPs/chip-0007.md)
* [8 - Split Royalties for NFT1](/CHIPs/chip-0008.md)
* [9 - Name Service Wallet Address Resolution](/CHIPs/chip-0009.md)
* [11 - CLVM BLS Additions](/CHIPs/chip-0011.md)
* [12 - Plot Filter Reduction](/CHIPs/chip-0012.md)
* [14 - Chialisp ASSERT_BEFORE_* conditions](/CHIPs/chip-0014.md)
* [15 - NFT1 metadata extension](/CHIPs/chip-0015.md)
* [20 - Wallet Hinted Coin Discovery](/CHIPs/chip-0020.md)
* [21 - NFT Fusion Puzzle](/CHIPs/chip-0021.md)
* [22 - Enhanced Harvester Protocol](/CHIPs/chip-0022.md)
* [25 - Chialisp Message Conditions](/CHIPs/chip-0025.md)
* [26 - New Wallet Sync Protocol](/CHIPs/chip-0026.md)
* [33 - Add additional partial headers](/CHIPs/chip-0033.md)
* [35 - DataLayer Delegation Capabilities](/CHIPs/chip-0035.md)
* [36 - keccak256 CLVM operator](/CHIPs/chip-0036.md)

### Stagnant
* [16 - VC1 standard](https://github.com/Chia-Network/chips/pull/65)
* [17 - VC metadata structure](https://github.com/Chia-Network/chips/pull/66)
* [18 - KYC-VC proof structure](https://github.com/Chia-Network/chips/pull/67)
* [19 - Restricted CAT standard](https://github.com/Chia-Network/chips/pull/68)
* [23 - On-chain voting standard](https://github.com/Chia-Network/chips/pull/90)
* [24 - DAO1 standard](https://github.com/Chia-Network/chips/pull/93)

### Withdrawn
* [3 - Minimum Fee](https://github.com/Chia-Network/chips/pull/13)
* [6 - DID External Identity Linking](https://github.com/Chia-Network/chips/pull/12)
* [10 - Owner-Editable Metadata Format for NFT1](https://github.com/Chia-Network/chips/pull/33)
* [13 - Tighten plot filter rules](https://github.com/Chia-Network/chips/pull/57)
* [32 - Block NoSSD](https://github.com/Chia-Network/chips/pull/111)
* [34 - Keccak and base64 operators](https://github.com/Chia-Network/chips/pull/116)

### Obsolete
* CAT1 -- This standard was replaced with CAT2

### Grandfathered
The following standards were finalized before the CHIP process had been created:
* [Singletons](https://chialisp.com/singletons) -- A standard for creating puzzles with unique IDs
* [Pooling](https://chialisp.com/pooling) -- Chia's decentralized pooling protocol
* [CAT2](https://chialisp.com/cats) -- The second standard for Chia Asset Tokens
* [Offers](https://chialisp.com/offers) -- The first standard for peer-to-peer asset exchange on Chia's blockchain

### Under Consideration
The following Pull Requests have not yet been formalized as a CHIP:
* [Auction Standard](https://github.com/Chia-Network/chips/pull/24)
* [Accelerated plot filter reduction](https://github.com/Chia-Network/chips/pull/95)

-----

Take a look at [notes/TODO.md](/notes/TODO.md) to see CHIPs that still need to be created.

To view these CHIPs in pretty rendered Markdown in your browser, type:

```
gem install bundler jekyll
jekyll serve
```
