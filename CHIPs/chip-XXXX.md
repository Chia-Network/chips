| CHIP Number  |                                                                                 |
| :----------- | :------------------------------------------------------------------------------ |
| Title        | Split Royalties for NFT1                                                        |
| Description  | A standard for splitting royalties for NFT1-compliant NFTs on Chia's blockchain |
| Author       | [Andreas Greimel](https://github.com/greimela)                                  |
| Comments-URI | < Creator must leave this blank. Editor will assign a URI.>                     |
| Status       | < Creator must leave this blank. Editor will assign a status.>                  |
| Category     | Process                                                                         |
| Sub-Category | Procedural                                                                      |
| Created      | 2022-09-03                                                                      |
| Dependencies | None                                                                            |

<!-- This is the template for all CHIPs to use. Please fill it out according to the guidelines laid out in [chip001](/CHIPs/chip-0001.md). All media associated with this CHIP should be added to the `assets/chip-<CHIP>` folder, which you may create after you receive your CHIP number.

Copy the template file to the `chips` folder, rename it to `chip-<your name>-<your proposal>`, fill it out, and submit it as a pull request. -->

## Abstract

This proposal aims to define a standard for splitting royalties for NFT1-compliant NFTs, using a standard Chialisp puzzle to prevent marketplace lock-in.

## Motivation

One of the great features of NFT1 is the built-in payment of royalties.
It is very flexible, since any address and therefore any puzzle can be used as royalty recipient.
Many people in the community have requested the option to split the royalty payment between different recipients.
Maybe a share should be sent to a Charity, or multiple artists want to share the royalties automatically.

<!-- Describe why you are creating this proposal. Make sure to include:

- What problem are you trying to solve?
- How would this proposal benefit Chia's overall ecosystem?
- What are the use cases for this proposal?
- How technically feasible will this be to implement?

This section is especially critical if you are proposing changes to Chia's core protocols. It should clearly answer all of the above, as well as explain exactly why the current protocol is inadequate. -->

## Backwards Compatibility

This proposal does not have any backwards incompatibilities.

## Rationale

It is a simple Chialisp puzzle without many moving parts.
The payment can not be altered by third parties.
Anyone is able to trigger the royalty payout for any NFT -> marketplace independence

## Specification

This specification has two parts.
The Chialisp puzzle that splits itself into one or multiple smaller coins, according to a predefined payout scheme.
And an addition to the NFT metadata, to allow obervers to figure out the royalty puzzle and optionally spend it.

An example payout scheme could look like this

| Recipient Address                                              | Share in % |
|:---------------------------------------------------------------|:-----------|
| xch18qt2ju2sj3k8w3290az6flkkc95fqcmcg7edl90ns0jrjav8xttsyuvkgj | 80         |
| xch1p9e3l3ttl7qrrhy6zmmqmjm0v33fvrxhd494yv7at0ppd97hljnscmfrmx | 20         |

### Royalty Split Chialisp Puzzle

The proposed Chialisp puzzle looks like this.

```
(mod (ROYALTY_LIST my_amount)

  (defconstant TEN_THOUSAND 10000)

  (include condition_codes.clvm)
  (include curry-and-treehash.clinc)

  (defun-inline calculate_percentage (amount percentage)
      (f (divmod (* amount percentage) TEN_THOUSAND))
  )

  (defun-inline get_puzhash (royalty_list_item)
      (f royalty_list_item)
  )

  (defun-inline get_amount (royalty_list_item my_amount)
      (calculate_percentage my_amount (f (r royalty_list_item)))
  )

   ; Loop through the royalty list and create coins
  (defun split_amount_and_create_coins (ROYALTY_LIST my_amount)
      (if ROYALTY_LIST
          (c
              (list
                CREATE_COIN
                (get_puzhash (f ROYALTY_LIST))
                (get_amount (f ROYALTY_LIST) my_amount)
              )
              (split_amount_and_create_coins (r ROYALTY_LIST) my_amount)
          )
          ()
      )
  )

  ; main
  (c
    (list ASSERT_MY_AMOUNT my_amount)
    (split_amount_and_create_coins ROYALTY_LIST my_amount)
  )
)
```

The royalty payout scheme `ROYALTY_LIST` is curried into this puzzle, to make it immutable. The only solution parameter needed on spend is the actual amount of the coin.

On spend, the puzzle steps through the entries of the `ROYALTY_LIST` and creates a new coin per entry. The amount of the new coins will be a share of the total amount, determined by the share defined in the `ROYALTY_LIST`. The payout share is specified in the same format as NFT royalties, which is `int(percentage * 100)`.

### NFT Metadata

The second part is an addition to the NFT metadata.
In order to allow any observer to recreate the split royalty puzzle and trigger the split, the observer has to know the payout scheme.

The suggested format is a list of 2-tuples, each containing an address and the percentage of the royalties it should receive, multiplied by 100.

```typescript
{
  // [...existing metadata]
  "rs": Array<[string, number]>
}
```

The royalty payout example from above would look like this:

```typescript
{
  //existing metadata
  "rs": [
    ["xch18qt2ju2sj3k8w3290az6flkkc95fqcmcg7edl90ns0jrjav8xttsyuvkgj", 8000], // 80%
    ["xch1p9e3l3ttl7qrrhy6zmmqmjm0v33fvrxhd494yv7at0ppd97hljnscmfrmx", 2000] // 20%
  ]
}
```

## Test Cases

- Most Standards Track proposals will require a suite of test cases, which you may add to the `assets/chip-<CHIP>` folder.
- Some Process proposals will require test cases, depending on the significance of new features being added.
- Informational proposals typically will not require test cases.

Your proposal will have a greater chance of success if you err on the side of including more test cases. Use your best judgment.

## Reference Implementation

The reference implementation for Chia NFTs is located in the XXX branch of the chia-blockchain GitHub repository, under [chia/wallet/nft_wallet](TODO).

## Security

The Chialisp code has been covered by unit tests, but has not been audited yet by Chia Network or the broader community.

Risks:

- Royalties can be diverged
- Royalty payout can be stalled
- Info to construct royalty puzzle can get lost

<!-- This section is mandatory for all CHIPs. List all considerations relevant to the security of this proposal if it is implemented. This section may be modified as the proposal moves toward consensus. Make sure to include:

- Security-related design decisions
- Important discussions
- Any security-related guidance
- All threats and risks, as well as how you are addressing them -->

## Additional Assets

No additional assets.

## Copyright

Copyright and related rights waived via [CC0](https://creativecommons.org/publicdomain/zero/1.0/).

```

```
