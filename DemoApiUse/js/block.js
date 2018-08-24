const Web3 = require('/path/to/aion/web3');
const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

// 1. eth_blockNumber

// get block number from API
let blockNumber = web3.eth.blockNumber;

// print block number
console.log("current block = " + blockNumber);

// 2. eth_getBlockByHash

// specify hash
let hash = '0x50a906f4ccaf05a3ebca69cc4f84a116e6aec881e3c4d080c4df505fea65afab';

// get block with given hash
let block = web3.eth.getBlock(hash, false);

// print block information
console.log("\nblock with transaction hashes:");
console.log(block);

// get block with given hash
// with full transaction information
block = web3.eth.getBlock(hash, true);

// print block information
console.log("\nblock with transaction information:");
console.log(block);

// 3. eth_getBlockByNumber

// specify number
let number = 247726;

// get main chain block with given number
block = web3.eth.getBlock(number, false);

// print block information
console.log("\nblock with transaction hashes:");
console.log(block);

// get main chain block with given number
// with full transaction information
block = web3.eth.getBlock(number, true);

// print block information
console.log("\nblock with transaction information:");
console.log(block);

// 4. eth_getBlockTransactionCountByHash

// get tx count given hash
let txCount = web3.eth.getBlockTransactionCount(hash);

// print information
console.log("\n" + txCount + " transactions in block " + hash);

// 5. eth_getBlockTransactionCountByNumber

// get tx count given block number
txCount = web3.eth.getBlockTransactionCount(number);

// print information
console.log("\n" + txCount + " transactions in block #" + number);
