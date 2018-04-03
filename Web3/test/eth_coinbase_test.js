require('../common.js');

describe('eth_coinbase', () => {
    it('sync', () => {
        let coinbase = web3.eth.coinbase;
        expect(coinbase).to.be.a('String');
        expect(coinbase.length).to.equal(66);
        expect(coinbase.indexOf('0x')).to.equal(0);
    });
    it('async', (done) => {
        web3.eth.getCoinbase((err, coinbase) => {
            if (err)
                done(err);
            if (coinbase) {
                expect(coinbase).to.be.a('String');
                expect(coinbase.length).to.equal(66);
                expect(coinbase.indexOf('0x')).to.equal(0);
                done();
            }
        });
    }).timeout(0);
});
