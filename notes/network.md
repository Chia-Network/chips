Bitcoin Network Protocol Notes
==============================

These notes intend to outline the bitcoin network's peer protocol, messages, 
and routines for joining and syncing in a "human-readable" manner to serve 
as a guide for the development of Chia's network and peer protocol.

Peer Discovery
--------------

* If a node is starting for the first time, it will perform a DNS query to a set of "DNS seeds" hardcoded into the client, which return A records for IP addresses of known nodes
* Once peers are discovered, they are stored on disk so that subsequent joins do not use the DNS seeds
* Nodes will establish a maximum of 8 outbound connections to discovered peers
* Nodes will accept a user-configurable number of inbound connections
* Peers with certain characteristics are protected from "connection eviction":
  * 8 peers with the lowest ping time
  * 4 peers that most recently sent us transactions
  * 4 peers that most recently sent us blocks
  * Half of the remaining nodes which have been connected the longest

Connecting to the  Network
--------------------------

* Once peers have been discovered via DNS seeds or from local on-disk cache,
node sends `version` message
  * If using on-disk cache, choose from the most recently connected peers
  * Version message contains:
    * Protocol version number
    * Services supported - encoded in bitfield, possible services include:
      * Flag indicating not a full node
    * Timestamp
    * Services perceived to be supported by target node (why? - if wrong no recourse)
    * IP address of target node perceived by sender (why? - if wrong no recourse)
    * Services supported (why? - duplicate, already included in message)
    * IP address of sender
    * Port of sender
    * Nonce (for detecting connection to self, almost certainly a better way to do this)
    * Number of bytes in user agent field
    * User agent field
    * Best block height (why? not used by receiver)
    * Flag indicating whether or not this node wants to receive unsolicted `inv` or `tx` messages
* Receiving node sends it's own `version` message
* If both nodes have compatible version, they each respond to the respective 
`version` messages with a `verack`
  * Verack messages contains no payload

Synchronizing the Blockchain
----------------------------

* Node performs initial block download to catch up to the latest blockchain
* Node selects a peer randomly from it's pool
* Node sends a `getheaders` message, which includes:
  * Protocol version
  * Header hash count (current known block height)
  * All the block header hashes from 0 - height (why? receiving node doesn't need to validate this)
  * Header stop height, the block header hash to stop at (zeroes for max size of 2000)
* Receiving node searches it's best blockchain for the starting header hash
* If node finds header hash, it responds with `headers` message, which contains:
  * Number of headers  included in message
  * All block headers (up to max of 2000) starting at the received start + 1
* Node validates (partially) the headers
* Node downloads more headers (if needed) and blocks for validated headers in parallel
* If node receives a `headers` message with less than 2000 headers:
  * Node selects all of it's outbound peers (8 - 1 (the initial sync node))
  * Node sends `getheaders` to each of them and compares responses to ensure sync node provided the best chain
* For every validated header received, node sends a `getdata` message for every header
  * Can be performed in parallel using all full node peers (as indicated in services flag in `version`)
  * Bitcoin Core only requests 16 blocks at a time from a peer (multiply by the 8 outbound connections) for 128 blocks downloading simultaneously
* The `getdata` message contains the same payload as an `inv` message:
  * The number of entries
  * One or more inventory entries, containing:
    * Type (block or tx)
    * Hash (block header or tx)
* Nodes receiving `getdata` message, respond with a `block` message for every requested block, which contains a serialized block:
  * Block header
  * Number of transactions
  * All raw transactions in block

Broadcasting and Relaying New Blocks
-------------------------------------

* Node notifies it's peers (outbound connections) when it mines a new block
* Multiple methods for signalling a new block
  * Inventory Relay, node sends an `inv` message, containing:
    * Number of entries
    * Inventory entries, each with:
      * Type (block)
      * Hash (block header)
  * Headers Announcement, node sends peers who previously sent a `sendheaders` message (no payload) a `headers` message, containing:
    * Number of headers in message
    * Up to 2000 block headers
  * Header Announcements are followed by a `getdata` message from the recipient
  * Block Push, node sends a `block` message directly to each of it's peers, containing:
    * Block header
    * Number of transactions
    * All raw transactions in block
* Bitcoin Core uses header announcements for nodes who signalled and Inventory relay for others
* There is also a `merkleblock` message which can be used for nodes who previously sent a `filterload` - used for SPV clients (see BIP37)
* Nodes receiving blocks, validate them and and use the Inventory Relay method with their peers
* If a node receives an orphan block, it sends a `getblocks` message to the sender containing:
  * Protocol version
  * Number of headers hashes included in the message
  * Block header hashes (mulitple sent because some may be stale)
  * Last block header hash (set to 0 for requesting an `inv` message)
* Missing block headers used to `getdata` for missing block(s) for orphan 

Broadcasting New Transactions
-----------------------------

* Node notifies all it's outbound peers when it wishes to broadcast a transaction
* Similar to broadcasting a block
* Uses the inventory relay method
  * Node sends an `inv` message to peers, containing
    * Number of entries
    * Inventory entries, each with:
      * Type (tx)
      * Hash (tx)
* If receiving node has not seen this transaction(s), sends `getdata` (same payload format as `inv`)
* Node responds to the `getdata` with `tx` message, containing:
  * Raw transaction format
* Receiving nodes check validity + policy rules for transaction
* If the transaction is valid, receiving node relays an `inv` message to it's own peers
* Process repeats until all nodes have transaction
* Full nodes generally keep track of unconfirmed transactions
* Transaction mined into blocks that become stale are added back to the memory pool
* If those transactions appear in a new block, they are removed from the memory pool

---

Questions
---------

* Why duplicate services information in version message?
  * Compatibility with older clients?
* Why custom binary message encoding?
  * Satoshi grumpy old bastard?
  * Makes protocol updates more difficult
  * Lots of nasty parsing code
  * Bencode? Msgpack? Literally anything?
* Why extraneous parameters in version message?
  * Like echoing perceived services - we don't do anything with that info if it's wrong
  * Why 3 different block broadcasting methods?
    * Standard relay seems fine
    * Header announcements make sense for SPV
    * Unsolicited doesn't seem useful - remnant of old protocol?
* What do we do if we receive a version message that has incorrect perceived address/port information?
  * There is no "correction" message
  * Send another version message?
  * Why does this matter, why would the perceived ip/port be anything other than what we sent?
* Why include best block height in version message?
  * Does not appear to be used to select a sync node
  * Is it thrown away?
* Why do we send all the the block headers from 0 - latest in the getheaders message?
  * Don't we only need to send our tip?
