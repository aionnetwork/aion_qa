require('../common.js');
let miner = web3.eth.coinbase;


describe('personal_listAccounts', () => {

    it('sync', () => {
        let accounts = web3.personal.listAccounts;
        expect(accounts).to.not.be.undefined;
        expect(accounts).to.be.an('Array');
        expect(accounts.length >= 0).to.equal(true);
        if (miner !== '0x0000000000000000000000000000000000000000000000000000000000000000' && web3.eth.mining) {
            expect(accounts).to.include(miner);
        }
    }).timeout(0);

});
