const fs = require('fs');
const args = require('../common.js');

const sol = fs.readFileSync(__dirname + '/contracts/personnel.sol', {
    encoding: 'utf8'
});

let pw0 = args.mainAccountPass;
let a0 = args.mainAccount;
let acc1 = args.secondaryAccounts[0];
let contractAddr, contractInstance, hash, abi, code;

describe('eth_call', () => {

    it('contract-compile', (done) => {
        compile(web3, sol).then((res) => {
            abi = res.Personnel.info.abiDefinition;
            code = res.Personnel.code;
            done();
        }, (err) => {
            done(err);
        })
    }).timeout(0);

    it('contract-deploy', (done) => {
        if (args.contractAddress.length === 66) {
            console.log('[log] using existing contract', args.contractAddress);
            contractAddr = args.contractAddress;
            done();
        }
        else {
            deploy(web3, a0, pw0, abi, code)
                .then((tx) => {
                    contractAddr = tx.address;
                    console.log('[log] contract address ' + tx.address);
                    done();
                }, (err) => {
                    done(err);
                });
        }
    }).timeout(0);

    it('add-user', () => {
        contractInstance = web3.eth.contract(abi).at(contractAddr);

        unlock(web3, a0, pw0);
        hash = contractInstance.addUser('Jd-14', acc1, '0x00', {from: a0});
        console.log('[log] tx hash', hash);

        while (web3.eth.getTransactionReceipt(hash) === null) {
            sleep(args.sleepTime);
        }

        let addr = contractInstance.getUserAddress('Jd-14');
        expect(addr).to.equal(acc1);
    }).timeout(0);

});

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}