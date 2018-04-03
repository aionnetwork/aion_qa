const args = require('../common.js');

let pass = args.mainAccountPass;
let txHash;
let mainAccount = args.mainAccount;
let secondaryAcc = args.secondaryAccounts[0];
let sleepTime = args.sleepTime;

describe('eth_sendTransaction', () => {

    it('async-sendTransaction', (done) => {
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

    it('get-transaction-receipt & info', () => {
        let receipt = web3.eth.getTransactionReceipt(txHash);
        let tx = web3.eth.getTransaction(txHash);

        let blockNumRec = receipt.blockNumber;
        let senderRec = receipt.from;
        let recHash = receipt.transactionHash;

        let blockNumTx = tx.blockNumber;
        let senderTx = tx.from;
        let hash = tx.hash;
        let value = tx.value;

        expect(recHash).to.equal(hash);
        expect(blockNumRec).to.equal(blockNumTx);
        expect(blockNumTx).to.not.equal(0);
        expect(senderRec).to.equal(senderTx);
        expect(senderTx).to.equal(mainAccount);
        expect(value.isEqualTo(BigNumber(1))).to.equal(true);
    });
}).timeout(0);

it('async-sendTransaction-with-data', (done) => {
    unlock(web3, mainAccount, pass);
    web3.eth.sendTransaction({
        from: mainAccount,
        to: secondaryAcc,
        value: 1,
        data: web3.toHex('John Doe sent you a message')
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

it('get-transaction-data', () => {
    let tx = web3.eth.getTransaction(txHash);
    let data = tx.input;
    expect(data).to.equal(web3.toHex('John Doe sent you a message'))

});

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


