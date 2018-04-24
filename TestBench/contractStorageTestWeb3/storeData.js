#!/usr/bin/env nodejs
const fs = require('fs');
const args = require('./common.js');

const sol = fs.readFileSync(__dirname + '/contracts/Data.sol', {
    encoding: 'utf8'
});

let a0 = args.mainAccount;
let pw0 = args.mainAccountPass;
let contractAddr, contractInstance, abi, code;

compile(web3, sol).then((res) => {
    abi = res.Data.info.abiDefinition;
    code = res.Data.code;

    if (args.contractAddress.length === 66) {
        console.log('[log] using existing contract', args.contractAddress);
        contractAddr = args.contractAddress;
        sendTransactions();
    }
    else {
        deploy(web3, a0, pw0, abi, code)
            .then((tx) => {
                contractAddr = tx.address;
                console.log('[log] contract address ' + tx.address);
                sendTransactions();

            }, (err) => {
                console.log(err);
            });
    }

});

function sendTransactions() {
    contractInstance = web3.eth.contract(abi).at(contractAddr);

    let i = contractInstance.getLastNumber().toNumber();

    unlock(web3, a0, pw0).then(
        setInterval(() => {

            let hash = contractInstance.testStorage(i, 'prop-' + i, args.iteration, {
                from: a0,
                gas: 1500000,
                gasPrice: 10000000000
            });
            console.log('tx', i, hash);
            i++;

        }, args.intervalTime));
}


