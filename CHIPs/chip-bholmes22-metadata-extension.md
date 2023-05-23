| CHIP Number   | < Creator must leave this blank. Editor will assign a number.>                          |
|:--------------|:----------------------------------------------------------------------------------------|
| Title         | Extension of Off-chain metadata format for NFT1                                         |
| Description   | An extension to the offchain metadata standard (CHIP0007) to include schema.org schemas |
| Author        | [Brandt Holmes](https://github.com/BrandtH22) (BrandtH22/ClydeWallace22)                |
| Comments-URI  | < Creator must leave this blank. Editor will assign a URI.>                             |
| Status        | < Creator must leave this blank. Editor will assign a status.>                          |
| Category      | Process                                                                                 |
| Sub-Category  | Tooling or Environment                                                                  |
| Created       | 2023-05-01                                                                              |
| Requires      | CHIP0007                                                                                |
| Replaces      | NA                                                                                      |
| Superseded-By | NA                                                                                      |
| Extends       | CHIP0007                                                                                |

## Abstract
**NOTE: This proposal is currently in draft while awaiting the next release of schema.org which includes a pr that ensures the thumbnail property can be used on all creativeWorks: https://github.com/schemaorg/schemaorg/commit/02b4fb73082b7f4e7f0b02bb1e0f684f4da2def8**


Proposal for schema.org schemas to be used in the data object included in CHIP0007 offchain metadata.

This additional metadata will directly benefit explorers/marketplaces/wallets (display services), creators, and the community as a whole:
 - Display services will have the necessary data to display, relay, and expand their compatibilities.
 - Creators can ensure that they receive acknowledgement for their efforts even if their creation is only a part of a larger asset.
 - The community gets to appreciate and enjoy NFTs in the methods that their creators intended.

There is endless additional data that can be added by utilizing schema.org but a few that will be most useful are:
 - ["encodingFormat"](https://schema.org/encodingFormat) : "Media type typically expressed using a MIME format (see [IANA site](https://www.iana.org/assignments/media-types/media-types.xhtml)) and MDN reference), e.g. application/zip for a SoftwareApplication binary, audio/mpeg for .mp3 etc."
 - ["thumbnail"](https://schema.org/thumbnail) : "Thumbnail image for an image or video."
 - ["encodesCreativeWork"](https://schema.org/encodesCreativeWork) / ["hasPart"](https://schema.org/hasPart) : "The CreativeWork encoded by this media object." / "Indicates an item or CreativeWork that is part of this item, or CreativeWork (in some sense)."
 - ["contributor"](https://schema.org/contributor) : "A secondary contributor to the CreativeWork or Event."
 - ["creator"](https://schema.org/creator) : "The creator/author of this CreativeWork."
 - ["identifier"](https://schema.org/identifier) : "The identifier property represents any kind of identifier for any kind of Thing, such as ISBNs, GTIN codes, UUIDs etc."
 - ["sha256"](https://schema.org/sha256) : "The SHA-2 SHA256 hash of the content of the item."
 - ["associatedMedia"](https://schema.org/associatedMedia) / ["isPartOf"](https://schema.org/isPartOf)  : "A media object that encodes this CreativeWork. This property is a synonym for encoding." / "Indicates an item or CreativeWork that this item, or CreativeWork (in some sense), is part of. "

Since this is the first CHIP extension, it is recommended that the CHIP process be updated to include extensions as a possibility anytime a proposal is fully backwards compatible with a CHIP and the proposal extends the purpose of that CHIP.
It is recommended that the formatting of CHIP####-ext#### become the standard for identifying chip extensions (ex. this would be CHIP-0007_ext-0001)

## Motivation
The current NFT off-chain metadata standard (CHIP0007) supports single component NFTs with little standardization for additional data.
Using the schema.org standards within the data object defined by CHIP0007 enhances the potential utility of all NFTs on the Chia blockchain by enabling multi-component assets, identifying thumbnails, acknowledging creators, establishing references to other NFTs, and much more.

Goals:
  * Enhance creator and user experience by ensuring NFTs have a standard for defining encoding format and thumbnails
  * Enable additional levels of provenance by establishing a standard for additional creator and contributor data
  * Expand potential utility for all Chia NFTs by entreating the use of additional data standards

Hurdles:
  * Display services adoption to ensure the data is available for users to view
  * Minting Tool adoption to ensure creators can easily integrate the additional data
  * Creator adoption to ensure all necessary and possible data is available for integration

## Backwards Compatibility
This CHIP extension is fully backwards compatible and designed to be future-proofed.
The only potential edge cases arise only if an NFT already uses the data object for other types of data.
This is a non-issue as this proposal recommends that the data object is first checked for the "@context" object to determine whether the NFT is following schema.org standards.

## Rationale
Describe the reasons for designing your features in the way you have proposed. Make sure to include:
  * Why did you choose your design?
    * Backwards compatibility - validation of @context object
    * Future-proofing - referential integration of standards maintained and determined by large stakeholders in web2 and web3 (Google, Yahoo, Bing and others are the initial founders of schema.org)
    * Expanding utility - integration of schema.org allows for the Chia ecosystem to organically adopt new NFT utility as supply and demand requires without the need for new standards for each use case
    * Enhancing ease of deployment - integration of media types and thumbnails drastically decreases the difficulty for display services to deploy and manage edge cases (currently most display services must transcode the main NFT assets to properly display them)
  * What design decisions did you make?
    * Extension to Chip0007 rather than defining a new CHIP ensures backwards compatibility with NFTs that do not follow this extension
    * Utilization of a well-defined standards implementation increases future-proofing as the schema.org standards will continue to adapt to current day use cases (ex. our pr that ensures thumbnails can be used for all creativeWork assets - https://github.com/schemaorg/schemaorg/commit/02b4fb73082b7f4e7f0b02bb1e0f684f4da2def8)
    * Integration recommendations allow ecosystem members to not only adopt parts of the standard as needed but also encourages ecosystem members to publicly relay what aspects of schema.org they support
  * What alternative designs did you consider?
    * Creating a full CHIP that deprecates CHIP0007 in place of using schema.org for the entire off-chain metadata. This would work better from a parsing perspective but increases the barrier to adoption as it would not be backwards compatible.
    * Utilizing a different base standard other than schema.org . After extensive research I concluded that while there are many other standards bodies that have released json standards, the most inclusive and diverse standards found were from schema.org.
    * Integration of other formats for the data in place of json. While this is possible it again runs into the backwards compatibility issues which would increase barriers to adoption.
  * How have you achieved community consensus for your design?
    * Over the past few months I have minted multiple NFTs on testnet and mainnet to provide test data for display services to begin reviewing.
    * I have relayed the expected standards and use cases to the community as a whole in Twitter spaces, keybase channels, and online forums.
    * I have worked directly with different display services in the ecosystem to gain input on the proposal.
    * We at NFTr have released a minting tool that incorporates standards from schema.org.
  * What objections were raised during your discussions with the community, and how does your design address them?
    * Backwards compatibility - by submitting the CHIP extension rather than a CHIP that deprecates CHIP0007, this proposal remains backwards compatible with all current NFTs that are CHIP0007 compliant
    * Future compatibility - by implementing standards from a respected governing board, it is anticipated that the standard will continue evolving along with data requirements and use cases. The initial recommendations only implement a very small portion of the standards from schema.org .
    * Ease of integration - since schema.org has been defining industry standards for more than 10 years there are dozens of tools available to aid in validating and parsing the compliant data.
    * Purpose of integration - the Chip0007 standard has been in place for almost a full year with very little complaint or issues; however, CHIP0007 incidentally limits the possible utility of NFTs that want to remain compliant. This proposal enhances that utility while maintaining backwards compatibility.

## Specification
Since the standards behind schema.org are intended to be all-encompassing it can become daunting to attempt integrating it into the ecosystem.
For this reason I have crafted 3 compiling integration recommendations that will not only help integrate the standard but also enable display services to publicly relay which parts of the standard they support.
These recommendations are not inclusive of all potential integrations from schema.org but are intended to resolve the main aspects that will be useful to the Chia ecosystem in the short term.
It is highly recommended that ecosystem members review the full potential of schema.org and work with another to continue adoption beyond that which is included in the integration recommendations below.
NOTE: the only required properties in this proposal are @context, @type, and encodingFormat. This has been determined as the bare requirements needed to optimize data parsing from NFTs and should be required for display services to list the NFT as CHIP-0007_ext-0001 compliant

### Integrating schema.org
Each ecosystem member will have a different role to play in the adoption of this proposal:

**Display Service(s):**
- Relay supported schema properties and values (recommended integrations are listed below, at bare minimum I recommend integrating Media Formats and Thumbnails)

**Minting Solution(s):**
- Update generated metadata to include supported schema properties and values (recommended phases are listed below)
- Coordinate with other minting solutions and display services to standardize variable fields (ex. identifier values)

**Creator(s):**
- Generate thumbnails for your assets (even if they are image assets, or use a minting tool like Mintr which can transcode your media and generate these thumbnails for you)
- Verify the minting tool/display services properly incorporate the data necessary for your project

#### Integration 1: Media Formats and Thumbnails -
Ecosystem members that display NFTs should relay which properties and types they support.
The below examples strictly use subtypes of MediaObject but with the inclusion of schema.org types community members can choose to adopt anything from the schema

| Property         | Type                | Required | Description                                                                                                                                          |
|------------------|---------------------|----------|------------------------------------------------------------------------------------------------------------------------------------------------------|
| `@context`       | string              | **Yes**  | defines schema of the data object                                                                                                                    |
| `@type`          | string              | **Yes**  | property type (see types reference in assets directory for more information)                                                                         |
| `encodingFormat` | string              | **Yes**  | assets' media type using MIME format (refer to [IANA media types](https://www.iana.org/assignments/media-types/media-types.xhtml))                   |
| `name`           | string              | No       | string of properties name                                                                                                                            |
| `thumbnail`      | {object} or [array] | No       | object or array containing assets thumbnail data (examples all use objects but arrays are accepted in the standard to include additional thumbnails) |
| `url`            | string              | No       | string containing assets url                                                                                                                         |
| `sha256`         | integer             | No       | hash of the asset                                                                                                                                    |

 ```
"data": {
    "@context": "https://schema.org/",
    "@type": "VideoObject",
    "encodingFormat": "video/mp4",
    "thumbnail": {
        "@type": "ImageObject",
        "encodingFormat": "image/png",
        "name": "Example #1 Thumbnail",
        "url": "www.fakeurl.com/example1_thumbnail.png",
        "sha256": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
    }
}
 ```

#### Integration 2: Creators and Contributors -
Integration 2 includes everything from integration 1 and adds the ability to add additional information regarding the creators and contributors.
NOTE: This example is not fully inclusive of all that these properties support and all properties that can be objects or arrays are represented as objects in these examples.

| Property      | Type                      | Required | Description                                                                                                                                    |
|---------------|---------------------------|----------|------------------------------------------------------------------------------------------------------------------------------------------------|
| `identifier`  | {object} or [array]       | No       | object or array of identifying data (expected types of identifiers: XCH_Address, DID, NFT_ID, Twitter, Keybase, etc)                           |
| `creator`     | {object} or [array]       | No       | object or array of the assets creator                                                                                                          |
| `contributor` | {object} or [array]       | No       | object or array of the assets contributors (likely those not acknowledged as creators)                                                         |
| `propertyID`  | string                    | No       | string indicating the identifiers key (keys in example include "Twitter" and "DID" but it is also recommended that "XCH_Address" is supported) |
| `value`       | integer or string or bool | No       | identifiers value                                                                                                                              |

 ```
"data": {
    "@context": "https://schema.org/",
    "@type": "VideoObject",
    "encodingFormat": "video/mp4",
    "thumbnail": {
        "@type": "ImageObject",
        "encodingFormat": "image/png",
        "name": "Example #1 Thumbnail",
        "url": "www.fakeurl.com/example1_thumbnail.png",
        "sha256": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
    },
    "creator": {
        "@type": "Organization",
        "name":  "NFTr",
        "url": "https://nftr.pro/",
        "identifier": {
            "@type": "PropertyValue",
            "propertyID": "Twitter",
            "value": "@nftr_pro"
        }
    },
    "contributor": {
        "@type": "Person",
        "name": "ClydeWallace",
        "identifier": {
            "@type": "PropertyValue",
            "propertyID": "DID",
            "value": "did:chia:1cmxxr9snvz8rv084p2fhpa7je4z8sc9dapwtqxdwghcg53my3slsp902fe"
        }
    }
}
 ```

#### Integration 3: Associated Assets -
Integration 3 includes everything from integrations 1 and 2 and adds the ability to add additional information regarding whether the main asset has subcomponents or is itself a subcomponent.
NOTE: This example is not fully inclusive of all that these properties support and all properties that can be objects or arrays are represented as objects in these examples.

| Property                          | Type                | Required | Description                                                                                                                                                                                                                     |
|-----------------------------------|---------------------|----------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `encodesCreativeWork' / 'hasPart` | {object} or [array] | No       | object or array for any components that exist in the main asset (will become very useful for composable and multi-component assets. Think of this as being an asset that is contained by the main asset)                        |
| `associatedMedia' / 'isPartOf`    | {object} or [array] | No       | object or array for any other forms of the same asset (example main asset is an image with its associated media being a 3DModel representation of the same asset. Think of this as being an asset that contains the main asset) |

NOTE - the above two types will have overlapping uses with their corresponding "part" properties (listed in abstract), it is recommended that if one is integrated then the other should be as well. To better clarify use case please refer to schema.org descriptions linked in abstract.

 ```
"data": {
    "@context": "https://schema.org/",
    "@type": "VideoObject",
    "encodingFormat": "video/mp4",
    "thumbnail": {
        "@type": "ImageObject",
        "encodingFormat": "image/png",
        "name": "Example #1 Thumbnail",
        "url": "www.fakeurl.com/example1_thumbnail.png",
        "sha256": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
    },
    "creator": {
        "@type": "Organization",
        "name":  "NFTr",
        "url": "https://nftr.pro/",
        "identifier": {
            "@type": "PropertyValue",
            "propertyID": "Twitter",
            "value": "@nftr_pro"
        }
    },
    "contributor": {
        "@type": "Person",
        "name": "ClydeWallace",
        "identifier": {
            "@type": "PropertyValue",
            "propertyID": "DID",
            "value": "did:chia:1cmxxr9snvz8rv084p2fhpa7je4z8sc9dapwtqxdwghcg53my3slsp902fe"
        }
    },
    "encodesCreativeWork": {
        "@type": "ImageObject",
        "encodingFormat": "image/png",
        "name": "Example #1 Component #1",
        "url": "www.fakeurl.com/example1_component1.png",
        "sha256": "9123dcbb0b42652b0e105956c68d3ca2ff34584f324fa41a29aedd32b883e131"
    },
    "associatedMedia": {     
        "@type": "3DModel",
        "encodingFormat": "model/gltf-binary",
        "name": "Example #1 3D Model",
        "url": "www.fakeurl.com/example1_3dmodel.png",
        "sha256": "e87v0oi3h497vsoij40t98hae4oiu5y08f4hoq34t5j094834qht09jq34g08qu7"
    }
}
 ```

### Verifying Data
1. Identify if schema.org standards are implemented in the NFT by checking if off-chain metadata data object contains "@context": "https://schema.org/"
2. Validate the data object is properly formatted by running the entire data object through the schema.org (or third party) [validator](https://validator.schema.org/) - note most json schema validators already contain schema.org validators
3. Parse the necessary data for your tool/site/application (see recommended integrations above or review schema.org to identify what data is needed)

## Test Cases
  * NA?

## Reference Implementation
  * For the full schema dialect please refer to [schema.org](https://github.com/schemaorg/schemaorg/blob/main/data/schema.ttl)
  * TODO: finish and add json schema example
  * Note - examples expand on the CHIP-0007 example to update the "format" and "data" objects

## Security
Similar to the CHIP0007 collection information, data that is compliant with this proposal should not be used on its own to validate its legitimacy. It is incumbent on NFT tools and services to combine this data with verifiable on-chain data, such as other NFTs referenced, DIDs, smart contracts, etc. The risk of NFT tools not implementing these checks is not introduced by this format but needs to be considered by ecosystem members who adopt this standard. (note - terminology and phrasing adapted from CHIP0007.)

## Additional Assets
  * For the full schema dialect please refer to [schema.org](https://github.com/schemaorg/schemaorg/blob/main/data/schema.ttl)
  * TODO: finish and add json schema examples

## Copyright
Copyright and related rights waived via [CC0](https://creativecommons.org/publicdomain/zero/1.0/).
