/**
 * pointing to aion-web3 directory location
 */
const Web3 = require('../../../aion-web3');
module.exports.provider = "http://localhost:8545";
global.web3 = new Web3(new Web3.providers.HttpProvider(this.provider));

/**
 * main account for sending transactions
 */
module.exports.mainAccount =  web3.personal.listAccounts[0];//web3.eth.coinbase;
module.exports.mainAccountPass = ''; //change to match account info
module.exports.contractAddress = '';

module.exports.initialVal = 50000;
module.exports.externalIterationCount = 10;
module.exports.internalIterationCount = 40;
module.exports.transferVal = 1;
module.exports.intervalTime = 1000;

global.unlock = require('./unlock.js');
global.compile = require('./contracts/compile.js');
global.deploy = require('./contracts/deploy.js');
