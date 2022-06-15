CHIP Number   | < Creator must leave this blank. Editor will assign a number.>
:-------------|:----
Title         | Auctions
Description   | A method for holding decentralized, zero-risk auctions for digital assets on the Chia blockchain
Author        | [Josh Painter](https://github.com/joshpainter) ([@endertown](https://twitter.com/endertown) on Keybase and Twitter)
Comments-URI  | < Creator must leave this blank. Editor will assign a URI.>
Status        | < Creator must leave this blank. Editor will assign a status.>
Category      | Informational
Sub-Category  | Guideline
Created       | 2022-05-22
Requires      | none
Replaces      | none
Superseded-By | none

## Abstract
Auction is one of the oldest methods of negotiating the exchange of goods and commodities between buyers and sellers. As early as 500 BC, Babylonians held annual auctions for attractive maidens who had reached marrying age. Ancient Greeks and Romans would auction off their spoils of battle to gain treasure for the war effort. Romans also used auctions to liquidate assets and pay off debt. Surprisingly, the entire Roman Empire was put up for auction on March 28th, 193 AD by the Praetorian Guard and purchased by Didius Julianus! Although it couldn't be built in a day, apparently Rome could at least be *purchased* within that timeframe. More recently, the Internet has enabled a massive new market for online auctions. Starting with eBay in 1995 and growing every year, online auctions continue to be an important method for trading assets to this day.

However, even with all this history, auctions still have unsolved risks for the buyer, the seller, and especially the auction house holding the auction itself. The Chia blockchain, along with the coinset model and Chialisp, brings about new and unique opportunities to improve on this millenia-old practice and eliminate risk for all parties. This document will explore the counterparty risks and issues with modern-day auction. It will then propose high-level solutions to these problems using puzzles created in Chialisp and executed directly on the Chia blockchain. Finally, it will recommend detailed specifications that can be used to build these Chialisp puzzles to enable these solutions.

## Motivation
Modern-day auctions continue to be a valuable tool for finding market value of new assets, quickly liquidating old assets, and everything in between. However, multiple risks still exist for the bidders, the sellers, and especially the auction house responsible for promoting and organizing the auction itself.

  * Seller risks
    * High bidder may not complete transaction after auction ends. This forces seller to find another buyer who will usually not be willing to pay the same price. The best case is probably offering the auctioned item to the second-highest bidder at their second highest bid, but usually the second-highest bidder will recognize their negotiating power and drive the price even lower. Current solutions to this problem involve legal contracts and bidder deposits, both of which can add significant friction to the auction event itself. 
    * High bidders might hold back bids until the last minute, hoping to “snipe” other users. Ideally users would be incentivized to make lots of small bids over the entire auction event instead of a few large bids in a short time near the end. This promotes more engagement with the auction itself and might result in a higher price for the seller.
    * The auction house might not properly market the auction resulting in low bidder attendance and a lower winning bid. Ideally the auction would at least be publicly discoverable via simple searching tools. The auction house might add additional marketing value above this baseline discoverability such as featured auctions, push notifications to interested buyers, etc.
  * Bidder risks
    * Seller may not complete transaction after auction ends. Perhaps the winning bid was lower than they expected and they now wish to rescind their decision to auction the item.  Again, these risks can be mitigated with legal contracts binding the seller to the auction sale, but again these add friction to the process and still do not deter sellers if the cost of litigation is less than the perceived loss of value.
    * High-bidders might be bidding against "dummy bids." In this context, a dummy bid is one that the seller (or someone working on behalf of the seller) creates in order to bid against the current high bidder to drive the price up.
    * High-bidders might be “sniped.” In this context, being sniped means that another bidder bids at the last possible time before an auction ends and the current high bidder does not have enough time to respond.    
  * Auction House risks
    * The auction house itself must worry about all risks above simultaneously to protect their reputation while also allocating and spending funds up front to market and operate the auction on behalf of the seller. If the buyer or seller ties up the finalization of the transaction, the auction house must usually wait for payment until the terms are finally settled. In some cases, and especially concerning items of very high value such as large properties or blue-chip art, the winning of the auction itself can sometimes simply be considered the opening offer of a long and strenuous transfer-of-ownership between two legal teams.

By presenting solutions for all of these risks using the Chia blockchain and Chialisp, it is hoped that Chia's overall ecosystem will benefit from the inflow of digital assets as well as the transactions and fees used to fund bids. Auctions are also a natural sales method for NFTs and CATs and a great way to find the market value of these new digital assets. Furthermore, it is hoped that Auctions will be a natural fit for carbon credit asset trading, enabling advancement of Chia's commitment to improve and support the Climate Warehouse for World Bank.

Although there are many auction variations, this proposal will focus on the use-cases of the two most popular methods of auction in use today: English and Dutch. However, the specification will be designed in such a way that almost any kind of auction can be defined, limited only by the power of Chialisp and the auction author's imagination.

* English Auction

  This is by far the most popular auction type in use today and is also known as an "ascending price auction." It is well-suited for unique or single assets, including NFTs. It begins with the minimum or opening bid, and each successive bid must be greater than or equal to the current bid increment. The auction ends when there are no further high bids. At that point, the high-bidder is declared the winner of the item for sale.
    
* Dutch Auction

  This type of auction is also known as a "descending price auction" and it is well-suited for commmodities or lots of the same asset, including CATs. It begins with a high asking price and is successively lowered by the bid increment until a bidder is willing to pay it. The bidder may request any quantity of lots of the item at that bid price. If there are remaining lots of the asset left after the high bidder declares their lot quantity selection, the auction continues until another bidder is willing to pay the descending bid price. That second-highest bidder is also allowed to choose the quantity of lots that they desire, and the auction will continue on until the quantity of lots of the asset is exhausted or the minimum bid amount is met and no more bids are received.

## Conceptual Design
An auction on the Chia blockchain will be represented by a singleton that wraps an asset, represented by an inner puzzle. A single-lot auction wraps an asset that represents a single unique item, such as an NFT. A multi-lot auction wraps an asset that represents multiple amounts of the same item, such as a CAT.

The auction singleton puzzle will include several parameters that allow customization of the auction event itself. Bidders must follow all rules and parameters set by the auctioneer.

The seller may not be the same entity as the auctioneer. This differentiation allows commissions and/or buyer's premiums to be paid to the auction house to cover promotion, marketing and any other expenses incurred for the real-world execution of the auction. Of course, the seller may also hold the auction on their own behalf.

A normal real-world auction does not settle until after it has closed, which introduces all of the counterparty risks mentioned above. But by using a unique and novel auction protocol, we can completely "settle" each high bid as it happens in real-time. For *every successful high bid* the asset immediately trades ownership and all bid payments, commissions and fees are sent and confirmed at the same time. This means that an auction running on Chia blockchain does not have *any* of the counter-party risks mentioned above. Because the high bid itself actually contains the payment transactions, it is not necessary to trust that either party will follow through with the agreed-upon sale after the auction has concluded. When a high-bidder successfully makes a high bid, the seller has been paid and the high-bidder now officially owns the asset. The only reason they will not hold the asset at the end of the auction is if another high-bidder successfully "steals" it from them by bidding higher. Of course, the original high-bidder then can "steal" it back, and so on. But if no other bidding action happens after a successful high bid, the auction will close and the high-bidder can then claim the wrapped asset.

This concept is easy to understand for the first successful high bid. The high bidder actually sends their high bid amount to the seller as a normal transaction. The high bidder may also be required to send an additional buyer's premium fee and/or commission fees to the auctioneer, depending on the settings chosen when the auction singleton is minted.

However, the second and subsequent successful high bids work quite differently. The new high bidder will first reimburse the current high bidder for their current high bid and commission fees via a normal transaction. The current high bidder is now "whole" and loses the ownership of the asset contained within the auction singleton. Ownership is now transferred to the new high bidder. The difference between the new high bid and the current high bid is sent to the seller, along with any required buyer's premium fees and/or commission fees. The seller has now received the initial high bid amount (from the first high bidder) plus the difference between the initial high bid and the new high bidn (from the second high bidder). This process continues until the auction has concluded.

It should be understood that all of this happens "behind the scenes" from the user's perspective. The user's experience will be very familiar to all who have used any existing auction software. All of this complexity should be accessible via transaction logs of course, but most users will just make high bids on auctions as they always have. Perhaps the only new user education that needs to happen is to make sure that users understand the true immediacy and finality of high bids. Auction houses will be particularly excited with this technology as they will no longer be caught in the middle of buyer and seller disagreements that can arise during the time that the auction has concluded but has not yet settled. All auctions are now actually settled *before* they are concluded!

## Specification
* Singleton launcher puzzle Parameters
  * ASSET_PUZZLE - can be any inner-puzzle coin such as NFTs, CATs, etc.
  * ORIGINAL_OWNER_PH - the original owner's puzzle hash to which the high bid payments should be sent.
  * STARTING_BID_AMOUNT - the starting minimum bid amount, in mojos.
  * CALC_MIN_LOT_AMOUNT - the Lisp program that calculates the minimum amount per lot. For a single-item auction, this value will be the same as TOTAL_ASSET_AMOUNT.
  * TOTAL_ASSET_AMOUNT - The total amount of the asset, in mojos.
  * CALC_MIN_BID_AMOUNT - the Lisp program that calculates the minimum bid amount required to make a new high bid. This allows smaller increments for lower amounts, larger increments for larger amounts, or any other custom logic. The program should output a minimum bid amount given the current_high_bid.
  * CALC_HAMMER_TIME - the Lisp program that returns either the datetime or the blockheight after which the auction is considered closed. The could be either a static value (pre-committed datetime or blockheight) or a dynamic value (automatically extend until no more bids received).
  * CALC_BUYERS_PREMIUM - the Lisp program that returns conditions for the Buyer's Premium, if applicable.
  * CALC_COMMISSION - the Lisp program that returns conditions for the Commission, if applicable.
  * PAY_HIGH_BID - the Lisp program that returns conditions for the High Bid payment.
    * If this is the first bid
      * Send new_high_bid amount to ORIGINAL_OWNER_PH. At this point, the original owner has been paid and the new owner officially owns the asset with the caveat that the asset may be "stolen" by another high bidder before the auction has ended.
    * Else
      * Send current_high_bid amount to current_owner_ph. This repays the last high bidder for their bid. The last high bidder no longer officially owns this asset, but they have been reimbursed for their previous bid by the new high bidder. The new high bidder now officially owns the asset.
      * Send difference between new_high_bid and current_high_bid to ORIGINAL_OWNER_PH. This adds to the original owner's other high bid payments so total payments received equals current high bid at all times.
    * Include conditions returned from CALC_BUYERS_PREMIUM, if any. This guarantees that the Buyer's Premium is paid for every bid.
    * Include conditions returned from CALC_COMMISSION, if any. This guarantees that the Commission is paid for every bid.
  * CLAIM_ASSET - the Lisp program that returns conditions needed to claim the asset after the auction has ended. This program is also responsible for melting this Auction singleton once the wrapped assets are claimed.

* Singleton puzzle Parameters
  * current_high_bid - the amount of the current high bid, in mojos.
  * current_owner_ph - the puzzlehash to be used when assigning this asset to the Auction Winner when the auction has completed.
  * new_high_bid - the amount of this newly submitted high bid, in mojos.
  * new_owner_ph - the puzzle hash of this new high bidder.

## Test Cases
TESTING...

## Reference Implementation
IMPLEMENTING...

## Security
SECURING...

## Terminology
This section describes common auction terminology for which the reader might not be familiar. Even more detailed information, including terminology, history and descriptions of different auction types can be found at https://en.wikipedia.org/wiki/Auction. The terms below are a subset of those found at the preceding link.

  * Auction house – the company operating the auction (i.e., establishing the date and time of the auction, the auction rules, determining which items are to be included in the auction, registering bidders, taking payments, and delivering the goods to the winning bidders).
  * Buyer's premium – a fee paid by the buyer to the auction house; it is typically calculated as a percentage of the winning bid and added to it. Depending on the jurisdiction the buyer's premium, in addition to the sales price, may be subject to VAT or sales tax.
  * Commission – a fee paid by a consignor/seller to the auction house; it is typically calculated as a percentage of the winning bid and deducted from the gross proceeds due to the consignor/seller.
  * Consignee and consignor – as pertaining to auctions, the consignor (also called the seller, and in some contexts the vendor) is the person owning the item to be auctioned or the owner's representative, while the consignee is the auction house. The consignor maintains title until such time that an item is purchased by a bidder and the bidder pays the auction house.
  * Dummy bid (a/k/a "ghost bid") – a false bid, made by someone in collusion with the seller or auctioneer, designed to create a sense of increased interest in the item (and, thus, increased bids).
  * Dynamic closing – a mechanism used to prevent auction sniping, by which the closing time is extended for a small period to allow other bidders to increase their bids.
  * Earnest money deposit (a/k/a "caution money deposit" or "registration deposit") – a payment that must be made by prospective bidders ahead of time in order to participate in an auction.
  * Escrow – an arrangement in which the winning bidder pays the amount of his/her bid to a third party, who in turn releases the funds to the seller under agreed-upon terms.
  * Hammer price – the nominal price at which a lot is sold; the winner is responsible for paying any additional fees and taxes on top of this amount
  * Increment – a minimum amount by which a new bid must exceed the previous bid. An auctioneer may decrease the increment when it appears that bidding on an item may stop, so as to get a higher hammer price.
  * Minimum bid – The smallest opening bid that will be accepted
  * Opening bid – the first bid placed on a particular lot. The opening bid must be at least the minimum bid, but may be higher (e.g., a bidder may shout out a considerably larger bid than minimum, to discourage other bidders from bidding).
  * Protecting a market – when a dealer places a bid on behalf of an artist he or she represents or otherwise has a financial interest in ensuring a high price. Artists represented by major galleries typically expect this kind of protection from their dealers.
  * Reserve price – A minimum acceptable price established by the seller prior to the auction, which may or may not be disclosed to the bidders.
  * Sealed bid – a submitted bid whose value is unknown to competitors.
  * Sniping – the act of placing a bid just before the end of a timed auction, thus giving other bidders no time to enter new bids.
  * Soft Close – When someone places a bid in the last set amount of minutes and the auction automatically extends a set period of time. Soft close prevents sniping.  

## Additional Assets
NONE YET...

## Copyright
Copyright and related rights waived via [CC0](https://creativecommons.org/publicdomain/zero/1.0/).