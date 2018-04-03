const args = require('../../common.js');
const fs = require('fs');
const compile = require('./compile.js');
const deploy = require('./deploy.js');
let a0 = args.mainAccount;
let pw0 = args.mainAccountPass;

const sol = fs.readFileSync(__dirname + '/personnel.sol', {
    encoding: 'utf8'
});

compile(web3, sol).then((res) => {
    abi = res.Personnel.info.abiDefinition;
    code = res.Personnel.code;
    deploy(web3, a0, pw0, abi, code).then((tx) => {
        if (tx) {
            contractAddr = tx.address;
            console.log('[log] contract address ' + tx.address);
        }
    })
});


