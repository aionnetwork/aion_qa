#!/usr/bin/env node

var Web3 = require('/home/aion/aion/web3/lib/web3.js')
//var Moment = require('/home/aion/aion/web3/node_modules/moment/moment.js')
var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
var blockNumber = web3.eth.blockNumber;
var difficulty = web3.eth.getBlock(blockNumber).difficulty;
var Info = web3.eth.getBlock(blockNumber);

//console.log(difficulty.toNumber())
console.log(difficulty.toString())
