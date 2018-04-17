#!/usr/bin/env nodejs
const web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:8545"));

module.exports = function(w3, acc0, pass, abi, code){
  return new Promise((resolve, reject)=>{
    // deploying contract
    w3.eth.describe(abi).new(
      {
        from: acc0,
        data: code,
        gas: 4699999,
        gasPrice: 1
      }, (err, contract) => {
        if (err) {
            reject(err)
        }
        else if(contract && contract.address) {
            resolve(contract)
        }
      }
    );
  });
}
