CHIP Number   | .
:-------------|:----
Title         | DID External Identity Linking Specification
Description   | A proposal for adding external identity linking integration into the Chia DID specification
Author        | [Daniel Desiderio](https://github.com/ddesiderio) (Trifolio, Inc.)
Comments-URI  | .
Status        | Draft
Category      | Standards Track
Sub-Category  | Interface
Created       | 2022-05-14
Requires      | None
Replaces      | None
Superseded-By | None

## Abstract
This proposal outlines a specification for allowing Chia Blockchain Decentralized Identifiers (DIDs) to support linking to and verifying links with external identities/accounts, such as social network accounts (e.g. Facebook, etc.).

## Motivation
Chia DIDs provide a way to identify blockchain users on the Chia blockchain but contain no explicit functionality to link DIDs to existing external sources of identity. DID linking to external identities provides verification of ownership of the DID against an external identity, such as being able to verify that a specific DID is owned by a specific Facebook user.

### DID Directional Link Verification
Verifying DID links to external identities can be accomplished in either uni-directional or bi-directional verifiable links.

#### Uni-directional Linking
An example of uni-directional linking would be having a link from the DID on-chain to an external identity. This can be verified in a single direction (verifying the DID on chain is associated with the external id), but not in the reverse direction (verifying the external id is owned by the same owner as the DID). Likewise, uni-directional linking can exist in the inverse case- where an external identity account owner can verify linking to a DID (using some verification mechanism from the external service), but the link may not be verifiable from the DID on chain.

#### Bi-Directional Linking
An example of bi-directional linking would be having a link from the DID on-chain to an external identity which also has a verifiable link back to the DID somewhere off-chain.

## Backwards Compatibility
This proposed specification is expected to be backwards compatible with the future Chia DID specification as this design requires only custom metadata fields be added within the DID.

## Rationale
This design was considered as a simple and future-extensible way for DID external identity linking to be done without any major changes needed at the consensus or protocol level of the Chia blockchain. The driver for this design is to allow community leaders (as authorities) to become owners of individual types of external identity metadata in a way that can be universally understood, unblocking many types of integrations (e.g. social apps, etc.) for web3 apps on top of the Chia blockchain.

### References
Several existing specification proposals for DID linking on other blockchains were considered for this proposal, principally [W3C Decentralized Identifiers (DIDs) v1.0](https://www.w3.org/TR/did-core/), [Keybase Account Proofs](https://book.keybase.io/account#proofs), and [CSIRO Data61 Blockchain and Social Media Account Pair](https://research.csiro.au/blockchainpatterns/general-patterns/self-sovereign-identity-patterns/bound-with-social-media/).

## Specification
External identity linking metadata can be stored on-chain with DIDs to provide linking information. Third party authority entities can be created to become off-chain sources of truth for the status of external identity links to DIDs, such that verification of external identity links can be queried by consumers of the on-chain DID information.

Third party authority information will be stored along with external identity metadata on-chain with the DIDs, such that any consumer of on-chain DID information can verify link status off-chain with known authorities using a defined REST API protocol.

### External Identity Privacy
For privacy purposes, it is suggested that IDs of linked accounts should not be stored in plain-text directly on-chain and instead should be stored as SHA-256 hashes of the original ID values. In this way, verification of ID linking can be verified with an already known ID but cannot be identified solely via inspection or crawling of the blockchain data. Some clients may still opt to allow plain-text IDs to be stored on chain for scenarios like celebrities or artists that purposely want to their links to be fully public for provenance purposes. However, as the chance of a user accidentally exposing personal information as perpetually public on-chain is high, the default behavior should encourage clients to keep IDs as private.

### Authorities
Authorities represent centralized services that implement the DID identity linking verification specification. Authorities are entities that can provide verification information for external links on DIDs off-chain, such as externally verifying that social network accounts are linked to a DID. For example, an authority service may provide functionality to verify that external identities are bi-directionally linked to a DID using some mechanism like crawling public user posts and blockchain information from that DID/external account.

Authority metadata can be added on-chain to a DID, using the below defined format. Authority metadata ultimately provides functionality for consumers of DID on-chain information to check and verify external identity links with trusted 3rd parties that have performed identity linking verification checks.

A DID may use multiple different authorities to verify external identity links. URI links to the authority for verification can be added on-chain to the DID, for clients supporting the below DID verification specification to query.

### Authority Service Specification
***Verification API***

Each authority service shall implement a verification HTTP REST API, which can be called publicly to check on link status, using the following structure:

**Request**
```GET /VERIFY```

_Parameters (Query String)_
* **type [String]**: Type of identity to verify, e.g. “com.facebook”
* **did [Hex String (Prefixed with 0x)]**: Hex string of the DID's launcher coin ID on-chain, e.g. “0x5be5cda6d6a0521a648ab97ed524a6de66b4d8bbc762302db1c53e55b0076b42”
* **eidHash [Hex String (Prefixed with 0x)]**: SHA-256 hash of the external id, in hex, e.g. “0xb769752902358cfc60efa22cc8cbbc256c13979a1d9709b6600b1b02f99f33d2”
* **direction [Short Integer] (Optional)**: Direction of the linking, 0 = single directional link DID=>EID, 1= single directional link EID=>DID, 2 = bidirectional link. If not provided, the first verified directional link will be returned (e.g. bidirectional response will be returned if that link exists in the authority, etc.). Skipping providing this field allows look-up of links to determine if any direction of link verification exists.
* **data [String] (Optional)**: Extra data that may be used to verify the link, e.g. a nonce that must be posted by the linked account

_Example_: ```GET https://sample.authority/dids/verify?type=com.facebook&did=0x5be5cda6d6a0521a648ab97ed524a6de66b4d8bbc762302db1c53e55b0076b42&eidHash=0=0xb769752902358cfc60efa22cc8cbbc256c13979a1d9709b6600b1b02f99f33d2&direction=2&data=0x5fd081ab4f7cad3f504bfe8268ca65b5cb1a02b12fd710647bac7b0bfb0c7ebc```

_Response_:
Upon successful request, the following response payload will be used:
```
        {
            "direction": 2, // direction of link
            "verified": true // whether or not the link is verified
	    "didTip": "0x43c3cad3fab37959f773dac28cd59867bfc9aea507ddfdd30aa2fe64c15fb9f2" // (Optional) the singleton tip of the DID for which verification is guaranteed up until
        }
```


**Response Codes**
```HTTP Codes: 200 (Success), 400 (Input Failure)```

_Note: The successful response return code should always be HTTP 200 except in the case of server errors. This includes the case where DIDs were not found or do not have verified links. The HTTP 200 code allows responses to be easily edge-cacheable to reduce service load handling._

```Response Headers (Optional): Cache-Control```

_Note: Cache-Control response headers should be provided to explicitly provide guidance for how long the link verification result should be trusted by the end user_

### DID Metadata
The following metadata structure can be included with Chia DIDs to support external account linking. _Note that short string names are purposely used in the JSON to reduce cost of storage on-chain._

* **t [String]**: Type of identity to verify, e.g. “com.facebook”
* **d [Short Integer] (Optional)**: Direction of the linking, 0 = single directional link DID=>EID, 1= single directional link EID=>DID, 2 = bidirectional link.
* **e [String] (Optional)**: Extra data that may be used to verify the link, e.g. a nonce that must be posted by the linked account
* **a [String]**: Name of the DID linking verification authority
* **u [URL String]**: URL to the linking verification authority

_Example:_
```
{
    "eid": [
        {
            "a": "Sample Authority", // authority name
            "t": "com.facebook", // external id type
            "d": 0, // direction of linking
            "u": "https://sample.authority/dids", // URL to verification authority
            "e": "0x5fd081ab4f7cad3f504bfe8268ca65b5cb1a02b12fd710647bac7b0bfb0c7ebc" // optional extra data used in verifying the link
        }
    ]
}
```

### DID Wallet RPC APIs
In order to support adding/removing of external identity links, the Chia DID wallet RPC APIs should be updated to support DID mutations that add/remove the above described DID metadata in the DID. This requires RPC APIs to be added to the DID wallet similar to the following:

```
/did_add_replace_external_identity
/did_remove_external_identity
```

Likewise, CLI helper utilities should be updated to include utilities for Chia users to add and remove external identities from their DIDs.

### DID Transfers
Transferring DIDs between different owners means that any existing verified external identity links to a DID may need to be reverified by authorities. This means that authorities will be responsible for keeping track of verification status of DIDs in the event of on-chain updates or transfers. It is suggested that authority services keep track of the DID singleton tip of a DID during verification such that verification status will be invalidated if the DID singleton tip has been spent.

### Decentralized Verification - Future Potential for Nodes
Once a structured format of external identity verification exists for DIDs, similar to the above, it will be possible for nodes to perform verification against authorities in a decentralized manner. This means that Chialisp could be extended to allow programs to execute DID linking verification checks directly against authorities and allow further functionality within Chialisp to be gated on whether an authority has verified identity links for a DID.
#### Potential problems
* Nodes may have trouble to connecting to authorities for various reasons, potentially including: service reliability issues on the authority, network connectivity issues on the node, or other network connectivity or firewall issues
* Nodes may not all see the same response from authorities depending on when verification was checked, and the state of HTTP cache on the network. This could affect potential for achieving consensus when evaluating the Chialisp programs depending on this verification functionality.

#### On-Chain Persistence and Oracles
Other chains such as Ethereum have attempted to solve the above problems by using the ["Oracle pattern"](https://ethereum.org/en/developers/docs/oracles/) of having 3rd party authorities store their lookup/processing results back on-chain. This allows smart contracts to look-up results such as identity verification without needing the ability to make off-chain calls when verifying blocks or attempting to achieve consensus. However, this model relies on the ability for long-running contracts to be executed and still relies on the 3rd party Oracles to be trusted with their own consensus and data management. This proposal aims to deliver authorities as a purposely simplified version of the Oracle pattern, without needing verification smart contracts to necessarily be run on-chain or store data back on-chain.

## Test Cases
### Examples
***Uni-directional Link Verification Example***

1. Chia user Alice owns a DID on Chia Network identified by 2cf24dba5fb0a. 
2. Alice decides to link their Facebook account identified by 123456 to this DID using a uni-directional link with an authority called Sample Authority. 
3. Alice visits the Sample Authority for instructions on how to uni-directionally link their DID with their Facebook account
4. Alice adds this link using a CLI helper that invokes the DID wallet RPC APIs to add a new external identity:
```chia-dids add-identity 2cf24dba5fb0a 123456 single facebook “Sample Authority” https://sample.authority/dids “extra data”```
5. The DID wallet submits this transaction to the blockchain and amends the DID with updated link metadata
6. Alice may submit the link to the authority they registered with
7. Alice’s DID is now confirmed linked to their Facebook account in a single direction
8. Any user may contact the Sample Authority verification API and verify that Alice’s DID 2cf24dba5fb0a has a verified uni-directional external id link to the Facebook account ID SHA-256 hash 8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92 (SHA-256 hash of id 123456)
9. It is up to the Sample Authority to confirm the legitimacy of the uni-directional link between DID and Facebook account in the case of updates to the DID metadata

***Bi-Directional Link Verification Example***

1. Chia user Alice owns a DID on Chia Network identified by 2cf24dba5fb0a.
2. Alice decides to link their Facebook account to this DID using a uni-directional link with an authority called Sample Authority. 
3. Alice visits the Sample Authority for instructions on how to bi-directionally link their DID with their Facebook account
4. Based on the Sample Authority instructions, Alice makes a public post on their Facebook account which includes their DID
5. Alice adds the link on-chain to their DID using a CLI helper with the Sample Authority information
```chia-dids add-identity 2cf24dba5fb0a 123456 double facebook “Sample Authority” https://sample.authority/dids “extra data”```
6. The DID wallet submits this transaction to the blockchain and amends the DID with updated link metadata
7. Any user may contact the Sample Authority verification API and verify that Alice’s DID 2cf24dba5fb0a has a verified bi-directional external id link to the Facebook account ID SHA-256 hash 8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92 (SHA-256 hash of id 123456)
8. It is up to the Sample Authority to confirm the legitimacy of the bi-directional links between DID and Facebook account in the case of updates to the DID metadata or Facebook account linking post is modified.

## Reference Implementation
Pending initial DID specification launch.

## Security
***Verification Timing and Replay Attack Prevention***

Verification results by an authority are inherently ephemeral and are suggested to include expiration information in the form of HTTP Cache-Control response headers. In this way, if requests for verification are replayed or responses are stale a client will have a hint that verification should be re-checked.

Additionally, for extra protection authorities may opt to use extra data like a time-based nonce as part of the verification process. This extra data may be included in the DID linking on-chain and can be used by the authority to perform time-based verification look-ups. For example, to verify that the linking between a DID and an external identity account is recent and hasn’t been tampered with, the authority may require the external account holder to publicly post with both the DID and a time-based nonce which can be later verified by the authority service.

## Additional Assets
N/A

## Copyright
Copyright and related rights waived via [CC0](https://creativecommons.org/publicdomain/zero/1.0/).
