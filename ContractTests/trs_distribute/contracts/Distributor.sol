pragma solidity ^0.4.17;

import {Owned} from '../../standard/contracts/Owned.sol';

// interface with what we need to withdraw
contract Withdrawable {
	function withdrawTo(address) returns (bool);
}

// responsible for 
contract Distributor is Owned {

	uint256 public nonce;
	Withdrawable public w;

	event BatchComplete(uint256 nonce);

	event Complete();

	function setWithdrawable(address w_addr) onlyOwner {
		w = Withdrawable(w_addr);
	}
	
	function distribute(address[] addrs) onlyOwner {
		for (uint256 i = 0; i <  addrs.length; i++) {
			w.withdrawTo(addrs[i]);
		}
		BatchComplete(nonce);
		nonce = nonce + 1;
	}

	function complete() onlyOwner {
		nonce = 0;
		Complete();
	}
}