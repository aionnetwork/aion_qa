# Account Creation Test

This repository contains the script for creating accounts by sending transactions and transferring value to them. It starts by sending a transaction to 0x0000000000000000000000000000000000000000000009223372036854775807 and in each iteration it decreases the account address by 1. It will terminate when the total number of account provided as an input are reached. 

## System Requirements

* **Java** v8 or above

## Test Requirements

* An account with balance.

## Running Test

This test requires the following 6 parameters as input.

```
 [0] account address to be used for sending transactions.
 [1] password for unlocking the sender account.
 [2] the 19 ending digits of the last created account, if continuing from the last created account. 0 if starting from scratch.
 [3] total number of accounts to create.
 [4] sleep time between sending transactions in ms.
 [5] maximum size of the queue holding transactions while they haven't been included in a block. When transactions are included in a block, they will be removed from the queue, opening space for new transactions.
```
Sample:
```
java -jar accountCreationJava.jar <sender-address> <sender-password> 0 <total-account-count> <sleep-time> <queue-size>

```
**Note**
the _native_ folder should be placed in the same directory as the jar file to run the test.