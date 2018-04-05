const args = require('../common.js');

// number of transfer iterations
let iter = args.sendTransactionIteration;

// amount to transfer in each iteration
let txValue = args.sendTransactionValue;

let pass1 = args.mainAccountPass;
let size = 3;

//number of blocks to be mined before checking for tx receipt and balance
let blockWaitCount = 6;

let accounts = web3.personal.listAccounts;
//minimum of four accounts on kernel, transfer to three accounts
if (accounts.length < 4) {
    console.log('minimum of 4 accounts required for sending multiple transactions');
    return;
}

let senderAcc = args.mainAccount;
let receiverAccs = args.secondaryAccounts;

let transactions = [];
let acc0_0, acc1_0, acc2_0, acc3_0;

describe('balance-check-after-transfer', () => {

    it('initial-balance', () => {
        console.log('Testing for', iter, 'iterations, each for a value of', txValue, 'to 3 accounts');

        acc0_0 = web3.eth.getBalance(senderAcc);
        console.log('balance main_acc:' + acc0_0);

        acc1_0 = web3.eth.getBalance(receiverAccs[0]);
        console.log('balance acc1: ' + acc1_0);

        acc2_0 = web3.eth.getBalance(receiverAccs[1]);
        console.log('balance acc2: ' + acc2_0);

        acc3_0 = web3.eth.getBalance(receiverAccs[2]);
        console.log('balance acc3: ' + acc3_0);
        console.log('---------------------------------------------------------------');

    }).timeout(0);

    it('send-transaction', (done) => {

        unlock(web3, senderAcc, pass1);
        for (let i = 0; i < iter; i++) {
            for (let j = 0; j < 3; j++) {
                sendTransaction(senderAcc, receiverAccs[j], done);
            }
        }
    }).timeout(0);

    it('check-txReceipt-block-info', (done) => {

        let blocks = [];
        for (let i = 0; i < transactions.length; i++) {
            let receipt = web3.eth.getTransactionReceipt(transactions[i]);
            let tx = web3.eth.getTransaction(transactions[i]);

            let blockHash = receipt.blockHash;
            let blockNumRec = receipt.blockNumber;
            let senderRec = receipt.from;
            let TxHash = receipt.transactionHash;

            let blockNumTx = tx.blockNumber;
            let senderTx = tx.from;
            let hash = tx.hash;
            let value = tx.value;

            expect(hash).not.equal('0x');
            expect(TxHash).to.equal(hash);
            expect(blockNumTx).not.to.equal(0);
            expect(blockNumRec).to.equal(blockNumTx);
            expect(senderRec).to.equal(senderTx);
            expect(senderTx).to.equal(senderAcc);
            expect(value.isEqualTo(BigNumber(txValue))).to.equal(true);

            let blockByNum = web3.eth.getBlock(blockNumTx, true);
            expect(containsHash(blockByNum, hash)).to.equal(true);
            expect(blockByNum.transactions[tx.transactionIndex].nonce).to.equal(tx.nonce);

            if (!blocks.includes(blockNumTx)) {
                blocks.push(blockNumTx);
                let blockByHash = web3.eth.getBlock(blockHash, false);
                expect(isEquivalent(blockByNum, blockByHash)).to.equal(true);
            }
        }
        console.log('block number, sender, transaction hash of getTransaction & getTransactionReceipt matching completed');
        console.log('getBlock by number and hash matching completed');
        console.log('---------------------------------------------------------------');
        done()
    }).timeout(0);

    it('check-balance', (done) => {

        let acc1_1 = web3.eth.getBalance(receiverAccs[0]);
        console.log('new balance 1 ' + acc1_1);

        let acc2_1 = web3.eth.getBalance(receiverAccs[1]);
        console.log('new balance 2 ' + acc2_1);

        let acc3_1 = web3.eth.getBalance(receiverAccs[2]);
        console.log('new balance 3 ' + acc3_1);

        expect(acc1_1 - acc1_0).to.equal(iter * txValue);
        expect(acc2_1 - acc2_0).to.equal(iter * txValue);
        expect(acc3_1 - acc3_0).to.equal(iter * txValue);
        done();
    }).timeout(0)
});


let c = 1;

function sendTransaction(minerAccount, nonMinerAccounts, callback) {
    web3.eth.sendTransaction({
        from: minerAccount,
        to: nonMinerAccounts,
        value: txValue
    }, (err, tx) => {
        if (!err) {
            console.log('Tx hash ' + (c++) + ' ' + tx);
            transactions.push(tx);
            if (transactions.length === size * iter) {
                blockGenerationWait(callback);
            }
        }
        else {
            console.log('error occurred: ' + err)
        }
    });
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function blockGenerationWait(callback) {
    let currBlock = web3.eth.blockNumber;
    let expectedBlock = currBlock + blockWaitCount;
    console.log('---------------------------------------------------------------');
    console.log('Waiting for', blockWaitCount, 'block generation. \ncurrent block: ', currBlock, ' expected block: ', expectedBlock);
    while (currBlock < expectedBlock) {
        sleep(args.sleepTime);
        currBlock = web3.eth.blockNumber;
        console.log('current block: ', currBlock, ' expected block: ', expectedBlock);
    }
    console.log('---------------------------------------------------------------');
    callback();
}

function isEquivalent(blockByNum, blockByHash) {

    let aProps = Object.getOwnPropertyNames(blockByNum);
    let bProps = Object.getOwnPropertyNames(blockByHash);

    if (aProps.length !== bProps.length) {
        console.log('block field count failed');
        return false;
    }

    if (blockByNum.blockNumber !== blockByHash.blockNumber) {
        console.log('block number match failed');
        return false;
    }
    if (blockByNum.hash !== blockByHash.hash) {
        console.log('block hash match failed');
        return false;
    }
    if (blockByNum.transactionsRoot !== blockByHash.transactionsRoot) {
        console.log('block transactionsRoot match failed');
        return false;
    }
    return true;
}

function containsHash(block, hash) {
    let size = block.transactions.length;
    for (let i = 0; i < size; i++) {
        if (block.transactions[i].hash === hash) {
            return true;
        }
    }
    return false;
}
