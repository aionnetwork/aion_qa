#!/usr/bin/env node

var Web3 = require('/home/aion/aion/web3/lib/web3.js')
var Moment = require('/home/aion/aion/web3/node_modules/moment/moment.js')
//console.log(Web3)
var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
var blockNumber = web3.eth.blockNumber;
var blockHash = web3.eth.getBlock(blockNumber).hash;
var timestamp = web3.eth.getBlock(blockNumber).timestamp;

//var TimeSinceEpoche = (new Date()).getTime();
var blkT = new Moment.unix(timestamp);
var nowT = new Moment(); 

console.log('lastBlockNumber: ' + blockNumber);
//console.log('SystemTime(): ' + nowT.format());
//console.log('blkTimestamp(): ' + blkT.format());

var duration = Moment.duration(nowT.diff(blkT));
var TimeDelta = duration.seconds();
//var diff = duration();

var nrpeOutput = 'TimeDelta: ' + TimeDelta + ' | ' + TimeDelta

//console.log('System time vs. lastBlock creation time: ' + TimeDelta + 'sec');
//console.log(nrpeOutput)
console.log('timeDelta -> currentTime vs. blockTime: ' + TimeDelta)
/*
if ((TimeDelta >= 0) && (TimeDelta <= 21)) {
    console.log('OK- ' + nrpeOutput);
    process.exit(0);
} else if ((TimeDelta > 21) && (TimeDelta <=70 )) {
    console.log('WARNING- ' + nrpeOutput);
    process.exit(1);
} else if (TimeDelta > 70) { 
    console.log('CRITICAL- ' + nrpeOutput);
    process.exit(2);
}
  else {
    console.log('UNKNOWN- ' + nrpeOutput);
    process.exit(3);
}
*/
