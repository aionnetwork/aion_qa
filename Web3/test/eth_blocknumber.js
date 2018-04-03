require('../common.js');

describe('eth_blockNumber', () => {
    it('sync', () => {
        let blockNumber = web3.eth.blockNumber;
        expect(blockNumber).to.not.be.undefined;
        expect(blockNumber).to.be.a('number');
        expect(blockNumber >= 0).to.equal(true);
    });
    it('async', (done) => {
        web3.eth.getBlockNumber((err, blockNumber) => {
            if (err)
                done(err);
            if (blockNumber) {
                expect(blockNumber).to.not.be.undefined;
                expect(blockNumber).to.be.a('number');
                expect(blockNumber >= 0).to.equal(true);
                done();
            }
        });
    });
});