---
layout: markdown
---

## How to verify Bitcoin transactions:

https://bitcoin.stackexchange.com/questions/52528/how-is-a-standard-bitcoin-transaction-defined
https://www.cryptocompare.com/coins/guides/how-does-a-bitcoin-node-verify-a-transaction/
https://www.cryptocompare.com/coins/guides/what-are-the-bitcoin-transaction-types/

1. The transactions syntax and data structure are correct.
2. The input and outputs have values.
3. The transaction is less than the block size of 1 MB.
4. The values must be more than 0 and less than 21 million.
5. None of the inputs have a hash that is equal to 0.
6. The locktime is less than the maximum allowed number.
7. The transaction size is greater than or equal to 100 bytes.
8. The number of signatures is less than the signatute limit.
9. The unlocking script can only push numbers onto the stack.
10. The locking script must match isstandard format.
11. A matching transaction must exist.
12. If a transaction is missing move the transaction to the orphan transaction pool.
13. If the transaction is a coinbase transaction then it must have a maturity of 100 confirmations.
14. For each input the output must exist and not have been spent.
15. Check that each input value is in the required range.
16. Reject if the input value is less than the output value.
17. Reject if the transaction value is too low to get into an empty block.
18. The unlocking scripts for each input must be verified against the output locking scripts.
