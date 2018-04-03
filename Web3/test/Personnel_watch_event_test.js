const fs = require('fs');
const args = require('../common.js');

const sol = fs.readFileSync(__dirname + '/contracts/personnel.sol', {
    encoding: 'utf8'
});

let pw0 = args.mainAccountPass;
let a0 = args.mainAccount;
let acc1 = args.secondaryAccounts[0];
let contractAddr, events, contractInstance, abi, code, prevBlock;
let sleepTime = args.sleepTime;

describe('event-watch', () => {

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

    /**
     * watch allEvents after transaction, check argument values
     */
    it('watch-allEvents', (done) => {
        contractInstance = web3.eth.contract(abi).at(contractAddr);
        let tx = contractInstance.addUser('Jd-01', acc1, '0x00', {from: a0});
        events = contractInstance.allEvents({fromBlock: 0, toBlock: 'latest'});
        events.watch(function (error, result) {
            if (!error) {
                console.log('[log] allEvents watch result', result);
                prevBlock = result.blockNumber;
                expect(result.address).to.equal(contractAddr);
                expect(result.blockHash).to.be.a('String');
                expect(result.blockHash).to.have.lengthOf(66);
                expect(result.blockNumber).to.be.a('Number');
                expect(result.transactionHash).to.be.a('String');
                expect(result.transactionHash).to.equal(tx);
                expect(result.event).to.equal('UserAdded');
                expect(result.args._stamp).to.equal('Jd-01');
                done()
            }
            else {
                done(error);
            }
        });
    }).timeout(0);

    it('uninstall-allEvents-watch', (done) => {
        events.stopWatching();
        console.log('[log] watching stopped');
        done();
    }).timeout(0);

    /**
     * watch for event after transaction, check data values
     */
    it('watch-UserAdded-event', (done) => {
        let currBlock = web3.eth.blockNumber;
        while (currBlock === prevBlock) {
            sleep(sleepTime);
            currBlock = web3.eth.blockNumber;
        }

        let tx = contractInstance.addUser('Jd-02', acc1, '0x00', {from: a0});

        events = contractInstance.UserAdded({}, {fromBlock: currBlock, toBlock: 'latest'});
        events.watch(function (error, result) {
            if (!error) {
                console.log('[log] watch UserAdded result', result);
                prevBlock = result.blockNumber;
                expect(result.transactionHash).to.be.a('String');
                expect(result.transactionHash).to.equal(tx);
                expect(result.event).to.equal('UserAdded');
                expect(result.args._stamp).to.equal('Jd-02');
                done();
            }
            else {
                done(error);
            }
        });

    }).timeout(0);

    it('uninstall-UserAdded-watch', (done) => {
        events.stopWatching();
        console.log('[log] watching stopped');
        done();
    }).timeout(0);

    /**
     * different events of type addAddress, addUser
     * filter for UserAdded type event
     */
    it('watch-UserAdded-event-2', (done) => {
        let currBlock = web3.eth.blockNumber;
        while (currBlock === prevBlock) {
            sleep(sleepTime);
            currBlock = web3.eth.blockNumber;
        }

        let tx = contractInstance.addAddress('Jd-03', acc1, {from: a0});
        let tx2 = contractInstance.addUser('Jd-04', acc1, '0x00', {from: a0});

        console.log('[log] user address tx hash', tx);
        console.log('[log] user add tx hash', tx2);

        events = contractInstance.UserAdded({}, {fromBlock: currBlock, toBlock: 'latest'});
        events.watch(function (error, result) {
            if (!error) {
                console.log('[log] watch UserAdded result(2)', result);
                prevBlock = result.blockNumber;
                expect(result.transactionHash).to.be.a('String');
                expect(result.transactionHash).to.equal(tx2);
                expect(result.event).to.equal('UserAdded');
                expect(result.args._stamp).to.equal('Jd-04');
                done();
            }
            else {
                done(error);
            }
        });
    }).timeout(0);

    it('uninstall-UserAdded-watch', (done) => {
        events.stopWatching();
        console.log('[log] watching stopped');
        done();
    }).timeout(0);

    /**
     * multiple events of type AddressAdded, with different argument values
     * filter for one
     */
    it('watch-AddressAdded-event-with-argument', (done) => {
        contractInstance = web3.eth.contract(abi).at(contractAddr);
        let currBlock = web3.eth.blockNumber;
        let tx = contractInstance.addAddress('Jd-05', acc1, {from: a0});
        let tx2 = contractInstance.addAddress('Jd-06', a0, {from: a0});

        console.log('[log] user address tx hash', tx);
        console.log('[log] user add tx hash', tx2);

        events = contractInstance.AddressAdded({_addr: a0}, {fromBlock: currBlock, toBlock: 'latest'});
        events.watch(function (error, result) {
            if (!error) {
                console.log('[log] watch AddressAdded result', result);
                expect(result.transactionHash).to.be.a('String');
                expect(result.transactionHash).to.equal(tx2);
                expect(result.event).to.equal('AddressAdded');
                expect(result.args._addr).to.equal(a0);
                done();
            }
            else {
                done(error);
            }
        });
    }).timeout(0);

    it('uninstall-UserAdded-watch', (done) => {
        events.stopWatching();
        console.log('[log] watching stopped');
        done();
    }).timeout(0);

    it('get-user', () => {
        expect(contractInstance.getUserAddress('Jd-01')).to.equal(acc1);
        expect(contractInstance.getUserAddress('Jd-02')).to.equal(acc1);
        expect(contractInstance.getUserAddress('Jd-03')).to.equal(acc1);
        expect(contractInstance.getUserAddress('Jd-04')).to.equal(acc1);
        expect(contractInstance.getUserAddress('Jd-05')).to.equal(acc1);
        expect(contractInstance.getUserAddress('Jd-06')).to.equal(a0);
    }).timeout(0);

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
});
