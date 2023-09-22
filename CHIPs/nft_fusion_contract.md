| CHIP Number   | < Creator must leave this blank. Editor will assign a number.>             |
|:--------------|:---------------------------------------------------------------------------|
| Title         | nft fusion puzzle                                                          |
| Description   | Smart Coin Contract for fusing (combining), defusing, and upgrading NFTs   |
| Author        | [Brandt Holmes](https://github.com/BrandtH22) (BrandtH22/ClydeWallace22)   |
| Editor        | < Creator must leave this blank. Editor will be assigned.>                 |
| Comments-URI  | < Creator must leave this blank. Editor will assign a URI.>                |
| Status        | < Creator must leave this blank. Editor will assign a status.>             |
| Category      | Informational                                                              |
| Sub-Category  | Chialisp Puzzle                                                            |
| Created       | 2023-10-01                                                                 |
| Requires      | [0015](https://github.com/Chia-Network/chips/blob/main/CHIPs/chip-0015.md) |
| Replaces      | NA                                                                         |
| Superseded-By | NA                                                                         |
| Extends       | NA                                                                         |

## Abstract

Proposal for a chialisp puzzle that enables a trustless and decentralized method of fusing (combining), updating, and upgrading NFTs on the Chia blockchain.
The single puzzle connects an input of one or more NFTs and an output of one or more NFTs, the input NFT(s) must be included in an offer file to claim the outputs NFT(s) locked with the smart coin puzzle.

The puzzle also supports reversing the operation by anyone that controls the necessary NFT(s) (output NFT(s) must be included in an offer file to claim the input NFT(s)).

## Motivation
The current NFT standard on Chia is a truly hardened non-fungible standard and intentionally prevents an NFT owner or creator from changing, upgrading, or combining the NFT with others.
This puzzle enables a method of retaining the non-fungible design of Chia NFTs and associated provenance while introducing a method to change, upgrade, or combine the NFT with others.

## Backwards Compatibility
This CHIP extension is fully backwards compatible and designed to be future-proofed.
The use of CHIP 15 metadata aids display services (marketplaces, explorers, wallets, etc) to better display the intricacies associates with the NFT Fusion Puzzle including:
- NFT(s) that are locked in fusion puzzles (hints can be used to identify whether the NFT is locked in a puzzle)
- NFT(s) that have been changed in some way using a fusion puzzle (CHIP 15 metadata identifies the fusion puzzle address and the original NFT(s))
- NFT(s) that have been upgraded using the fusion puzzle (CHIP 15 metadata identifies the fusion puzzle address and the original NFT(s))
- NFT(s) that have been combined using the fusion puzzle (CHIP 15 metadata identifies the fusion puzzle address and the original NFT(s))

## Rationale
Describe the reasons for designing your features in the way you have proposed. Make sure to include:
  * Why did you choose your design?
    * 
  * What design decisions did you make?
    * The use of a smart puzzle to enable on-chain provenance and immutability.
    * The use of offer files for a user-friendly experience.
    * The ability to reverse the puzzle enabling upgrading/downgrading.
    * The ability to use one or more NFTs on either side of the puzzle.
    * Not to have any overrides or master keysets involved in the puzzle.
    * 
  * What alternative designs did you consider?
    * Performing everything offline in a trusted manner (users send NFTs to a project creator to have the upgraded NFT returned), this requires trusting the project and severely limits future interactions such as defusing or downgrading.
    * The use of custom spend bundles requiring the user to download and run custom scripts as this would have simplified development.
    * Creating a 1-way only puzzle as this simplified development but drastically limits functionality.
    * Limiting the puzzle to single NFTs again simplified development but drastically limits functionality.
    * Including an escape spend that would enable the puzzle creator to remove NFTs from the puzzles. This was initially intended to be a security feature to ensure NFTs would not be bricked by the incorrect creation of contracts but was deemed too much of a security risk when the project is not known.
    * 
  * How have you achieved community consensus for your design?
    * Over the period of 1-year, we have discussed and reviewed the design and integration plans with display services, chialisp developers, community members, and more.
    * We have drastically upgrading the initial design of the puzzle to enable the use of offer files rather than custom spend bundle logic.
    * We have developed a full implementation for the [MonkeyZoo project](www.fusionzoo.net).
    * 
  * What objections were raised during your discussions with the community, and how does your design address them?
    * Backwards compatibility - The ability to use this puzzle with any and all NFTs that currently exist on-chain ensures full backwards compatibility. Also, using CHIP15 metadata ensures display services already have the tools they need to display the intricacies of the puzzles.
    * Future compatibility - The ability to reverse the puzzle ensures that even future owners can claim back the original NFT(s) locked in the puzzle. Also, the ability to use cascading puzzles ensures ever-increasing functionality.
    * Ease of integration - Using primitives and CHIPs that are already present in the Chia ecosystem simplifies integration for display services. Developing a test case for the MonkeyZoo project and providing the full contract open source helps others to utilize the puzzle.
    * Purpose of integration - Expanding the current functionality of chia NFTs in a way that enables ever-increasing functionality and expandability.

## Specification
TODO: INSERT CLSP STUFF HERE

### Integrating the Fusion Puzzle
Each ecosystem member will have a different role to play in the adoption of this proposal:

**Display Service(s):**
Display services have the ability to parse the CHIP15 metadata and to identify Fusion Puzzles via hints in order to display:
- NFTs locked in fusion puzzles
- The provenance of fused/updated/upgraded nfts
- Available interactions with fusion puzzles (defusing, reverting updates, downgrading, etc)
- Total number of fusion puzzles
- Total number of NFT associated with fusion puzzles

**Minting Solution(s):**
Minting solutions have the ability to provide fusion, update, and/or upgrade services to creators by integrating the fusion puzzle into their minting solution.

**Creator(s):**
Creators have the ability to add additional functionality through fusions and upgrades or to update their nfts as they deem fit (the NFT holder has the ability to follow through with the update or to keep their current version).

#### Fusion Example: Fusing (Combining) NFTs -
NOTE - examples below are showing the data specific to displaying the components of a Fusion Puzzle and are not fully inclusive of CHIP15 capabilities. More complete examples can be found in the [chip assets](https://github.com/Chia-Network/chips/blob/main/assets/nft_fusion_puzzle.md)
NOTE 2 - examples below are representative of specific attributes being fused but this CHIP can also be used for entire NFTs rather than just specific attributes.

The below example shows an NFT that was created by fusing 5 attributes from 5 different NFTs.
This example identifies:
- type and encoding format of the fused NFT
- xch address of the fusion puzzle
- all attributes that were fused to create the fused NFT
- the original NFT ids of the fused attributes

| Property     | Type     | Required | Description                                                                                                                                                                                                  |
|--------------|----------|----------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `subjectOf`  | {object} | **Yes**  | denotes the NFT is associated with the noted property (a fusion puzzle in this case)                                                                                                                         |
| `@type`      | string   | **Yes**  | property type ("PropertyValue" should be used to denote that specific propertyID's will be used)                                                                                                             |
| `propertyID` | string   | **Yes**  | property id ("Fusion Puzzle" denotes that this puzzle is used in the NFT, "Fused Attribute" denotes the NFT fuses attributes from 1 or more NFTs, "NFTid" denotes the original NFT containing the attribute) |
| `value`      | string   | **Yes**  | value of the identifier (an xch address will be used for the puzzle, nftIDs will be used for associated NFTs, attribute values will be used for attributes)                                                  |
| `hasPart`    | [array]  | **Yes**  | an array denoting parts contained in the NFT (fused attributes will be identified in the array)                                                                                                              |
| `identifier` | {object} | **Yes**  | denotes that additional information or data is provided for the NFT (refer to the contents of the identifier object for more details)                                                                        |
| `name`       | string   | **Yes**  | name or title of the identifier (attribute names will be used for fused attributes)                                                                                                                          |
| `mainEntity` | {object} | **Yes**  | object that identifies the original NFT containing the fused attribute                                                                                                                                       |

Use Cases:
- combining multiple nfts into 1 or more other nfts
- composable assets

 ```
"data": {
  "@context": "https://schema.org",
  "@type": "ImageObject",
  "encodingFormat": "image/png",
  "subjectOf": {
    "@type": "PropertyValue",
    "propertyID": "Fusion Puzzle",
    "value": "xchxr9snwz8rv084p2fhpa7je4z8sc9dapqxdwghcg53my3slsp902fe"
  },
  "hasPart": [
    {
      "@type": "ImageObject",
      "encodingFormat": "image/png",
      "identifier": {
        "@type": "PropertyValue",
        "propertyID": "Fused Attribute",
        "name": "Shorts",
        "value": "Red Shorts 1"
      },
      "mainEntity":{
        "@type": "PropertyValue",
        "propertyID": "NFTid",
        "value": "nft1u840lusdgpc5vp708fjwmlshjnvueqwhplrsk59mjdwaet8vgqxq0p3eu6"
      }
    },
    {
      "@type": "ImageObject",
      "encodingFormat": "image/png",
      "identifier": {
        "@type": "PropertyValue",
        "propertyID": "Fused Attribute",
        "name": "Eyes",
        "value": "brown eyes smokes 2"
      },
      "mainEntity":{
        "@type": "PropertyValue",
        "propertyID": "NFTid",
        "value": "nft14mt28v2cx2q8e6d877tn7u5pfnvsqyq8wyy0d9qcan7u8sw65tpqh5s92s"
      }
    },
    {
      "@type": "ImageObject",
      "encodingFormat": "image/png",
      "sha256": "127df0f866e4f7a4b512a2c047c108c5ab61ce48e3e7583c16419fdf82c9aba4",
      "identifier": {
        "@type": "PropertyValue",
        "propertyID": "Fused Attribute",
        "name": "Body",
        "value": "Base layer"
      },
      "mainEntity":{
        "@type": "PropertyValue",
        "propertyID": "NFTid",
        "value": "nft16faqwm3de0njhtwheqtkgrftz2p56e66y069gwywvd5w5u3w82tqsu7pv8"
      }
    },
    {
      "@type": "ImageObject",
      "encodingFormat": "image/png",
      "identifier": {
        "@type": "PropertyValue",
        "propertyID": "Fused Attribute",
        "name": "Backgrounds",
        "value": "Turquoise cloud background 3"
      },
      "mainEntity":{
        "@type": "PropertyValue",
        "propertyID": "NFTid",
        "value": "nft1e7zt7fd4sdu4x276e7dtu6ztln4rtuxpea7c8unzpyd9zl877znq2edgke"
      }
    },
    {
      "@type": "ImageObject",
      "encodingFormat": "image/png",
      "identifier": {
        "@type": "PropertyValue",
        "propertyID": "Fused Attribute",
        "name": "Objects",
        "value": "Flaming halo 3"
      },
      "mainEntity":{
        "@type": "PropertyValue",
        "propertyID": "NFTid",
        "value": "nft1mp6nfx7easclw6mgpsupxu0lt03evp6gge84kjx3337shfkxnh8qwrsrju"
      }
    }
  ]
}
 ```

#### Update Example: Changing NFT Attributes or Data -
NOTE - examples below are showing the data specific to displaying the components of an Update Puzzle and are not fully inclusive of CHIP15 capabilities. More complete examples can be found in the [chip assets](https://github.com/Chia-Network/chips/blob/main/assets/nft_fusion_puzzle.md)
NOTE 2 - examples below are representative of specific attributes being updated but this CHIP can also be used for entire NFTs rather than just specific attributes.

The below example shows an NFT that was created with a typo in the Shorts attribute ("Red Shortz 1" vs "Red Shorts 1") and is being updated with a corrected NFT.
This example identifies:
- type and encoding format of the updated NFT
- xch address of the update puzzle
- all attributes and their original values that were updated to create the updated NFT
- the original NFT ids of the updated attributes

| Property     | Type     | Required | Description                                                                                                                                                                                            |
|--------------|----------|----------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `subjectOf`  | {object} | **Yes**  | denotes the NFT is associated with the noted property (an update puzzle in this case)                                                                                                                  |
| `@type`      | string   | **Yes**  | property type ("PropertyValue" should be used to denote that specific propertyID's will be used)                                                                                                       |
| `propertyID` | string   | **Yes**  | property id ("Update Puzzle" denotes that this puzzle is used in the NFT, "Updated Attribute" denotes the NFT updates attributes of an NFT, "NFTid" denotes the original NFT containing the attribute) |
| `value`      | string   | **Yes**  | value of the identifier (an xch address will be used for the puzzle, nftIDs will be used for associated NFTs, original attribute values will be used for updated attributes)                           |
| `hasPart`    | [array]  | **Yes**  | an array denoting parts contained in the NFT (updated attributes will be identified in the array)                                                                                                      |
| `identifier` | {object} | **Yes**  | denotes that additional information or data is provided for the NFT (refer to the contents of the identifier object for more details)                                                                  |
| `name`       | string   | **Yes**  | name or title of the identifier (attribute names will be used for updated attributes)                                                                                                                  |
| `mainEntity` | {object} | **Yes**  | object that identifies the original NFT containing the updated attribute                                                                                                                               |

Use Cases:
- fixing typos or other errors in NFTs while maintaining provenance
- updating values in an NFT based on other conditions (ex. an NFT that represents seasons or releases of a card game)

 ```
"data": {
  "@context": "https://schema.org",
  "@type": "ImageObject",
  "encodingFormat": "image/png",
  "subjectOf": {
    "@type": "PropertyValue",
    "propertyID": "Update Puzzle",
    "value": "xchxr9snwz8rv084p2fhpa7je4z8sc9dapqxdwghcg53my3slsp902fe"
  },
  "hasPart": [
    {
      "@type": "ImageObject",
      "encodingFormat": "image/png",
      "identifier": {
        "@type": "PropertyValue",
        "propertyID": "Updated Attribute",
        "name": "Shorts",
        "value": "Red Shortz 1"
      },
      "mainEntity":{
        "@type": "PropertyValue",
        "propertyID": "NFTid",
        "value": "nft1u840lusdgpc5vp708fjwmlshjnvueqwhplrsk59mjdwaet8vgqxq0p3eu6"
      }
    }
  ]
}
 ```

#### Upgrade Example: Upgrading NFT Attributes -
NOTE - examples below are showing the data specific to displaying the components of an Upgrade Puzzle and are not fully inclusive of CHIP15 capabilities. More complete examples can be found in the [chip assets](https://github.com/Chia-Network/chips/blob/main/assets/nft_fusion_puzzle.md)
NOTE 2 - examples below are representative of specific attributes being upgraded but this CHIP can also be used for entire NFTs rather than just specific attributes.

The below example shows an NFT that is having the Shorts attribute upgraded ("Red Shorts 1" to "Flaming Red Shorts 3").
This example identifies:
- type and encoding format of the upgraded NFT
- xch address of the upgrade puzzle
- all attributes and their original values that were upgraded to create the upgraded NFT
- the original NFT ids of the upgraded attributes

| Property     | Type     | Required | Description                                                                                                                                                                                              |
|--------------|----------|----------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `subjectOf`  | {object} | **Yes**  | denotes the NFT is associated with the noted property (an upgrade puzzle in this case)                                                                                                                   |
| `@type`      | string   | **Yes**  | property type ("PropertyValue" should be used to denote that specific propertyID's will be used)                                                                                                         |
| `propertyID` | string   | **Yes**  | property id ("Upgrade Puzzle" denotes that this puzzle is used in the NFT, "Upgraded Attribute" denotes the NFT updates attributes of an NFT, "NFTid" denotes the original NFT containing the attribute) |
| `value`      | string   | **Yes**  | value of the identifier (an xch address will be used for the puzzle, nftIDs will be used for associated NFTs, original attribute values will be used for upgraded attributes)                            |
| `hasPart`    | [array]  | **Yes**  | an array denoting parts contained in the NFT (upgraded attributes will be identified in the array)                                                                                                       |
| `identifier` | {object} | **Yes**  | denotes that additional information or data is provided for the NFT (refer to the contents of the identifier object for more details)                                                                    |
| `name`       | string   | **Yes**  | name or title of the identifier (attribute names will be used for upgraded attributes)                                                                                                                   |
| `mainEntity` | {object} | **Yes**  | object that identifies the original NFT containing the upgraded attribute                                                                                                                                |

Use Cases:
- upgrading specific attributes or entire nfts while maintaining on-chain provenance and the ability to downgrade

 ```
"data": {
  "@context": "https://schema.org",
  "@type": "ImageObject",
  "encodingFormat": "image/png",
  "subjectOf": {
    "@type": "PropertyValue",
    "propertyID": "Upgrade Puzzle",
    "value": "xchxr9snwz8rv084p2fhpa7je4z8sc9dapqxdwghcg53my3slsp902fe"
  },
  "hasPart": [
    {
      "@type": "ImageObject",
      "encodingFormat": "image/png",
      "identifier": {
        "@type": "PropertyValue",
        "propertyID": "Upgraded Attribute",
        "name": "Shorts",
        "value": "Red Shorts 1"
      },
      "mainEntity":{
        "@type": "PropertyValue",
        "propertyID": "NFTid",
        "value": "nft1u840lusdgpc5vp708fjwmlshjnvueqwhplrsk59mjdwaet8vgqxq0p3eu6"
      }
    }
  ]
}
 ```

### Verifying Data
1. TODO: UPDATE

## Test Cases
  * TODO: UPDATE

## Reference Implementation
  * TODO: INSERT CLSP STUFF HERE

## Security
TODO: UPDATE

## Additional Assets
  * TODO: UPDATE

## Copyright
Copyright and related rights waived via [CC0](https://creativecommons.org/publicdomain/zero/1.0/).
