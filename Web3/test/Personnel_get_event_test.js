const fs = require('fs');
const args = require('../common.js');

const sol = fs.readFileSync(__dirname + '/contracts/personnel.sol', {
    encoding: 'utf8'
});

let pw0 = args.mainAccountPass;
let a0 = args.mainAccount;
let acc1 = args.secondaryAccounts[0];
let contractAddr, contractInstance, events, abi, code, prevBlock;
let sleepTime = args.sleepTime;

describe('event-get', () => {

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

    it('get-allEvents', (done) => {
        contractInstance = web3.eth.contract(abi).at(contractAddr);
        let currBlock = web3.eth.blockNumber;
        let tx = contractInstance.addUser('Jd-07', acc1, '0x00', {from: a0});
        while (web3.eth.getTransactionReceipt(tx) === null) {
            sleep(sleepTime);
        }
        let currBlk = web3.eth.blockNumber;
        let expectedBlk = currBlk + 2;
        while (currBlk < expectedBlk) {
            sleep(sleepTime);
            currBlk = web3.eth.blockNumber;
        }

        events = contractInstance.allEvents({fromBlock: currBlock, toBlock: 'latest'});
        events.get(function (error, result) {
            console.log('[log] get allEvents result', result);
            prevBlock = result.blockNumber;
            expect(result.length).to.be.equal(1);
            expect(result[0].transactionHash).to.be.a('String');
            expect(result[0].event).to.equal('UserAdded');
            expect(result[0].args._stamp).to.equal('Jd-07');
            expect(result[0].address).to.equal(contractAddr);
            expect(result[0].blockHash).to.be.a('String');
            expect(result[0].blockHash).to.have.lengthOf(66);
            expect(result[0].blockNumber).to.be.a('Number');
            expect(result[0].transactionHash).to.equal(tx);
            done()
        })
    }).timeout(0);

    it('get-UserAdded-event', (done) => {
        let currBlock = web3.eth.blockNumber;
        let tx = contractInstance.addUser('Jd-08', acc1, '0x00', {from: a0});
        while (web3.eth.getTransactionReceipt(tx) === null) {
            sleep(sleepTime);
        }
        let currBlk = web3.eth.blockNumber;
        let expectedBlk = currBlk + 2;
        while (currBlk < expectedBlk) {
            sleep(sleepTime);
            currBlk = web3.eth.blockNumber;
        }
        events = contractInstance.UserAdded({}, {fromBlock: currBlock, toBlock: 'latest'});
        events.get(function (error, result) {
            console.log('[log] get UserAdded result', result);
            prevBlock = result.blockNumber;
            expect(result.length).to.be.above(0);
            expect(result[0].event).to.equal('UserAdded');
            expect(result[0].args._stamp).to.equal('Jd-08');
            done()
        });

    }).timeout(0);

    it('get-UserAdded-event-2', (done) => {
        let currBlock = web3.eth.blockNumber;
        let tx = contractInstance.addAddress('Jd-09', acc1, {from: a0});
        let tx2 = contractInstance.addUser('Jd-10', acc1, '0x00', {from: a0});

        console.log('[log] user address tx hash', tx);
        console.log('[log] user add tx hash', tx2);
        while (web3.eth.getTransactionReceipt(tx) === null ||
        web3.eth.getTransactionReceipt(tx2) === null) {
            sleep(sleepTime);
        }
        let currBlk = web3.eth.blockNumber;
        let expectedBlk = currBlk + 2;
        while (currBlk < expectedBlk) {
            sleep(sleepTime);
            currBlk = web3.eth.blockNumber;
        }
        events = contractInstance.UserAdded({}, {fromBlock: currBlock, toBlock: 'latest'});
        events.get(function (error, result) {
            if (!error) {
                console.log('[log] get UserAdded result(2)', result);
                prevBlock = result.blockNumber;
                expect(result[0].transactionHash).to.be.a('String');
                expect(result[0].transactionHash).to.equal(tx2);
                expect(result[0].event).to.equal('UserAdded');
                expect(result[0].args._stamp).to.equal('Jd-10');
                done();
            }
            else {
                done(error);
            }
        });
    }).timeout(0);

    it('get-AddressAdded-event-with-argument', (done) => {
        contractInstance = web3.eth.contract(abi).at(contractAddr);
        let currBlock = web3.eth.blockNumber;
        let tx = contractInstance.addAddress('Jd-11', acc1, {from: a0});
        let tx2 = contractInstance.addAddress('Jd-12', a0, {from: a0});

        console.log('[log] user address tx hash', tx);
        console.log('[log] user address tx hash (2)', tx2);
        while (web3.eth.getTransactionReceipt(tx) === null ||
        web3.eth.getTransactionReceipt(tx2) === null) {
            sleep(args.sleepTime);
        }
        let currBlk = web3.eth.blockNumber;
        let expectedBlk = currBlk + 2;
        while (currBlk < expectedBlk) {
            sleep(sleepTime);
            currBlk = web3.eth.blockNumber;
        }
        events = contractInstance.AddressAdded({_addr: a0}, {fromBlock: currBlock, toBlock: 'latest'});
        events.get(function (error, result) {
            if (!error) {
                console.log('[log] get AddressAdded result', result);
                expect(result[0].transactionHash).to.be.a('String');
                expect(result[0].transactionHash).to.equal(tx2);
                expect(result[0].event).to.equal('AddressAdded');
                expect(result[0].args._addr).to.equal(a0);
                done();
            }
            else {
                done(error);
            }
        });
    }).timeout(0);

    it('get-user', () => {
        expect(contractInstance.getUserAddress('Jd-07')).to.equal(acc1);
        expect(contractInstance.getUserAddress('Jd-08')).to.equal(acc1);
        expect(contractInstance.getUserAddress('Jd-09')).to.equal(acc1);
        expect(contractInstance.getUserAddress('Jd-10')).to.equal(acc1);
        expect(contractInstance.getUserAddress('Jd-11')).to.equal(acc1);
        expect(contractInstance.getUserAddress('Jd-12')).to.equal(a0);
    }).timeout(0);

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
});


