let Controller = artifacts.require('./Controller.sol');
let Ledger = artifacts.require("./Ledger.sol");
let Token = artifacts.require("./Token.sol");

// web3 already loaded by truffle

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

/**
 * Does all the dirtywork of setting up the contracts and
 * setting the controllers to eachother
 *
 * @return     {<type>}  { description_of_the_return_value }
 */
let deployAll = () => {
  p = new Promise((resolve, reject) => {
    c = {
      token: null,
      controller: null,
      ledger: null
    };

    Token.new().then((tokenInstance) => {
      Controller.new().then((controllerInstance) => {
        Ledger.new().then((ledgerInstance) => {
          c.token = tokenInstance;
          c.controller = controllerInstance;
          c.ledger = ledgerInstance;
        }).then(() => {
          return c.token.setController(c.controller.address);
        }).then((txid) => {
          return c.controller.setToken(c.token.address);
        }).then((txid) => {
          return c.controller.setLedger(c.ledger.address);
        }).then((txid) => {
          return c.ledger.setController(c.controller.address);
        }).then((txid) => {
          resolve(c);
        });
      });
    });
  });

  return p;
}

/**
 * Exports
 */

module.exports.Controller = Controller;
module.exports.Ledger = Ledger;
module.exports.Token = Token;

module.exports.padLeft = padLeft;
module.exports.addressValue = addressValue;
module.exports.deployAll = deployAll;