pragma solidity ^0.4.15;

import {Owned} from '../../standard/contracts/Owned.sol';

// basic functionality from token contract
contract Token {
    function transferFrom(address from, address to, uint amount) returns (bool);
    function transfer(address to, uint amount) returns(bool);
    function balanceOf(address addr) constant returns(uint);
}


contract BatchTransfer is Owned {    
    uint public nonce;
    Token public token;

    // some events to assist in contract readability
    event Batch(uint256 indexed nonce);
    event Complete();

    function batchTransfer(uint n, uint256[] bits) public onlyOwner {
        require(n == nonce);

        nonce += 1;
        uint256 lomask = (1 << 96) - 1;
        uint sum = 0;
        for (uint i=0; i<bits.length; i++) {
            address a = address(bits[i]>>96);
            uint value = bits[i]&lomask;
            token.transfer(a, value);
        }
        Batch(n);
    }

    function setToken(address tokenAddress) public onlyOwner {
        token = Token(tokenAddress);
    }

    function reset() public onlyOwner {
        nonce = 0;
        Complete();
    }

    // refund all tokens back to owner
    function refund() public onlyOwner {
        uint256 balance = token.balanceOf(this);
        token.transfer(owner, balance);
    }

    function getBalance() public constant returns (uint256 balance) {
        return token.balanceOf(this);
    }
}