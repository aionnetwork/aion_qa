# Account Creation Test

This repository contains the script for creating accounts by sending transactions to a smart contract.

## System Requirements

* **NodeJS** > 8

## Test Requirements

* An account with balance.
* Modify the `common.js` file to match your configuration by setting the following fields:
    * `Web3`: _aion-web3_ directory location.
    * `mainAccount`: address of the account sending the transactions. 
    * `mainAccountPass`: password associated with `mainAccount`.
    * `contractAddress` (optional): You can copy the address of a deployed contract and continue to send transactions to it. Alternatively, the contract will be redeployed for each test. Note that this field should be set in order to watch for events.
    * `intervalTime`: time to wait before sending new a new transaction.
    * `initialVal`: value to transfer to the contract.
    * `externalIterationCount`: number of transactions to send from the script to the smart contract in each iteration.
    * `internalIterationCount`: number of transactions to send within the smart contract.

## Running Test

Run the following command to start sending transactions:
```
node accountCreation.js
```
In order to watch for events open another terminal and run the following:  
```
node accountEventListener.js 
```
The value of public variables can be retrieved using:
```
node accountValueCheck.js 
```