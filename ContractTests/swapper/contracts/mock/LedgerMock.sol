/**
 * Copyright (C) 2017 Aion Foundation
 */

pragma solidity ^0.4.15;

import {Owned} from '../../../standard/contracts/Owned.sol';
import {ControllerMock} from './ControllerMock.sol';

contract LedgerMock is Owned {

    ControllerMock public controller;

    /**
     * Events
     */
    event DebugSetController();

    function setController(address _addr) {
        controller = ControllerMock(_addr);
        DebugSetController();
    }
}