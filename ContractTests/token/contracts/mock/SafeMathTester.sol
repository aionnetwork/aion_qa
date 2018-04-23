pragma solidity >=0.4.10;

import '../SafeMath.sol';

contract SafeMathTester is SafeMath {

    // expecting REVERT
    function TestMultiplicationOverflow() returns (uint256 output) {
        uint256 almostMax = 2**(256 - 1);
        return safeMul(almostMax, 2);
    }

    // expecting REVERT
    function TestAdditionOverflow() returns (uint256 output) {
        uint256 almostMax = 2**256 - 1;
        return safeAdd(almostMax, 1);
    }

    // expecting REVERT
    function TestSubtractionUnderflow() returns (uint256 output) {
        uint256 zero = 0;
        return safeSub(zero, 1);
    }
}