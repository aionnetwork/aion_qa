# Transaction Generator Benchmark Test (Java API)

This test will focus on the ability of the Java API to create accounts and perform
transactions. 

## System Requirements

* **IntelliJ* (can be downloaded [here](https://www.jetbrains.com/idea/download/#section=linux))

## Tests Requirements and Parameters

This transaction generator will require an account, x, located in your `aion/keystore` folder where the
kernel is being run from, which contains a significant amount. The specified number of accounts will be
created. For each account creation, a small value will be transferred to this account from
account x. Once the accounts have been created, continuous transactions will be performed
using the Java API in iterations where in each iteration, an increased number of transactions
are sent between accounts.

## Running the Test

Before running the test, you will need to build the jar in IntelliJ.
1) Open the project folder in IntelliJ
2) Go to Build > Rebuild Project
3) Build > Build Artifacts
Now you will have a `jar` generated in your project folder under
`out/artifacts/tx_gn_artifacts/`.

In Terminal, navigate to this directory. Make sure the kernel is
running before attempting to run this test. In order to run this jar, you will need to pass in
three parameters into the command line:

* number of accounts to create (`num_of_accounts`)
* account address of where to transfer money from initially (`account_address`)
* password of the account where the money is being transferred from (`password_of_account_addr`)

ex. ```$ java -jar tx-gn.jar <num_of_accounts> <0xaccount_address> <password_of_account_addr>```

You should start to see output messages where the test is run showing that the API has been connected and the accounts are being created. The initial transaction hashes which 
are output after each new account has been created are in regards to the transaction from the `account_address` is initially transferred to the new account that is created. Once the accounts have been created, the balances for the accounts will be checked and then it will proceed to start iterations of the transactions between the new accounts which were made.