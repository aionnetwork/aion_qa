require('../common.js');
const daemon = require('./miner-pool-daemon.js');

let blkNum;

describe.skip('getBlockByHeader', () => {
    it('cmd-call', () => {

        blkNum = web3.eth.blockNumber;
        let blk = web3.eth.getBlock(blkNum);
        let parentHash = web3.eth.getBlock(blkNum).hash;
        setTimeout(() => {
            daemon.cmd('getHeaderByBlockNumber', [blkNum], function (response) {
                  console.log('[log] result for block', blkNum, ':', response);
                let solution = response.result.solution;
                let headerHash = response.result.headerHash;
                let coinbase = response.result.blockHeader.coinBase;
                let trieRoot = response.result.blockHeader.txTrieRoot;
                let diff = response.result.blockHeader.difficulty;
                let stateRoot = response.result.blockHeader.stateRoot;
                let parent = response.result.blockHeader.parentHash;
                let nonce = response.result.nonce;

                expect(solution).to.be.a('String');
                expect('0x' + solution).to.equal(blk.solution);

                expect(headerHash).to.be.a('String');
                expect(headerHash).to.have.lengthOf(64);

                //expect(headerHash).to.equal(blk.hash);

                expect(coinbase).to.be.a('String');
                expect(coinbase).to.have.lengthOf(64);

                expect(trieRoot).to.be.a('String');
                expect(trieRoot).to.have.lengthOf(64);

                expect(diff).to.be.a('String');
                expect(new BigNumber(diff, 16).isEqualTo(BigNumber(blk.difficulty))).to.equal(true);

                expect(stateRoot).to.be.a('String');
                expect(stateRoot).to.have.lengthOf(64);

                expect(parent).to.be.a('String');
                expect(parent).to.have.lengthOf(64);
                //expect(parentHash).to.equal(parent);

                expect(nonce).to.be.a('String');
                expect(nonce).to.have.lengthOf(64);

            });
        }, 1000)
    }).timeout(0)

});
