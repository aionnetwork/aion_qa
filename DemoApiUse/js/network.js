const Web3 = require('/path/to/aion/web3');
const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

// 1. eth_syncing

// get sync status
let status = web3.eth.syncing;

// print status
console.log(status);

// 2. net_peerCount

// get peer count
let peers = web3.net.peerCount;

// print count
console.log("\nnumber of active peers = " + peers);

// 3. net_listening

// get listening status
let listening = web3.net.listening;

// print status
console.log("\n" +  (listening ? "" : "not") + "listening for connections",);
