let util = require('./util.js');

let Token = artifacts.require("./Token.sol");
let Controller = artifacts.require('./Controller.sol');
let Ledger = artifacts.require("./Ledger.sol");
let foundation = require('./foundation_tools.js');
let Migration = artifacts.require("./Migrations.sol");

let SafeMathTester = artifacts.require('./mock/SafeMathTester.sol');

let deployed = {
  token: null,
  controller: null,
  ledger: null
}

let padLeft = function(value, len) {
  let hexLength = len * 2;
  if (value.length > len)
    return value;

  let outStr = value;
  for (i = 0; i < (hexLength - value.length); i++) {
    outStr = '0' + outStr;
  }
  return outStr;
}

contract('User', (accs) => {
  /**
   * This test suite tests how users interact with exchange, to buy/sell Aion token.
   *
   * Accounts:
   * [0]: UserA
   * [1]: Exchange
   * [2]: UserB
   *
   * Procedures:
   * 1) UserA can transfer token to the exchange, which will emit an event. After receiving
   *    the evnet, the Exchange will check the balance of receiving address (exchange assigns
   *    dedicated address for the user to deposit).
   * 2) Users can buy/sell token on exchange. NOT PART OF THE TEST
   * 3) UserB can withdraw the token he/she bought on the exchange, which require the exchange
   *    transfer token to the address of UserB.
   */
  it("should be able to exchange", (done) => {
    let totalSupply = 5000;
    let amount = 200;

    util.deployAll().then((c) => {
      let transferEvent = c.token.Transfer();

      // distribute tokens to userA
      c.ledger.multiMint(0, [util.addressValue(accs[0], totalSupply)]).then((txid) => {

        // transfer to exchange
        return c.token.transfer(accs[1], amount);
      }).then((txid) => {

        // a transfer event is emitted and caught by exchange
        return transferEvent.get();
      }).then((events) => {
        assert.equal(events[0].args.from, accs[0]);
        assert.equal(events[0].args.to, accs[1]);
        assert.equal(events[0].args.value.c[0], amount);

        // exchange verify the balance
        return c.token.balanceOf(accs[1], {from: accs[1]});
      }).then((ret) => {
        assert.equal(ret, amount);

        //============================================================
        // exchange update user balance database
        // userA and userB do exchange on the exchange's website
        //============================================================

        // exchange transfer token to userB afer a request of withdraw
        return c.token.transfer(accs[2], amount, {from: accs[1]});
      }).then((txid) => {

        // userB check the balance of his account
        return c.token.balanceOf(accs[2], {from: accs[2]});
      }).then((ret) => {
        assert.equal(ret, amount);
        done();
      });
    });
  });
});

describe('tools', () => {
  it("should output the correct length", (done) => {
    // no need to deploy contracts here
    // fake a ledger here
    let ledger = [];

    for (i = 0; i < 100; i++) {
      ledger.push({addr: i, value: i});
    }

    let outputLedger = []
    let ledgerFn = (addr) => {
      return new Promise((resolve, reject) => {
        outputLedger.push("hello");
        resolve(true);
      });
    }

    foundation.confirmBatch(ledger, ledgerFn).then((res) => {
      if (outputLedger.length != 100)
        assert.fail("output length mismatch");

      done();
    }, (err) => {
      assert.fail("expected the same verifications");
      done();
    });
  });

  it("should reject on any errors thrown by array promise fn", (done) => {
    let rejectFn = (input) => {
      return new Promise((resolve, reject) => {
        reject(true);
      });
    }

    foundation.confirmBatch([1], rejectFn).catch((res) => {
      console.log("caught expected rejection");
      done();
    });

  });
});

/**
 * This test suite kind of acts like the system tests. Since most functionality
 * is accessible from the token contract.
 */
contract('Token', (accs) => {

  /**
   * Deployment state tests
   * (run these tests before we deploy the live contract)
   * These tests check that our assumed initial states are correct
   */

  it("should have the same burn address as controller and ledger", (done) => {
    util.deployAll().then((c) => {
      tokenBurnAddress = null;
      controllerBurnAddress = null;
      ledgerBurnAddress = null;
      c.token.burnAddress().then((res) => {
        tokenBurnAddress = res;
        return c.controller.burnAddress();
      }).then((res) => {
        controllerBurnAddress = res;
        return c.ledger.burnAddress();
      }).then((res) => {
        ledgerBurnAddress = res;
        assert.equal(tokenBurnAddress, controllerBurnAddress);
        assert.equal(controllerBurnAddress, ledgerBurnAddress);
        done();
      });
    });
  });

  it("should have the correct state when deployed", (done) => {
    util.Token.new().then((token) => {
      /*
      Assumed state:
      string constant public name = "FixMeBeforeDeploying";
      uint8 constant public decimals = 8;
      string constant public symbol = "FIXME";
      Controller public controller;
      */
      let params = [token.name(),
                    token.decimals(),
                    token.symbol(),
                    token.controller(),
                    token.motd(),
                    token.burnAddress(),
                    token.burnable()]

      Promise.all(params).then((params) => {
        console.log()
        assert.equal(params[0], 'FixMeBeforeDeploying');
        assert.equal(params[1], 8);
        assert.equal(params[2], 'FIXME');
        assert.equal(params[3], '0x0000000000000000000000000000000000000000');
        assert.equal(params[4], '');
        assert.equal(params[5], '0x0000000000000000000000000000000000000000');
        assert.equal(params[6], false);
        done();
      });
    });
  });

  /**
   * Transfer Test Suite
   */

  it("should transfer 100 tokens from account 0 to account 1", (done) => {
    util.deployAll().then((c) => {
      c.ledger.multiMint(0, [util.addressValue(accs[0], 100)]).then((txid) => {
        return c.token.transfer(accs[1], 100);
      }).then((txid) => {
        return c.token.balanceOf(accs[1]);
      }).then((res) => {
        assert.equal(res.c[0], 100);
        return c.token.balanceOf(accs[0]);
      }).then((res) => {
        assert.equal(res.c[0], 0);
        done();
      });
    });
  });

  it("should not be able to transfer more than owned value", (done) => {
    util.deployAll().then((c) => {
      c.token.transfer(accs[1], 1).then((txid) => {
        return c.token.balanceOf(accs[1]);
      }).then((res) => {
        assert.equal(res.c[0], 0);
        done();
      });
    });
  });

  it("should not be able to transfer while paused", (done) => {
    util.deployAll().then((c) => {
      c.token.pause().then((txid) => {
        return c.ledger.multiMint(0, [util.addressValue(accs[0], 100)]);
      }).then((txid) => {
        return c.token.balanceOf(accs[0]);
      }).then((res) => {
        console.log("initial accs[0] balance: " + res);
        assert.equal(res.c[0], 100);
        return;
      }).then(() => {
        return c.token.transfer(accs[1], 100);
      }).catch((err) => {
        console.log("error caught, cannot transfer while paused");
        return;
      }).then(() => {
        return c.token.unpause();
      }).then((txid) => {
        return c.token.transfer(accs[1], 100);
      }).then((txid) => {
        return c.token.balanceOf(accs[1]);
      }).then((res) => {
        assert.equal(res.c[0], 100);
        done();
      });
    });
  });

  it("should not be able to transfer un-approved value", (done) => {
    util.deployAll().then((c) => {
      c.ledger.multiMint(0, [util.addressValue(accs[0], 100)]).then((txid) => {
        return c.token.transferFrom.sendTransaction(accs[0], accs[1], 100, {from: accs[1]});
      }).then((txid) => {
        return c.token.balanceOf(accs[1]);
      }).then((res) => {
        assert.equal(res.c[0], 0);
        done();
      });
    });
  });

  /**
   * Approval Test Suite
   */

  it("should be able to approve a higher value than balance", (done) => {
    util.deployAll().then((c) => {
      c.ledger.multiMint(0, [util.addressValue(accs[0], 100)]).then((txid) => {
        return c.token.approve(accs[1], 200);
      }).then((txid) => {
        return c.token.allowance(accs[0], accs[1]);
      }).then((res) => {
        assert.equal(res.c[0], 200);
        done();
      });
    });
  });

  it("should not be able to approve once an approve value is already set", (done) => {
    let initialValue = 200;
    let secondaryValue = 300;

    util.deployAll().then((c) => {
      c.ledger.multiMint(0, [util.addressValue(accs[0], 100)]).then((txid) => {
        return c.token.approve(accs[1], initialValue);
      }).then((txid) => {
        return c.token.allowance(accs[0], accs[1]);
      }).then((res) => {
        assert.equal(res.c[0], initialValue);
      }).then(() => {
        return c.token.approve(accs[1], secondaryValue);
      }).then((txid) => {
        return c.token.allowance(accs[0], accs[1]);
      }).then((res) => {
        assert.equal(res.c[0], initialValue);
        done();
      });
    });
  });

  /**
   * Assuming:
   * 1) account 0 has 500 tokens
   * 2) account 0 wants to let account 1 spend 100 tokens
   * 3) account 1 tries to transfer 101 tokens to account 2
   */
  it("should not allow users to transfer higher than the approved value", (done) => {
    let actualBalance = 500;
    let approvedBalance = 100;

    util.deployAll().then((c) => {
      c.ledger.multiMint(0, [util.addressValue(accs[0], actualBalance)]).then((txid) => {
        return c.token.approve(accs[1], approvedBalance);
      }).then((txid) => {
        return c.token.transferFrom(accs[0], accs[2], 101);
      }).then((txid) => {
        // our check is based on the event being emit on a successful transfer
        for (j = 0; j < txid.logs.length; j++) {
          if (txid.logs[j].event == 'Transfer')
            assert.fail("Transfer event found, should not have been successful");
        }
        done();
      });
    });
  });


  it("should not allow users to transfer higher than the balance", (done) => {
    let actualBalance = 100;
    let approvedBalance = 500;

    util.deployAll().then((c) => {
      c.ledger.multiMint(0, [util.addressValue(accs[0], actualBalance)]).then((txid) => {
        return c.token.approve(accs[1], approvedBalance);
      }).then((txid) => {
        return c.token.transferFrom(accs[0], accs[2], approvedBalance);
      }).then((txid) => {
        for (j = 0; j < txid.logs.length; j++) {
          if (txid.logs[i].event == 'Transfer')
            assert.fail("Transfer event found, should not have been successful");
        }
        done();
      });
    });
  });


  it("should allow re-approval after allowance has been spent", (done) => {
    let approvedBalance = 500;

    util.deployAll().then((c) => {
      c.ledger.multiMint(0, [util.addressValue(accs[0], approvedBalance)]).then((txid) => {
        c.token.approve(accs[1], 100);
      }).then(() => {
        return c.token.transferFrom.sendTransaction(accs[0], accs[2], 100, {from: accs[1]});
      }).then((txid) => {
        let receipt = web3.eth.getTransactionReceipt(txid);
        if (!util.searchForEvent(receipt, "Transfer(address,address,uint256)")) {
          assert.fail("expected transfer");
        }
      }).then(() => {
        return c.token.allowance(accs[0], accs[1]);
      }).then((res) => {
        assert.equal(res.c[0], 0);
      }).then(() => {
        c.token.approve(accs[1], 100);
      }).then(() => {
        return c.token.transferFrom.sendTransaction(accs[0], accs[2], 100, {from: accs[1]});
      }).then((txid) => {
        let finalState = [
          c.token.balanceOf(accs[0]),
          c.token.balanceOf(accs[1]),
          c.token.balanceOf(accs[2]),
          c.token.allowance(accs[0], accs[1])
        ];

        Promise.all(finalState).then((states) => {
          assert.equal(states[0].c[0], 300);
          assert.equal(states[1].c[0], 0);
          assert.equal(states[2].c[0], 200);
          assert.equal(states[3].c[0], 0);
          done();
        });
      });
    });
  });

  /**
   * Added to confirm increase/decreaseApproval functionality
   * Should confirm that:
   * 
   * 1) decreaseApproval is not vulnerable to timing attacks, in this form:
   * 
   * Allowance(A, B) = 100
   * A wants to decrease to 0
   * A sends decreaseApproval(100)
   * B captures this message and immediately publishes a spend for 50
   * 
   * This can be successful, B can spend before A deducts, but As 
   * decrease in allowance should still go through with the floor at 0.
   */
  it("should floor the approval to 0 given a decreaseApproval > currentApproval", (done) => {
    // so we only trigger done() once
    completed = false;

    util.deployAll().then((c) => {
      // no need to multiMint, we just want to test approval
      c.token.approve(accs[1], 100);
    }).then(() => {
      c.token.decreaseApproval(accs[1], 200);
    }).then(() => {
      return c.token.allowance(accs[0], accs[1]);
    }, (err) => {
      assert.fail("decreaseApproval should not cause a throw");
      completed = true;
      done();
    }).then((res) => {
      assert.equal(res.c[0], 0);
      
      if (!completed)
        done();
    });
  });

  /**
   * Burning Test Suite
   */

  /**
   * Assuming:
   * 1) multiMint is working
   * 2) contracts are all linked and deployed properly
   */
  it("should burn tokens and emit the a ControllerBurn event", (done) => {
    let defaultBurnAddress = '0x0000000000000000000000000000000000000000';
    let otherNetworkAddress = '0x00000000000000000000000000000000000000000000000000000000deadbeef';

    util.deployAll().then((c) => {
      let controllerBurnEvent = c.controller.ControllerBurn();

      c.ledger.multiMint(0, [util.addressValue(accs[0], 100)]).then((txid) => {
        return c.controller.enableBurning()
      }).then((txid) => {
        return c.token.burn(otherNetworkAddress, 99);
      }).then((txid) => {
        return controllerBurnEvent.get();
      }).then((events) => {
        assert.equal(events[0].args.from, accs[0]);
        assert.equal(events[0].args.to, otherNetworkAddress);
        assert.equal(events[0].args.value.c[0], 99);
      }).then(() => {
        // now we need to check that the balances are correctly put
        return c.token.balanceOf(accs[0]);
      }).then((res) => {
        assert.equal(res.c[0], 1);
      }).then(() => {
        return c.token.balanceOf(defaultBurnAddress);
      }).then((res) => {
        assert.equal(res.c[0], 99);
        done();
      });
    });
  });

  it("should not be able to burn tokens if not burn enabled", (done) => {
    let defaultBurnAddress = '0x0000000000000000000000000000000000000000';
    let otherNetworkAddress = '0x00000000000000000000000000000000000000000000000000000000deadbeef';

    util.deployAll().then((c) => {

      c.ledger.multiMint(0, [util.addressValue(accs[0], 100)]).then((txid) => {
        return c.token.burn(otherNetworkAddress, 100);
      }).catch((err) => {
        console.log("caught error, cannot burn without burn being enabled");
        done();
      });
    });
  });

  it("should not be able to burn tokens if paused, even if burn is enabled", (done) => {
    let otherNetworkAddress = '0x00000000000000000000000000000000000000000000000000000000deadbeef';

    util.deployAll().then((c) => {
      c.controller.enableBurning();
    }).then(() => {
      // burning should be enabled, check
      return c.token.burnable();
    }).then((res) => {
      assert.equal(res, true);
    }).then(() => {
      // now pause the contract
      c.token.pause();
    }).then(() => {
      c.ledger.multiMint(0,[util.addressValue(accs[0], 100)]);
    }).then(() => {
      // try to burn some tokens, should fail
      return c.token.burn(otherNetworkAddress, 100);
    }).catch((txid) => {
      console.log("caught error, pause should throw error");
      done();
    });
  });

  /**
   * Payload Size Test Suite
   */

  it("should be able to reject a transfer (2w + 4b) with an incorrect data payload", (done) => {
    util.deployAll().then((c) => {
      c.ledger.multiMint(0, [util.addressValue(accs[0], 100)]).then((txid) => {
        return c.token.transfer(accs[1], 1);
      }).then((txid) => {
        // first transfer one token (valid)
        // mainly for us to generate the correct inputs
        let tx = web3.eth.getTransaction(txid.tx);
        util.transactionMined(txid.tx).then((tx) => {
          // the offset we are looking for is the end of the address
          // 16*2 + 20*2 (plus the 0x means we are just in the correct position)
          console.log(tx.tx.input);
          const input = tx.tx.input.substring(0, 72) + tx.tx.input.substring(74);
          console.log(input);
          return input;
        }).then((modifiedInput) => {
          return c.token.sendTransaction({from: accs[0], data: modifiedInput});
        }).then((res) => {
          assert.fail("should not accept invalid payload (payloadSize modifier)");
          done();
        }, (err) => {
          done();
        });
      });

    });
  });

  it("should accept a payload size that is too large", (done) => {
    util.deployAll().then((c) => {
      c.ledger.multiMint(0, [util.addressValue(accs[0], 100)]).then((txid) => {
        return c.token.transfer(accs[1], 1);
      }).then((txid) => {
        // first transfer one token (valid)
        // mainly for us to generate the correct inputs
        let tx = web3.eth.getTransaction(txid.tx);
        util.transactionMined(txid.tx).then((tx) => {
          // the offset we are looking for is the end of the address
          // 16*2 + 20*2 (plus the 0x means we are just in the correct position)
          console.log(tx.tx.input);
          const input = tx.tx.input + "00"; //extend
          console.log(input);
          return input;
        }).then((modifiedInput) => {
          return c.token.sendTransaction({from: accs[0], data: modifiedInput});
        }).then((res) => {
          done();
        }, (err) => {
          assert.fail(err);
          done();
        });
      });
    });

  });

  it("should be able to reject approve (4b + 2w) of smaller payload size", (done) => {
    util.deployAll().then((c) => {

      let expectedInput = null;

      c.ledger.multiMint(0, [util.addressValue(accs[0], 100)]).then((txid) => {
        return c.token.approve(accs[1], 100);
      }).then((txid) => {
        const input = web3.eth.getTransaction(txid).input;
        expectedInput = input.substring(0, 8 + 64) + input.substring(8 + 64 + 2);
      }).then(() => {
        // disable the approve so we can approve again after
        return c.token.approve(accs[1], 0);
      }).then((txid) => {
        return c.sendTransaction({from: accs[0], data: expectedInput});
      }).then((res) => {
        assert.fail("did not expect malformed input to succeed");
        done();
      }, (err) => {
        done();
      });
    });
  });

  it("should be able to accept approve (4b + 2w + 1b) of larger payload size", (done) => {
    util.deployAll().then((c) => {

      let expectedInput = null;

      c.ledger.multiMint(0, [util.addressValue(accs[0], 100)]).then((txid) => {
        return c.token.approve(accs[1], 100);
      }).then((txid) => {
        const tx = web3.eth.getTransaction(txid.tx);
        expectedInput = tx.input + '00';
      }).then(() => {
        // disable the approve so we can approve again after
        return c.token.approve(accs[1], 0);
      }).then((txid) => {
        return c.token.sendTransaction({from: accs[0], data: expectedInput});
      }).then((res) => {
        done();
      }, (err) => {
        assert.fail(err);
        done();
      });
    });
  });


  it("should be able to reject a transferFrom (4b + 3w) of smaller payload size", (done) => {
    util.deployAll().then((c) => {
      c.ledger.multiMint(0, [util.addressValue(accs[0], 100)]).then((txid) => {
        return c.token.approve(accs[1], 100);
      }).then((txid) => {
        return c.token.transferFrom.sendTransaction(accs[0], accs[1], 1, {from: accs[1]});
      }).then((txid) => {
        const tx = web3.eth.getTransaction(txid);
        const outTx = tx.input.substring(0, 8 + 128) + tx.input.substring(8 + 128 + 2);
        console.log(tx.input);
        console.log(outTx);
        return outTx;
      }).then((modifiedInput) => {
        return c.token.sendTransaction({from: accs[1], data: modifiedInput});
      }).then((res) => {
        assert.fail("did not expect transaction with wrong payload to go through");
        done();
      }, (err) => {
        done();
      });
    });
  });

  it("should be able to accept a transferFrom (4b + 3w + 1b) longer payload", (done) => {
    util.deployAll().then((c) => {
      c.ledger.multiMint(0, [util.addressValue(accs[0], 100)]).then((txid) => {
        return c.token.approve(accs[1], 100);
      }).then((txid) => {
        return c.token.transferFrom.sendTransaction(accs[0], accs[1], 1, {from: accs[1]});
      }).then((txid) => {
        const tx = web3.eth.getTransaction(txid);
        const outTx = tx.input + '00';
        console.log(tx.input);
        console.log(outTx);
        return outTx;
      }).then((modifiedInput) => {
        return c.token.sendTransaction({from: accs[1], data: modifiedInput});
      }).then((res) => {
        done();
      }, (err) => {
        assert.fail(err);
        done();
      });
    });
  });

  it("should be able to reject increaseApproval (4b + 2w) of smaller payload size", (done) => {
    util.deployAll().then((c) => {
      c.ledger.multiMint(0, [util.addressValue(accs[0], 100)]).then((txid) => {
        return c.token.increaseApproval(accs[1], 1);
      }).then((txid) => {
        const input = web3.eth.getTransaction(txid.tx);
        return input.substring(0, 8 + 64) + input.substring(8 + 64 + 2);
      }).then((modifiedInput) => {
        return c.token.sendTransaction({from: accs[0], input: modifiedInput});
      }).then((res) => {
        assert.fail("did not expect transaction with wrong payload to go through");
        done();
      }, (err) => {
        done();
      });
    });
  });


  it("should be able to reject decreaseApproval (4b + 2w) of smaller payload size", (done) => {
    util.deployAll().then((c) => {
      c.ledger.multiMint(0, [util.addressValue(accs[0], 100)]).then((txid) => {
        return c.token.approve(accs[1], 50);
      }).then((txid) => {
        return c.token.decreaseApproval(accs[1], 1);
      }).then((txid) => {
        const input = web3.eth.getTransaction(txid.tx);
        return input.substring(0, 8 + 64) + input.substring(8 + 64 + 2);
      }).then((modifiedInput) => {
        return c.token.sendTransaction({from: accs[0], input: modifiedInput});
      }).then((res) => {
        assert.fail("did not expect transaction with wrong payload to go through");
        done();
      }, (err) => {
        done();
      });
    });
  });

  /**
   * Owner Test Suite
   */

  it("should return the address of the owner", (done) => {
    util.Token.new().then((token) => {
      return token.owner();
    }).then((res) => {
      assert.equal(res, accs[0]);
      done();
    });
  });

  it("should only let the owner set the message of the day", (done) => {
    let desiredMotd = "Beam me up, Scotty";

    util.Token.new().then((token) => {
        /**
         * Try setting motd from not owner
         */
        token.setMotd.sendTransaction(desiredMotd, {from: accs[1]}).catch((err) => {
        console.log("error caught, should not be able to set motd unless owner");
      }).then(() => {
        return token.setMotd(desiredMotd); // as owner
      }).then((txid) => {
        return token.motd();
      }).then((res) => {
        assert.equal(res, desiredMotd);
        done();
      });
    });
  });

  it("should only let the owner set the controller address", (done) => {
    let desiredAddress = accs[1];

    util.Token.new().then((token) => {
      token.setController.sendTransaction(desiredAddress, {from: accs[1]}).catch((err) => {
        console.log("error caught, should not be able to set controller address unless owner");
      }).then(() => {
        return token.setController(desiredAddress);
      }).then((txid) => {
        return token.controller();
      }).then((res) => {
        assert.equal(res, accs[1]);
        done();
      });
    });
  });

  it("should transfer 100 tokens after transferring ownership", (done) => {
    let newOwner = accs[1];

    util.deployAll().then((c) => {
      // create some value initially
      c.ledger.multiMint(0, [util.addressValue(accs[0], 100)]).then((txid) => {
        c.token.transfer(accs[1], 1);
      }).then(() => {
        return c.token.balanceOf(accs[1]);
      }).then((res) => {
        assert.equal(res.c[0], 1);
      }).then(() => {
        // begin transferring ownership
        c.token.changeOwner(newOwner);
      }).then(() => {
        // receive ownership
        c.token.acceptOwnership.sendTransaction({from: newOwner});
      }).then(() => {
        // verify that old owner is no longer able to transfer tokens
        c.token.transfer(accs[1], 1);
      }).catch((err) => {
        console.log("error caught, old owner is no longer able to transfer currency");
      }).then(() => {
        // new owner should be able to transfer currency
        return c.token.transfer.sendTransaction(accs[2], 1, {from: newOwner});
      }).then((txid) => {
        txReceipt = web3.eth.getTransactionReceipt(txid);
        let eventHash = web3.sha3("Transfer(address,address,uint256)");

        for (j = 0; j < txReceipt.logs.length; j++) {
          if (txReceipt.logs[j].topics[0] == eventHash)
            eventFound = true;
        }

        if (!eventFound)
          assert.fail("Transfer event not found");
        done();
      });
    });
  });

  /**
   * Finalize Test Suite
   * TODO: already covered in general tests suite
   */


  /**
   * Event Test Suite
   */
  it("should emit Transfer event", (done) => {
    let totalSupply = 5000;
    let amount = 200;

    util.deployAll().then((c) => {
      let ev = c.token.Transfer();

      c.ledger.multiMint(0, [util.addressValue(accs[0], totalSupply)]).then((txid) => {
        return c.token.transfer("0x1122334455667788112233445566778811223344", amount);
      }).then((txid) => {
        return ev.get();
      }).then((events) => {
        assert.equal(events[0].args.from, accs[0]);
        assert.equal(events[0].args.to, "0x1122334455667788112233445566778811223344");
        assert.equal(events[0].args.value.c[0], amount);
        done();
      });
    });
  });

  it("should emit Approval event", (done) => {
    let totalSupply = 5000;
    let amount = 200;

    util.deployAll().then((c) => {
      let ev = c.token.Approval();

      c.ledger.multiMint(0, [util.addressValue(accs[0], totalSupply)]).then((txid) => {
        return c.token.approve("0x1122334455667788112233445566778811223344", amount);
      }).then((txid) => {
        return ev.get();
      }).then((events) => {
        assert.equal(events[0].args.owner, accs[0]);
        assert.equal(events[0].args.spender, "0x1122334455667788112233445566778811223344");
        assert.equal(events[0].args.value.c[0], amount);
        done();
      });
    });
  });

  it("should emit Burn event", (done) => {
    let totalSupply = 5000;
    let amount = 200;

    util.deployAll().then((c) => {
      let ev = c.token.Burn();

      c.ledger.multiMint(0, [util.addressValue(accs[0], totalSupply)]).then((txid) => {
        return c.controller.enableBurning();
      }).then((txid) => {
        return c.token.burn("0x1122334455667788112233445566778811223344556677881122334455667788", amount);
      }).then((txid) => {
        return ev.get();
      }).then((events) => {
        assert.equal(events[0].args.from, accs[0]);
        assert.equal(events[0].args.to, "0x1122334455667788112233445566778811223344556677881122334455667788");
        assert.equal(events[0].args.value.c[0], amount);
        done();
      });
    });
  });

  it("should NOT emit Burn event when burning is disabled", (done) => {
    let totalSupply = 5000;
    let amount = 200;

    util.deployAll().then((c) => {
      let ev = c.token.Burn();

      c.ledger.multiMint(0, [util.addressValue(accs[0], totalSupply)]).then((txid) => {
        return c.token.burn("0x1122334455667788112233445566778811223344556677881122334455667788", amount);
      }).then((txid) => {
        return ev.get();
      }).then((events) => {
        throw "Recevied burn event"
        done();
      }).catch((err) => {
        console.log("caught error, failed to burn");
        done();
      });
    });
  });

  /**
   * Pause Test Suite
   */
  it("should NOT be able to transfer after being paused", (done) => {
    let totalSupply = 5000;
    let amount = 200;

    util.deployAll().then((c) => {
      c.ledger.multiMint(0, [util.addressValue(accs[0], totalSupply)]).then((txid) => {
        return c.token.pause();
      }).then((txid) => {
        return c.token.transfer("0x1122334455667788112233445566778811223344", amount);
      }).then((txid) => {
        assert.fail("Should be unable to transfer under current condition");
      }).catch((err) => {
        console.log("caught error, failed to transfer");
        done();
      });
    });
  });

  it("should be able to transfer after unpaused", (done) => {
    let totalSupply = 5000;
    let amount = 200;

    util.deployAll().then((c) => {
      let ev = c.token.Transfer();

      c.ledger.multiMint(0, [util.addressValue(accs[0], totalSupply)]).then((txid) => {
        return c.token.pause();
      }).then((txid) => {
        return c.token.unpause();
      }).then((txid) => {
        return c.token.transfer("0x1122334455667788112233445566778811223344", amount);
      }).then((txid) => {
        return ev.get();
      }).then((events) => {
        assert.equal(events[0].args.from, accs[0]);
        assert.equal(events[0].args.to, "0x1122334455667788112233445566778811223344");
        assert.equal(events[0].args.value.c[0], amount);
        done();
      }).catch((err) => {
        assert.fail("Unable to transfer under current condition");
        done();
      });
    });
  });

  it("should NOT be able to burn after being paused", (done) => {
    let defaultBurnAddress = '0x0000000000000000000000000000000000000000';
    let otherNetworkAddress = '0xdeadbeef00000000000000000000000000000000000000000000000000000000';

    let totalSupply = 5000;
    let amount = 200;

    util.deployAll().then((c) => {
      c.ledger.multiMint(0, [util.addressValue(accs[0], totalSupply)]).then((txid) => {
        return c.controller.enableBurning()
      }).then((txid) => {
        return c.token.pause();
      }).then((txid) => {
        return c.token.burn(defaultBurnAddress, amount);
      }).then((txid) => {
        assert.fail("Should be unable to burn under current condition");
      }).catch((err) => {
        console.log("caught error, failed to burn");
        done();
      });
    });
  });

  it("should be able to burn after being unpaused", (done) => {
    let aionAddress = '0xdeadbeef00000000000000000000000000000000000000000000000000000000';

    let totalSupply = 5000;
    let amount = 200;

    util.deployAll().then((c) => {
      let ev = c.token.Burn();

      c.ledger.multiMint(0, [util.addressValue(accs[0], totalSupply)]).then((txid) => {
        return c.controller.enableBurning()
      }).then((txid) => {
        return c.token.pause();
      }).then((txid) => {
        return c.token.unpause();
      }).then((txid) => {
        return c.token.burn(aionAddress, amount);
      }).then((txid) => {
        return ev.get();
      }).then((events) => {
        assert.equal(events[0].args.from, accs[0]);
        assert.equal(events[0].args.to, aionAddress);
        assert.equal(events[0].args.value.c[0], amount);
        done();
      }).catch((err) => {
        console.log(err);
        assert.fail("failed to burn");
        done();
      });
    });
  });

  /**
   * approval test suite
   */

  it("should be able to increase approval", (done) => {
    let totalSupply = 5000;
    let amount = 200;

    util.deployAll().then((c) => {
      let ev = c.token.Approval();

      c.ledger.multiMint(0, [util.addressValue(accs[0], totalSupply)]).then((txid) => {
        return c.token.approve("0x1122334455667788112233445566778811223344", amount);
      }).then((txid) => {
        return c.token.increaseApproval("0x1122334455667788112233445566778811223344", amount);
      }).then((txid) => {
        return ev.get();
      }).then((events) => {
        assert.equal(events[0].args.owner, accs[0]);
        assert.equal(events[0].args.spender, "0x1122334455667788112233445566778811223344");
        assert.equal(events[0].args.value.c[0], amount * 2);
        done();
      }).catch((err) => {
        assert.fail("Unable to increase approval");
        done();
      });
    });
  });

  it("should be able to decrease approval", (done) => {
    let totalSupply = 5000;
    let amount = 200;

    util.deployAll().then((c) => {
      let ev = c.token.Approval();

      c.ledger.multiMint(0, [util.addressValue(accs[0], totalSupply)]).then((txid) => {
        return c.token.approve("0x1122334455667788112233445566778811223344", amount);
      }).then((txid) => {
        return c.token.decreaseApproval("0x1122334455667788112233445566778811223344", amount);
      }).then((txid) => {
        return ev.get();
      }).then((events) => {
        assert.equal(events[0].args.owner, accs[0]);
        assert.equal(events[0].args.spender, "0x1122334455667788112233445566778811223344");
        assert.equal(events[0].args.value.c[0], 0);
        done();
      }).catch((err) => {
        assert.fail("Unable to decrease approval");
        done();
      });
    });
  });

  /**
   * General test cases
   */

  it("should be able to repeatly set controller before being finalized", (done) => {
    let controllerAddress = "0x0000000000000000000000000000000000000001";

    util.deployAll().then((c) => {
      c.token.setController(controllerAddress).then((tx) => {
        return c.token.controller();
      }).then(res => {
        assert.equal(controllerAddress, res);
        done();
      });
    });
  });

  it("should not be able to set controller after being finalized", (done) => {
    util.deployAll().then((c) => {
      c.token.finalize().then((tx) => {
        return c.token.setController(c.controller);
      }).then((tx) => {
        throw "Were able to set controller"
        done();
      }).catch((err) => {
        console.log("caught error, unable to set controller");
        done();
      });
    });
  });

  it("should NOT decrease totalSupply after coin burning", (done) => {
    let defaultBurnAddress = '0x0000000000000000000000000000000000000000';
    let otherNetworkAddress = '0xdeadbeef00000000000000000000000000000000000000000000000000000000';
    let totalSupply = 5000;
    let burnAmount = 200;

    util.deployAll().then((c) => {
      let burnEvent = c.token.Burn();

      c.ledger.multiMint(0, [util.addressValue(accs[0], totalSupply)]).then((txid) => {
        return c.controller.enableBurning()
      }).then((txid) => {
        return c.token.burn(otherNetworkAddress, burnAmount);
      }).then((txid) => {
        return burnEvent.get();
      }).then((events) => {
        assert.equal(events[0].args.from, accs[0]);
        assert.equal(events[0].args.to, otherNetworkAddress);
        assert.equal(events[0].args.value.c[0], burnAmount);
      }).then(() => {
        return c.token.totalSupply();
      }).then((res) => {
        assert.equal(totalSupply, res);
        done();
      });
    });
  });
});

contract('Minter', (accs) => {
  /**
   * Test the minting process, which contains the following steps:
   *
   * 0) (NOT TESTED) Minter collect <address, amount> info from the token sale;
   * 1) Foundation transfer ownership of ledger to minter;
   * 2) Minter mint the coins and verify the balances of each address;
   * 3) Minter transfer ownership back to foundation.
   */
  it("should not be able to mint", (done) => {
    util.deployAll().then((c) => {
      // transfer ownership
      c.ledger.changeOwner(accs[1]).then((txid) => {
        return c.ledger.acceptOwnership({from: accs[1]});
      }).then((txid) => {

        // check owner
        return c.ledger.owner();
      }).then((ret) => {
        assert(ret, accs[1]);

        // multimint
        const bits = [
          util.addressValue("0x1122334455667788112233445566778800000001", 1),
          util.addressValue("0x1122334455667788112233445566778800000002", 2)
        ];
        return c.ledger.multiMint(0, bits, {from: accs[1]});
      }).then((txid) => {

        // transfer ownership
        return c.ledger.changeOwner(accs[0], {from: accs[1]});
      }).then((txid) => {
        return c.ledger.acceptOwnership();
      }).then((txid) => {

        // check owner
        return c.ledger.owner();
      }).then((ret) => {
        assert(ret, accs[0]);

        // check balance
        return c.ledger.balanceOf("0x1122334455667788112233445566778800000001");
      }).then((ret) => {
        assert(ret, 1);
        return c.ledger.balanceOf("0x1122334455667788112233445566778800000002");
      }).then((ret) => {
        assert(ret, 2);
        done();
      });
    });
  });
});

contract("SafeMathTester", (accs) => {
  it("should throw on a multiplication overflow", (done) => {
    SafeMathTester.new().then((instance) => {
      instance.TestMultiplicationOverflow().catch((err) => {
        console.log("error caught, expected throw on multiplication overflow");
        done();
      });
    });
  });

  it("should throw on a addition overflow", (done) => {
    SafeMathTester.new().then((instance) => {
      instance.TestAdditionOverflow().catch((err) => {
        console.log("error caught, expected throw on addition overflow");
        done();
      });
    });
  });

  it("should throw on a subtraction underflow", (done) => {
    SafeMathTester.new().then((instance) => {
      instance.TestSubtractionUnderflow().catch((err) => {
        console.log("error caught, expected throw on subtraction underflow");
        done();
      });
    });
  });

});

/**
 * Generates the packed address value multiMint expects
 *
 * TODO: this function should throw if anything goes wrong
 * since its our responsibility to ensure the input is correct.
 * This function or some variation of it must be unit tested in the future
 * to ensure safe functionality.
 *
 * @param      {string}    address  The address in hexidecimal string format with or without '0x'
 * @param      {number}    value    The numerical value of the intended value to mint
 * @return     {string}    The correctly formatted numerical value that maps to uint256
 */
let addressValue = function(address, value) {
  let hexValue = value.toString(16);
  if (hexValue.length > 24)
    throw "size too large";

  let paddedHexValue = padLeft(hexValue, 12);

  let headerIncluded = false;
  if (address.substring(0, 2) == '0x') {
    headerIncluded = true;
  }

  if (headerIncluded && !(address.length == 42))
    throw "address wrong length";

  if (!headerIncluded && !(address.length == 40))
    throw "address wrong length";

  return address + paddedHexValue;
}

/**
 * Does all the dirtywork of setting up the contracts and
 * setting the controllers to eachother
 *
 * @return     {<type>}  { description_of_the_return_value }
 */
let deployAll = () => {
  p = new Promise((resolve, reject) => {
    c = {
      token: null,
      controller: null,
      ledger: null
    };

    Token.new().then((tokenInstance) => {
      Controller.new().then((controllerInstance) => {
        Ledger.new().then((ledgerInstance) => {
          c.token = tokenInstance;
          c.controller = controllerInstance;
          c.ledger = ledgerInstance;
        }).then(() => {
          return c.token.setController(c.controller.address);
        }).then((txid) => {
          return c.controller.setToken(c.token.address);
        }).then((txid) => {
          return c.controller.setLedger(c.ledger.address);
        }).then((txid) => {
          return c.ledger.setController(c.controller.address);
        }).then((txid) => {
          resolve(c);
        });
      });
    });
  });

  return p;
}

contract('Ledger', (accs) => {

  /**
   * Minting Suite
   */

  it("should mint one account with 100 tokens (correct nonce)", (done) => {
    deployAll().then((c) => {
      return c.ledger.multiMint(0, [addressValue(accs[0], 100)]);
    }).then((txid) => {
      return c.ledger.balanceOf(accs[0]);
    }).then((res) => {
      assert.equal(res.c[0], 100);
      done();
    });
  });

  it("should mint 10 accounts with values of 100*i", (done) => {
    deployAll().then((c) => {
      let mintList = []

      for (j = 0; j < 10; j++) {
        mintList.push(addressValue(accs[j], j*100));
      }

      c.ledger.multiMint(0, mintList).then((txid) => {
        return c.ledger.balanceOf(accs[0]);
      }).then((res) => {
        assert.equal(res.c[0], 0);
        return c.ledger.balanceOf(accs[1]);
      }).then((res) => {
        assert.equal(res.c[0], 100);
        return c.ledger.balanceOf(accs[2]);
      }).then((res) => {
        assert.equal(res.c[0], 200);
        return c.ledger.balanceOf(accs[3]);
      }).then((res) => {
        assert.equal(res.c[0], 300);
        return c.ledger.balanceOf(accs[4]);
      }).then((res) => {
        assert.equal(res.c[0], 400);
        return c.ledger.balanceOf(accs[5]);
      }).then((res) => {
        assert.equal(res.c[0], 500);
        return c.ledger.balanceOf(accs[6]);
      }).then((res) => {
        assert.equal(res.c[0], 600);
        return c.ledger.balanceOf(accs[7]);
      }).then((res) => {
        assert.equal(res.c[0], 700);
        return c.ledger.balanceOf(accs[8]);
      }).then((res) => {
        assert.equal(res.c[0], 800);
        return c.ledger.balanceOf(accs[9]);
      }).then((res) => {
        assert.equal(res.c[0], 900);
        done();
      });
    });
  });

  it("should fail trying to mint after minting disabled", (done) => {
    deployAll().then((c) => {
      c.ledger.stopMinting().then((txid) => {
        return c.ledger.multiMint(0, [addressValue(accs[0], 100)]);
      }).catch((err) => {
        console.log("caught error, trying to mint when minting disabled")
        done();
      });
    });
  });

  it("should fail trying to mint from not owner", (done) => {
    deployAll().then((c) => {
      return c.ledger.multiMint.sendTransaction(0, [addressValue(accs[1], 100)], {from: accs[1]});
    }).catch((err) => {
      console.log("caught error, trying to mint not as owner");
      done();
    });
  });

  it("should mint to an address containing leading zeroes", (done) => {
    let targetAddress = '0x0000000000000000000000000000000000000000';
    deployAll().then((c) => {
      c.ledger.multiMint(0, [addressValue(targetAddress, 100)]).then((txid) => {
        return c.ledger.balanceOf(targetAddress);
      }).then((res) => {
        assert.equal(res.c[0], 100);
        done();
      });
    });
  });

  it("should mint to the same account 10 times, each containing 100 tokens", (done) => {
    let targetAddress = '0x0000000000000000000000000000000000000000';
    deployAll().then((c) => {
      let mintList = [];
      for (j = 0; j < 10; j++) {
        mintList.push(addressValue(targetAddress, 100));
      }
      c.ledger.multiMint(0, mintList).then((txid) => {
        return c.ledger.balanceOf(targetAddress);
      }).then((res) => {
        assert.equal(res.c[0], 1000);
        done();
      });
    });
  });

  it("should not mint with the wrong nonce", (done) => {
    let targetAddress = '0x0000000000000000000000000000000000000000';
    deployAll().then((c) => {
      /**
       * This function does not fail, just returns without processing.
       * Assuming this is because of saving gas costs, but maybe we can
       * do with a revert in the future post Metropolis?
       */
      c.ledger.multiMint(1, [addressValue(targetAddress, 100)]).then((txid) => {
        return c.ledger.balanceOf(targetAddress);
      }).then((res) => {
        assert.equal(res.c[0], 0);
        done();
      });

    });
  });

  /**
   * TODO: we skip the transfer and approval suites because those need to be called down
   * from Token and Controller contracts.
   */

  /**
   * Finalize Suite
   */

  it("should not be able to modify controller after finalizing", (done) => {
    deployAll().then((c) => {
      c.ledger.finalize().then((txid) => {
        return c.ledger.setController(accs[0]);
      }).catch((err) => {
        console.log("caught error, cannot set controller after contract is finalized");
        done();
      });
    });
  });
});

contract("Foundation", (accs) => {
  /**0
   * This test is written from the viewpoint of the foundation
   */
  let inst;

  // multimint
  const bits = [
    util.addressValue(accs[0], 100),
    util.addressValue(accs[1], 200)
  ];

  let totalSupply = 0;
  for (i = 0; i < bits.length; i++) {
    totalSupply += parseInt(bits[i].substr(42), 16);
  }
  console.log("tokensupply: " + totalSupply );

  it("should transfer owner from accs[0] to the accs[1]", (done) => {
    util.deployAll().then ( (c) => {
     inst = c;
     return c.ledger.owner.call();
    }).then( (res) => {
      console.log("ledger current owner : " + res);
      return c.token.owner.call();
    }).then( (res) => {
      console.log("token current owner : " + res);
      return c.controller.owner.call();
    }).then( (res) => {
      console.log("cotroller current owner : " + res);
      console.log("preffer transafer account : " + accs[1]);
      return c.ledger.changeOwner(accs[1]);
    }).then( (tx) => {
      return c.token.changeOwner(accs[1]);
    }).then( (tx) => {
      return c.controller.changeOwner(accs[1]);
    }).then( (tx) => {
      return c.ledger.acceptOwnership({from: accs[1]});
    }).then( (tx) => {
      return c.ledger.owner.call();
    }).then( (res) => {
      assert.equal(res, accs[1]);
      return c.token.acceptOwnership({from: accs[1]});
    }).then( (tx) => {
      return c.token.owner.call();
    }).then( (res) => {
      assert.equal(res, accs[1]);
      return c.controller.acceptOwnership({from: accs[1]});
    }).then( (tx) => {
      return c.controller.owner.call();
    }).then( (res) => {
      assert.equal(res, accs[1]);
      done();
    });
  })

  it("should the contract state nothing has been minted", (done) => {
    console.log("Checking ledger status");
      inst.ledger.totalSupply.call().then((res) => {
        assert.equal(res, 0);
      }).then( () => {
        inst.ledger.mintingNonce.call().then( (res) => {
          assert.equal(res, 0);
        });
      }).then( () => {
        inst.ledger.mintingStopped.call().then( (res) => {
          assert.equal(res, false);
        });
      }).then( () => {
        inst.ledger.finalized.call().then( (res) => {
          assert.equal(res, false);
        });
      }).then( () => {
        inst.ledger.controller.call().then( (res) => {
          assert.equal(res, inst.controller.address);
        });
      });

    console.log("Checking token status");
    inst.token.name.call().then((res) => {
        assert.equal(res, "FixMeBeforeDeploying");
    }).then(() => {
      inst.token.decimals.call().then((res) => {
        assert.equal(res, 8);
      });
    }).then(() => {
      inst.token.symbol.call().then((res) => {
        assert.equal(res, "FIXME");
      });
    }).then(() => {
      inst.token.controller.call().then((res) => {
        assert.equal(res, inst.controller.address);
        //done();
      });
    }).then(() => {
      inst.token.motd.call().then((res) => {
        assert.equal(res, "");
      });
    }).then(() => {
      inst.token.burnAddress.call().then((res) => {
        assert.equal(res, "0x0000000000000000000000000000000000000000");
      });
    }).then(() => {
      inst.token.burnable.call().then((res) => {
        assert.equal(res, false);
      });
    }).then(() => {
      inst.token.paused.call().then((res) => {
        assert.equal(res, false);
      });
    }).then( () => {
      inst.token.finalized.call().then( (res) => {
        assert.equal(res, false);
      });
    });

    console.log("Checking controller status");
    inst.controller.finalized.call().then((res) => {
        assert.equal(res, false);
    }).then(() => {
      inst.controller.ledger.call().then((res) => {
        assert.equal(res, inst.ledger.address);
      });
    }).then(() => {
      inst.controller.token.call().then((res) => {
        assert.equal(res, inst.token.address);
      });
    }).then(() => {
      inst.controller.burnAddress.call().then((res) => {
        assert.equal(res, "0x0000000000000000000000000000000000000000");
        done();
      });
    })
  });

  it("should pause the contract", (done) => {
    inst.token.pause({from: accs[1]}).then(() => {
      inst.token.paused.call().then((res) => {
        assert.equal(res, true);
        done();
      });
    });
  });

  it("should transfer the minted abt to minter", (done) => {
    inst.ledger.changeOwner(accs[2], {from: accs[1]}).then(() => {
      return inst.ledger.acceptOwnership({from: accs[2]});
    }).then((tx) => {
      return inst.ledger.owner.call();
    }).then((res) => {
      assert.equal(res, accs[2]);
      done();
    });
  });

  it("should be able to mint some tokens by the minter", (done) => {
    inst.ledger.multiMint(0, bits, {from: accs[2]}).then( () => {
      return inst.ledger.stopMinting({from: accs[2]});
    }).then(() => {
      return inst.ledger.mintingStopped.call();
    }).then( (res) => {
        assert.equal(res, true);
    }).then( () => {
      return inst.ledger.totalSupply.call();
    }).then( (res) => {
      assert.equal(res, totalSupply);
      done();
    });
  });

  it("should transfer the ledger back to the foundation", (done) => {
    inst.ledger.changeOwner(accs[1], {from: accs[2]}).then( () => {
      return inst.ledger.acceptOwnership({from: accs[1]});
    }).then( () => {
      return inst.ledger.owner.call();
    }).then( (res) => {
      assert.equal(res, accs[1]);
      done();
    });
  });

  it("verify the balance minted by minter", (done) => {
    inst.ledger.totalSupply.call().then( (res) => {
      assert.equal(res, totalSupply);
    }).then( () => {

      const val = parseInt(bits[0].substr(42), 16);
      const addr = bits[0].substr(0,42);
      console.log("addr: " + addr + " val: " + val);
      inst.ledger.balanceOf.call( addr ).then( (res) => {
        console.log("res: " + res);
        assert.equal(res, val);
      });

      const val1 = parseInt(bits[1].substr(42), 16);
      const addr1 = bits[1].substr(0,42);
      console.log("addr: " + addr1 + " val: " + val1);
      inst.ledger.balanceOf.call( addr1 ).then( (res1) => {
        console.log("res: " + res1);
        assert.equal(res1, val1);
      });

      done();
    });
  });

  it("unpause contract", (done) => {
    inst.token.unpause({from: accs[1]}).then(() => {
      inst.token.paused.call().then((res) => {
        assert.equal(res, false);
        done();
      });
    });
  });

  it("should pause the contract again before update tokenContract", (done) => {
    inst.token.pause({from: accs[1]}).then(() => {
      inst.token.paused.call().then((res) => {
        assert.equal(res, true);
        done();
      });
    });
  });

  var newToken;
  it("should deploy new token contract", (done) => {
    util.Token.new({from: accs[0]}).then((token) => {

      token.setController(inst.controller.address).then( () => {
        let params = [token.name(),
                      token.decimals(),
                      token.symbol(),
                      token.controller(),
                      token.motd(),
                      token.burnAddress(),
                      token.burnable()]

        Promise.all(params).then((params) => {
          console.log()
          assert.equal(params[0], 'FixMeBeforeDeploying');
          assert.equal(params[1], 8);
          assert.equal(params[2], 'FIXME');
          assert.equal(params[3], inst.controller.address);
          assert.equal(params[4], '');
          assert.equal(params[5], '0x0000000000000000000000000000000000000000');
          assert.equal(params[6], false);
        });
      });

      newToken = token;
      done();
    });
  });

  it ("should transafer new token contract owner", (done) => {
    newToken.changeOwner(accs[1],{from: accs[0]}).then( (tx) => {
      return newToken.changeOwner(accs[1],{from: accs[0]});
    }).then( (tx) => {
      return newToken.acceptOwnership({from: accs[1]});
    }).then( (tx) => {
      return newToken.owner.call();
    }).then( (res) => {
      assert.equal(res, accs[1]);
      done();
    });
  });

  it ("should assign new token contract address to controller", (done) => {
    inst.controller.setToken(newToken.address, {from: accs[1]}).then( () => {
      inst.controller.token.call().then( (tAddr) => {
        console.log("newToken.address: " + newToken.address);
        console.log("token.address in the controller: " + tAddr);
        assert.equal(tAddr, newToken.address);
      }).then( () => {
        return newToken.totalSupply.call();
      }).then( (res) => {
        assert.equal(res, totalSupply);
        done();
      });
    });
  });

  it ("should transfer balnce from user[1] to user[2]", (done) => {
      newToken.transfer(accs[1], 50, {from: accs[0]}).then( (res) => {

        // Can't get the fuction return value
        //assert.equal(res, true);

        inst.ledger.balanceOf.call( accs[0] ).then( (res) => {
          console.log("acc0 res: " + res);
          assert.equal(res, 50);
        });

        inst.ledger.balanceOf.call( accs[1] ).then( (res1) => {
          console.log("acc1 res: " + res1);
          assert.equal(res1, 250);
        });

        done();
      });
    });
});

contract("Foundation", (accs) => {
  /**0
   * This test is written from the viewpoint of the foundation
   */
  let inst;

  // multimint
  const bits = [
    util.addressValue(accs[0], 100),
    util.addressValue(accs[1], 200)
  ];

  let totalSupply = 0;
  for (i = 0; i < bits.length; i++) {
    totalSupply += parseInt(bits[i].substr(42), 16);
  }
  console.log("tokensupply: " + totalSupply );

  it("should transfer owner from accs[0] to the accs[1]", (done) => {
    util.deployAll().then ( (c) => {
     inst = c;
     return c.ledger.owner.call();
    }).then( (res) => {
      console.log("ledger current owner : " + res);
      return c.token.owner.call();
    }).then( (res) => {
      console.log("token current owner : " + res);
      return c.controller.owner.call();
    }).then( (res) => {
      console.log("cotroller current owner : " + res);
      console.log("preffer transafer account : " + accs[1]);
      return c.ledger.changeOwner(accs[1]);
    }).then( (tx) => {
      return c.token.changeOwner(accs[1]);
    }).then( (tx) => {
      return c.controller.changeOwner(accs[1]);
    }).then( (tx) => {
      return c.ledger.acceptOwnership({from: accs[1]});
    }).then( (tx) => {
      return c.ledger.owner.call();
    }).then( (res) => {
      assert.equal(res, accs[1]);
      return c.token.acceptOwnership({from: accs[1]});
    }).then( (tx) => {
      return c.token.owner.call();
    }).then( (res) => {
      assert.equal(res, accs[1]);
      return c.controller.acceptOwnership({from: accs[1]});
    }).then( (tx) => {
      return c.controller.owner.call();
    }).then( (res) => {
      assert.equal(res, accs[1]);
      done();
    });
  })

  it("should the contract state nothing has been minted", (done) => {
    console.log("Checking ledger status");
      inst.ledger.totalSupply.call().then((res) => {
        assert.equal(res, 0);
      }).then( () => {
        inst.ledger.mintingNonce.call().then( (res) => {
          assert.equal(res, 0);
        });
      }).then( () => {
        inst.ledger.mintingStopped.call().then( (res) => {
          assert.equal(res, false);
        });
      }).then( () => {
        inst.ledger.finalized.call().then( (res) => {
          assert.equal(res, false);
        });
      }).then( () => {
        inst.ledger.controller.call().then( (res) => {
          assert.equal(res, inst.controller.address);
        });
      });

    console.log("Checking token status");
    inst.token.name.call().then((res) => {
        assert.equal(res, "FixMeBeforeDeploying");
    }).then(() => {
      inst.token.decimals.call().then((res) => {
        assert.equal(res, 8);
      });
    }).then(() => {
      inst.token.symbol.call().then((res) => {
        assert.equal(res, "FIXME");
      });
    }).then(() => {
      inst.token.controller.call().then((res) => {
        assert.equal(res, inst.controller.address);
        //done();
      });
    }).then(() => {
      inst.token.motd.call().then((res) => {
        assert.equal(res, "");
      });
    }).then(() => {
      inst.token.burnAddress.call().then((res) => {
        assert.equal(res, "0x0000000000000000000000000000000000000000");
      });
    }).then(() => {
      inst.token.burnable.call().then((res) => {
        assert.equal(res, false);
      });
    }).then(() => {
      inst.token.paused.call().then((res) => {
        assert.equal(res, false);
      });
    }).then( () => {
      inst.token.finalized.call().then( (res) => {
        assert.equal(res, false);
      });
    });

    console.log("Checking controller status");
    inst.controller.finalized.call().then((res) => {
        assert.equal(res, false);
    }).then(() => {
      inst.controller.ledger.call().then((res) => {
        assert.equal(res, inst.ledger.address);
      });
    }).then(() => {
      inst.controller.token.call().then((res) => {
        assert.equal(res, inst.token.address);
      });
    }).then(() => {
      inst.controller.burnAddress.call().then((res) => {
        assert.equal(res, "0x0000000000000000000000000000000000000000");
        done();
      });
    })
  });

  it("should pause the contract", (done) => {
    inst.token.pause({from: accs[1]}).then(() => {
      inst.token.paused.call().then((res) => {
        assert.equal(res, true);
        done();
      });
    });
  });

  it("should transfer the minted abt to minter", (done) => {
    inst.ledger.changeOwner(accs[2], {from: accs[1]}).then(() => {
      return inst.ledger.acceptOwnership({from: accs[2]});
    }).then((tx) => {
      return inst.ledger.owner.call();
    }).then((res) => {
      assert.equal(res, accs[2]);
      done();
    });
  });

  it("should be able to mint some tokens by the minter", (done) => {
    inst.ledger.multiMint(0, bits, {from: accs[2]}).then( () => {
      return inst.ledger.stopMinting({from: accs[2]});
    }).then(() => {
      return inst.ledger.mintingStopped.call();
    }).then( (res) => {
        assert.equal(res, true);
    }).then( () => {
      return inst.ledger.totalSupply.call();
    }).then( (res) => {
      assert.equal(res, totalSupply);
      done();
    });
  });

  it("should transfer the ledger back to the foundation", (done) => {
    inst.ledger.changeOwner(accs[1], {from: accs[2]}).then( () => {
      return inst.ledger.acceptOwnership({from: accs[1]});
    }).then( () => {
      return inst.ledger.owner.call();
    }).then( (res) => {
      assert.equal(res, accs[1]);
      done();
    });
  });

  it("verify the balance minted by minter", (done) => {
    inst.ledger.totalSupply.call().then( (res) => {
      assert.equal(res, totalSupply);
    }).then( () => {

      const val = parseInt(bits[0].substr(42), 16);
      const addr = bits[0].substr(0,42);
      console.log("addr: " + addr + " val: " + val);
      inst.ledger.balanceOf.call( addr ).then( (res) => {
        console.log("res: " + res);
        assert.equal(res, val);
      });

      const val1 = parseInt(bits[1].substr(42), 16);
      const addr1 = bits[1].substr(0,42);
      console.log("addr: " + addr1 + " val: " + val1);
      inst.ledger.balanceOf.call( addr1 ).then( (res1) => {
        console.log("res: " + res1);
        assert.equal(res1, val1);
      });

      done();
    });
  });

  it("unpause contract", (done) => {
    inst.token.unpause({from: accs[1]}).then(() => {
      inst.token.paused.call().then((res) => {
        assert.equal(res, false);
        done();
      });
    });
  });

  it("should pause the contract again before update the ledgerContract", (done) => {
    inst.token.pause({from: accs[1]}).then(() => {
      inst.token.paused.call().then((res) => {
        assert.equal(res, true);
        done();
      });
    });
  });

  it("should get correct total account balance", (done) => {
    inst.token.totalSupply().then((res) => {
      console.log("token totalSupply: " + res);
        assert.equal(res, totalSupply);
        done();
    });
  });


  var newLedger;
  it("should deploy new ledger contract", (done) => {
    util.Ledger.new({from: accs[0]}).then((ledger) => {

      let params = [ledger.controller(),
                    ledger.totalSupply(),
                    ledger.mintingNonce(),
                    ledger.mintingStopped(),
                    ledger.burnAddress()]

      Promise.all(params).then((params) => {
        console.log()
        assert.equal(params[0], '0x0000000000000000000000000000000000000000');
        assert.equal(params[1], 0);
        assert.equal(params[2], 0);
        assert.equal(params[3], false);
        assert.equal(params[4], '0x0000000000000000000000000000000000000000');
      });

      newLedger = ledger;
      done();
    });
  });

  var mig;
  it("should migration new ledger contract", (done) => {
    Migration.new({from: accs[2]}).then( (m) => {
      mig = m;
    }).then( () => {
      console.log("address: " + mig.address + " , last_completed_migration: " + mig.last_completed_migration.call());
      done();
    });
  });

  it("should be able to transfer the owner of new ledger to the foundation and assign controller", (done) => {
    newLedger.changeOwner(accs[1], {from: accs[0]}).then(() => {
      return newLedger.acceptOwnership({from: accs[1]});
    }).then((tx) => {
      return newLedger.owner.call();
    }).then((res) => {
      assert.equal(res, accs[1]);
    }).then( () => {
      newLedger.setController(inst.controller.address, {from: accs[1]}).then( ()=>{
        return newLedger.controller.call();
      }).then( (res) => {
        assert.equal(res, inst.controller.address);
        done();
      });
    });
  });

  it("should be able to transfer the owner of new ledger to the minter", (done) => {
    newLedger.changeOwner(accs[2], {from: accs[1]}).then(() => {
      return newLedger.acceptOwnership({from: accs[2]});
    }).then((tx) => {
      return newLedger.owner.call();
    }).then((res) => {
      assert.equal(res, accs[2]);
      done();
    });
  });

  it("should be able to mint the same tokens for the new ledger by the minter", (done) => {
    newLedger.multiMint(0, bits, {from: accs[2]}).then( (tx) => {
        return newLedger.stopMinting({from: accs[2]});
      }).then(() => {
        return newLedger.mintingStopped.call();
      }).then( (res) => {
          assert.equal(res, true);
      }).then( () => {
        return newLedger.totalSupply.call();
      }).then( (res) => {
        assert.equal(res, totalSupply);
        done();
      });
  });

  it("should transfer the owner back to the foundation", (done) => {
    newLedger.changeOwner(accs[1], {from: accs[2]}).then( () => {
      return newLedger.acceptOwnership({from: accs[1]});
    }).then( () => {
      return newLedger.owner.call();
    }).then( (res) => {
      assert.equal(res, accs[1]);
      done();
    });
  });

  it("should transfer the ledger back to the foundation", (done) => {
    inst.controller.setLedger(newLedger.address, {from: accs[1]}).then( () => {
      assert.equal(inst.ledger.address, newLedger.address);
    });
  });

  it("verify the balance minted by minter", (done) => {
    newLedger.totalSupply.call().then( (res) => {
      assert.equal(res, totalSupply);
    }).then( () => {

      var val = parseInt(bits[0].substr(42), 16);
      var addr = bits[0].substr(0,42);
      console.log("addr: " + addr + " val: " + val);
      newLedger.balanceOf.call( addr ).then( (res) => {
        console.log("res: " + res);
        assert.equal(res, val);
      });

      var val1 = parseInt(bits[1].substr(42), 16);
      var addr1 = bits[1].substr(0,42);
      console.log("addr: " + addr1 + " val: " + val1);
      newLedger.balanceOf.call( addr1 ).then( (res1) => {
        console.log("res: " + res1);
        assert.equal(res1, val1);
      });

      done();
    });
  });

  it("unpause contract", (done) => {
    inst.token.unpause({from: accs[1]}).then(() => {
      inst.token.paused.call().then((res) => {
        assert.equal(res, false);
        done();
      });
    });
  });
});

contract('Deployer', function(accounts) {
  it("should be able to deploy/link contracts and transfer ownership", function() {
    // deploy token
    return Token.new().then((instance) => {
      deployed.token = instance;

      // deploy controller
      return Controller.new();
    }).then((instance) => {
      deployed.controller = instance;

      // deploy ledger
      return Ledger.new();
    }).then((instance) => {
      deployed.ledger = instance;

      // check addresses of deployed contracts
      assert.notEqual(deployed.token.address, null);
      assert.notEqual(deployed.controller.address, null);
      assert.notEqual(deployed.ledger.address, null);

      // link controller and ledger
      return deployed.controller.setLedger(deployed.ledger.address);
    }).then((tx) => {
      return deployed.ledger.setController(deployed.controller.address);
    }).then((tx) => {

      // link controller and token
      return deployed.controller.setToken(deployed.token.address);
    }).then((tx) => {
      return deployed.token.setController(deployed.controller.address);
    }).then((tx) => {

      // check linking results
      return deployed.token.controller();
    }).then((ret) => {
      assert.equal(ret, deployed.controller.address);
      return deployed.controller.token();
    }).then((ret) => {
      assert.equal(ret, deployed.token.address);
      return deployed.controller.ledger();
    }).then((ret) => {
      assert.equal(ret, deployed.ledger.address);
      return deployed.token.controller();
    }).then((ret) => {
      assert.equal(ret, deployed.controller.address);

      // transfer ownership of token contract
      return deployed.token.changeOwner(accounts[1]);
    }).then((tx) => {
      return deployed.token.acceptOwnership({from: accounts[1]});
    }).then((tx) => {
      return deployed.token.owner();
    }).then((ret) => {
      assert.equal(ret, accounts[1]);

      // transfer ownership of controller contract
      return deployed.controller.changeOwner(accounts[1]);
    }).then((tx) => {
      return deployed.controller.acceptOwnership({from: accounts[1]});
    }).then((tx) => {
      return deployed.controller.owner();
    }).then((ret) => {
      assert.equal(ret, accounts[1]);

      // transfer ownership of ledger contract
      return deployed.ledger.changeOwner(accounts[1]);
    }).then((tx) => {
      return deployed.ledger.acceptOwnership({from: accounts[1]});
    }).then((tx) => {
      return deployed.ledger.owner();
    }).then((ret) => {
      assert.equal(ret, accounts[1]);
    });
  })
});


contract("Accidental", (accs) => {
  /**
   * Receivable Test Suite
   * 
   * TODO: Migrated from test_token into own suite
   *
   * Recall that TokenReceivable is used in case someone accidentally sends
   * tokens to OUR token contact address on their token contract.
   *
   * In this scenario he/she would probably contact us about the mistake
   * and we would have to manually call claimTokens
   */
  it("should be able to call another token contract to refund (9)", (done) => {
    let DummyToken = artifacts.require('./DummyToken.sol');
    util.Token.new().then((token) => {
      let debugEvent = null;
      DummyToken.new().then((dummy) => {
        debugEvent = dummy.DebugTransferEvent();
        return token.claimTokens(dummy.address, 1);
      }).then((txid) => {
        return debugEvent.get();
      }).then((event) => {
        assert.equal(event[0].event, 'DebugTransferEvent');
        done();
      });
    });
  });

  it("should be able to call itself and refund", async () => {
  	const c = await util.deployAll();
  	await c.ledger.multiMint(0, [util.addressValue(c.token.address, 100)]);
  	await c.token.claimTokens(c.token.address, accs[0]);
  	assert.equal((await c.token.balanceOf(accs[0])).toNumber(), 100);
  });
});

contract("Controller", (accs) => {

  it("should set the burnAddress for all contracts", (done) => {
    util.deployAll().then((c) => {
      c.controller.setBurnAddress(accs[0]).then((txid) => {
        return c.token.burnAddress();
      }).then((res) => {
        assert.equal(res, accs[0]);
        return c.controller.burnAddress();
      }).then((res) => {
        assert.equal(res, accs[0]);
        return c.ledger.burnAddress();
      }).then((res) => {
        assert.equal(res, accs[0]);
        done();
      });
    });
  });

  it("should not be able to set the burnAddress unless owner", (done) => {
    util.deployAll().then((c) => {
      c.controller.setBurnAddress.sendTransaction(accs[0], {from: accs[1]}).catch((err) => {
        console.log("error caught, cannot set burn address unless owner");
        done();
      });
    });
  });
});

contract("Foundation", (accs) => {

  /**
   * This test is written from the viewpoint of the foundation
   */
  it("should handle an update to the ledger correctly", (done) => {
    util.deployAll().then((c) => {
      let newLedger = null;
      let oldControllerAddr = null;

      /**
       * Assume a successful deployment, the next step is to pretend
       * to set an initial state onto the contract, this involves
       * setting the balances for a multitude of users. The idea here is to
       * test a massive batch create from users
       */
      let mintMax = 1000;
      let mintAmount = 200; // seems to be the average amount of user
                              // other ICOs are getting
      /**
       * Generate user account address for each account, these will be
       * random addresses
       */
      let accounts = []
      for (i = 0; i < mintAmount; i++) {
        let _acc = {addr: null, value: null};
        let seed = Math.floor(Math.random() * 1000000);
        _acc.addr = web3.sha3(seed.toString()).substring(0, 42);
        _acc.value = Math.floor(Math.random()*(mintMax-1)+1);
        accounts.push(_acc);
      }

      let balanceOfWrapper = (acc) => {
        //console.log(acc);
        return new Promise((resolve, reject) => {
          c.ledger.balanceOf(acc.addr).then((res) => {
            //console.log("res.c[0]: " + res.c[0] + " acc.value: " + acc.value);
            if (res.c[0] == acc.value)
              resolve(acc.value);
            else
              reject("incorrect value");
          });
        });
      }

      // NOTE: uses Token to query instead of ledger!
      let balanceOfZeroWrapper = (acc) => {
        //console.log(acc);
        return new Promise((resolve, reject) => {
          c.token.balanceOf(acc.addr).then((res) => {
            //console.log("res.c[0]: " + res.c[0] + " acc.value: " + acc.value);
            if (res.c[0] == 0)
              resolve(acc.value);
            else
              reject("incorrect value");
          });
        });
      }

      /**
       * Migration related functions
       */
      let multiMintWrapper = (nonce, mintArr) => {
        return c.ledger.multiMint.sendTransaction(nonce, mintArr, {from: accs[1]});
      }


      foundation.mintBatch(accounts, c.ledger.multiMint).then(() => {
        return foundation.confirmBatch(accounts, balanceOfWrapper).then((res) => {
          console.log("successfully generated the ledger correctly");
        }).then(() => {
          /**
           * Now that all necessary initial state is set, swap out the ledger
           * and verify that all account balances are now reset to 0
           */
          return util.Ledger.new();
        }).then((ledgerInstance) => {
          newLedger = ledgerInstance;
        }).then(() => {
          return c.controller.setLedger(newLedger.address);
        }).then((txid) => {
          // it doesnt matter what accounts we send in, as long as its the same length
          console.log("confirming that accounts are set to 0");
          return foundation.confirmBatch(accounts, balanceOfZeroWrapper);
        }).then((txid) => {
          /**
           * Assume at this point, assume accs[1] is a minter and transfer ownership
           */
          return c.ledger.changeOwner(accs[1]);
        }).then((txid) => {
          return c.ledger.acceptOwnership.sendTransaction({from: accs[1]});
        }).then((txid) => {
          return foundation.mintBatch(accounts, multiMintWrapper);
        }).then((txid) => {
          console.log("successfully minted as minter");
          console.log("transferring ownership back to foundation")
        }).then((txid) => {
          return c.ledger.changeOwner.sendTransaction(accs[0], {from: accs[1]});
        }).then((txid) => {
          // ownership back to foundation
          return c.ledger.acceptOwnership();
        }).then((txid) => {
          return foundation.confirmBatch(accounts, balanceOfWrapper);
        }).then((txid) => {
          console.log("foundation completed check that balances are same");
          done();
        });
      });

    });
  });

  it("should be able to upgrade controller", (done) => {
    util.deployAll().then((c) => {
      c.ledger.multiMint(0, [util.addressValue(accs[0], 100)]).then((txid) => {
        return c.token.pause();
      }).then((txid) => {
        return artifacts.require('./Controller.sol').new();
      }).then((instance) => {
        assert.notEqual(instance.address, c.controller.address);
        c.controller = instance;

        return c.controller.setToken(c.token.address);
      }).then((txid) => {
        return c.controller.setLedger(c.ledger.address);
      }).then((txid) => {
        return c.token.setController(c.controller.address);
      }).then((txid) => {
        return c.ledger.setController(c.controller.address);
      }).then((txid) => {
        return c.token.balanceOf(accs[0]);
      }).then((ret) => {
        assert.equal(ret, 100);
        done();
      });
    });
  });

});

contract("Foundation", (accs) => {
  /**0
   * This test is written from the viewpoint of the foundation
   */
  let inst;

  // multimint
  const bits = [
    util.addressValue("0x1122334455667788112233445566778800000001", 1),
    util.addressValue("0x1122334455667788112233445566778800000002", 2)
  ];

  let totalSupply = 0;
  for (i = 0; i < bits.length; i++) {
    totalSupply += parseInt(bits[i].substr(42));
  }
  console.log("tokensupply: " + totalSupply );

  it("should transfer owner from accs[0] to the accs[1]", (done) => {
    util.deployAll().then ( (c) => {
     inst = c;
     return c.ledger.owner.call();
    }).then( (res) => {
      console.log("ledger current owner : " + res);
      return c.token.owner.call();
    }).then( (res) => {
      console.log("token current owner : " + res);
      return c.controller.owner.call();
    }).then( (res) => {
      console.log("cotroller current owner : " + res);
      console.log("preffer transafer account : " + accs[1]);
      return c.ledger.changeOwner(accs[1]);
    }).then( (tx) => {
      return c.token.changeOwner(accs[1]);
    }).then( (tx) => {
      return c.controller.changeOwner(accs[1]);
    }).then( (tx) => {
      return c.ledger.acceptOwnership({from: accs[1]});
    }).then( (tx) => {
      return c.ledger.owner.call();
    }).then( (res) => {
      assert.equal(res, accs[1]);
      return c.token.acceptOwnership({from: accs[1]});
    }).then( (tx) => {
      return c.token.owner.call();
    }).then( (res) => {
      assert.equal(res, accs[1]);
      return c.controller.acceptOwnership({from: accs[1]});
    }).then( (tx) => {
      return c.controller.owner.call();
    }).then( (res) => {
      assert.equal(res, accs[1]);
      done();
    });
  })

  it("should the contract state nothing has been minted", (done) => {
    console.log("Checking ledger status");
      inst.ledger.totalSupply.call().then((res) => {
        assert.equal(res, 0);
      }).then( () => {
        inst.ledger.mintingNonce.call().then( (res) => {
          assert.equal(res, 0);
        });
      }).then( () => {
        inst.ledger.mintingStopped.call().then( (res) => {
          assert.equal(res, false);
        });
      }).then( () => {
        inst.ledger.finalized.call().then( (res) => {
          assert.equal(res, false);
        });
      }).then( () => {
        inst.ledger.controller.call().then( (res) => {
          assert.equal(res, inst.controller.address);
        });
      });

    console.log("Checking token status");
    inst.token.name.call().then((res) => {
        assert.equal(res, "FixMeBeforeDeploying");
    }).then(() => {
      inst.token.decimals.call().then((res) => {
        assert.equal(res, 8);
      });
    }).then(() => {
      inst.token.symbol.call().then((res) => {
        assert.equal(res, "FIXME");
      });
    }).then(() => {
      inst.token.controller.call().then((res) => {
        assert.equal(res, inst.controller.address);
        //done();
      });
    }).then(() => {
      inst.token.motd.call().then((res) => {
        assert.equal(res, "");
      });
    }).then(() => {
      inst.token.burnAddress.call().then((res) => {
        assert.equal(res, "0x0000000000000000000000000000000000000000");
      });
    }).then(() => {
      inst.token.burnable.call().then((res) => {
        assert.equal(res, false);
      });
    }).then(() => {
      inst.token.paused.call().then((res) => {
        assert.equal(res, false);
      });
    }).then( () => {
      inst.token.finalized.call().then( (res) => {
        assert.equal(res, false);
      });
    });

    console.log("Checking controller status");
    inst.controller.finalized.call().then((res) => {
        assert.equal(res, false);
    }).then(() => {
      inst.controller.ledger.call().then((res) => {
        assert.equal(res, inst.ledger.address);
      });
    }).then(() => {
      inst.controller.token.call().then((res) => {
        assert.equal(res, inst.token.address);
      });
    }).then(() => {
      inst.controller.burnAddress.call().then((res) => {
        assert.equal(res, "0x0000000000000000000000000000000000000000");
        done();
      });
    })
  });

  it("should pause the contract", (done) => {
    inst.token.pause({from: accs[1]}).then(() => {
      inst.token.paused.call().then((res) => {
        assert.equal(res, true);
        done();
      });
    });
  });

  it("should transfer the minted abt to minter", (done) => {
    inst.ledger.changeOwner(accs[2], {from: accs[1]}).then(() => {
      return inst.ledger.acceptOwnership({from: accs[2]});
    }).then((tx) => {
      return inst.ledger.owner.call();
    }).then((res) => {
      assert.equal(res, accs[2]);
      done();
    });
  });

  it("should be able to mint some tokens by the minter", (done) => {
    inst.ledger.multiMint(0, bits, {from: accs[2]}).then( () => {
      return inst.ledger.stopMinting({from: accs[2]});
    }).then(() => {
      return inst.ledger.mintingStopped.call();
    }).then( (res) => {
        assert.equal(res, true);
    }).then( () => {
      return inst.ledger.totalSupply.call();
    }).then( (res) => {
      assert.equal(res, totalSupply);
      done();
    });
  });

  it("should transfer the ledger back to the foundation", (done) => {
    inst.ledger.changeOwner(accs[1], {from: accs[2]}).then( () => {
      return inst.ledger.acceptOwnership({from: accs[1]});
    }).then( () => {
      return inst.ledger.owner.call();
    }).then( (res) => {
      assert.equal(res, accs[1]);
      done();
    });
  });

  it("verify the balance minted by minter", (done) => {
    inst.ledger.totalSupply.call().then( (res) => {
      assert.equal(res, totalSupply);
    }).then( () => {

      const val = parseInt(bits[0].substr(42));
      const addr = bits[0].substr(0,42);
      console.log("addr: " + addr + " val: " + val);
      inst.ledger.balanceOf.call( addr ).then( (res) => {
        console.log("res: " + res);
        assert.equal(res, val);
      });

      const val1 = parseInt(bits[1].substr(42));
      const addr1 = bits[1].substr(0,42);
      console.log("addr: " + addr1 + " val: " + val1);
      inst.ledger.balanceOf.call( addr1 ).then( (res1) => {
        console.log("res: " + res1);
        assert.equal(res1, val1);
      });

      done();
    });
  });

  it("unpause contract", (done) => {
    inst.token.unpause({from: accs[1]}).then(() => {
      inst.token.paused.call().then((res) => {
        assert.equal(res, false);
        done();
      });
    });
  });
});

