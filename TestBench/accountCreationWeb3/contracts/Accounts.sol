pragma solidity ^0.4.10;

contract Accounts {

    event Transfer(uint128 _count, address _accountAddress);

    uint128 public initialAddress;
    uint128 public count;

    function Accounts(){
        initialAddress = 0x1000000000000000000000000000000;
        count = 0;
    }

    function() payable {
    }

    function sendManyTransaction(uint128 iteration, uint8 amount){

        for (uint8 i = 0; i < iteration; i++) {
            address accountAddress = address(initialAddress);
            accountAddress.transfer(amount);
            initialAddress = initialAddress - 1;
            count = count + 1;
            Transfer(count, accountAddress);
        }
    }

    function sendTransaction(uint8 amount){

        address accountAddress = address(initialAddress);
        accountAddress.transfer(amount);
        initialAddress = initialAddress - 1;
        count = count + 1;
        Transfer(count, accountAddress);
    }

    function validateBalanceIter(uint128 iteration) constant returns (bool){
        if (address(initialAddress + iteration).balance > 0)
            return true;
        else
            return false;
    }

    function validateBalance(address account) constant returns (bool){
        if (account.balance > 0)
            return true;
        else
            return false;
    }

}