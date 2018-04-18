/**
 * Copyright (C) 2017 Aion Foundation
 */

pragma solidity ^0.4.15;

import {IOwned, Owned} from '../../standard/contracts/Owned.sol';

contract TokenInterface is IOwned {
    function setController(address _c);
}

contract ControllerInterface is IOwned {
    function setToken(address _token);
    function setLedger(address _ledger);
}

contract LedgerInterface is IOwned {
    function setController(address _controller);
}

/**
 * Functionality is currently separated into a two-step method, all functions
 * with the `set` prefix do not possess irreversible state changes. All
 * functionality with the `do` prefix will.
 * 
 * It is the users responsibility to ensure that all parameters are `set`
 * properly before calling any `do` functionality.
 */
contract Swapper is Owned {

    /**
     * Interface pointed at the new controller, this is initially set to 0x0.
     * The user is free to modify this value until swapController() is called, at which point
     * this value will be reset back to 0x0.
     */
    ControllerInterface public newController;

    /**
     * If its necessary to transfer ownership of the controller back
     * to another user. Will be reset to 0x0 upon transfer.
     */
    address public controllerHeir;

    /**
     * Interface pointed at a token contract
     */
    TokenInterface public token;

    /**
     * Interface pointed at the current controller contract. The user is free to modify
     * this value until swapController() is called, at which point the contract
     * referenced by this interface has it's owner pointed at the caller, and the reference
     * is dropped.
     */
    ControllerInterface public controller;

    /**
     * Interface pointed at the current ledger contract
     */
    LedgerInterface public ledger;

    /**
     * Intermediate address used when setting the future owner
     * of the TCL contracts. Will be set back to 0x0 upon completion
     * of the transfer.
     */
    address public TCLHeir;

    /**
     * Intermediate address used when setting the owner of the
     * stale controller, this MUST be set as on a swap the old controller's
     * ownership will be transferred to this account.
     */
    address public staleControllerHeir;

    /**
     * Modifiers
     */

    // checks that TCL suite has been set
    modifier tcl_set() {
        require(address(token) != 0x0 &&
            address(controller) != 0x0 &&
            address(ledger) != 0x0);
        _;
    }

    // checks that the new controller has been set
    modifier new_controller_set() {
        require(address(newController) != 0x0);
        _;
    }

    // checks that all `this` owns ownership to all the required contracts
    modifier has_required_ownership() {
        require(token.owner() == address(this) &&
            controller.owner() == address(this) && 
            ledger.owner() == address(this) &&
            newController.owner() == address(this));
        _; 
    }

    // checks that the TCL owner is set to something non-zero
    modifier tcl_heir_set() {
        require(TCLHeir != 0x0);
        _;
    }

    // checks that the new controller owner is set to something non-zero
    modifier controller_heir_set() {
        require(controllerHeir != 0x0);
        _;
    }

    modifier stale_controller_heir_set() {
        require(staleControllerHeir != 0x0);
        _;
    }


    /**
     * TCL Functionality
     */

    function setTCL(address _token, address _controller, address _ledger)
        onlyOwner
        external
    {
        token = TokenInterface(_token);
        controller = ControllerInterface(_controller);
        ledger = LedgerInterface(_ledger);
    }

    /**
     * Accepts ownership of TCL (Token, Controller Ledger)
     * The user must manually direct ownership towards this contract before calling this functionality.
     */
    function doAcceptTCLOwnership()
        onlyOwner
        tcl_set
        external
    {
        token.acceptOwnership();
        controller.acceptOwnership();
        ledger.acceptOwnership();
    }

    function setTCLOwnership(address _addr)
        onlyOwner
        tcl_set
        external
    {
        TCLHeir = _addr;
    }

    function doTransferTCLOwnership()
        onlyOwner
        tcl_set
        tcl_heir_set
        external
    {
        token.changeOwner(TCLHeir);
        controller.changeOwner(TCLHeir);
        ledger.changeOwner(TCLHeir);
        TCLHeir = 0x0;
    }

    /**
     * New Controller Functionality
     */

    function setNewControllerAddress(address _addr)
        onlyOwner
        external
    {
        newController = ControllerInterface(_addr);
    }

    function doAcceptNewControllerOwnership()
        onlyOwner
        new_controller_set
        external
    {
        newController.acceptOwnership();
        // owner does not throw, therefore we throw here
        require(newController.owner() == address(this));
    }

    function setNewControllerOwnership(address _addr)
        onlyOwner
        new_controller_set
        external
    {
        controllerHeir = _addr;
    }

    function doTransferNewControllerOwnership()
        onlyOwner
        new_controller_set
        controller_heir_set
        external
    {
        newController.changeOwner(controllerHeir);
        controllerHeir = 0x0;
    }

    /**
     * Stale Controller
     */
    function setStaleControllerOwnership(address _addr)
        onlyOwner
        tcl_set
        new_controller_set
        external
    {
        staleControllerHeir = _addr;
    }

    /**
     * Controller Swap Functionality
     */

    function doSwapController()
        onlyOwner
        tcl_set
        new_controller_set
        stale_controller_heir_set
        has_required_ownership
        external
    {
        // new controller -> token, ledger
        newController.setToken(address(token));
        newController.setLedger(address(ledger));

        // token -> new controller
        token.setController(address(newController));

        // ledger -> new controller
        ledger.setController(address(newController));

        // newController -> controller, controller discarded
        controller.changeOwner(staleControllerHeir);
        controller = ControllerInterface(address(newController));
        
        newController = ControllerInterface(0x0);
    }
}