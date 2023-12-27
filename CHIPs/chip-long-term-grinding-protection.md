CHIP Number   | ????
:-------------|:----
Title         | Long term grinding protection
Description   | A hard fork to aggressively reduce grinding economics, can be adjusted with soft forks later.
Author        | [Slowest Timelord](https://github.com/SlowestTimelord)
Editor        | < Creator must leave this blank. Editor will be assigned.>
Comments-URI  | < Creator must leave this blank. Editor will assign a URI.>
Status        | < Creator must leave this blank. Editor will assign a status.>
Category      | Standards Track
Sub-Category  | Core
Created       | 2023-12-27
Requires      | None
Replaces      | None
Superseded-By | None

## Abstract
In the design of Chia's consensus, there are several built-in levers that can be adjusted to reduce the cost-effectiveness of plot grinding. These options were assessed in CHIP-0012 and ultimately, four steps of plot filter reduction over 10 years (down to 32 in 2033) was accepted and implemented with a hard fork. Hard forks are not desirable and more will be necessary in the future to keep up with technological advances. This CHIP proposes to implement a "final hard fork" *now* with **intentionally aggressive timelines** towards eventual plot filter removal with the understanding that if deemed too aggressive, timelines can be pushed back later with a soft fork.

## Motivation
The primary motivation to reduce the cost effectiveness of plot grinding was [described well in CHIP-0012](https://github.com/Chia-Network/chips/blob/main/CHIPs/chip-0012.md#motivation), the reasoning here remains the same. Additional motivation for outlining a more aggressive and longer term plan against plot grinding include:
- Recognizing recent developments in GPU plotting efficiency and hence grinding effectiveness.
- Recognizing a potential ~3x gain in plot grinding effectiveness that may not have been evident at the time of CHIP-0012 discussion. (A moot point if CHIP-0013 is implemented.)
- A desire to not have further hard forks every 3-5 years to keep up with plot grinding effectiveness. Instead have one "final" aggressive hard fork now that can be adjusted as needed with soft forks.
- Provide transparency to farmers as to what the future of Chia farming looks like.
- Recognize an eventual flipping of SSD vs HDD cost effectiveness and future farming considerations for when majority of netspace will be on flash storage.

It is important to acknowledge that this CHIP is *not* motivated by:
- The [increasing share of netspace using plot compression](https://xch.farm/compressed-netspace/)
- Increased centralization caused by some farming pools not following the official pooling protocol
- Any increased energy use that comes from the above

However, by reducing plot grinding effectiveness, there *will* be a side effect of impacting farmers and third parties that utilize or otherwise benefit from compressed plot farming, potentially requiring them to pull ahead the rethinking of their long term farming strategy. There will also be long term impact to farmers utilizing slow large capacity drives. See the sections below on impact for more details.

### Proposal

This CHIP is a proposal to aggressively pull ahead the plot reduction schedule beyond the 256 reduction to every 1 year instead of every 3 years. It also introduces new timelines for further reductions all the way to plot filter removal (Filter size = 1), at which point it can be expected for much of the netspace to be on SSDs where [proof lookups aren't bottlenecked by disk latency](https://chiapower.org/Power/powerssd).

| Block height | Month/Year (approx) | Filter size | vs CHIP-0012           |
|------------: | ------------------: | ----------: | ---------------------: |
|  `5 496 000` | June 2024           | 256         | Unchanged              |
| `10 542 000` | June 2025           | 128         | June 2027 -> June 2025 |
| `15 588 000` | June 2026           |  64         | June 2030 -> June 2026 |
| `20 634 000` | June 2027           |  32         | June 2033 -> June 2027 |
| `25 680 000` | June 2028           |  16         | Previously not defined |
| `30 726 000` | June 2029           |  8          | Previously not defined |
| `35 772 000` | June 2030           |  4          | Previously not defined |
| `40 818 000` | June 2031           |  2          | Previously not defined |
| `45 864 000` | June 2032           |  1 (none)   | Previously not defined |

Although no minimum k-size increase is directly introduced, there is natural motivation to plot higher k-sizes as a means of reducing proof/quality look ups (disk seeks) required to maintain feasibility of farming large capacity HDDs or slow HDDs as the filter reduction continues.

This proposal also has an effective "start date" of June 2025 so if accepted, it allows for almost 1.5 years for farmers to update their software to support the hard fork. This is more than the 1 year guideline typically required to allow for hard fork adoption.

### SSD vs HDD price parity
Estimates of when SSDs will reach price parity with HDDs on a $/TB basis varies:
- [2023 Estimate from TechRadar](https://www.techradar.com/news/ssd-could-hasten-demise-of-hdd-as-price-parity-looms-in-2023)
- [2028 Estimate from Pure Storage](https://blocksandfiles.com/2023/05/09/pure-no-more-hard-drives-2028/)
- [2030 Estimate from r/datahoarders](https://www.reddit.com/r/DataHoarder/comments/17sljc1/as_requested_an_improved_chart_of_ssd_vs_hdd/)

Even at lower $/TB for HDDs in the short term, the [increased reliability](https://www.tomshardware.com/news/backblaze-confirms-ssds-more-reliable-than-hdds) and [energy efficiency](https://chiapower.org/Power/powerssd) and hence lower TCO of SSDs may cause more of the netspace to shift towards solid state storage even before the CapEx price is significantly cheaper.

A final plot reduction in 2032 seems reasonable as an end state for a network secured mostly by SSDs but again, this CHIP is intentionally aggressive to allow for soft fork adjustments at a later date. 

### Impact on Compressed Farming
It is known that at lower plot filter sizes, workload for decompression will increase proportionally which is a direct side effect of reducing plot grinding effectiveness. Compressed farmers should have already accounted for future plot reductions from CHIP-0012 in planning their farm but these plans may need to be revisited if the life expectancy of their hardware is expected to go beyond the first few filter reductions.

It is entirely possible that the most feasible long term farming strategy involves "OG" uncompressed plots. Even "low compression" like Bladebit C4 would only support ~18TB max farm size on a low end 2-thread CPU at plot filter of 1.

### Impact on Slow HDD Farming
The plot filter was initially put in place to reduce disk seeks on traditional HDDs. Without a plot filter, slow large capacity hard drives will be at the limits for being able to do a proof look up in time. From CHIP-0012:
> On a low-end spinning hard drive, a quality check requires 50-70 ms (benchmarked at 10 ms per disk seek), so a 20 TB disk filled with 183 plots of size k=32 would require 9-13 seconds to perform the quality checks. This would be unacceptable in Chia's network because signage points occur (on average) every 9.375 seconds.

Farmers using slow (5400rpm) large capacity drives will need to account for this impact and consider plotting OG uncompressed plots of higher k-sizes to ensure successful proof lookups at a final plot filter of 1. One thing to note is that most large capacity drives are actually faster 7200rpm with 4-5 ms per disk seeks so quality checks would be fine even for a 22TB filled with OG K32 plots.

The less frequent full proof look ups of 64 disk seeks will still come in under the suggested 20 second response time.

### Technical feasibility
Adjustments to plot filter reduction timelines is technically simple, [following the CHIP-0012 implementation](https://github.com/Chia-Network/chia-blockchain/blob/main/chia/consensus/default_constants.py#L66-L74).

## Backwards Compatibility
Similar to CHIP-0012, this proposal is not backwards compatible and will constitute a hard fork.
> This proposal is not backwards compatible with the status quo because it makes something valid that previously would have been invalid. For example, currently an average of 18 plots pass the filter for each signage point on a 1-PB farm. After this change, the same farm would see an average of 36 plots passing the filter. This broadening of the rules will necessitate a hard fork of Chia's network.

## Rationale
The various options for reducing plot grinding economics are discussed in the [Rationale section of CHIP-0012](https://github.com/Chia-Network/chips/blob/main/CHIPs/chip-0012.md#rationale).

For the same reasons discussed, a plot format change or minimum k-size increase is not desireable due to the impact to a vast majority of the netspace. Instead, k-size increase will be indirectly motivated by the eventual removal of the plot filter as a means of reducing disk seeks for even uncompressed plots.

Technical implementation is also a consideration in only leveraging plot filter reductions as this is a well-tested and understood implementation that is already supported by ecosystem tools (such as max farm size estimators, farming calculators etc.)


## Specification
Since this proposal only defines a plot filter reduction schedule, the specification is [identical to that of CHIP-0012](https://github.com/Chia-Network/chips/blob/main/CHIPs/chip-0012.md#specification).


## Security
The security considerations are [similar to that discussed in CHIP-0012](https://github.com/Chia-Network/chips/blob/main/CHIPs/chip-0012.md#security).

## Additional Assets
n/a

## Copyright
Copyright and related rights waived via [CC0](https://creativecommons.org/publicdomain/zero/1.0/).




