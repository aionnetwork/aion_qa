const Web3 = require('/path/to/aion/web3');
const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

// 1. eth_getCompilers

// get list of available compilers
let compilers = web3.eth.getCompilers();

// print
console.log("available compilers: " + compilers + "\n");

// 2. eth_compileSolidity

// contract source code
const source_ticker = 'contract ticker { uint public val; function tick () { val+= 1; } }';

// compile code
let result = web3.eth.compile.solidity(source_ticker);

// print result
console.log(result);

// 3. eth_gasPrice

// get NRG price
let price = web3.eth.gasPrice

// print price
console.log("\ncurrent NRG price = " + price + " nAmp");

// 4. eth_estimateGas

// compile contract source code
result = web3.eth.compile.solidity(source_ticker);

// get NRG estimate for contract
let estimate = web3.eth.estimateGas({data:result.ticker.code});

// print estimate
console.log("\nNRG estimate for contract = " + estimate + " NRG");

// transaction data
let sender = 'a06f02e986965ddd3398c4de87e3708072ad58d96e9c53e87c31c8c970b211e5';
let receiver = 'a0bd0ef93902d9e123521a67bef7391e9487e963b2346ef3b3ff78208835545e';
let amount = 1000000000000000000; // = 1 AION
let data = '0x746573742e6d657373616765'; // hex for "test.message"

// get NRG estimate for transaction
estimate = web3.eth.estimateGas({data: data, from: sender, to: receiver, value: amount})

// print estimate
console.log("\nNRG estimate for transaction = " + estimate + " NRG");

// 5. eth_getCode

// set contract account
let ctAcc = 'a0960fcb7d6423a0446243916c7c6360543b3d2f9c5e1c5ff7badb472b782b79';

// get code from latest block
let code = web3.eth.getCode(ctAcc, 'latest');

// print code
console.log("\n" + code + "\n");

// 6. eth_getStorageAt

// view contract creation tx
let txHash = '0xb42a5f995450531f66e7db40efdfad2c310fa0f8dbca2a88c31fdc4837368e48';
let receipt = web3.eth.getTransactionReceipt(txHash);
console.log(receipt);

// set contract account
let contractAccount = receipt.contractAddress;

// get value from storage
let valuePos0 = web3.eth.getStorageAt(contractAccount, 0, 'latest');
let valuePos1 = web3.eth.getStorageAt(contractAccount, 1, 'latest');

// print values
// in this case the first two values are the contract owner
console.log("\nconcatenated values = " + valuePos0 + valuePos1);

// 7. deploy contract

// contract source code
const source_personnel = "contract Personnel { address public owner; modifier onlyOwner() { require(msg.sender == owner); _;} "
                + "mapping(bytes32 => address) private userList; /** 3 LSB bits for each privilege type */ "
                + "mapping(address => bytes1) private userPrivilege; function Personnel(){ owner = msg.sender; } "
                + "event UserAdded(string _stamp); event AddressAdded(address indexed _addr); "
                + "function getUserAddress(string _stamp) constant returns (address){ return userList[sha3(_stamp)]; } "
                + "function addUser(string _stamp, address _addr, bytes1 _userPrivilege) "
                + "onlyOwner{ userList[sha3(_stamp)] = _addr; userPrivilege[_addr] = _userPrivilege; "
                + "UserAdded(_stamp); } function addAddress(string _stamp, address _addr) "
                + "onlyOwner{ userList[sha3(_stamp)] = _addr; AddressAdded(_addr); } }";

// compile code
result = web3.eth.compile.solidity(source_personnel);
let abi = result.Personnel.info.abiDefinition;
code = result.Personnel.code;

// unlock owner
let owner = 'a06f02e986965ddd3398c4de87e3708072ad58d96e9c53e87c31c8c970b211e5';
let isUnlocked = web3.personal.unlockAccount(owner, "password", 100);
console.log("\nowner account " + (isUnlocked ? "unlocked" : "locked"));

// deploy contract
let response = web3.eth.contract(abi).new({from: owner, data: code, gasPrice: 10000000000, gas: 5000000});

// print response
txHash = response.transactionHash;
contractAccount = response.address;
// note that the address is not defined in the response
console.log("\ntransaction hash:\n\t" + txHash + "\ncontract address:\n\t" + contractAccount);

// get & print receipt
txReceipt = web3.eth.getTransactionReceipt(txHash);
// repeat till tx processed
while (txReceipt == null) {
  // wait 10 sec
  sleep(10000);
  txReceipt = web3.eth.getTransactionReceipt(txHash);
}
// getting the address from the receipt
contractAccount = txReceipt.contractAddress;
console.log("\ncontract address:\n\t" + contractAccount);
// print full receipt
console.log("\ntransaction receipt:");
console.log(txReceipt);

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 8. execute a contract function

// input values
txHash = '0xb35c28a10bc996f1cdd81425e6c90d4c841ed6ba6c7f039e76d448a6c869d7bc';
let addressToAdd = "0xa0ab456ab456ab456ab456ab456ab456ab456ab456ab456ab456ab456ab456ab";
let keyToAdd = "key-ab456";

// get contract object parameters
txReceipt = web3.eth.getTransactionReceipt(txHash);
contractAccount = txReceipt.contractAddress;
let ownerAddress = txReceipt.from;
let abiDefinition = web3.eth.compile.solidity(source_personnel).Personnel.info.abiDefinition;

// get contract object using ownerAddress & contractAccount & abiDefinition
let ctr = web3.eth.contract(abiDefinition).at(contractAccount);

// unlock account
web3.personal.unlockAccount(ownerAddress, "password", 100);

// execute function: adding a user address
let rsp = ctr.addAddress(keyToAdd, addressToAdd, {from: ownerAddress, gas: 2000000, gasPrice: 10000000000});

console.log("\nADD response: " + rsp);

// get & print receipt
txReceipt = web3.eth.getTransactionReceipt(rsp);
// repeat till tx processed
while (txReceipt == null) {
  // wait 10 sec
  sleep(10000);
  txReceipt = web3.eth.getTransactionReceipt(rsp);
}
console.log("\nADD transaction receipt:")
console.log(txReceipt);

// 9. eth_call

// call function: getting a user address
rsp = ctr.getUserAddress(keyToAdd);

console.log("\nGET response: " + rsp);

// checking that received value matches input
if (!rsp == addressToAdd) {
    console.log("\nThe received value:\n%s\n does not match the given parameter:\n%s\n", rsp, addressToAdd);
} else {
    console.log("\nThe received value:\n%s\nmatches the given parameter:\n%s\n", rsp, addressToAdd);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
