pragma solidity ^0.4.8

contract Personnel {

	address public owner; 
	modifier onlyOwner() {
    require(msg.sender == owner);
        _;}

    mapping(bytes32 => address) private userList;
    
    /** 3 LSB bits for each privilege type
     *  [receive/client, signoff, upload]
     */
	mapping(address => bytes1) private userPrivilege;
	function Personnel(){
		owner = msg.sender;
	}

    event UploaderAdded(string _stamp);
    event SignerAdded(string _stamp);
    event ReceiverAdded(string _stamp);
    event UserAdded(string _stamp);
    
    //check address 0 in program --------------------
    function getUserAddress(string _stamp) constant returns (address){
        return userList[sha3(_stamp)];
    }
    
    function getUserPrivilege(address _userAddr) constant returns (bytes1){
        return userPrivilege[_userAddr];
    }
    
    function addUser(string _stamp, address _addr, bytes1 _userPrivilege) onlyOwner{
        userList[sha3(_stamp)] = _addr;
        userPrivilege[_addr] = _userPrivilege;
        UserAdded(_stamp);
    }
    
	function verifyUploader (address _uploader)  constant  returns (bool) {
	    return ( (userPrivilege[_uploader] & (0x01)) == (0x01));
	}
	
	function addUploader (string _stamp) onlyOwner{
	   if(userList[sha3(_stamp)] != address(0)){
			address userAddr = userList[sha3(_stamp)];
			userPrivilege[userAddr] = userPrivilege[userAddr] | (0x01);
			UploaderAdded(_stamp);
	   }
	   //else
	   //throw;
	}

	function verifySigner (address _signer) constant returns  (bool) {
		return ((userPrivilege[_signer] & (0x02)) == (0x02));
	}
	
	function addSigner (string _stamp) onlyOwner {
	    if(userList[sha3(_stamp)] != address(0)){
		    address userAddr = userList[sha3(_stamp)];
			userPrivilege[userAddr] = userPrivilege[userAddr] | (0x02);
			SignerAdded(_stamp);
	    }
	}
	
	function verifyReceiver (address _receiver) constant returns  (bool) {
		return ((userPrivilege[_receiver] & (0x04)) == (0x04));
	}
	
	function addReceiver (string _stamp) onlyOwner{
	    if(userList[sha3(_stamp)] != address(0)){
		    address userAddr = userList[sha3(_stamp)];
			userPrivilege[userAddr] = userPrivilege[userAddr] | (0x04);
			ReceiverAdded(_stamp);
		}
	}

}