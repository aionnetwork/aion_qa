const daemon = require('./miner-pool-daemon.js');
require('../common.js');


describe('getBlockTemplate', () => {
    it('cmd-call', (done) => {

        let blkNum = web3.eth.blockNumber;
        daemon.cmd('getblocktemplate', [{"capabilities": ["coinbasetxn", "workid", "coinbase/append"]}], function (response) {
            console.log('[log] getBlocTemplate result:', response);
            let res = response.result;
            expect(res.headerHash).to.be.a('String');
            expect(res.headerHash).to.have.lengthOf(64);

            expect(res.previousblockhash).to.be.a('String');
            expect(res.previousblockhash).to.have.lengthOf(64);

            expect(res.height).to.be.a('Number');
            expect(res.height).to.be.above(blkNum);

            expect(res.transactions).to.be.an('Array');

            expect(res.blockHeader.coinBase).to.be.a('String');
            expect(res.blockHeader.coinBase).to.have.lengthOf(64);

            expect(res.blockHeader.txTrieRoot).to.be.a('String');
            expect(res.blockHeader.txTrieRoot).to.have.lengthOf(64);

            expect(res.blockHeader.stateRoot).to.be.a('String');
            expect(res.blockHeader.stateRoot).to.have.lengthOf(64);

            expect(res.blockHeader.parentHash).to.be.a('String');
            expect(res.blockHeader.parentHash).to.have.lengthOf(64);

            expect(res.blockHeader.difficulty).to.be.a('String');
            expect(new BigNumber(res.blockHeader.difficulty, 16).isGreaterThan(BigNumber(0))).to.equal(true);

            //var target = new BigNumber(res.target, 16);
            //console.log(target.toString(10));
            //let expectedTarget = BigNumber(2).pow(256).div(new BigNumber(res.blockHeader.difficulty, 16)).integerValue();
            //console.log(expectedTarget.toString(16))
            //expect(expectedTarget.isEqualTo(BigNumber(res.target, 16))).to.equal(true);
            done()

        });

    }).timeout(0);
});