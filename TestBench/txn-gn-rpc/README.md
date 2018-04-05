# Batch Transaction Generator Benchmark Test (JSON-RPC)

This is a test which will aim to send batch transactions using JSON-RPC. Furthermore it will go through the process of unlocking accounts, deploying the ERC-20 contract, minting ERC-20 tokens, checking the balance and transferring tokens (transactions in batch).
 
This is a continuous test (which will run until manually shutdown using `Ctrl+C`. 

## Setting up the test 

Prior to running this, you will need to edit the config.js file found under `txn-generator/app/`. You will find six empty account address fields along with their corresponding passwords. Using six accounts from your keystore fill in the address fields and their passwords. Furthermore, you can edit the amount of transactions that are sent in a batch. Under `app.js`, there is a variable defined as `BATCH_THRESHOLD` which can be altered to send a smaller or larger number of transactions in one batch. By default, it is set to 200.  

## Run the test

1) Ensure that the kernel is running, and then in a new terminal 

2) Navigate to `testbench/txn-generator/src`

3) Run `node app.js`. You should see the test output as it is first unlocking the account, deploying the contract, minting tokens, and then sending transactions in batch amounts. 
