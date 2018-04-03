const args = require('../common.js');
const fs = require('fs');

const sol = fs.readFileSync(__dirname + '/contracts/personnel.sol', {
    encoding: 'utf8'
});

let a0 = args.mainAccount;
let acc1 = args.secondaryAccounts[0];
let pw0 = args.mainAccountPass;
let contractAddr, contractInstance, abi, code;
let sleepTime = args.sleepTime;
let filter, filter2;

describe('eth_filter_watch', () => {

    it('contract-compile', (done) => {
        compile(web3, sol).then((res) => {
            abi = res.Personnel.info.abiDefinition;
            code = res.Personnel.code;
            done();
        }, (err) => {
            done(err);
        })

    }).timeout(0);

    it('contract-deploy', (done) => {
        if (args.contractAddress.length === 66) {
            console.log('[log] using existing contract', args.contractAddress);
            contractAddr = args.contractAddress;
            done();
        }
        else {
            deploy(web3, a0, pw0, abi, code)
                .then((tx) => {
                    contractAddr = tx.address;
                    console.log('[log] contract address ' + tx.address);
                    done();
                }, (err) => {
                    done(err);
                });
        }
    }).timeout(0);

    it('watch-latest', (done) => {

        filter = web3.eth.filter('latest');
        filter.watch(function (error, result) {
            if (error)
                done(error);
            else {
                console.log('[log] eth_filter (latest) blk hash', result);
                expect(result.length).to.equal(66);
                done()
            }
        });

    }).timeout(0);

    it('uninstall-watch', () => {
        filter.stopWatching();
        console.log('[log] watching stopped');
    }).timeout(0);


    it('watch-options', (done) => {

        unlock(web3, a0, pw0).then(() => {
            contractInstance = web3.eth.contract(abi).at(contractAddr);
            let currBlock = web3.eth.blockNumber;
            let tx = contractInstance.addUser('Jd-15', acc1, '0x00', {from: a0});
            let receipt;
            while ((receipt = web3.eth.getTransactionReceipt(tx)) === null) {
                sleep(sleepTime);
            }

            filter2 = web3.eth.filter({'fromBlock': currBlock, 'toBlock': 'latest', 'address': contractAddr});
            filter2.watch(function (error, result) {
                if (error)
                    done(error);
                else {
                    console.log('[log] eth_filter (options) ', result);

                    expect(result.logIndex).to.be.a('Number');
                    expect(result.transactionIndex).to.be.a('Number');
                    expect(result.logIndex).to.equal(0);
                    expect(result.transactionIndex).to.equal(0);
                    expect(result.address).to.equal(contractAddr);
                    expect(result.transactionHash).to.equal(tx);
                    expect(result.blockNumber).to.equal(receipt.blockNumber);
                    expect(result.blockHash).to.equal(receipt.blockHash);
                    expect(result.data).to.be.a('String');
                    expect(result.topics).to.be.an('Array');
                    done();
                }
            });
        });
    }).timeout(0);

    it('uninstall-watch', () => {
        filter2.stopWatching();
        console.log('[log] watching stopped');
    }).timeout(0);
});

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}