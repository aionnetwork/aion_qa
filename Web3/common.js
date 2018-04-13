/**
 * pointing to aion-web3 directory location
*/
const Web3 = require('../../aion-web3');
module.exports.provider = "http://localhost:8545";
global.web3 = new Web3(new Web3.providers.HttpProvider(this.provider));

/**
 * main account for sending transactions
 */
module.exports.mainAccount = web3.personal.listAccounts[0];//web3.eth.coinbase;
module.exports.mainAccountPass = ''; //change to match account info
module.exports.secondaryAccounts = web3.personal.listAccounts.filter(acc => acc !== this.mainAccount);

module.exports.sleepTime = 10000;
module.exports.contractAddress = '';

global.expect = require("chai").expect;
global.unlock = require('./unlock.js');
global.BigNumber = require('bignumber.js');
global.compile = require('./test/contracts/compile.js');
global.deploy = require('./test/contracts/deploy.js');

//required for send_multiple_transactions_test
module.exports.sendTransactionIteration = 1;
module.exports.sendTransactionValue = 10;
