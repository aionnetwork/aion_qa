const args = require('../common.js');

let correctPw = args.mainAccountPass,
    wrongAddr = '0xa1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1',
    wrongPw = 'wrong';
let account = args.mainAccount;

describe('personal_unlockAccount', () => {
    it('sync', (done) => {

        let unlock = web3.personal.unlockAccount(account, correctPw);
        expect(unlock).to.equal(true);

        unlock = web3.personal.unlockAccount(account, correctPw, 9999);
        expect(unlock).to.equal(true);

        unlock = web3.personal.unlockAccount(account, wrongPw);
        expect(unlock).to.equal(false);

        unlock = web3.personal.unlockAccount(wrongAddr, wrongPw, 9999);
        expect(unlock).to.equal(false);
        done();
    }).timeout(0);

    it('async', (done) => {

        web3.personal.unlockAccount(account, correctPw, 9999, (err, unlock) => {
            if (err)
                done(err);
            if (unlock) {
                expect(unlock).to.equal(true);
                done();
            }
        });
        web3.personal.unlockAccount(account, wrongPw, 9999, (err, unlock) => {
            if (err)
                done(err);
            if (unlock) {
                expect(unlock).to.equal(false);
                done();
            }
        });
        web3.personal.unlockAccount(wrongAddr, correctPw, 9999, (err, unlock) => {
            if (err)
                done(err);
            if (unlock) {
                expect(unlock).to.equal(false);
                done();
            }
        });

    }).timeout(0);
});
