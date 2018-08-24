const Web3 = require('/path/to/aion/web3');
const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

// 1. eth_getTransactionByHash

// specify hash
let hash = '0x5f2e74ade04ab9f6e8d4acd394f7f51832d4706d7268eea0ecc6391f94185b80';

// get tx with given hash
let tx = web3.eth.getTransaction(hash);

// print tx information
console.log("\ntransaction details:");
console.log(tx);

// 2. eth_getTransactionByBlockHashAndIndex

// specify block hash
hash = '0x50a906f4ccaf05a3ebca69cc4f84a116e6aec881e3c4d080c4df505fea65afab';
// specify tx index = 0 -> first tx
let index = 0;

// get tx with given hash & index
tx = web3.eth.getTransactionFromBlock(hash, index);

// print tx information
console.log("\ntransaction details:");
console.log(tx);

// 3. eth_getTransactionByBlockNumberAndIndex

// specify block number
let number = 247726;
// specify tx index = 1 -> second tx
index = 1;

// get tx with given number & index
tx = web3.eth.getTransactionFromBlock(number, index);

// print tx information
console.log("\ntransaction details:");
console.log(tx);

// 4. eth_getTransactionReceipt

// specify tx hash
hash = '0x2a1d8dc09f2c6670690bbda74377f59c8737df9812cf7c794fa35409d200fe3f';

// get receipt for given tx hash
let txReceipt = web3.eth.getTransactionReceipt(hash);

// print tx receipt
console.log("\ntransaction receipt:");
console.log(txReceipt);

// 5. eth_sendTransaction

// specify accounts and amount
let sender = 'a06f02e986965ddd3398c4de87e3708072ad58d96e9c53e87c31c8c970b211e5';
let receiver = 'a0bd0ef93902d9e123521a67bef7391e9487e963b2346ef3b3ff78208835545e';
let amount = 1000000000000000000; // = 1 AION

// unlock sender
let isUnlocked = web3.personal.unlockAccount(sender, "password", 100);
let status = isUnlocked ? "unlocked" : "locked";
console.log("\nsender account " + status);

// perform transaction
let txHash = web3.eth.sendTransaction({from: sender, to: receiver, value: amount});
console.log("\ntransaction hash: " + txHash);

// print receipt
txReceipt = web3.eth.getTransactionReceipt(txHash);
// repeat till tx processed
while (txReceipt == null) {
  // wait 10 sec
  sleep(10000);
  txReceipt = web3.eth.getTransactionReceipt(txHash);
}
console.log("\ntransaction receipt:");
console.log(txReceipt);

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
