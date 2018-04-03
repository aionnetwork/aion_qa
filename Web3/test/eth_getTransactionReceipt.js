const fs = require('fs');
const args = require('../common.js');

const sol = fs.readFileSync(__dirname + '/contracts/personnel.sol', {
    encoding: 'utf8'
});

let pass = args.mainAccountPass;
let txHash, receipt, abi, code, contractAddr;
let mainAccount = args.mainAccount;
let secondaryAcc = args.secondaryAccounts[0];
let sleepTime = args.sleepTime;

describe('eth_getTransactionReceipt', () => {

    it('send-transaction', (done) => {

        unlock(web3, mainAccount, pass);
        web3.eth.sendTransaction({
            from: mainAccount,
            to: secondaryAcc,
            value: 1
        }, (err, tx) => {
            if (!err) {
                console.log('[log] Tx hash ' + tx);
                expect(tx).to.be.a('String');
                expect(tx).to.not.equal('0x');
                txHash = tx;
                while (web3.eth.getTransactionReceipt(tx) === null) {
                    sleep(sleepTime);
                }
                done();
            }
            else {
                console.log('error occurred: ' + err);
                done(err);
            }
        });
    }).timeout(0);

    it('getTransactionReceipt', () => {
        receipt = web3.eth.getTransactionReceipt(txHash);
        expect(receipt.blockHash).to.be.a('String');
        expect(receipt.blockHash).to.have.lengthOf(66);
        expect(receipt.blockNumber).to.be.a('Number');
        expect(receipt.blockNumber).to.be.above(0);
        expect(receipt.nrgUsed).to.be.a('Number');
        expect(receipt.nrgUsed).to.be.above(0);
        expect(receipt.from).to.be.a('String');
        expect(receipt.from).to.have.lengthOf(66);
        expect(receipt.from).to.equal(mainAccount);
        expect(receipt.to).to.be.a('String');
        expect(receipt.to).to.have.lengthOf(66);
        expect(receipt.to).to.equal(secondaryAcc);
        expect(receipt.transactionHash).to.be.a('String');
        expect(receipt.transactionHash).to.have.lengthOf(66);
        expect(receipt.transactionHash).to.equal(txHash);

    }).timeout(0);


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
        unlock(web3, mainAccount, pass);
        deploy(web3, mainAccount, pass, abi, code)
            .then((tx) => {
                txHash = tx.transactionHash;
                contractAddr = tx.address;
                console.log('[log] contract address ' + tx.address);
                done();
            }, (err) => {
                done(err);
            });
    }).timeout(0);

    it('get-contract-transaction-receipt', () => {
        while (web3.eth.getTransactionReceipt(txHash) === null) {
            sleep(sleepTime);
        }
        receipt = web3.eth.getTransactionReceipt(txHash);
        expect(receipt.contractAddress).to.be.a('String');
        expect(receipt.contractAddress).to.have.lengthOf(66);
        expect(receipt.contractAddress).to.equal(contractAddr);

        unlock(web3, mainAccount, pass);
        let contractInstance = web3.eth.contract(abi).at(contractAddr);
        let tx = contractInstance.addUser('Jd-16', mainAccount, '0x00', {from: mainAccount});
        while ((receipt = web3.eth.getTransactionReceipt(tx)) === null) {
            sleep(sleepTime);
        }
        expect(receipt.to).to.equal(contractAddr);

    }).timeout(0);

});

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


