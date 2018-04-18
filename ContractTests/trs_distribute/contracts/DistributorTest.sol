pragma solidity ^0.4.17;

import {Owned} from '../../standard/contracts/Owned.sol';

// interface with what we need to withdraw
contract WithdrawableTest {
	function withdrawTo(address, uint256) returns (bool);
}

// responsible for 
contract DistributorTest is Owned {

	uint256 public nonce;
	WithdrawableTest public w;

	event BatchComplete(uint256 nonce);

	event Complete();

	function setWithdrawable(address w_addr) onlyOwner {
		w = WithdrawableTest(w_addr);
	}
	
	function distribute(address[] addrs, uint256 timestamp) onlyOwner {
		for (uint256 i = 0; i <  addrs.length; i++) {
			w.withdrawTo(addrs[i], timestamp);
		}
		BatchComplete(nonce);
		nonce = nonce + 1;
	}

	function complete() onlyOwner {
		nonce = 0;
		Complete();
	}
}