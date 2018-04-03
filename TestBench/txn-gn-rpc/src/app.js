var core = require('./core.js');
const config = require('./config.js');
const fs = require('fs');
var BigNumber = require('bignumber.js');
const token = require('./contracts/token.js');
const tokenContract = "./contracts/token.sol"

const SHOULD_INITIALIZE = true;
const UNLOCK_TIME = 86400;
const MAX_RETRIES = 30;
const BATCH_THRESHOLD = 200;
const TOKEN_MINT = 10000000;

let compiled = null;
let contractInstance = null;

const timeout = async (seconds) => {
  return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}

const unlockAccount = async (account) => {
  let res = null;
  try {
    res = await core.unlockAccount(account.addr, account.pass, UNLOCK_TIME);
  } catch (err) {
    core.log("ERR: could not unlock account: " + account.addr);
    core.log(err);
  }

  core.log("account: " + account.addr + " unlocked: " + res);
}

const unlockAccountList = async (accounts) => {
  for (let account of accounts) {
    await unlockAccount(account);
  }
}

const deploy = async (owner) => {
  try {
    const source = fs.readFileSync(tokenContract, "utf-8");
    compiled = await core.compile(source);
    contractInstance = await core.deploy(compiled, owner.addr);
    core.log("contract deployed at: " + contractInstance.address);
  } catch (err) {
    core.log("deploy err: " + err);
  }   
}

const mint = async (contract, addrTo, value, addrFrom) => {
  try { 
    const response = await core.mint(contract, addrTo, value, addrFrom);
    //core.log("mint: " + response);
  } 
  catch (err) {
    core.log("ERR: contract.mint() " + err);
  } 
}

const getRandomInt = (start, end) => {
  return (Math.floor(Math.random() * end) + start);
}

const waitForFinality = async (nonceCount, address, callback) => {
  const n0 = await core.getTransactionCount(address);

  await callback();

  // now wait for the last transaction to be included in a block
  let retries = 0;
  while(true) {
    const n1 = await core.getTransactionCount(address);
    console.log(n1.toString(10));

    const diff = n1.minus(n0);
    if(diff.eq(nonceCount))
      break;

    if(diff.gt(nonceCount) || retries >= MAX_RETRIES) {
      core.log("waitForNonceIncrementBy failed somehow ... returning.");
      return false;
    }

    retries++;
    await timeout(2);
  }

  return true;
}

const generateRandomTransfer = async (contract, accounts, owner, value) => {
  let a0 = getRandomInt(accounts.length - 1, 0);
  let a1 = getRandomInt(accounts.length - 1, 0);
  
  try { 
    const hash = await core.transfer(
      contract, 
      accounts[a0].addr, 
      accounts[a1].addr, 
      value, 
      owner.addr
    );

    //core.log("transfer: " + hash);
  } 
  catch (err) {
    core.log("ERR: contract.transfer() " + err);
  } 
}

(async () => {  
  console.log("-------------------------------------------");
  console.log("Test Bench");
  console.log("-------------------------------------------");
  
  while(true) {
    // unlock all accounts
    const accounts = config.accounts;
    const owner = accounts[0];
    
    await unlockAccountList(accounts);
    core.log("finished unlocking accounts");

    // iniitalize the contract
    if (!SHOULD_INITIALIZE) {
      contractInstance = core.contract(token.compiled, token.address);
    } else {
      core.log("deploying token contract ...");

      const deploySuccess = await waitForFinality(1, owner.addr, async () => {
        await deploy(owner);
      });

      if (!deploySuccess) {
        core.log("deploy failed ... returning");
        continue;
      }

      core.log("minting " + TOKEN_MINT + " tokens to " + accounts.length + " accounts ...");

      const mintSuccess = await waitForFinality(accounts.length, owner.addr, async () => {
        for (let account of accounts) {
          await mint(contractInstance, account.addr, TOKEN_MINT, owner.addr);
        }
      });

      if (!mintSuccess) {
        core.log("mint failed ... returning");
        continue;
      }
    }
    
    while (true) {
      core.log("sending " + BATCH_THRESHOLD + " transfers ...");
      //await unlockAccountList(accounts);
      
      const transferSuccess = await waitForFinality(BATCH_THRESHOLD, owner.addr, async () => {
        let i = 0;
        while (i < BATCH_THRESHOLD) {
          await generateRandomTransfer(contractInstance, accounts, owner, 1);
          i++;
        }
      });
      if (!transferSuccess) {
        core.log("transfers failed ... returning");
        break;
      }
    }
  }

  core.log("finished ...");

})().catch((err) => {
  core.log("ERR: top level function chain threw");
  core.log(err);
});
