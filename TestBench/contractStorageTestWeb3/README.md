# Account Creation Test

This repository contains the script for testing contract storage limits.

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
    * `iteration`: number of items to store in arrays inside the smart contract with each transaction.
    
## Running Test

Run the following command to start sending transactions:
```
node storeData.js
```
In order to watch for events open another terminal and run the following:  
```
node dataEventListener.js 
```
