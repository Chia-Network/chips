CHIP Number   | < Creator must leave this blank. Editor will assign a number.>
:-------------|:----
Title         | Chia DAO1 Standard
Description   | A standard for creating and managing Decentralized Autonomous Organizations on the Chia blockchain
Author        | [Geoff Walmsley](https://github.com/geoffwalmsley), [Dan Perry](https://github.com/danieljperry)
Editor        | < Creator must leave this blank. Editor will be assigned.>
Comments-URI  | < Creator must leave this blank. Editor will assign a URI.>
Status        | < Creator must leave this blank. Editor will assign a status.>
Category      | Standards Track
Sub-Category  | Chialisp
Created       | 2023-12-12
Requires      | [Singleton Standard](https://chialisp.com/singletons "Chia's Singleton Standard (pre-CHIP)"), [Offers](https://chialisp.com/offers "Chia's Offers Standard (pre-CHIP)"), [CAT2](https://chialisp.com/cats "Chia's CAT2 Standard")
Replaces      | None
Superseded-By | None


## Abstract

Decentralized Autonomous Organizations (DAOs) are a new form of organizational structure, where control over decisions is managed by a set of decentralized members. This CHIP is a standard for implementing DAOs on the Chia blockchain. Chia DAOs are funded through their treasuries. Membership is determined by ownership of DAO CATs, which function as ownership shares. Any member can create a proposal, for example to spend some of the DAO's treasury. Members vote on proposals with their ownership shares.

## Motivation

DAOs on other blockchains have shown a lot of potential. However, because DAOs are both decentralized and pseudonymous, bad actors are frequently able to wrest control from other members. In addition, voter apathy has led to major decisions being made, despite only being supported by a small fraction of a DAO's members.

Because DAOs are still new and often misunderstood, we'll start this section by examining the differences between DAOs and traditional organizations. Later, we'll focus on DAOs on Chia versus other blockchains.

### DAOs vs Traditional Organizations

Whereas organizations such as companies and NGOs operate with top-down structures, DAOs are decentralized by design. All members of a DAO have the power to create, discuss, and vote on proposals. Decision-making power is placed in the hands of the whole group, as opposed to a few individuals at the top of the organization. This means that anyone can help to shape a DAO's future.

Voting rights in DAOs are generally determined by governance tokens. All actions require a stake, which results in members being intentional about voting. Members are accountable for their actions because all data is stored on the blockchain. Proposals are typically stored in smart contracts, which create a neutral environment for organizations where rules are agreed to and enforced.

### Problems with DAOs

While DAOs offer some advantages over organizations with top-down structures, they also come with their share of issues:

#### Values Alignment

The decentralized nature of DAOs often leads to a [lack of alignment](https://medium.com/@LKhov/the-problem-with-daos-975ea931019d) on values, incentives, and priorities. On top of that, DAOs often lack clear communication of how rewards correlate to contributions. This leads some members to become disaffected and less dedicated to contributing to the DAO's success.

#### Voting Power

DAOs may not actually be as decentralized as they suggest. A 2022 [report from Chainalysis](https://blog.chainalysis.com/reports/web3-daos-2022/) analyzed ten of the world's largest DAOs. The report concluded that for each of these DAOs, fewer than 1% of all holders controlled 90% of the voting power. This means that most DAOs have a similar concentration of power to top-down organizations, where almost all of the voting power is controlled by small number of individuals.

#### Off-Chain Voting

Discussion of, and voting on, proposals can happen off-chain. Forums such as Discord and Telegram can exclude some members, which leads to an even more centralized form of governance.

#### Legal Obligations

It's unclear what rights DAO holders have and how they would be upheld in a court of law. Since a DAO is not necessarily an incorporated body, its token holders do not have equivalent standing to shareholders or debt holders in a corporation. In addition, many DAOs are pseudonymous, making it difficult for regulators to trace the token issuance back to specific issuers. Perhaps even more concerning, DAOs that issue tokens to non-accredited American investors [may not be compliant](https://www.lexology.com/library/detail.aspx?g=a7df74b6-38b1-4848-bb0b-daec544d8dac) with US securities laws.

### DAOs on Chia vs Other Blockchains

#### Voter Participation

##### Status Quo

[Voter apathy](https://cointelegraph.com/magazine/dao-hyped-voting-decentralization/) is one of the biggest challenges facing DAOs today. If a DAO is actually decentralized, a single member won't have much voting power. Many members are therefore not motivated to read lengthy proposals in order to make informed decisions. In fact, creators are often motivated to make their proposals overly complex, and/or to avoid talking about their proposals in hope of a low voter turnout. Proposals often pass with only a small fraction of the tokens being used for "Yes" votes.

##### How Chia Fixes This

Chia DAOs are able to set to set a minimum threshold of votes being applied, similar to how a quorum functions in many democracies. For example, if a DAO sets its threshold to 75%, then at least three-quarters of the voting tokens must participate in order for the proposal to pass. Even if every vote is cast in favor, the proposal will not pass until the minimum threshold has been met.

In addition, each DAO is able to set their own threshold for the percentage of "Yes" votes required in order for a proposal to pass. For example, instead of requiring a simple majority, a DAO could require a three-quarters majority, or the proposal would fail.

Combined, these two settings will make a powerful weapon to combat voter apathy. For example, if 75% of a DAO's members have to vote, and 75% of those votes have to be in favor of a given proposal, this should motivate creators to keep their proposals succinct and easy to understand. In addition, a high turnout threshold will motivate creators to promote their ideas in order to maximize participation, rather than to keep their proposals secret in the hope that they will pass with a low turnout.

### Workflow

The following is the basic workflow for setting up a Chia DAO:

1. Create a DAO, which exists as a singleton on Chia's blockchain
    * While creating the DAO, set all parameters such as the minimum threshold, as discussed above
    * Configure the DAO's lock-up period, during which DAO CATs are not tradeable after being acquired
2. Crowdfund investments into the DAO's treasury, recommended in exchange for DAO tokens, using Chia Offers

After a DAO has been configured, typical operations might include:

* Treasury management -- adding or withdrawing funds
* Corporate governance -- changing the DAO's rules or minting new tokens

## Backwards Compatibility

Chia DAOs build on top of several existing primitives. However, they do not supersede any of those primitives, nor do they introduce any backwards incompatibilities to the codebase.

## Rationale

### DAO components

#### Treasury

DAOs have a pot of money called a _treasury_. Members can contribute to the treasury by providing XCH in exchange for voting tokens (explained below). The DAO1 standard does not come with any requirements regarding how the treasury may be spent. Instead, each individual DAO should create their own guidelines and rules regarding their treasury.

#### Proposals

Any member can submit a _proposal_ to change something about a DAO. The DAO1 standard will ship with three standard proposal puzzles (categories):
1. Spend some of the treasury's money
2. Change one or more of the DAO's settings
3. Issue new DAO CATs

In addition, proposals with other functionalities are also allowed. The only limitation is that a proposal must be describable in Chialisp/CLVM.

We designed DAOs to support off-chain storage of proposal information, with on-chain storage of the proposal's ID and metadata. We chose this structure in anticipation of proposals being too large to be reasonably stored on-chain. Proposals can be stored using any off-chain storage system, including in the cloud, as well as on Chia DataLayer™.

#### DAO CATs

We designed Chia DAOs to use CATs (Chia Asset Tokens) to represent ownership shares. DAO CATs also allow owners to vote on proposals by using the following framework:

* DAO CATs must support tradeability via Chia Offers
* DAO CATs should have terms upon purchase (can be a link to terms and conditions)
* DAO CATs must have a traceable provenance of their entire history 
* Proposals must accept DAO CATs issued from the same DAO as valid voting tokens
* Votes must be either "Yes" or "No"
* A DAO's treasury should contain rules about what forms a proposal may take
* If a proposal is valid and passes, then upon being closed, its inner puzzle must run, for example to spend part of the treasury
* DAO CATs must always be in one of two modes:
  * Tradeable -- this the standard period, where there is no current proposal
  * Voting -- this is the "lock-up" period, where DAO CATs are not tradeable

#### Voting Mode puzzle

The Voting Mode puzzle ensures that a DAO can:

* Track the proposals each DAO CAT has already voted on
* Prevent DAO CATs from voting more than once on a given proposal
* Enable DAO CATs to vote on new proposals
* Transition DAO CATs from voting mode to tradeable mode after the timelock of the last proposal they voted on has passed

#### Proposals

Proposals have several components:

* A unique identifier, tied to exactly one DAO treasury
* A program to be run if the proposal passes (which may spend money from the treasury)
* An expiration time, when voting closes and the proposal is either accepted or rejected

Proposals have two states:

* **Active** -- the expiration time has yet to be reached; voting is still ongoing
* **Closed** -- either the expiration time has been reached, or the proposal has been closed manually

Participants may vote on multiple proposals while the DAO CAT is locked, but the tokens may not be transferred during this period. Each Voting Token has an amount of XCH representing the number of votes in that Voting Token. An individual DAO CAT may only be used to vote on one active proposal at a time.

#### Treasury

The treasury contains several parameters that govern when a proposal is accepted:

* **Proposal Timelock** -- The minimum amount of time a proposal must wait until it can be closed
* **Soft Close Timelock** -- The amount of time a proposal must wait after receiving its last vote before it can be closed (this allows members to vote without the possibility of being blocked by other spends at the last minute)
* **Pass Percentage** -- the percentages of "yes" votes required for the proposal to pass
* **Attendance Required** -- the number of votes needed for a proposal to reach a quorum (until a quorum is reached, the proposal cannot pass, regardless of the Pass Percentage)

After a proposal has been created, these parameters cannot be modified. However, the proposal can be closed and a new proposal with the same off-chain data and different treasury parameters can been created.

#### Wallets

DAOs come with two types of wallets:

* DAO Wallet - holds the treasury singleton
* CAT Wallet - holds DAO CATs in tradeable mode
* DAO CAT Wallet - holds DAO CATs in voting mode

Wallets can thus filter any proposals that have yet to reach a certain vote threshold. For example, a user could specify that they only want to be shown proposals that have already received at least 100 votes.

### DAO actions

#### Create and fund a DAO 

To create a DAO, the creator must decide on the following parameters:

* Structure and mechanisms
* Type
* Tokenomics

To fund the treasury, the creator:

* Mints DAO CATs (stored in the DAO Wallet)
* Creates Offers to exchange DAO CATs for XCH, which are recommended to be stored in the on-chain treasury (Offers are recommended, but not required)

#### Join a DAO

Anyone who wants to become a member of a DAO must acquire DAO CATs. This is recommended to be done by accepting an Offer of DAO CATs in exchange for XCH, which the creator of the DAO will subsequently send to the treasury.

#### Make a proposal

Any DAO member may create a proposal. From the same command that creates the proposal, the member may cast votes for that proposal using their own DAO CATs.

In addition, each DAO contains a `proposal_minimum` setting. This is an amount of XCH that will be deducted from the creator's wallet upon the proposal's creation, and added to the treasury when the proposal closes. This setting was created as a deterrent from members spamming a DAO with untenable proposals.

#### Exit a DAO

A DAO member can close their position by selling their DAO CATs. This is recommended to be done with Offers.

## Specification

### DAO CATs

A DAO CAT is launched with [dao_cat_launcher.clsp](https://github.com/Chia-Network/chia-blockchain/blob/main/chia/wallet/puzzles/dao_cat_launcher.clsp).

### Lockup puzzle

The [DAO lockup puzzle](https://github.com/Chia-Network/chia-blockchain/blob/main/chia/wallet/puzzles/dao_lockup.clsp) contains a list of every proposal from this DAO that has been voted on.

It has two spend cases:
* **Timelocked** -- Proposal timelocks are standardized and relative (e.g. every proposal must last two weeks)
* **Vote again** -- A member can only vote on a proposal in this state if the proposal isn't included in their list of previous votes. Whenever a member votes on a new proposal, that proposal is appended to the list.

### Treasury puzzle

The [treasury puzzle](https://github.com/Chia-Network/chia-blockchain/blob/main/chia/wallet/puzzles/dao_treasury.clsp) is a singleton. It tracks the money that is currently being pooled, as well as the current total CAT issuance (including the CAT TAIL ID).

Anyone can fund the treasury by using [dao_spend_p2_singleton_v2.clsp](https://github.com/Chia-Network/chia-blockchain/blob/main/chia/wallet/puzzles/dao_spend_p2_singleton_v2.clsp), which the treasury must later absorb. This is the only way a treasury can increase its funds.

The only way for a treasury to decrease its funds is with a successful proposal, after which an announcement is made. The proposal announcements accepted by the treasury are generated internally, as they must receive a pre-configured percentage of "yes" votes from the current number of issued CATs. 

### Proposals

The DAO [proposal puzzle](https://github.com/Chia-Network/chia-blockchain/blob/main/chia/wallet/puzzles/dao_proposal.clsp) is a singleton that tracks how many votes it has received. It has an [inner puzzle](https://github.com/Chia-Network/chia-blockchain/blob/main/chia/wallet/puzzles/dao_proposal_validator.clsp) template that hints the CAT's TAIL, as well as the info needed to recreate itself in the memo. The inner puzzle is curried into the proposal at the time of its creation. 

Anybody can spend a DAO proposal, but they must also spend DAO CATs that have been curried into the proposal. When it is spent, the proposal uses `ASSERT_PUZZLE_ANNOUNCEMENT` to update the status of the votes. In order to track the votes' validity, the puzzle announcement contains the puzzle and the amount. This ensures that they use the special vote puzzle, and are really the amount they say they are. 

The proposal also rebroadcasts itself via hint every time it is spent in case someone was offline. Proposals must also specify the treasury's singleton ID, and can only be completed after they've passed with a corresponding announcement from the treasury. 

When a proposal is successful it runs its curried inner puzzle. This is where payments are generated or new DAO CATs minted.

A few more notes about proposals:

* As far as the proposal puzzle is concerned, the DAO treasury is just a singleton and the rules inside are irrelevant. This allows DAOs to have other custom rules.
* In order for a proposal to receive a vote, it must receive an announcement from a CAT coin in voting mode with the TAIL associated with its own DAO group
* Proposals have a soft close of a certain number blocks (set by the DAO upon its creation) to allow votes to come in.
* Proposals create an external [timer coin](https://github.com/Chia-Network/chia-blockchain/blob/main/chia/wallet/puzzles/dao_proposal_timer.clsp), inside of which information about its parent is curried.
* The timer coin has a timelock relative to the proposal's creation. It asserts a puzzle announcement from the proposal singleton. The reason for the timer coin is to support the relative time of a proposal while remaining immune to the proposal recreating itself (and resetting the timer) every time it is spent.
* Coins that get spent together assert announcements from each other to stop attacks where one of the coins is spent without the other. Some examples of these coins include:
  * ephemeral and lockup
  * proposal and treasury
  * proposal and ephemeral

After a proposal has completed, [dao_finished_state.clsp](https://github.com/Chia-Network/chia-blockchain/blob/main/chia/wallet/puzzles/dao_finished_state.clsp) recreates itself and emits an announcement that it has concluded the operation. Thus, the finished state puzzle acts as an oracle to indicate that the proposal has completed.

### Update proposal

The [update proposal puzzle](https://github.com/Chia-Network/chia-blockchain/blob/main/chia/wallet/puzzles/dao_update_proposal.clsp) is used as a proposal to update a DAO's treasury conditions. Just like regular proposals, it must be voted on.

### RPCs

Wallets that implement this CHIP may optionally include the following RPCs in their implementation.

#### dao_add_funds_to_treasury

Functionality: Add funds to a DAO's treasury wallet

Usage: chia rpc wallet [OPTIONS] dao_add_funds_to_treasury [REQUEST]

Options:

| Short Command | Long Command | Type | Required | Description                                                         |
|:--------------|:-------------|:-----|:---------|:--------------------------------------------------------------------|
| -j            | --json-file  | TEXT | False    | Instead of REQUEST, provide a json file containing the request data |
| -h            | --help       | None | False    | Show a help message and exit                                        |

Request Parameters:

| Parameter          | Required | Description                                                                           |
|:-------------------|:---------|:--------------------------------------------------------------------------------------|
| wallet_id          | True     | The DAO wallet to which to add funds. Must be of type `DAOWallet`                     |
| funding_wallet_id  | True     | The wallet from which the funds will come. Must be of type `STANDARD_WALLET` or `CAT` |
| amount             | True     | The amount of funds to add, in mojos                                                  |
| fee                | False    | An optional blockchain fee, in mojos [Default: 0]                                     |

---

#### dao_adjust_filter_level

Functionality: Change a DAO's filter level

Usage: chia rpc wallet [OPTIONS] dao_adjust_filter_level [REQUEST]

Options:

| Short Command | Long Command | Type | Required | Description                                                         |
|:--------------|:-------------|:-----|:---------|:--------------------------------------------------------------------|
| -j            | --json-file  | TEXT | False    | Instead of REQUEST, provide a json file containing the request data |
| -h            | --help       | None | False    | Show a help message and exit                                        |

Request Parameters:

| Parameter          | Required | Description                                                                                  |
|:-------------------|:---------|:---------------------------------------------------------------------------------------------|
| wallet_id          | True     | The ID of the wallet whose filter level you would like to adjust. Must be of type `DAOWallet` |
| filter_level       | True     | The new filter level                                                                         |

---

#### dao_close_proposal

Functionality: Close a proposal from a DAO

Usage: chia rpc wallet [OPTIONS] dao_close_proposal [REQUEST]

Options:

| Short Command | Long Command | Type | Required | Description                                                         |
|:--------------|:-------------|:-----|:---------|:--------------------------------------------------------------------|
| -j            | --json-file  | TEXT | False    | Instead of REQUEST, provide a json file containing the request data |
| -h            | --help       | None | False    | Show a help message and exit                                        |

Request Parameters:

| Parameter          | Required | Description                                                                           |
|:-------------------|:---------|:--------------------------------------------------------------------------------------|
| wallet_id          | True     | The ID of the wallet that contains the proposal to close. Must be of type `DAOWallet` |
| proposal_id        | True     | The ID of the proposal to close                                                       |
| fee                | False    | An optional blockchain fee, in mojos                                                  |

---

#### dao_create_proposal

Functionality: Create and add a proposal to a DAO

Usage: chia rpc wallet [OPTIONS] dao_create_proposal [REQUEST]

Options:

| Short Command | Long Command | Type | Required | Description                                                         |
|:--------------|:-------------|:-----|:---------|:--------------------------------------------------------------------|
| -j            | --json-file  | TEXT | False    | Instead of REQUEST, provide a json file containing the request data |
| -h            | --help       | None | False    | Show a help message and exit                                        |

Request Parameters:

| Parameter          | Required | Description                                 |
|:-------------------|:---------|:--------------------------------------------|
| wallet_id          | True     | Must be of type `DAOWallet`                 |
| proposal_type      | True     | Must be either `spend`, `update`, or `mint` |
| vote_amount        | False    | The number of votes to add                  |
| fee                | False    | An optional blockchain fee, in mojos        |

Proposal Types:

| Type   | Description                            |
|:-------|:---------------------------------------|
| spend  | A proposal to spend funds from the DAO |
| update | A proposal to change a DAO's rules     |
| mint   | A proposal to mint new DAO CATs        |

If the proposal is of type `spend`, then `additions` may optionally be included in the request parameters.

`additions` is a list with the following elements:

| Element      | Required | Description                                        |
|:-------------|:---------|:---------------------------------------------------|
| asset_id     | False    | The asset_id of the funds to spend [Default: None] |
| puzzle_hash  | True     | The puzzle_hash of the funds to spend              |
| amount       | True     | The amount, in mojos, to spend                     |

If the proposal is of type `spend`, and `additions` is not included, then the following **request parameters** will be used instead:

| Parameter     | Required | Description                                        |
|:--------------|:---------|:---------------------------------------------------|
| asset_id      | False    | The asset_id of the funds to spend [Default: None] |
| inner_address | True     | The inner address of the funds to spend            |
| amount        | True     | The amount, in mojos, to spend                     |

If the proposal is of type `update`, then the **request parameter** `new_dao_rules` is required.

`new_dao_rules` is a list of optional rules to update. If a rule is missing from this list, it will not be updated:

| Rule                 | Required | Description                                                                                        |
|:---------------------|:---------|:---------------------------------------------------------------------------------------------------|
| proposal_timelock    | False    | The new minimum number of blocks before a proposal can close                                       |
| soft_close_length    | False    | The number of blocks a proposal must remain unspent before closing                                 |
| attendance_required  | False    | The minimum number of votes a proposal must receive to be accepted                                 |
| pass_percentage      | False    | The percentage of 'yes' votes in basis points a proposal must receive to be accepted. 100% = 10000 |
| self_destruct_length | False    | The number of blocks required before a proposal can be automatically removed                       |
| oracle_spend_delay   | False    | The number of blocks required between oracle spends of the treasury                                |

If the proposal is of type `mint`, then the following **request parameters** are required:

| Parameter          | Required | Description                                  |
|:-------------------|:---------|:---------------------------------------------|
| amount             | True     | The number of DAO CATs to mint               |
| cat_target_address | True     | The xch address that will receive the tokens |

---

#### dao_exit_lockup

Functionality: Release DAO CATs from voting mode

Usage: chia rpc wallet [OPTIONS] dao_exit_lockup [REQUEST]

Options:

| Short Command | Long Command | Type | Required | Description                                                         |
|:--------------|:-------------|:-----|:---------|:--------------------------------------------------------------------|
| -j            | --json-file  | TEXT | False    | Instead of REQUEST, provide a json file containing the request data |
| -h            | --help       | None | False    | Show a help message and exit                                        |

Request Parameters:

| Parameter          | Required | Description                                                                          |
|:-------------------|:---------|:-------------------------------------------------------------------------------------|
| wallet_id          | True     | The ID of the wallet from which to release the DAO CATs. Must be of type `DAOWallet` |
| coins              | False    | A list of coin IDs to release                                                        |
| fee                | False    | An optional blockchain fee, in mojos                                                 |

---

#### dao_free_coins_from_finished_proposals

Functionality: Release closed proposals from DAO CATs

Usage: chia rpc wallet [OPTIONS] dao_free_coins_from_finished_proposals [REQUEST]

Options:

| Short Command | Long Command | Type | Required | Description                                                         |
|:--------------|:-------------|:-----|:---------|:--------------------------------------------------------------------|
| -j            | --json-file  | TEXT | False    | Instead of REQUEST, provide a json file containing the request data |
| -h            | --help       | None | False    | Show a help message and exit                                        |

Request Parameters:

| Parameter          | Required | Description                                                                          |
|:-------------------|:---------|:-------------------------------------------------------------------------------------|
| wallet_id          | True     | The ID of the wallet from which to release the DAO CATs. Must be of type `DAOWallet` |
| fee                | False    | An optional blockchain fee, in mojos                                                 |

---

#### dao_get_proposals

Functionality: List all existing proposals from the specified DAO

Usage: chia rpc wallet [OPTIONS] dao_get_proposals [REQUEST]

Options:

| Short Command | Long Command | Type | Required | Description                                                         |
|:--------------|:-------------|:-----|:---------|:--------------------------------------------------------------------|
| -j            | --json-file  | TEXT | False    | Instead of REQUEST, provide a json file containing the request data |
| -h            | --help       | None | False    | Show a help message and exit                                        |

Request Parameters:

| Parameter | Required | Description                                                          |
|:----------|:---------|:---------------------------------------------------------------------|
| wallet_id | True     | The wallet from which to list proposals; must be of type `DAOWallet` |

---

#### dao_get_proposal_state

Functionality: Show the status of the specified DAO proposal

Usage: chia rpc wallet [OPTIONS] dao_get_proposal_state [REQUEST]

Options:

| Short Command | Long Command | Type | Required | Description                                                         |
|:--------------|:-------------|:-----|:---------|:--------------------------------------------------------------------|
| -j            | --json-file  | TEXT | False    | Instead of REQUEST, provide a json file containing the request data |
| -h            | --help       | None | False    | Show a help message and exit                                        |

Request Parameters:

| Parameter          | Required | Description                                                                                     |
|:-------------------|:---------|:------------------------------------------------------------------------------------------------|
| wallet_id          | True     | The ID of the DAO wallet from which to look up a proposal's status. Must be of type `DAOWallet` |
| proposal_id        | True     | The ID of the proposal whose status you would like to show                                      |

---

#### dao_get_rules

Functionality: Shows the rules governing the specified DAO wallet

Usage: chia rpc wallet [OPTIONS] dao_get_rules [REQUEST]

Options:

| Short Command | Long Command | Type | Required | Description                                                         |
|:--------------|:-------------|:-----|:---------|:--------------------------------------------------------------------|
| -j            | --json-file  | TEXT | False    | Instead of REQUEST, provide a json file containing the request data |
| -h            | --help       | None | False    | Show a help message and exit                                        |

Request Parameters:

| Parameter          | Required | Description                                                             |
|:-------------------|:---------|:------------------------------------------------------------------------|
| wallet_id          | True     | The DAO wallet from which to get the rules. Must be of type `DAOWallet` |

---

#### dao_get_treasury_balance

Functionality: Show the balance of a DAO's treasury

Usage: chia rpc wallet [OPTIONS] dao_get_treasury_balance [REQUEST]

Options:

| Short Command | Long Command | Type | Required | Description                                                         |
|:--------------|:-------------|:-----|:---------|:--------------------------------------------------------------------|
| -j            | --json-file  | TEXT | False    | Instead of REQUEST, provide a json file containing the request data |
| -h            | --help       | None | False    | Show a help message and exit                                        |

Request Parameters:

| Parameter          | Required | Description                                                                        |
|:-------------------|:---------|:-----------------------------------------------------------------------------------|
| wallet_id          | True     | The DAO whose treasury balance you would like to show. Must be of type `DAOWallet` |

---

#### dao_get_treasury_id

Functionality: Returns the ID of a DAO's treasury

Usage: chia rpc wallet [OPTIONS] dao_get_treasury_id [REQUEST]

Options:

| Short Command | Long Command | Type | Required | Description                                                         |
|:--------------|:-------------|:-----|:---------|:--------------------------------------------------------------------|
| -j            | --json-file  | TEXT | False    | Instead of REQUEST, provide a json file containing the request data |
| -h            | --help       | None | False    | Show a help message and exit                                        |

Request Parameters:

| Parameter          | Required | Description                                                       |
|:-------------------|:---------|:------------------------------------------------------------------|
| wallet_id          | True     | The DAO wallet whose ID you would like to retrieve. Must be of type `DAOWallet` |

---

#### dao_parse_proposal

Functionality: Show the details of the specified proposal

Usage: chia rpc wallet [OPTIONS] dao_parse_proposal [REQUEST]

Options:

| Short Command | Long Command | Type | Required | Description                                                         |
|:--------------|:-------------|:-----|:---------|:--------------------------------------------------------------------|
| -j            | --json-file  | TEXT | False    | Instead of REQUEST, provide a json file containing the request data |
| -h            | --help       | None | False    | Show a help message and exit                                        |

Request Parameters:

| Parameter          | Required | Description                                                          |
|:-------------------|:---------|:---------------------------------------------------------------------|
| wallet_id          | True     | The DAO wallet where the proposal lives. Must be of type `DAOWallet` |
| proposal_id        | True     | The ID of the proposal whose details you would like to show          |

---

#### dao_send_to_lockup

Functionality: Lock DAO CATs for voting

Usage: chia rpc wallet [OPTIONS] dao_send_to_lockup [REQUEST]

Options:

| Short Command | Long Command | Type | Required | Description                                                         |
|:--------------|:-------------|:-----|:---------|:--------------------------------------------------------------------|
| -j            | --json-file  | TEXT | False    | Instead of REQUEST, provide a json file containing the request data |
| -h            | --help       | None | False    | Show a help message and exit                                        |

Request Parameters:

| Parameter          | Required | Description                                                                  |
|:-------------------|:---------|:-----------------------------------------------------------------------------|
| wallet_id          | True     | The ID of the wallet from which to lock DAO CATs. Must be of type `DAOWallet` |
| amount             | True     | The amount of CATs to lock for voting                                        |

---

#### dao_vote_on_proposal

Functionality: Vote on an existing proposal

Usage: chia rpc wallet [OPTIONS] dao_vote_on_proposal [REQUEST]

Options:

| Short Command | Long Command | Type | Required | Description                                                         |
|:--------------|:-------------|:-----|:---------|:--------------------------------------------------------------------|
| -j            | --json-file  | TEXT | False    | Instead of REQUEST, provide a json file containing the request data |
| -h            | --help       | None | False    | Show a help message and exit                                        |

Request Parameters:

| Parameter          | Required | Description                                                                |
|:-------------------|:---------|:---------------------------------------------------------------------------|
| wallet_id          | True     | The ID of the wallet where the proposal lives. Must be of type `DAOWallet` |
| proposal_id        | True     | The ID of the proposal on which you would like to vote                     |
| vote_amount        | False    | The number of DAO CATs to use for this vote [Default: None]                |
| is_yes_vote        | True     | A boolean indicating whether this vote is "yes" (`true`) or "no" (`false`) |
| fee                | False    | An optional blockchain fee, in mojos                                       |

## Test Cases

Test cases for Chia DAOs can be found in the [tests/wallet/dao_wallet](https://github.com/Chia-Network/chia-blockchain/tree/main/tests/wallet/dao_wallet) folder of the `chia-blockchain` GitHub repository.

## Reference Implementation

All DAO puzzles exist within the [chia/wallet/puzzles](https://github.com/Chia-Network/chia-blockchain/tree/main/chia/wallet/puzzles) folder of the `chia-blockchain` GitHub repository.

## Security 

Chia Network, Inc. has conducted an internal review of the code involved with this CHIP.
[todo anything specific to add, for example how are we protecting against attacks such as rug pulls and flash loans?]

## Additional Assets
None

## Copyright
Copyright and related rights waived via [CC0](https://creativecommons.org/publicdomain/zero/1.0/).
