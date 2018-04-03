require('../common.js');

describe('eth_syncing', () => {
    it('sync', () => {
        let syncing = web3.eth.syncing;
        console.log(syncing)
        expect(syncing).to.be.an('Object');
        expect(syncing.currentBlock).to.be.a('number');
        expect(syncing.highestBlock).to.be.a('number');
        expect(syncing.startingBlock).to.be.a('number');

    });
    it('async', (done) => {
        web3.eth.getSyncing((err, syncing) => {
            if (err)
                done(err);
            else {
                expect(syncing).to.be.an('Object');
                expect(syncing.currentBlock).to.be.a('number');
                expect(syncing.highestBlock).to.be.a('number');
                expect(syncing.startingBlock).to.be.a('number');
                done();
            }

        });
    });
});