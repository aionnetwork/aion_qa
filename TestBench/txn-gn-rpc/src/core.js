const request = require('request');
const config = require('./config.js');
const moment = require('moment');
const Web3 = require('aion-web3');
var BigNumber = require('bignumber.js');

const web3 = new Web3(new Web3.providers.HttpProvider(config.provider));

const random = require('node-random-number');

//const abi = [{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint128"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint128"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_value","type":"uint128"}],"name":"transferFrom","outputs":[{"name":"success","type":"bool"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint128"}],"name":"approve","outputs":[{"name":"success","type":"bool"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"recipient","type":"address"},{"name":"value","type":"uint128"}],"name":"mint","outputs":[{"name":"success","type":"bool"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"},{"name":"_spender","type":"address"}],"name":"allowance","outputs":[{"name":"remaining","type":"uint128"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint128"}],"name":"transfer","outputs":[{"name":"success","type":"bool"}],"payable":false,"type":"function"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_from","type":"address"},{"indexed":true,"name":"_to","type":"address"},{"indexed":false,"name":"_value","type":"uint128"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_owner","type":"address"},{"indexed":true,"name":"_spender","type":"address"},{"indexed":false,"name":"_value","type":"uint128"}],"name":"Approval","type":"event"}];
let rpcNonce = 0;

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const log = (s) => {
  const now = moment();
  console.log("[" + now.format() + "] " + s);
}
module.exports.log = log;

const req = (callForm) => {
  // append the id here
  callForm.jsonrpc = "2.0";
  callForm.id = rpcNonce.toString();
  rpcNonce++;

  const options = {
    url: config.provider,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    json: callForm
  }

  return new Promise((resolve, reject) => {
    request(options, (err, resp, body) => {
      if (err)
        reject(err);

      resolve(body);
    });
  });
}

module.exports.getAccounts = async () => {
  const resp = await req({
    method: config.transferAddress1,
    params: []
  });
  return resp.result;
}

module.exports.unlockAccount = async (userAddress, password, duration) => {
  const resp = await req({
    method: "personal_unlockAccount",
    params: [userAddress, password, duration]
  });
  return resp.result;
}

module.exports.getTransaction = async (hash) => {
  const resp = await req({
    method: "eth_getTransactionByHash",
    params: [hash]
  });
  return resp.result;
}

module.exports.getTransactionCount = async (address, blkNum=null) => {
  let blk = blkNum ? blkNum : "latest";
  const resp = await req({
    method: "eth_getTransactionCount",
    params: [address, blk]
  });
  try {
    const count = new BigNumber(resp.result);
    if (count.isFinite() && count.gte(0)) 
      return count;
  }
  catch (e) {
    log(e);
  }

  return null;
}

module.exports.compile = function(source){
  return new Promise((resolve, reject) => {
    web3.eth.compile.solidity(source, (err, res) => {
      if(err) {
        reject(err)
      }
      
      if(res) {
        let name = Object.keys(res)[0]
        let compiled = res[name]
        let abi = compiled.info.abiDefinition
        let code = compiled.code
        resolve({
          name: name, 
          abi: abi, 
          binary: code
        });
      }
    })
  })
}


module.exports.deploy = ({name, abi, binary}, address) => {
  const options = {
    from: address,
    gas: 9000000,
    gasPrice: 1,
    data: binary,
  };

  return new Promise((resolve, reject) => {
    web3.eth.contract(abi).new(options, (err, contract) => {
      if (err) {
        log(err);
        reject(err);
      }

      if (contract && contract.address)
        resolve(contract);
    });
  });
}

module.exports.contract = ({name, abi, binary}, contractAddress) => {
  return web3.eth.contract(abi).at(contractAddress);
}

module.exports.mint = (contract, addrTo, value, addrFrom) => {
  return new Promise((resolve, reject) => {
    contract.mint(
      addrTo, 
      value, 
      {
        from: addrFrom,
        gas: 100000,
        gasPrice: 1
      }, 
      (err, res) => {
        if (err)
          reject(err);

        resolve(res);
      }
    );
  });
}

module.exports.transfer = (contract, from, to, value, owner) => {
  return new Promise((resolve, reject) => {
    contract.transfer(
      to, 
      value, 
      {
        from: owner,
        gas: 100000,
        gasPrice: 1
      }, 
      (err, res) => {
        if (err)
          reject(err);

        resolve(res);
      }
    );
  });
}
