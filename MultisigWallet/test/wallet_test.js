#!/usr/bin/env nodejs

// How to run: mocha wallet_test.js
const fs = require('fs');
global.Web3 = require('../../../aion_web3'); // directory where Web3 is stored, adjust accordingly
const web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:8545"));
const expect = require("chai").expect;

const unlock = require('./contracts/unlock.js')
const compile = require('./contracts/compile.js');
const deploy = require('./contracts/deploy.js');

const sol = fs.readFileSync(__dirname + '/contracts/wallet.sol', {
    encoding: 'utf8'
});


/*
  Test Structure:
    a) contract compile
      1) compile()
      2) deploy()

		b) multiowned contract
      1) addOwner()
      2) removeOwner()
      3) changeOwner()
      4) changeRequirement()
      5) isOwner()
      6) getOwner()

      TO DO:
      7) revoke()
      8) hasConfirmed()

		c) daylimit contract
  		1) setDayLimit()
  		2) resetSpentToday()

		d) multisig contract
  		1) payable()
  		2) execute()
  		3) confirm()
*/

let contractAddr;
let events;
let contractInstance;
let tx, abi, code;
let operation;
let acc = web3.eth.accounts;
// main wallet owners will be a0, a1, a2, a3
// a4 will be used to execute transactions to
let a0 = acc[0], a1 = acc[1], a2 = acc[2], a3 = acc[3], a4=acc[4]
// password for accounts a0-a3
let pw = 'PasswordGoesHere';

describe('a) contract compile', () => {
  it('contract compile', (done) => {
      compile(web3, sol).then((res) => {
          abi = res.Wallet.info.abiDefinition;
          code = res.Wallet.code;
          done();
      }, (err) => {
          done(err);
      })
  }).timeout(0);

  it('contract deploy', (done) => {
    unlock(web3, a0, pw)
    unlock(web3, a1, pw)
    unlock(web3, a2, pw)
    unlock(web3, a3, pw),
    deploy(web3, a0, a1, a2, pw, abi, code)
        .then((res) => {
            contractAddr = res.address;
            contractInstance = web3.eth.contract(abi).at(contractAddr);

            console.log('[log] contract address:', res.address);
            done();
        }, (err) => {
            done(err);
        });

  }).timeout(0);
})

/*
  multiowned contract:
  1) add owner --> add an owner to the list of owners
  2) remove owner --> remove an owner from the list of owners
  3) owner changed --> change the address of an existing owner
  4) requirement change --> changing the required signatures
  5) isOwner() --> check if account is owner of wallet
  6) getOwner()

  TO DO:
  7) accept a confirmation --> record owner and operation hash
  8) revoke --> revert remaining gas to the _to address when an operation is revoked
  methods to test: addOwner(), removeOwner(), changeOwner(), changeRequirement(), hasConfirmed(),  revoke(), multiowned()
*/
describe('b) multiowned contract', () => {
  // 5) check if acc3 is owner
  // it('acc3 should not be an owner'), (done) => {
  //   let check = multiownedInstance.isOwner(a3, {
  //       from: a0,
  //       data: code,
  //       gas: 3000000,
  //       gasPrice: 1
  //     },
  //   (err, res) => {
  //     if (err)
  //     console.log('error', err);
  //     else {
  //       console.log('[log]', res);
  //     }
  //   })
  //   check()
  //   done();
  // }

  // 1) adding new owner (acc3), to wallet
  it('add new owner', (done) => {
    let add_addr = a3;
    contractInstance.addOwner(add_addr, {
      from: a0,
      data: code,
      gas: 3000000,
      gasPrice: 1
    },
    (err, res) => {
        if (err)
          console.log('error', err);
        else {
          console.log('[log] addOwner() tx hash:', res);

          tx = res;
          events = contractInstance.OwnerAdded({}, {fromBlock: 0, toBlock: 'latest'});

          events.watch(function (err, res) {
            if ((res.transactionHash === tx) &&
            (res.event === 'OwnerAdded') &&
            (res.args.newOwner === a3)) {
              console.log('[log] OwnerAdded result', res);

              // event & newOwner is what we expected
              expect(res.event).to.equal('OwnerAdded');
              expect(res.args.newOwner).to.equal(a3);
              events.stopWatching();
              done();

            } else if (err) {
              events.stopWatching();
              done(err)
            }
          });
        }
      })
  }).timeout(0)

  // 2) removing owner (acc3), from wallet
  it('remove owner', (done) => {
    let remove_addr = a3;
    contractInstance.removeOwner(remove_addr, {
      from: a0,
      data: code,
      gas: 3000000,
      gasPrice: 1
    },
    (err, res) => {
        if (err)
          console.log('error', err);

        else {
          console.log('[log] removeOwner() tx hash:', res);

          tx = res;
          events = contractInstance.OwnerRemoved({}, {fromBlock: 0, toBlock: 'latest'});

          events.watch(function (err, res) {
            if ((res.transactionHash === tx) &&
            (res.event === 'OwnerRemoved') &&
            (res.args.oldOwner === a3)) {
              console.log('[log] OwnerRemoved result', res);

              // event & oldOwner is what we expected
              expect(res.event).to.equal('OwnerRemoved');
              expect(res.args.oldOwner).to.equal(a3);
              events.stopWatching();
              done();

            } else if (err) {
              events.stopWatching();
              done(err)
            }
          });
        }
      })
  }).timeout(0)

  // 3) changing owner (from a2, to a3)
  it('change owner (from acc2, to acc3)', (done) => {
    let from_addr = a2;
    let to_addr = a3;
    console.log('[log] from:', a2);
    console.log('[log] to:', a3);

    contractInstance.changeOwner(from_addr, to_addr, {
      from: a0,
      data: code,
      gas: 3000000,
      gasPrice: 1
    },
    (err, res) => {
        if (err)
          console.log('error', err);
        else {
          console.log('[log] changeOwner() tx hash:', res);

          tx = res;
          events = contractInstance.OwnerChanged({}, {fromBlock: 0, toBlock: 'latest'});

          events.watch(function (err, res) {
            if ((res.transactionHash === tx) &&
              (res.event === 'OwnerChanged') &&
              (res.args.oldOwner === a2) &&
              (res.args.newOwner === a3)) {
              console.log('[log] OwnerChanged result', res);
              // event & newOwner & olderOwner is what we expected
              expect(res.event).to.equal('OwnerChanged');
              expect(res.args.oldOwner).to.equal(a2);
              expect(res.args.newOwner).to.equal(a3);
              events.stopWatching();
              done();

            } else if (err) {
              events.stopWatching();
              done(err)
            }
          });
        }
      })
  }).timeout(0)

  // 4) changing requirements (from 3 to 2 signatures)
  it('change required signatures (from 3 to 2)', (done) => {
    let new_required = 2;
    let current_required = contractInstance.m_required().toNumber();
    console.log('[log] current requirement:', current_required);

    contractInstance.changeRequirement(new_required, {
      from: a0,
      data: code,
      gas: 3000000,
      gasPrice: 1
    },
    (err, res) => {
        if (err)
          console.log('error', err);
        else {
          console.log('[log] changeRequirement() tx hash:', res);
          tx = res;

          // loop & check public variable m_required
          itv = setInterval(() => {
            let current_required = contractInstance.m_required().toNumber();
            if (current_required === new_required) {
              expect(current_required).to.equal(new_required);
              stopInterval();
              console.log('[log] new requirement:', current_required);
              done();
            }
          }, 6000);
        }
      })
  }).timeout(0)

  // 5) accept a confirmation --> record owner and operation hash
  // 6) revoke --> revert remaining gas to the _to address when an
});

/* Daylimit Contract Test Suite
  1) setDailyLimit --> sets daily limit & does not alter amount already spent today
  2) resetSpentToday() --> resets amount spent today
*/
describe('c) multiowned contract', () => {
  // 1) setting daily limit from 5000000000000000000 to 2949109293494949494
  it('set daily limit', (done) => {
    let new_dailyLimit = 9949109293494949494;
    let current_dailyLimit = contractInstance.m_dailyLimit().toNumber();;
    console.log('[log] current daily limit:', current_dailyLimit);

    contractInstance.setDailyLimit(new_dailyLimit, {
      from: a0,
      data: code,
      gas: 3000000,
      gasPrice: 1
    },
    (err, res) => {
        if (err)
          console.log('error', err);
        else {
          console.log('[log] setting new limit to:', new_dailyLimit);
          console.log('[log] setDailyLimit() tx hash:', res);
          tx = res;

          // loop & check public variable m_dailyLimit
          itv = setInterval(() => {
            let current_dailyLimit = contractInstance.m_dailyLimit().toNumber();
            if (current_dailyLimit === new_dailyLimit) {
              expect(current_dailyLimit).to.equal(new_dailyLimit);
              console.log('[log] new daily limit:', current_dailyLimit);
              stopInterval();
              done();
            }
          }, 6000);
        }
      })
  }).timeout(0)

  // 2) resetting amount spent today
  it('reset amount spent today', (done) => {
    contractInstance.resetSpentToday({
      from: a0,
      data: code,
      gas: 3000000,
      gasPrice: 1
    },
    (err, res) => {
        if (err)
          console.log('error', err);
        else {
          console.log('[log] resetSpentToday() tx hash:', res);
          tx = res; // find a way to match tx for action to happen?


          // loop & check public variable m_dailyLimit
          itv = setInterval(() => {
            let current_spentToday = contractInstance.m_spentToday().toNumber();
            if (current_spentToday === 0) {
              expect(current_spentToday).to.equal(0);
              stopInterval();
              done();
            }
          }, 6000);
        }
      })
  }).timeout(0)
});

/*
  Wallet/Multisig Test Suite
    1) payable()
    2) execute underlimit()
    3) a) execute overlimit()
       b)confirm() -> need 3 confirmations since overlimit
*/
describe('c) Wallet testing', () => {
  // 1) payable()
  it('payable() / Deposit ', (done) => {
    let depositAmt = 3000000000000000000;
    console.log('[log] transferring money to multisig contract');
    web3.eth.sendTransaction({
        from: a0,
        to: contractAddr,
        value: web3.toWei(3, 'ether'),
        gas: 3000000
    }, (err, res) => {
        if (err)
            console.log('[err] ' + err)
        else {
          console.log('[log] payable() tx hash:', res);
          tx = res;

          events = contractInstance.Deposit({}, {fromBlock: 0, toBlock: 'latest'});

          events.watch(function (err, res) {
            if ((res.transactionHash === tx) &&
              (res.event === 'Deposit')){
              console.log('[log] Deposit result', res);

              // event & amount deposited is what we expected
              expect(res.event).to.equal('Deposit');
              expect(res.args.value.toNumber()).to.equal(depositAmt)
              events.stopWatching();
              done();

            } else if (err) {
              events.stopWatching();
              done(err)
            }
          });
        }
    })
  }).timeout(0);

  // 2) execute transaction under limit
  it('execute transaction under limit ', (done) => {
    let txAmt = 1000000000000000000;
    contractInstance.execute(a4, web3.toWei(1, 'ether'), '0x', {
        from: a0,
        gas: 3000000,
        gasPrice: 1,
    },
    (err, res) => {
        if (err)
            console.log('[err]')
        else {
          console.log('[log] execute() tx hash:', res);
          tx = res;
          // since under limit, transaction will go through
          // look for SingleTransact event
          events = contractInstance.SingleTransact({}, {fromBlock: 0, toBlock: 'latest'});

          events.watch(function (err, res) {
            if ((res.transactionHash === tx) &&
                (res.event === 'SingleTransact') &&
                (res.args.to === a4)){
              console.log('[log] SingleTransact result', res);

              // event & amount deposited is what we expected
              expect(res.event).to.equal('SingleTransact');
              expect(res.args.owner).to.equal(a0);
              // expect(res.args.value).to.equal(txAmt);
              expect(res.args.to).to.equal(a4);;
              events.stopWatching();
              done();

            } else if (err) {
              events.stopWatching();
              done(err)
            }
          });
        }
    })
  }).timeout(0);

  // 3) execute transaction over limit, thus need confirmations
  describe('execute transaction over limit & call for 2 more confirmations', () => {

    it('execute transaction over limit ', (done) => {
      let txAmt = 11000000000000000000;
      contractInstance.execute(a4, web3.toWei(11, 'ether'), '0x', {
          from: a0,
          gas: 3000000,
          gasPrice: 1,
      },
      (err, res) => {
          if (err)
              console.log('[err]')
          else {
            console.log('[log] execute() tx hash:', res);
            tx = res;

            // Since transaction is over limit, need confirmation from other accounts
            events = contractInstance.ConfirmationNeeded({}, {fromBlock: 0, toBlock: 'latest'});

            events.watch(function (err, res) {
              if ((res.transactionHash === tx) &&
                  (res.event === 'ConfirmationNeeded') &&
                  (res.args.to === a4)){
                console.log('[log] ConfirmationNeeded result', res);
                //store operation hash
                operation = res.args.operation;
                // event & initiator, and to whom deposited is what we expected
                expect(res.event).to.equal('ConfirmationNeeded');
                expect(res.args.initiator).to.equal(a0);
                expect(res.args.to).to.equal(a4);
                events.stopWatching();
                done();

              } else if (err) {
                events.stopWatching();
                done(err)
              }
            });
          }
      })
    }).timeout(0);

    it('account 1 & 3 confirming', (done) => {
      contractInstance.confirm(
        operation, {
            from: a1,
            gas: 3000000,
            gasPrice: 1,
        },
        (err, res) => {
          if (err)
            console.log('[err]')
          else {
            console.log('[log] confirm() account #1 tx hash:', res);
          }
      })
      contractInstance.confirm(
        operation, {
            from: a3,
            gas: 3000000,
            gasPrice: 1,
        },
        (err, res) => {
          if (err)
            console.log('[err]')
          else {
            console.log('[log] confirm() account #3 tx hash:', res);
          }
      })
      done();
    }).timeout(0);

    it('account 1 confirmed success', (done) => {
      events = contractInstance.Confirmation({}, {fromBlock: 0, toBlock: 'latest'});

      events.watch(function (err, res) {
        if ((res.event === 'Confirmation') &&
            (res.args.owner === a1)) {
          console.log('[log] account 1 - Confirmation result', res);
          // event correct
          expect(res.event).to.equal('Confirmation');
          // account #1 confirmed deposited is what we expected
          expect(res.args.owner).to.equal(a1);

          events.stopWatching();
          done();

        } else if (err) {
          events.stopWatching();
          done(err)
        }
      })
    }).timeout(0);

    it('account 3 confirmed success', (done) => {
      events = contractInstance.Confirmation({}, {fromBlock: 0, toBlock: 'latest'});

      events.watch(function (err, res) {
        if ((res.event === 'Confirmation') &&
            (res.args.owner === a3)) {
          console.log('[log] account 3 - Confirmation result', res);
          // event correct
          expect(res.event).to.equal('Confirmation');
          // account #1 confirmed deposited is what we expected
          expect(res.args.owner).to.equal(a3);

          events.stopWatching();
          done();

        } else if (err) {
          events.stopWatching();
          done(err)
        }
      })
    }).timeout(0);

  }); // end of overlimit transaction

})

function stopInterval() {
  clearInterval(itv);
}
