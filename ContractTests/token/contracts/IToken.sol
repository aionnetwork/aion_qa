pragma solidity >=0.4.10;

contract IToken {
    function transfer(address _to, uint _value) returns (bool);
    function balanceOf(address owner) returns(uint);
}