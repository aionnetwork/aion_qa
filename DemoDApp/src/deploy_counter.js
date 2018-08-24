/*
 * deploy_counter
 *    Deploys counter.sol contract
 *    node deploy_counter.js
 *    Output: deployed contract address {0x.....}
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

// Importing Counter contract
const sol = fs.readFileSync('./contracts/Counter.sol', {
  encoding: 'utf8'
});

let contractAddr; // Deployed contract address
let contractInstance; // Contract Instantiantion
let acc = web3.personal.listAccounts; // Grab accounts in keystore
let a0 = acc[0]; // Grab your account index at [i]
let pw0 = "AccountPasswordGoesHere"; // Account password associated w/ a0

Promise.all([
  // Unlock account & complile contract
  unlock(web3, a0, pw0),
  compile(web3, sol),
  console.log("\n[log] 1. unlocking account:", a0),
  console.log("[log] 2. compiling contract"),

]).then((res) => {
  let a0 = res[0]; // Store Account
  let abi = res[1].Counter.info.abiDefinition; // abi
  let code = res[1].Counter.code; // bytecode

  console.log("[log] unlock & compile successful! \n");
  console.log("[log] 3. deploying... ");

  deploy(web3, a0, pw0, abi, code)
  .then((res) => {
      contractAddr = res.address;
      contractInstance = web3.eth.contract(abi).at(contractAddr);
      console.log('[log] deploy successful! \n');
      console.log('[log] contract address:', res.address);

  }, (err) => {
      console.log("[error]", err);;
  });
})
