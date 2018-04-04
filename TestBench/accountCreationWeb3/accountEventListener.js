const fs = require('fs');
const args = require('./common.js');

const sol = fs.readFileSync(__dirname + '/contracts/Accounts.sol', {
    encoding: 'utf8'
});

let contractAddr = args.contractAddress;
let contractInstance, abi, code;
let j = 0;


compile(web3, sol).then((res) => {
    abi = res.Accounts.info.abiDefinition;
    code = res.Accounts.code;
    contractInstance = web3.eth.contract(abi).at(contractAddr);
    let blk = web3.eth.blockNumber;

    let events = contractInstance.Transfer({fromBlock: blk, toBlock: 'latest'});
    events.watch(function (error, result) {
        if (!error) {
            console.log("event", j, "for acc-" + result.args._count.toString(), result.args._accountAddress, "received");
            let res = web3.eth.getBalance(result.args._accountAddress);
            if(res.toString() !== '1'){
                console.log('[ERROR] balance for', result.args._accountAddress, 'is', res.toString());
            }
            j++;
        }
        else {
            console.log(error);
        }
    });
});






