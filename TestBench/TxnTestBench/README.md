# Continuous Transaction Test

This repository contains the script for sending continuous transactions and monitoring the throughput. It sends transactions from one account to another with a value of 1. It will display the number of transactions processed and dropped.

## System Requirements

* **Java** v8 or above

## Test Requirements

* An account with balance.

## Running Test

This test requires the following 7 parameters as input.

```
 [0] account address to be used for sending transactions.
 [1] password for unlocking the sender account.
 [2] account address who receives transactions.
 [3] total number of transactions to send before stopping.
 [4] sleep time between transactions in ms.
 [5] maximum size of the queue holding transactions while they haven't been included in a block.
 [6] (optional) url for the api.
```
