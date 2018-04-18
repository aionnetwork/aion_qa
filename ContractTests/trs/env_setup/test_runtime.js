const Savings = artifacts.require("SavingsTest.sol");
const Distributor = artifacts.require("DistributorTestMock.sol");
const Token = artifacts.require("TokenMock.sol");
const Controller = artifacts.require("ControllerMock.sol");
const Ledger = artifacts.require("LedgerMock.sol");

const assert = require('chai').assert;
const BN = require('bn.js');

const state = require('./state.json');

// TODO: swap to own utility once complete
const util = require('erc-utils');
const BigNumber = web3.BigNumber;
const secsPerMonth = 2592000;
function getBestBlockTimestamp(){
  return web3.eth.getBlock(web3.eth.blockNumber).timestamp;
}

/**
 * Truffle is still using web3 0.4.12 internally, which defaults to BigNumber.js,
 * convert to BN.js until web3 is updated.
 */
const toBN = (bignum) => {
  return new BN(bignum.toString(), 10);
}

// simpler version of the util
// this should ideally be consolidated with `erc-utils`
// do this if time permits
const deployERC20 = async () => {
  const [t, c, l] = await Promise.all([Token.new(), Controller.new(), Ledger.new()]);
  await Promise.all([
    t.setController(c.address),
    c.setToken(t.address),
    c.setLedger(l.address),
    l.setController(c.address)
  ]);
  return {token: t, controller: c, ledger: l};
}

const deployERC20Mint = async (accs) => {
  const [t, c, l] = await Promise.all([Token.new(), Controller.new(), Ledger.new()]);
  await Promise.all([
    t.setController(c.address),
    c.setToken(t.address),
    c.setLedger(l.address),
    l.setController(c.address)
  ]);

  let addressValueList = [];
  for (let i = 0; i < 10; i++) {
    addressValueList.push(util.addressValue(accs[i], 100));
  }

  await l.multiMint(0, addressValueList);
  return {token: t, controller: c, ledger: l};
}

const deployERC20Amount = async (accs, amount) => {
  const [t, c, l] = await Promise.all([Token.new(), Controller.new(), Ledger.new()]);
  await Promise.all([
    t.setController(c.address),
    c.setToken(t.address),
    c.setLedger(l.address),
    l.setController(c.address)
  ]);

  addressValueList = [];
  for (let i = 0; i < 10; i++) {
    addressValueList.push(util.addressValue(accs[i], amount));
  }

  await l.multiMint(0, addressValueList);
  return {token: t, controller: c, ledger: l};
}

contract("Savings Runtime", (accs) => {
  let s;
  let c;
  let d;
  // const total = "0x" + (
  //     new BN("3721696727671426")).add(new BN("11997814952940200")).toString(16)

  const total = 3721696727671426 + 11997814952940200;

  before(async () => {
    // deploy distributor first, so address is always deterministic
    d = await Distributor.new();
    [s, c] = await Promise.all([Savings.new(), deployERC20Amount(accs, total)]);

    await s.setToken(c.token.address);
    await s.init(12, 4);
    await s.finalizeInit();

    for (let i = 0; i < state.manifest.length; i++) {
      await s.multiMint.sendTransaction(
        i,
        [util.addressValue(state.manifest[i].address, (new BN(state.manifest[i].balance)).toString(16))], 
        {gasPrice: 1});
    }

    await s.lock();
    await c.token.transfer(s.address, total);
    await s.start(1513277100);
    await d.setWithdrawable(s.address);
    
    console.log("total face value: " + (await s.totalfv()).toString());
    console.log("total: " + (await s.total()).toString());
  });

  const test_distribute = async ({timestamp}) => {
    let total_distributed = new BN(0);
    for (let i = 0; i < state.manifest.length; i++) {
      const addr = state.manifest[i].address;
      const response = await s.withdrawTo.sendTransaction(state.manifest[i].address, timestamp, {gasPrice: 1});

      // get balance
      const balance = await c.token.balanceOf(addr);
      total_distributed = total_distributed.add(new BN(balance.toString()));
      console.log("#" + i +" address: " + addr + " " + balance.toString());
    }

    console.log("distributed: " + total_distributed.toString());
    console.log("final balance: " + (await c.token.balanceOf(s.address)).toString());

    return {distributed: total_distributed};
  }

  it("should setup runtime distribution", async () => {
    //await test_distribute({timestamp: 1513277100});
    //const tx = await d.distribute([state.manifest[0].address], 1513277100);
    console.log("ready for testing");
    console.log("distributor address: " + d.address);
  });
  
  // it("test monthly distributions", async () => {
  //   const m1_dist = await test_distribute({timestamp: 1513277100});
  //   const m2_dist = await test_distribute({timestamp: 1515869100});
  //   console.log("STATS");
  //   console.log("month1 distribution total: " + m1_dist.distributed.toString());
  //   console.log("month2 distribution total: " + m2_dist.distributed.toString());

  //   console.log("difference: " + m2_dist.distributed.sub(m1_dist.distributed).toString());
  // });
});