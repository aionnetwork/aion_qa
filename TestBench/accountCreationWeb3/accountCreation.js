#!/usr/bin/env nodejs
const fs = require('fs');
const args = require('./common.js');

const sol = fs.readFileSync(__dirname + '/contracts/Accounts.sol', {
    encoding: 'utf8'
});

let pw0 = args.mainAccountPass;
let a0 = args.mainAccount;
let contractInstance, abi, code, contractAddr;

compile(web3, sol).then((res) => {

    abi = res.Accounts.info.abiDefinition;
    code = res.Accounts.code;
    if (args.contractAddress.length !== 66) {
        deploy(web3, a0, pw0, abi, code)
            .then((tx) => {
                contractAddr = tx.address;
                web3.eth.sendTransaction({from: a0, to: contractAddr, value: args.initialVal});
                sendTransactions();
            });
    }
    else {
        console.log('[log] using existing contract', args.contractAddress);
        contractAddr = args.contractAddress;
        sendTransactions();
    }


});

function sendTransactions() {
    contractInstance = web3.eth.contract(abi).at(contractAddr);
    unlock(web3, a0, pw0);
    let i = 0;
    let itv;

    itv = setInterval(() => {
        let tx = contractInstance.sendManyTransaction(args.internalIterationCount, args.transferVal, {
            from: a0,
            gas: 4500000
        });
        console.log(i, tx);
        i++;
        if (i === args.externalIterationCount) {
            clearInterval(itv);
        }
    }, args.intervalTime);
}

