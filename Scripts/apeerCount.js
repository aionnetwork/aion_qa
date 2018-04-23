#!/usr/bin/env node

var Web3 = require('/home/aion/aion/web3/lib/web3.js')
//var Moment = require('/home/aion/aion/web3/node_modules/moment/moment.js')

var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
var peerCount = web3.eth.getPeerCount;

web3.eth.getPeerCount().then(console.log);

//console.log(peerCount)

