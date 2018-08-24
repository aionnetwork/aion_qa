/*
 * interact_counter
 *    Interact with deployed counter contract
 *    node interact_counter.js {contractAddress}
 */


const fs = require('fs');
// directory where Web3 is stored, in Aion Kernel
global.Web3 = require('/home/kimcodeashian/Aion/aion/web3');
// connecting to Aion local node
const web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:8545"));

// Importing unlock, compile and deploy scripts
const unlock = require('./scripts/unlock.js')
const compile = require('./scripts/compile.js');
const deploy = require('./scripts/deploy.js');
const readlineSync = require('readline-sync')

// Importing unlock, compile and deploy scripts
const sol = fs.readFileSync('./contracts/Counter.sol', {
  encoding: 'utf8'
});

let contractAddr = process.argv[2]; // Grab contract address input
let contractInstance; // Contract Instantiantion
let acc = web3.personal.listAccounts; // Grab accounts in keystore
let a0 = acc[0]; // Grab your account index at [i]
let pw0 = "AccountPasswordGoesHere"; // Account password associated w/ a0

Promise.all([
  // Unlock accounts & complile contract
  unlock(web3, a0, pw0),
  compile(web3, sol),
  console.log("\n[log] 1. unlocking account:", a0),
  console.log("[log] 2. compiling contract"),

]).then((res) => {
  let a0 = res[0]; // Store Account
  let abi = res[1].Counter.info.abiDefinition; // abi
  let code = res[1].Counter.code; // bytecode
  console.log("[log] accessing contract\n");

  // Contract Instantiantion
  contractInstance = web3.eth.contract(abi).at(contractAddr);

  // Start console
  readlineSync.promptCLLoop({
    // return count
    getCount: function(){
      let count = contractInstance.getCount();
      console.log("counter =", count.toString(), "\n");
    },

    // increment counter by 1
    incrementCounter: function(){
      contractInstance.incrementCounter(
        {
          from: a0,
          data: code,
          gas: 50000
        }
      );
      console.log('[log] counter increased \n');
    },

    // decrement counter by 1
    decrementCounter: function(){
      contractInstance.decrementCounter(
        {
          from: a0,
          data: code,
          gas: 50000
        }
      )
      console.log('[log] counter decreased\n');
    }
  })
});
