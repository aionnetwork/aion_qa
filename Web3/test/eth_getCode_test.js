const fs = require('fs');
const args = require('../common.js');
const compile = require('./contracts/compile.js');
const deploy = require('./contracts/deploy.js');

const sol = fs.readFileSync(__dirname + '/contracts/personnel.sol', {
    encoding: 'utf8'
});

let pw0 = args.mainAccountPass;
let a0 = args.mainAccount;

let contractAddr, abi, compiledCode, txHash;

describe('eth_getCode', () => {
    it('contract-compile', (done) => {
        compile(web3, sol)
            .then((res) => {
                abi = res.Personnel.info.abiDefinition;
                compiledCode = res.Personnel.code;
                done();
            });
    }).timeout(0);

    it('contract-deploy', (done) => {
        deploy(web3, a0, pw0, abi, compiledCode)
            .then((tx) => {
                console.log('[log] tx hash:' + tx.transactionHash);
                txHash = tx.transactionHash;
                expect(tx.abi).to.eql(abi);
                contractAddr = tx.address;
                console.log('[log] contract address ' + tx.address);
                done();
            }, (err) => {
                done(err);
            });
    }).timeout(0);

    it('getCode', () => {
        let input = web3.eth.getTransaction(txHash).input;
        expect(input).to.equal(compiledCode);
        let code = web3.eth.getCode(contractAddr);
        expect(code).to.be.a('String');
    }).timeout(0);
});