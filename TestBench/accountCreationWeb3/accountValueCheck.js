const fs = require('fs');
const args = require('./common.js');

const sol = fs.readFileSync(__dirname + '/contracts/Accounts.sol', {
    encoding: 'utf8'
});

let contractAddr = args.contractAddress;
let contractInstance, abi, code;

compile(web3, sol).then((res) => {
    abi = res.Accounts.info.abiDefinition;
    code = res.Accounts.code;
    contractInstance = web3.eth.contract(abi).at(contractAddr);

    contractInstance.initialAddress.call((err, res) => {
        console.log('initial account address ' + web3.toHex(res));
    });

    contractInstance.count.call((err, res) => {
        console.log('account count  ' + res);
    });

});




