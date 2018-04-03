require('../common.js');

let hash;

describe('eth_getBlock', () => {
    let blockNumber = web3.eth.blockNumber;
    console.log('[log] Getting block # ' + blockNumber);

    describe('eth_getBlockByNumber', () => {
        it('sync-noTransaction', () => {
            let block = web3.eth.getBlock(blockNumber, false);
            expect(block).to.be.an('object');

            expect(block.hash).to.be.a('String');
            expect(block.hash).to.have.lengthOf(66);
            expect(block.number).to.be.a('Number');
            expect(block.number).to.equal(blockNumber);
            expect(BigNumber.isBigNumber(block.totalDifficulty)).to.equal(true);
            expect(block.receiptsRoot).to.be.a('String');
            expect(block.receiptsRoot).to.have.lengthOf(66);
            expect(block.nonce).to.be.a('String');
            expect(block.nonce).to.have.lengthOf(66);
            expect(block.miner).to.be.a('String');
            expect(block.miner).to.have.lengthOf(66);
            expect(block.nrgUsed).to.be.a('Number');
            expect(block.transactionsRoot).to.be.a('String');
            expect(block.transactionsRoot).to.have.lengthOf(66);
            expect(block.stateRoot).to.be.a('String');
            expect(block.stateRoot).to.have.lengthOf(66);
            expect(block.parentHash).to.be.a('String');
            expect(block.parentHash).to.have.lengthOf(66);
            expect(block.timestamp).to.be.a('Number');

            hash = block.hash;
        });

        it('async-noTransaction', (done) => {
            web3.eth.getBlock(blockNumber, (err, block) => {
                if (err)
                    done(err);
                if (block) {
                    expect(block).to.be.an('object');
                    expect(block.number).to.equal(blockNumber);
                    done();
                }
            });
        }).timeout(0);

        it('sync-include-transaction-info', () => {
            let block = web3.eth.getBlock(blockNumber, true);
            expect(block).to.be.an('object');
            expect(block.number).to.equal(blockNumber);
            expect(block.transactions).to.be.an('Array');

        });

        it('async-include-transaction-info', (done) => {
            web3.eth.getBlock(blockNumber, true, (err, block) => {
                if (err)
                    done(err);
                if (block) {
                    expect(block).to.be.an('object');
                    expect(block.number).to.equal(blockNumber);
                    expect(block.transactions).to.be.an('Array');
                    done();
                }
            });
        }).timeout(0);
    });
    describe('eth_getBlockByHash', () => {
        it('sync-noTransaction', () => {
            let block = web3.eth.getBlock(hash, false);
            expect(block).to.be.an('object');
            expect(block.number).to.equal(blockNumber);
            expect(block.hash).to.equal(hash);
        });

        it('async-noTransaction', (done) => {
            web3.eth.getBlock(hash, (err, block) => {
                if (err)
                    done(err);
                if (block) {
                    expect(block).to.be.an('object');
                    expect(block.number).to.equal(blockNumber);
                    expect(block.hash).to.equal(hash);
                    done();
                }
            });
        }).timeout(0);

        it('sync-include-transaction-info', () => {
            let block = web3.eth.getBlock(hash, true);
            expect(block).to.be.an('object');
            expect(block.number).to.equal(blockNumber);
            expect(block.transactions).to.be.an('Array');
            expect(block.hash).to.equal(hash);
        });

        it('async-include-transaction-info', (done) => {
            web3.eth.getBlock(hash, true, (err, block) => {
                if (err)
                    done(err);
                if (block) {
                    expect(block).to.be.an('object');
                    expect(block.number).to.equal(blockNumber);
                    expect(block.transactions).to.be.an('Array');
                    expect(block.hash).to.equal(hash);
                    done();
                }
            });
        }).timeout(0);
    });

    describe('eth_getBlockParameter', () => {

        it('latest', () => {
            let blockNumber = web3.eth.blockNumber;
            let block = web3.eth.getBlock('latest');
            expect(block.hash).to.be.a('String');
            expect(block.hash).to.have.lengthOf(66);
            expect(block.number).to.be.a('Number');
            expect(block.number).to.be.at.least(blockNumber);
            expect(BigNumber.isBigNumber(block.totalDifficulty)).to.equal(true);
            expect(block.receiptsRoot).to.be.a('String');
            expect(block.receiptsRoot).to.have.lengthOf(66);
            expect(block.nonce).to.be.a('String');
            expect(block.nonce).to.have.lengthOf(66);
            expect(block.miner).to.be.a('String');
            expect(block.miner).to.have.lengthOf(66);
            expect(block.miner).to.equal(web3.eth.coinbase);
            expect(block.nrgUsed).to.be.a('Number');
            expect(block.transactionsRoot).to.be.a('String');
            expect(block.transactionsRoot).to.have.lengthOf(66);
            expect(block.stateRoot).to.be.a('String');
            expect(block.stateRoot).to.have.lengthOf(66);
            expect(block.parentHash).to.be.a('String');
            expect(block.parentHash).to.have.lengthOf(66);
            expect(block.timestamp).to.be.a('Number');

        });

        it('earliest', () => {
            let block = web3.eth.getBlock('earliest');
            expect(block.hash).to.be.a('String');
            expect(block.hash).to.have.lengthOf(66);
            expect(block.number).to.be.a('Number');
            expect(block.number).to.equal(0);
            expect(BigNumber.isBigNumber(block.totalDifficulty)).to.equal(true);
            expect(block.receiptsRoot).to.be.a('String');
            expect(block.receiptsRoot).to.have.lengthOf(66);
            expect(block.nonce).to.be.a('String');
            expect(block.nonce).to.have.lengthOf(66);
            expect(block.miner).to.be.a('String');
            expect(block.miner).to.have.lengthOf(66);
            expect(block.nrgUsed).to.be.a('Number');
            expect(block.transactionsRoot).to.be.a('String');
            expect(block.transactionsRoot).to.have.lengthOf(66);
            expect(block.stateRoot).to.be.a('String');
            expect(block.stateRoot).to.have.lengthOf(66);
            expect(block.parentHash).to.be.a('String');
            expect(block.parentHash).to.have.lengthOf(66);
            expect(block.timestamp).to.be.a('Number');

        });
    })
});


