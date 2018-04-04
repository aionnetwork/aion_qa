const Web3 = require('../../../aion-web3');
module.exports.provider = "http://localhost:8545";
global.web3 = new Web3(new Web3.providers.HttpProvider(this.provider));

/**
 * main account for sending transactions
 */
module.exports.mainAccount = web3.personal.listAccounts[0]; //web3.eth.coinbase
module.exports.mainAccountPass = ''; //change to match account info

module.exports.contractAddress = '';
module.exports.intervalTime = 10000;
module.exports.iteration = 5;


global.unlock = require('./unlock.js');
global.compile = require('./contracts/compile.js');
global.deploy = require('./contracts/deploy.js');
