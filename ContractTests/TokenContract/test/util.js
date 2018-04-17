const fs = require('fs');
var Combined = null; 
var Controller = null;
var Ledger = null;
var Token = null;

var web3_def = true;
// try {
//   web3;
// } catch (e) {
//   if (e.name == "ReferenceError") {
//     console.log("unable to find web3, ledgers will not be loaded");
//     web3_def = false;
//   }
// }

if (web3_def) {
  Controller = fs.readFileSync(__dirname + '/contracts/Controller.sol', {
    encoding: 'utf8'
  });
  Ledger = fs.readFileSync(__dirname + '/contracts/Ledger.sol', {
    encoding: 'utf8'
  });
  Token = fs.readFileSync(__dirname + '/contracts/Token.sol', {
    encoding: 'utf8'
  });
  SafeMathTester = fs.readFileSync(__dirname + '../contracts/mock/SafeMathTester.sol', {
    encoding: 'utf8'
  });
  Migration = fs.readFileSync(__dirname + '../contracts/Migrations.sol', {
    encoding: 'utf8'
  });
  foundation = fs.readFileSync(__dirname + '../foundation_tools.js', {
    encoding: 'utf8'
  });
  TokenReceivable = fs.readFileSync(__dirname + '../contracts/TokenReceivable.sol', {
    encoding: 'utf8'
  });
  SafeMath = fs.readFileSync(__dirname + '../contracts/SafeMath.sol', {
    encoding: 'utf8'
  });
  Pausable = fs.readFileSync(__dirname + '../contracts/Pausable.sol', {
    encoding: 'utf8'
  });
  Owned = fs.readFileSync(__dirname + '../contracts/Owned.sol', {
    encoding: 'utf8'
  });
  IToken = fs.readFileSync(__dirname + '../contracts/IToken.sol', {
    encoding: 'utf8'
  });
  Finalizable = fs.readFileSync(__dirname + '../contracts/Finalizable.sol', {
    encoding: 'utf8'
  });
  EventDefinitions = fs.readFileSync(__dirname + '../contracts/EventDefinitions.sol', {
    encoding: 'utf8'
  });
  DummyToken = fs.readFileSync(__dirname + '../contracts/DummyToken.sol', {
    encoding: 'utf8'
  });
  ControllerEventDefinitions = fs.readFileSync(__dirname + '../contracts/ControllerEventDefinitions.sol', {
    encoding: 'utf8'
  }); 
}

let padLeft = function(value, len) {
  let hexLength = len * 2;
  if (value.length > len)
    return value;

  var outStr = value;
  for (i = 0; i < (hexLength - value.length); i++) {
    outStr = '0' + outStr;
  }
  return outStr;
}

/**
 * Generates the packed address value multiMint expects
 * 
 * TODO: this function should throw if anything goes wrong
 * since its our responsibility to ensure the input is correct.
 * This function or some variation of it must be unit tested in the future
 * to ensure safe functionality.
 *
 * @param      {string}    address  The address in hexidecimal string format with or without '0x'
 * @param      {number}    value    The numerical value of the intended value to mint
 * @return     {string}    The correctly formatted numerical value that maps to uint256
 */
let addressValue = function(address, value) {
  let hexValue = value.toString(16);
  if (hexValue.length > 24)
    throw "size too large";

  let paddedHexValue = padLeft(hexValue, 12);

  let headerIncluded = false;
  if (address.substring(0, 2) == '0x') {
    headerIncluded = true;
  }

  if (headerIncluded && !(address.length == 42))
    throw "address wrong length";

  if (!headerIncluded && !(address.length == 40))
    throw "address wrong length";

  return address + paddedHexValue;
}

let searchForEvent = (receipt, signature) => {
  let hashed = web3.sha3(signature);
  for (i = 0; i < receipt.logs.length; i++) {
    let topics = receipt.logs[i].topics;
    for (j = 0; j < topics.length; j++) {
      let topic = topics[j];
      if (topic == hashed)
        return true;      
    }
  }
  return false;
}

/**
 * Promise wrapper for tx getting mined
 * Starts filtering from 10 blocks before when called, until the latest.
 * 
 * Resolves on txHash find
 * Rejects after 50 blocks
 */
let transactionMined = (txHash) => {
  let latestBlock = web3.eth.blockNumber
  let p = new Promise((resolve, reject) => {
    let filter = web3.eth.filter({fromBlock: latestBlock - 10, toBlock: 'latest'});

    filter.watch((err, res) => {
      let block = web3.eth.getBlock(res.blockHash, true);
      for (j = 0; j < block.transactions.length; j++) {
        if (block.transactions[j].hash == txHash) {
          let tx = block.transactions[j];
          let receipt = web3.eth.getTransactionReceipt(tx.hash);
          filter.stopWatching();
          resolve({tx: tx, receipt: receipt});
        }
      }

      if ((res.blockNumber - latestBlock) > 50) {
        filter.stopWatching();
        reject("waited 50 blocks, no transaction response");
      }
    }); 
  });
  return p;
}

/**
 * Confirms that a transaction is mined, then confirms that said transaction
 * did not occur any invalid opcodes
 */
let confirmTransactionValid = (txHash) => {
  return new Promise((resolve, reject) => {
    transactionMined(txHash).then((res) => {
      return web3.debug.traceTransaction(res.hash);
    }, (err) => {
      reject(err);
    }).then((res) => {
      let lastOpError = res.structLogs[res.structLogs.length - 1].error
      if (error == "")
        resolve(null);
      else
        reject(lastOpError);
    });
  });
}

/**
 * Exports
 */

module.exports.Controller = Controller;
module.exports.Ledger = Ledger;
module.exports.Token = Token;
module.exports.ControllerEventDefinitions = ControllerEventDefinitions; 
module.exports.DummyToken = DummyToken;
module.exports.Finalizable = Finalizable;
module.exports.IToken = IToken;
module.exports.Owned = Owned;
module.exports.Pausable = Pausable;
module.exports.SafeMath = SafeMath;
module.exports.TokenReceivable = TokenReceivable;
module.exports.foundation = foundation;
module.exports.Migration = Migration;
module.exports.SafeMathTester = SafeMathTester;

module.exports.padLeft = padLeft;
module.exports.addressValue = addressValue;
module.exports.searchForEvent = searchForEvent;
module.exports.transactionMined = transactionMined;
module.exports.confirmTransactionValid = confirmTransactionValid;
