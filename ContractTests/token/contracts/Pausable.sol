pragma solidity >=0.4.10;

import './Owned.sol';

contract Pausable is Owned {
    bool public paused;

    function pause() onlyOwner {
        paused = true;
    }

    function unpause() onlyOwner {
        paused = false;
    }

    modifier notPaused() {
        require(!paused);
        _;
    }
}