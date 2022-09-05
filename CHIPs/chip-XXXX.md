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

## Abstract

This proposal aims to define a standard for splitting royalties for NFT1-compliant NFTs, using a standard Chialisp puzzle to prevent marketplace lock-in.

## Motivation

One of the great features of NFT1 is the built-in payment of royalties.
It is very flexible, since any address and therefore any puzzle can be used as royalty recipient.
Many people in the community have requested the option to split the royalty payment between different recipients.
For example, a share should be sent to a charity, or multiple artists want to share the royalties automatically.
Having this features available increases the value of the Chia NFT ecosystem as a whole.

Due to the nature of the Coinset model, the royalty split has to be triggered by some off-chain entity. This proposal ensures to ensure independence from any individual actor.

## Backwards Compatibility

This proposal does not have any backwards incompatibilities.

## Rationale

There have already been approaches to split royalties in the Chia ecosystem. The shortcoming of the existing approaches is a dependence on a single actor to trigger the royalty split.

The solution outlined in this propsal ensures independence from any single actor. This means that any observer of the Chia blockchain is able to trigger the royalty split, including the users wallet or an NFT marketplace.

The core is a simple Chialisp puzzle without many moving parts. It includes a payout scheme defining how the royalty should be split. The payment scheme is fixed and can not be altered by third parties. Anyone is able to trigger the royalty payout for any NFT.

In order to allow obervers to spend a royalty split coin, this proposal contains an extension to the NFT on-chain metadata to include the royalty payout scheme. This allows observers to recreate the royalty puzzle and optionally spend it.

An alternative approach would be to include the royalty payout scheme in the off-chain metadata instead. This was dismissed since it would require an observer to fetch the off-chain metadata as well to be able to trigger the split, which increases the complexity and reduces the permanence. Relying solely on on-chain metadata ensures the royalty split can always be reconstructed.

## Specification

This specification has two parts.
The Chialisp puzzle that splits itself into one or multiple smaller coins, according to a predefined payout scheme.
And an addition to the NFT metadata, to allow obervers to figure out the royalty puzzle and optionally spend it.

An example payout scheme could look like this

| Recipient Address                                              | Share in % |
| :------------------------------------------------------------- | :--------- |
| xch18qt2ju2sj3k8w3290az6flkkc95fqcmcg7edl90ns0jrjav8xttsyuvkgj | 80         |
| xch1p9e3l3ttl7qrrhy6zmmqmjm0v33fvrxhd494yv7at0ppd97hljnscmfrmx | 20         |

### Royalty Split Chialisp Puzzle

The proposed Chialisp puzzle looks like this.

```
(mod (PAYOUT_SCHEME my_amount)

  (defconstant TEN_THOUSAND 10000)

  (include condition_codes.clvm)
  (include curry-and-treehash.clinc)

  (defun-inline calculate_percentage (amount percentage)
      (f (divmod (* amount percentage) TEN_THOUSAND))
  )

  (defun-inline get_amount (payout_scheme_item my_amount)
      (calculate_percentage my_amount (f (r payout_scheme_item)))
  )

  (defun-inline get_puzhash (payout_scheme_item)
      (f payout_scheme_item)
  )

   ; Loop through the royalty payout scheme and create coins
  (defun split_amount_and_create_coins (PAYOUT_SCHEME my_amount)
      (if PAYOUT_SCHEME
          (c
              (list
                CREATE_COIN
                (get_puzhash (f PAYOUT_SCHEME))
                (get_amount (f PAYOUT_SCHEME) my_amount)
              )
              (split_amount_and_create_coins (r PAYOUT_SCHEME) my_amount)
          )
          ()
      )
  )

  ; main
  (c
    (list ASSERT_MY_AMOUNT my_amount)
    (split_amount_and_create_coins PAYOUT_SCHEME my_amount)
  )
)
```

The royalty payout scheme `PAYOUT_SCHEME` is curried into this puzzle, to make it immutable. The only solution parameter needed on spend is the actual amount of the coin.

On spend, the puzzle steps through the entries of the `PAYOUT_SCHEME` and creates a new coin per entry. The amount of the new coins will be a share of the total amount, determined by the share defined in the `PAYOUT_SCHEME`. The payout share is specified in the same format as NFT royalties, which is `int(percentage * 100)`.

If the created coins do not use up the full coin amount, the rest is left for the farmer of the block. This difference is most likely very small and not worth the effort to construct a more complex puzzle to collect this rest.

The royalty puzzle does not check whether the shares in the payout table add up to 100%, since it would be too late. This verification has to be done by the entity creating the NFT and the payout scheme.

### NFT Metadata

The second part is an addition to the NFT metadata.
In order to allow any observer to recreate the split royalty puzzle and trigger the split, the observer has to know the payout scheme.

The suggested format is a list of 2-tuples, each containing an address and the percentage of the royalties it should receive, multiplied by 100.

```typescript
{
  // existing metadata
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

The wallet or tool accepting this payout scheme from a user and passing it into the NFT has to ensure the percentages add up to 100%.

## Test Cases

The unit test for the royalty split Chialisp puzzle is located in the `royalty_split` branch of the `greimela/chia-blockchain` GitHub repository: [tests/wallet/nft_wallet/test_nft_puzzles.py](https://github.com/greimela/chia-blockchain/blob/royalty_split/tests/wallet/nft_wallet/test_nft_puzzles.py).

A more extensive integration test using NFT offers can be found here: [tests/wallet/nft_wallet/test_nft_royalty_split.clvm](https://github.com/greimela/chia-blockchain/blob/royalty_split/tests/wallet/nft_wallet/test_nft_royalty_split.py).

## Reference Implementation

The Chialisp puzzle itself is located in the `royalty_split` branch of the `greimela/chia-blockchain` GitHub repository: [chia/wallet/puzzles/royalty_split.clvm](https://github.com/greimela/chia-blockchain/blob/royalty_split/chia/wallet/puzzles/royalty_split.clvm).

## Security

The Chialisp code has been covered by unit tests, but has not been audited yet by Chia Network or the broader community.

Potential risks:

- Royalty recipient can be altered
  - The royalty recipients are curried into the puzzle and the only parameter in the solution is the amount. So the payout scheme can not be altered after it has been created.
- Royalty payout can be stalled
  - Since
- Info to construct royalty puzzle can get lost
  - The payout scheme is added to the NFT on-chain metadata, so it can not get lost as long as the Chia blockchain lives.
- Users can be deceived by a mismatch between the NFT metadata and the actual royalty puzzle
  - A malicious actor could specifiy in the NFT metadata that a large share of the royalties is given to some charity. The actor could then use a different royalty puzzle that sends all royalties to himself.
  - Mitigation: Marketplaces and blockchain explorers should check whether the payout scheme defined in the NFT metadata matches the royalty puzzle.

## Additional Assets

No additional assets.

## Copyright

Copyright and related rights waived via [CC0](https://creativecommons.org/publicdomain/zero/1.0/).
