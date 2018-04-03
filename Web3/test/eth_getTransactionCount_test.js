const args = require('../common.js');

let pw = args.mainAccountPass;
let mainAccount = args.mainAccount;
let acc1 = args.secondaryAccounts[0];
let res, blkNum;
let sleepTime = args.sleepTime;

describe('eth_getTransactionCount', () => {
    it('sync', (done) => {

        blkNum = web3.eth.blockNumber;
        res = web3.eth.getTransactionCount(mainAccount);
        console.log('[log] sync transaction count for account', mainAccount, 'at current block(', blkNum, ') :', res);
        expect(res).to.be.a('Number');

        unlock(web3, mainAccount, pw);
        let tx = web3.eth.sendTransaction({
            from: mainAccount,
            to: acc1,
            value: 10
        });
        console.log('[log] Tx hash ' + tx);

        while (web3.eth.getTransactionReceipt(tx) === null) {
            sleep(sleepTime);
        }

        let newRes = web3.eth.getTransactionCount(mainAccount);
        console.log('[log] Updated sync transaction count:', newRes);
        expect(newRes).to.be.a('Number');
        expect(newRes).to.equal(++res);
        done();

    }).timeout(0);

    it('async', (done) => {
        web3.eth.getTransactionCount(mainAccount, (err, count) => {
            if (err)
                done(err);
            if (count) {
                console.log('[log] Updated async transaction count:', res);
                expect(count).to.be.a('Number');
                expect(count).to.be.equal(res);
                done();
            }
        });

    }).timeout(0);

    it('including-previous-blockNumber', (done) => {
        web3.eth.getTransactionCount(mainAccount, blkNum, (err, count) => {
            if (err)
                done(err);
            if (count) {
                console.log('[log] async transaction count at block', blkNum, ':', count);
                expect(count).to.be.a('Number');
                expect(count).to.be.equal(res - 1);
                done();
            }
        });

    }).timeout(0);

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
});
