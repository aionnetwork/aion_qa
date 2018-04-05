#!/usr/bin/env nodejs
const fs = require('fs');
const args = require('./common.js');

const sol = fs.readFileSync(__dirname + '/contracts/Data.sol', {
    encoding: 'utf8'
});

let contractAddr = args.contractAddress;
let contractInstance, abi;


compile(web3, sol).then((res) => {
    abi = res.Data.info.abiDefinition;

    contractInstance = web3.eth.contract(abi).at(contractAddr);
    let j = 0;
    let currBlock = web3.eth.blockNumber;

    let events = contractInstance.allEvents({fromBlock: currBlock, toBlock: 'latest'});
    events.watch(function (error, result) {
        if (!error) {
            console.log("event#", j, "for data", result.args._i.toString(), "received");
            j++;
        }
        else {
            console.log(error);
        }

    });
}, (err) => {
    console.log(err);
});


