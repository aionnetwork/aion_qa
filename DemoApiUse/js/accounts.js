const Web3 = require('/path/to/aion/web3');
const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

// 1.a) eth_accounts

// get accounts from API
let accounts = web3.eth.accounts;

// print accounts to standard output
console.log("the keystore contains " + accounts.length + " accounts, as follow:");
console.log(accounts);

// 1.b) eth_accounts

// get accounts from API
accounts = web3.personal.listAccounts;

// print accounts to standard output
console.log("\nthe keystore contains " + accounts.length + " accounts, as follow:");
console.log(accounts);

// 2. eth_coinbase

// get miner account
let miner = web3.eth.coinbase;

// print retrieved value
console.log("\ncoinbase account = " + miner);

// 3. eth_getBalance

// set address
let account = 'a06f02e986965ddd3398c4de87e3708072ad58d96e9c53e87c31c8c970b211e5';

// get account balance
let balance = web3.eth.getBalance(account);

// print balance
console.log("\n" + account + " has balance = " + balance + " nAmp (" + balance.shiftedBy(-18).toString() + " AION)");

// 4. eth_getTransactionCount

// set address
// note that hex prefix '0x' is optional
account = '0xa06f02e986965ddd3398c4de87e3708072ad58d96e9c53e87c31c8c970b211e5';

// get number of transactions sent by account
let txCount = web3.eth.getTransactionCount(account);

// print performed transactions
console.log("\n" + account + " performed " + txCount + " transactions");

// 5. eth_getBalance & eth_getTransactionCount for each keystore account

// print balance & tx count to standard output
console.log("\nthe keystore contains " + accounts.length + " accounts, as follow:");
accounts.forEach(print);

function print(acc, index) {
    console.log("\t" + acc + " balance = " + web3.eth.getBalance(acc) + " nAmp, tx count = " + web3.eth.getTransactionCount(acc));
}
