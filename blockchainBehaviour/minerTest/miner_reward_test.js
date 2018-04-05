const Web3 = require('../../../aion-web3');
let web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
var BigNumber = require('bignumber.js');

//precision for miner balance
let precision = 10;

async function checkBalance() {

    let account = web3.eth.coinbase;
    let currentBlock = web3.eth.blockNumber;
	//TODO: (fix after feature implemented)
	// let balCurrentBlock = await (w3.eth.getBalance(account, currentBlock).shiftedBy(-18));
    let balCurrentBlock = await (web3.eth.getBalance(account).shiftedBy(-18));
    let nextBlock = web3.eth.blockNumber;
    console.log('Waiting for next block generation ...')
    while (nextBlock < currentBlock +1) {
        await sleep(4000);
        nextBlock = web3.eth.blockNumber;
        console.log('current block: ', nextBlock, '- expected block: ', currentBlock+1);
    }

	//TODO: (fix after feature implemented)
	// let balNextBlock = await(w3.eth.getBalance(account, nextBlock).shiftedBy(-18).toPrecision(precision));
    let balNextBlock = await(web3.eth.getBalance(account).shiftedBy(-18).toPrecision(precision));

    let reward = rewardsCalculator(nextBlock);

    let expected  = balCurrentBlock.plus(reward).toPrecision(precision);
    console.log('------------------------------------------------------------------------------')
    console.log('balance - block' , currentBlock, ':', balCurrentBlock.toPrecision(precision).toString());
    console.log('expected balance    :' , expected.toString());
    console.log('balance - block',nextBlock, ':', balNextBlock.toString());
    console.log('------------------------------------------------------------------------------\n')
    if(BigNumber(balNextBlock).minus(expected).isEqualTo(BigNumber(0))){
        console.log('Test passed.')
    }
    else {
        console.log('difference is', BigNumber(balNextBlock).minus(expected))
    }
}

checkBalance();


function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function rewardsCalculator(blockNumber){
    let m;
    let blockReward =  new BigNumber (1500000000000000000);
    let dividend =  new BigNumber(1000000000000000000);
    let rampUpLowerBound = 0;
    let rampUpUpperBound = 259200;
    let delta = rampUpUpperBound - rampUpLowerBound;
    m = blockReward.dividedBy(BigNumber(delta));
    if (blockNumber <= rampUpUpperBound) {
        return new BigNumber(BigNumber(blockNumber).times(m)).dividedBy(dividend);
    } else {
        return new BigNumber(blockReward).dividedBy(dividend);
    }
}
