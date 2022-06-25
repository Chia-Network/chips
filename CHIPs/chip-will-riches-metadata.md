CHIP Number   | < Creator must leave this blank. Editor will assign a number.>
:-------------|:----
Title         | Off-chain metadata format for NFT1
Description   | A standard for formatting off-chain metadata for NFT1-compliant NFTs on Chia's blockchain
Author        | [Will Riches](https://github.com/wriches)
Comments-URI  | < Creator must leave this blank. Editor will assign a URI.>
Status        | < Creator must leave this blank. Editor will assign a status.>
Category      | Process
Sub-Category  | Other
Created       | 2022-06-25
Requires      | 0005
Replaces      | None
Superseded-By | None

## Abstract
The Chia NFT1 standard enables an off-chain metadata file to be referenced by Non-Fungible Tokens (NFTs) on chain, along with a hash of the file that ensures its immutability. This CHIP describes a standard format for off-chain metadata files. It is intended to be used with image-based NFTs but could be used with other types of media.

## Motivation
The NFT1 standard does not require compliant NFTs to reference an off-chain metadata file. If an off-chain metadata file **is** used, it is not required to be in any particular file format or conform to a particular data model or schema.

For projects in the Chia ecosystem to be able to create, display and interact with NFTs in a consistent manner, some coordination of metadata file formats is necessary.

## Backwards Compatibility
If this CHIP is accepted and the data format becomes widely used by projects in the Chia NFT ecosystem, it is possible that non-compliant NFTs which have already been minted will not be displayed correctly, or at least may not have their full metadata displayed. However, the same risk is present without this CHIP being put forward, since there would be little standardization.

## Rationale
 * For wide compatibility with developers, JSON format was selected.
 * To avoid low quality data being used unnecessarily, only a minimal set of fields are required to be compliant with the format.
 * A collection object is included, which would result in collection information being duplicated across each NFT in the collection. Although storage is not a large problem since the metadata is off chain, this data structure is not ideal since NFT tools will have to parse collection information from each NFT and potentially deal with mismatches. However, this is seen as an acceptable interim measure until collection information is directly referenced on chain.
 * Collection data is optional, but if it is included it must include both a collection `id` and `name` to enable collections to be grouped more easily.

## Specification
The metadata file must be in JSON format. Typically, the metadata file will have a `.json` extension, but this is not required.

In this section, the schema of the root JSON object is described.

### Properties

| Property       | Type                    | Required | Description                                                          |
|----------------|-------------------------|----------|----------------------------------------------------------------------|
| `format`       | string                  | **Yes**  | CHIP number of the metadata format. Possible values are: `CHIP-XXXX`. |
| `name`         | string                  | **Yes**  | Name of the NFT                                                      |
| `description`  | string                  | **Yes**  | Description of the NFT                                               |
| `attributes`   | [object](#attributes)[] | No       | Attributes of the NFT                                                |
| `collection`   | [object](#collection)   | No       | NFT collection information                                           |
| `minting_tool` | string                  | No       | Name or short tag of the minting tool used to create this NFT        |

### `attributes`
Attributes of the NFT

#### Properties

| Property    | Type              | Required | Description                                                                                |
|-------------|-------------------|----------|--------------------------------------------------------------------------------------------|
| `type`      | integer or string | **Yes**  | Name of the NFT attribute                                                                  |
| `value`     | integer or string | **Yes**  | Value of the NFT attribute                                                                 |
| `max_value` | integer           | No       | Maximum value of the NFT attribute in relation to other NFTs. Only applicable to integers. |
| `min_value` | integer           | No       | Minimum value of the NFT attribute in relation to other NFTs. Only applicable to integers. |

### `collection`
NFT collection information

#### Properties

| Property     | Type                    | Required | Description                      |
|--------------|-------------------------|----------|----------------------------------|
| `id`         | string                  | **Yes**  | ID of the NFT collection         |
| `name`       | string                  | **Yes**  | Name of the NFT collection       |
| `attributes` | [object](#attributes)[] | No       | Attributes of the NFT collection |

#### `attributes`
Attributes of the NFT collection

##### Properties

| Property | Type              | Required | Description                           |
|----------|-------------------|----------|---------------------------------------|
| `type`   | integer or string | **Yes**  | Name of the NFT collection attribute  |
| `value`  | integer or string | **Yes**  | Value of the NFT collection attribute |


## Reference Implementation
The schema is [made available for consumption as a JSON Schema dialect](assets/chip-XXXX/schema.json). The dialect can be used to validate that metadata files are compliant with the schema.

An [example metadata file](assets/chip-XXXX/example.json) has also been included.

## Security
Currently, there are no requirements of the metadata's file format or data structure. From a security perspective, introducing a standard format is only a net gain.

This format includes collection information, which itself does not verify the legitimacy of the collection. It is incumbent on NFT tools and services to combine this collection information with verifiable ownership data, such as the DID of the creator. The risk of NFT tools not implementing these checks is not introduced by this format, but it's possible that the availability of collection information in a standard metadata format could infer that this information is verified. This can be prevented by providing clear information and documentation to developers.

## Additional Assets
 * JSON Schema dialect: [assets/chip-XXXX/schema.json](assets/chip-XXXX/schema.json)
 * Example off-chain metadata file: [assets/chip-XXXX/example.json](assets/chip-XXXX/example.json)

## Copyright
Copyright and related rights waived via [CC0](https://creativecommons.org/publicdomain/zero/1.0/).




