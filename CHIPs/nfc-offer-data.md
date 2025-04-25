CHIP Number   | 0047
:-------------|:----
Title         | NFC Offer Data
Description   | Standard for NFC tag based offer data structure, read operations, and write operations with optional locking
Author        | [Brandt Holmes](https://github.com/BrandtH22)
Editor        | [Dan Perry](https://github.com/danieljperry)
Comments-URI  | [CHIPs repo, PR #158](https://github.com/Chia-Network/chips/pull/158)
Status        | Draft
Category      | Informational
Sub-Category  | Guideline
Created       | 2024-03-19
Requires      | [0042](https://github.com/Chia-Network/chips/pull/143)
Replaces      | NA
Superseded-By | NA

## Abstract
This CHIP establishes a standardized framework for integrating Near Field Communication (NFC) technology with Chia NFT offers, enabling physical-digital asset linkage. It defines the data structures, operations, and security measures required for storing and managing NFT offer data on NFC tags. The standard ensures interoperability across different implementations while maintaining the security and integrity of NFT offer data in physical form.

Core functionality includes tag type support, data structure definitions, read/write operations, security protocols, and lock mechanisms. 

## Motivation
### Need for Standardization
The integration of physical items with digital NFTs requires a standardized approach to:
- Ensure consistent data storage across different implementations
- Maintain compatibility between different NFC readers and writers
- Establish security protocols for physical NFT handling
- Enable interoperability between different applications and display services
- Prevent fragmentation of NFC implementation methods

### Benefits to Chia Ecosystem
1. Physical-Digital Bridge
   - Enable physical representation of digital assets
   - Create new use cases for NFT technology
   - Expand NFT utility beyond digital-only applications

2. Enhanced User Experience
   - Simplified NFT interaction through NFC
   - Immediate access to NFT offers for physical assets
   - Seamless integration with physical collectibles

3. Developer Support
   - Clear implementation guidelines
   - Standardized development approach
   - Reduced development complexity

### Use Cases
1. Physical Collectibles
   - Trading cards with NFT backing
   - Art pieces with digital certificates
   - Luxury products
   - POAPs

2. Authentication (future implementations can adopt on-chip signing mechanisms)
   - Product authenticity verification via NFC stored NFTid 
   - Ownership validation 
   - Transfer history tracking via the blockchain for physical assets

3. Interactive Experiences
   - Physical-digital hybrid games
   - Interactive art installations
   - Event-based NFT activities

### Technical Feasibility
The proposed standard utilizes:
- Widely available NFC tag types
- Standard NDEF message format
- Established NFC protocols
- Existing NFC reader infrastructure
- Current NFC security measures

## Backwards Compatibility
This proposal is fully compatible with all CHIPs and current Chia consensus.

This proposal supports the [offerco.de](https://offerco.de/) 5 character offer short codes for compatibility but recommends using 64 character (32 byte) short codes for collision and grinding protection.

## Rationale
### Design Decisions
- Offer Short Codes: actual offer data is too large for storing on NFC chips and the size can vary greatly based on how the offer is constructed. Using deterministic short codes makes the length offer portion of the data deterministic.
- Protocol Version Identifier: the 5 character version identifier in the NFC Data enables a seamless method of updating the data structure or NFC features while maintaining backward compatibility.
- 64 character (32 byte) codes: this length was chosen to help protect from grinding the codes and from collisions.
- Security for offer short code API: The CNI implementation only permits CNI to upload new offers, enforces rate limits on requesting offers, and requires teh offer short code to retrieve the offer.
- Authentication is out of scope for this CHIP - due to low availability of NFCs that support signing mechanisms supported by the Chia blockchain, authentication from the key signing of the chip is not supported in this CHIP.

## Specification
Note: to use this solution for single sided offers it is highly recommended that only wallets which have adopted [CHIP-42](https://github.com/Chia-Network/chips/pull/143) (Protected Single Sided Offers) should be used to accept the offers.

There are two example codebases associated with this solution:
- The [NFC Offer repo](https://github.com/Chia-Network/nfc-offer) overviews how the data can be written to and read from NFCs (future adaptations can also include signing from the NFC) 
- The [Offer Codes repo](https://github.com/Chia-Network/offer-codes) demonstrates the requirements for running an offer short code API.

### Offer Short Codes
The short codes are deterministic sha256 32 byte hashes based on the offer files themselves using this code to generate them:
`let code = Bytes32::new(spend_bundle.hash());`

These are then stored in a mysql database which is accessible via an API using the offer short code. An example of retrieving the offer from the short code:
```javascript
const {
  data: { offer },
} = await axios.post(`offercodes.chia.net/download_offer`, {
  code,
});

console.log("Offer is", offer);
```

### NFC Offer Data
This specification defines the standard for storing Chia NFT offer data on NFC tags. It provides the data structure, supported tag types, and operations for reading and writing offer data.

#### Payload Format
The data is stored as a continuous string with fixed-length fields:
```
[Version (5 chars)][NFT ID (64 chars)][Offer String (variable)]

Example:
"DT001nft1vyet0xdu0cady88hd7mm0xaauql8547hjlk8gt2ujcn5zvm8ly7s7krg4j3w4md3w4md12..."
```

#### NDEF Message Structure
```
[NDEF Message TLV (0x03)] [Length] [NDEF Record] [Terminator TLV (0xFE)]

NDEF Record:
- Header: 0xD1 (MB=1, ME=1, CF=0, SR=1, IL=0, TNF=0x01)
- Type Length: 0x01 (for "T")
- Payload Length: Length of total payload
- Type: "T" (Text Record)
- Payload: 
  - Language Code: 0x02 "en" (3 bytes)
  - Data String: Continuous string as shown above
```

#### Memory Layout
```
Page 0-2: Manufacturer data & static lock bits
Page 3: Capability Container (CC)
Page 4+: NDEF message data
Last Pages: Dynamic lock bits (tag-specific)
```

#### APDU Commands
```python
APDU_COMMANDS = {
    'GET_UID': [0xFF, 0xCA, 0x00, 0x00, 0x00],
    'READ_PAGE': [0xFF, 0xB0, 0x00],  # + [page_number, 0x04]
    'READ_PAGE_ALT': [0xFF, 0x30, 0x00],
    'WRITE_PAGE': [0xFF, 0xD6, 0x00],  # + [page_number, 0x04, data]
    'WRITE_PAGE_ALT': [0xFF, 0xA2, 0x00]
}
```

### Tag Requirements

#### Supported Tag Types and Configurations
```python
NDEF_CONFIG = {
    'NTAG213': {
        'data_start': 0x04,
        'data_area': (0x04, 0x27),
        'cc_page': 0x03,
        'cc_bytes': bytes([0xE1, 0x10, 0x12, 0x00]),
        'max_size': 144,
        'lock_page': 0x28,
        'lock_bytes': bytes([0xFF, 0xFF, 0x00, 0x00])
    },
    'NTAG215': {
        'data_start': 0x04,
        'data_area': (0x04, 0x81),
        'cc_page': 0x03,
        'cc_bytes': bytes([0xE1, 0x10, 0x3E, 0x00]),
        'max_size': 504,
        'lock_page': 0x82,
        'lock_bytes': bytes([0xFF, 0xFF, 0x00, 0x00])
    },
    'NTAG216': {
        'data_start': 0x04,
        'data_area': (0x04, 0xE1),
        'cc_page': 0x03,
        'cc_bytes': bytes([0xE1, 0x10, 0x6D, 0x00]),
        'max_size': 888,
        'lock_page': 0xE2,
        'lock_bytes': bytes([0xFF, 0xFF, 0xFF, 0x00])
    },
    'ULTRALIGHT': {
        'data_start': 0x04,
        'data_area': (0x04, 0x0F),
        'cc_page': 0x03,
        'cc_bytes': bytes([0xE1, 0x10, 0x06, 0x00]),
        'max_size': 48,
        'lock_page': 0x02,
        'lock_bytes': bytes([0xFF, 0xFF, 0x00, 0x00])
    }
}
```
Note: the ultralight tags are in place for backwards compatibility but they do not work with most iOS devices nor will they work with the 32 byte offer codes and smaller offer codes are needed.
For these reasons it is not recommended to use ultralight tags.

### Operations

#### Write Process
1. Tag Detection
   - Read tag UID
   - Identify tag type
   - Verify sufficient memory

2. Data Formatting
   - Create continuous data string
   - Add language code
   - Format as NDEF Text Record
   - Add TLV wrapper

3. Writing
   - Write page by page (4 bytes per page)
   - Verify written data
   - Optional: Lock tag

#### Read Process
1. Tag Detection
   - Read tag UID
   - Identify tag type

2. Data Reading
   - Read NDEF message
   - Verify message format
   - Extract payload

3. Data Parsing
   - Skip headers and language code
   - Extract version (5 chars)
   - Extract NFT ID (64 chars)
   - Extract offer string (remaining)

#### Lock Operation
- Optional operation after writing
- Sets both static and dynamic lock bits
- Makes tag read-only
- Operation is permanent and cannot be reversed
- Lock bits location varies by tag type (see NDEF_CONFIG)

### Standards Compliance

#### NFC Forum Standards
- NFC Forum Type 2 Tag Operation compliant
- Standard NDEF Text Record Type (RTD_TEXT)
- ISO/IEC 14443A compatible

#### NDEF Implementation
- Uses standard TLV structure
- Well Known Type record format
- Standard language encoding
- Proper NDEF message encapsulation

### Integration

#### Example Usage
```python
def handle_nfc_operation(args):
    reader = NFCReader()
    if not reader.connect():
        return

    try:
        if args.command == 'read':
            if args.uid:
                reader.read_tag_uid()
            else:
                while True:
                    user_input = input("Press Enter to read a tag (or 'q' to quit)...")
                    if user_input.lower() == 'q':
                        break
                    
                    logging.info("Waiting for tag... Please touch an NFC tag to the reader.")
                    tag_type = reader.get_tag_type()
                    if tag_type:
                        data = reader.read_data()
                        if data:
                            print("\nTag Data:")
                            print(json.dumps(data, indent=2))

        elif args.command == 'write':
            if args.input_file:
                with open(args.input_file, 'r') as f:
                    nft_data = json.load(f)
                success = reader.write_data(nft_data)

    except Exception as e:
        logging.error(f"Operation failed: {e}")
    finally:
        reader.close()
```

### Dependencies

#### Required Packages
- pyscard: Smart card interface
- logging: Error and debug logging
- json: Data serialization
- argparse: Command line parsing
- csv: Scan operation output

#### System Requirements
- NFC Reader supporting ISO/IEC 14443A
- Compatible NFC tags (NTAG21x or MIFARE Ultralight)
- Python 3.6+

## Test Cases
NA - this is an informational CHIP and implementations may vary.

## Reference Implementation
Reference Implementations can be found in the repos listed below:
- [NFC Offer repo](https://github.com/Chia-Network/nfc-offer)
- [Offer Codes repo](https://github.com/Chia-Network/offer-codes)

## Security

### Data Protection
- Optional tag locking after write
- No encryption (data is public)
- No physical tampering detection
- Relies on Chia offer security model
- CNI Short code implementation is read only
- 32 byte codes are used for enhanced entropy to protect from collisions and grinding

### Considerations
- Data is publicly readable
- Locked tags cannot be modified
- Physical damage can corrupt data

## References
- [Type 2 Tag Operation Specification - NFC Forum](https://nfc-forum.org/build/specifications/type-2-tag-specification/)
- [NDEF Specification - NFC Forum](https://nfc-forum.org/build/specifications/data-exchange-format-ndef-technical-specification/)
- [ISO/IEC 14443A](https://www.iso.org/) 

## Additional Assets
None

## Copyright
Copyright and related rights waived via [CC0](https://creativecommons.org/publicdomain/zero/1.0/).




