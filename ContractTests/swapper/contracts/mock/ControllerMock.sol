/**
 * Copyright (C) 2017 Aion Foundation
 */

pragma solidity ^0.4.15;

import {Owned} from '../../../standard/contracts/Owned.sol';
import {TokenMock} from './TokenMock.sol';
import {LedgerMock} from './LedgerMock.sol';

contract ControllerMock is Owned {

    TokenMock public token;
    LedgerMock public ledger;

    /**
     * Events
     */
    event DebugSetToken();
    event DebugSetLedger();

    function setToken(address _addr) {
        token = TokenMock(_addr);
        DebugSetToken();
    }

    function setLedger(address _addr) {
        ledger = LedgerMock(_addr);
        DebugSetLedger();
    }
}