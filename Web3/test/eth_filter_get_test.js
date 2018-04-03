const fs = require('fs');
const args = require('../common.js');

const sol = fs.readFileSync(__dirname + '/contracts/personnel.sol', {
    encoding: 'utf8'
});

let a0 = args.mainAccount;
let acc1 = args.secondaryAccounts[0];
let pw0 = args.mainAccountPass;
let contractAddr, contractInstance, abi, code;
let sleepTime = args.sleepTime;


describe('eth_filter_get', () => {

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

    it('get-filter', (done) => {
        contractInstance = web3.eth.contract(abi).at(contractAddr);
        let currBlock = web3.eth.blockNumber;
        unlock(web3, a0, pw0);
        let tx = contractInstance.addUser('Jd-13', acc1, '0x00', {from: a0});
        let receipt;
        while ((receipt = web3.eth.getTransactionReceipt(tx)) === null) {
            sleep(sleepTime);
        }

        let filter = web3.eth.filter({'fromBlock': currBlock, 'toBlock': 'latest', 'address': contractAddr});
        filter.get(function (error, result) {
            console.log('[log] eth_filter (options) ', result);
            expect(result[0].logIndex).to.be.a('Number');
            expect(result[0].transactionIndex).to.be.a('Number');
            expect(result[0].logIndex).to.equal(0);
            expect(result[0].transactionIndex).to.equal(0);
            expect(result[0].address).to.equal(contractAddr);
            expect(result[0].transactionHash).to.equal(tx);
            expect(result[0].blockNumber).to.equal(receipt.blockNumber);
            expect(result[0].blockHash).to.equal(receipt.blockHash);
            expect(result[0].data).to.be.a('String');
            expect(result[0].topics).to.be.an('Array');
            done();
        })
    }).timeout(0);

});

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}