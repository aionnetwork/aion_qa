# Web3 Tests

This repository contains the mocha test files for web3 API.

## System Requirements

* **NodeJS** > 8
* **Bignumber.js library**
* **Mocha and Chai**


## Test Requirements

* Create at least 2 accounts.
* Ensure the account to be used as main has balance.
* Modify the `common.js` file to match your configuration by setting the following fields:
    * `Web3`: _aion-web3_ directory location.
    * `mainAccount`: address of the account sending all the transactions. 
    * `mainAccountPass`: password associated with `mainAccount`.
    * `sleepTime`: time to wait before querying for changes such as transaction receipt and new block generation.
    * `contractAddress` (optional): several tests work with the _Personnel_ contract. You can deploy the contract only once by running ``test/contracts/PersonnelCompileDeploy.js`` using node.js and copying the address. Alternatively, the contract will be redeployed for each test.
    * `sendTransactionIteration`, `sendTransactionValue`: number of transactions to send to each account and value of each transaction in _send_multiple_transactions_test_, respectively.
## Running Tests

* Running a single mocha test:
In a terminal navigate to the `test` folder and run the test using
```
mocha testName_test.js
```
* Running all the mocha tests:
In a terminal navigate to the `Web3` folder and run the following command:
    
```
mocha --recursive
```
