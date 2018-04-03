contract Personnel {

	address public owner;
	modifier onlyOwner() {
		require(msg.sender == owner);
		_;}

	mapping(bytes32 => address) private userList;

	/** 3 LSB bits for each privilege type
     */
	mapping(address => bytes1) private userPrivilege;
	function Personnel(){
		owner = msg.sender;
	}

	event UserAdded(string _stamp);
	event AddressAdded(address indexed _addr);

	function getUserAddress(string _stamp) constant returns (address){
		return userList[sha3(_stamp)];
	}

	function addUser(string _stamp, address _addr, bytes1 _userPrivilege) onlyOwner{
		userList[sha3(_stamp)] = _addr;
		userPrivilege[_addr] = _userPrivilege;
		UserAdded(_stamp);
	}

	function addAddress(string _stamp, address _addr) onlyOwner{
		userList[sha3(_stamp)] = _addr;
		AddressAdded(_addr);
	}



}
