require('../common.js');
let miner = web3.eth.coinbase;

describe('eth_accounts with miner', () => {

    it('sync', () => {
        let accounts = web3.eth.accounts;
        expect(accounts).to.not.be.undefined;
        expect(accounts).to.be.an('Array');
        expect(accounts.length >= 0).to.equal(true);
        if (miner !== '0x0000000000000000000000000000000000000000000000000000000000000000') {
            expect(accounts).to.include(miner);
        }
    }).timeout(0);

    it('async', (done) => {
        web3.eth.getAccounts((err, accounts) => {
            if (err)
                done(err);
            expect(accounts).to.not.be.undefined;
            expect(accounts).to.be.an('Array');
            expect(accounts.length >= 0).to.equal(true);
            if (miner !== '0x0000000000000000000000000000000000000000000000000000000000000000') {
                expect(accounts).to.include(miner);
            }
            done();
        });
    }).timeout(0);


});
