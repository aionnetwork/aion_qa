require('../common.js');

describe('eth_getGasPrice', () => {

    it('sync', () => {
        let gas = web3.eth.gasPrice;
        expect(BigNumber.isBigNumber(gas)).to.equal(true);
        expect(BigNumber(gas).isGreaterThan(0)).to.equal(true);
    });

    it('async', (done) => {
        web3.eth.getGasPrice((err, gas) => {
            expect(BigNumber.isBigNumber(gas)).to.equal(true);
            expect(BigNumber(gas).isGreaterThan(0)).to.equal(true);
            done();
        })
    }).timeout(0);

});


