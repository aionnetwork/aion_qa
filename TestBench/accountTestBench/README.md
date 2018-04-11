# Account Creation Test

The script contained in this repository starts by creating accounts based on the number provided. Once the accounts are created and have balance, they will start sending transactions to new addresses. Thus, creating more accounts. The first new address will be 0a00000000000000000000000000000009223372036854775807 and in each iteration it will be decreased by 1.

## System Requirements

* **Java** v8 or above

## Test Requirements

* An account with balance.

## Running Test

This test requires the following 6 parameters as input.

```
 [0] total number of accounts to create.
 [1] account address to be used for sending transactions.
 [2] password for unlocking the sender account.
 [3] sleep time between sending transactions in ms.
 [4] the 19 ending digits of the last created account, if continuing from the last created account. 0 if starting from scratch.
 [5] maximum size of the queue holding transactions while they haven't been included in a block. When transactions are included in a block, they will be removed from the queue, opening space for new transactions.
 [6] (optional) url for the api.
```
Sample:
```
java -jar accountCreationJava.jar <total-account-count> <sender-address> <sender-password> <sleep-time> 0 <queue-size>

```
**Note**
the _native_ folder should be placed in the same directory as the jar file to run the test.

