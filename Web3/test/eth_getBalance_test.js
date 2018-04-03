const args = require('../common.js');

let account = args.mainAccount;

describe('eth_getBalance', () => {
    it('sync', () => {
        let balance = web3.eth.getBalance(account);
        expect(BigNumber.isBigNumber(balance)).to.equal(true);
        if (account === web3.eth.coinbase) {
            expect(balance.isGreaterThan(0)).to.equal(true);
        }
    }).timeout(0);

    it('async', (done) => {
        web3.eth.getBalance(account, (err, balance) => {
            if (err)
                done(err);
            else {
                expect(BigNumber.isBigNumber(balance)).to.equal(true);
                done();
            }
        });
    }).timeout(0);
});