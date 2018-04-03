const args = require('../common.js');

let minerAccount = args.mainAccount;
let acc1 = args.secondaryAccounts[0];

describe('eth_estimateGas', () => {
    it('sync', () => {
        let res = web3.eth.estimateGas({
            from: minerAccount, to: acc1, amount: 10
        });
        console.log('[log] sync estimateGas result', res);
        expect(res).to.be.a('Number');
        expect(res).to.be.above(0);
    });

    it('async', (done) => {
        web3.eth.estimateGas({
            from: minerAccount, to: acc1, amount: 10
        }, (err, res) => {
            if (err)
                done(err);
            if (res) {
                console.log('[log] async estimateGas result', res);
                expect(res).to.be.a('Number');
                expect(res).to.be.above(0);
                done();
            }
        });
    });
});
