const Savings = artifacts.require("Savings.sol");
const Token = artifacts.require("TokenMock.sol");
const Controller = artifacts.require("ControllerMock.sol");
const Ledger = artifacts.require("LedgerMock.sol");
const DummyMock = artifacts.require("DummyMock.sol");

// TODO: misnamed variable
const gas = require('erc-utils');
const BigNumber = web3.BigNumber;

/**
 * Not all gas costs are covered here, only interesting items
 */
contract("Savings gas", (accs) => {
  let price;
  let costs = [];
  before(async () => {
    gas.setWeb3(web3);
    price = {
      gas: {
        low: new BigNumber('5000000000'),
        medium: new BigNumber('20000000000'),
        high: new BigNumber('24504381517')
      },
      eth: {
        CAD: new BigNumber('364.84')
      } 
    };
    console.log("Current prices:");
    console.log(price);
  });

  it("should produce deployment gas results", async () => {
    const s = await Savings.new();
    let deploymentCost = gas.cost(s.transactionHash, price);
    deploymentCost.name = "deployment";
    costs.push(deploymentCost);
  });

  it("should produce gas costs for changeOwner", async () => {
    const s = await Savings.new();
    const tx = await s.changeOwner(accs[1]);
    const tx2 = await s.changeOwner(accs[2]);

    let costTx = gas.cost(tx.tx, price);
    costTx.name = "changeOwner";
    costs.push(costTx);
  });

  it("should produce gas costs for start", async() => {
    const s = await Savings.new();
    const c = await gas.deployMVC(Token, Controller, Ledger);
    await s.setToken(c.token.address);
    await s.lock();
    const tx = await s.start(100); //arbitrary number
    let cost = gas.cost(tx.tx, price);
    cost.name = "start"
    costs.push(cost);
  });

  // test gas costs for a bulk transfer
  it("should produce gas costs for deposit", async () => {
    const c = await gas.deployMVC(Token, Controller, Ledger);
    const s = await Savings.new();

    await s.setToken(c.token.address);
    await gas.mint([accs[0]], 1000, c.ledger); //mint
    const approveTx = await c.token.approve(s.address, 1000);
    const approveCost = gas.cost(approveTx.tx, price);

    const tx = await s.deposit(1000);
    let cost = gas.cost(tx.tx, price);
    cost.name = "deposit";
    costs.push(cost);
  });

  describe("#bulkDepositTo()", () => {
    it("should produce gas costs for bulk deposit", async () => {
      const c = await gas.deployMVC(Token, Controller, Ledger);
      const s = await Savings.new();

      await s.setToken(c.token.address);
      await gas.mint([accs[0]], 1000, c.ledger); //mint
      await c.token.approve(s.address, 1000);

      let depositList = [];
      for (let i = 0; i < 50; i++) {
        const addrValue = "0x" + gas.addressValue(gas.numberToAddress(i), 1);
        depositList.push(addrValue);
      }

      const tx = await s.bulkDepositTo(depositList);
      let cost = gas.cost(tx.tx, price);
      cost.name = "bulkDepositTo (50)"
      costs.push(cost);
    });
  });

  describe("#multiMint()", () => {
    it("should produce gas costs for multiMint", async () => {
      const s = await Savings.new();
      let depositList = [];
      for (let i = 0; i < 100; i++) {
        const addrValue = "0x" + gas.addressValue(gas.numberToAddress(i), 1);
        depositList.push(addrValue);
      }

      const tx = await s.multiMint(0, depositList);
      const cost = gas.cost(tx.tx, price);
      cost.name = "multiMint (100)"
      costs.push(cost);
    });
  });

  describe("#withdraw()", () => {
    it("should produce gas costs for initial withdrawal, then one after", async () => {
      // dummy is for increment blocks, this test only works under testrpc
      const _dummy = await DummyMock.deployed();
      const [s, c] = await Promise.all([Savings.new(), gas.deployMVC(Token, Controller, Ledger)]);
      const expectedSpecial = 2500000;
      const expectedMonthly = 208333;

      await gas.mint(accs, 100000000, c.ledger);

      await s.setToken(c.token.address);
      await c.token.approve(s.address, 100000000);

      // everyone deposits
      let bulkDepositToList = [];
      for (let i = 0; i < 10; i++) {
        bulkDepositToList.push(gas.addressValue(accs[i], 10000000));
      }
      // bulk depositTo
      const tx = await s.bulkDepositTo(bulkDepositToList);

      // accumulate gas costs
      let totalGasUsed = 0;

      // lets assume case b == d, then each use should be getting 2.5mil instantly (no roundoffs)
      // lets assume the case of one particular user acc[0]
      await s.lock();
      await s.start(10);

      const txSpecial = await s.withdraw(); // 1 tx
      console.log("initial withdrawal");
      let txSpecialCost = gas.cost(txSpecial.tx, price);
      txSpecialCost.name = "$withdraw_{special}$";
      costs.push(txSpecialCost);

      for (let j = 0; j < 9; j++) {
        await _dummy.increment.sendTransaction({from: accs[0], gasPrice: 1});
      }

      console.log("monthly withdrawal");
      const txMonthlyAfter = await s.withdraw();
      let cost = gas.cost(txMonthlyAfter.tx, price);
      cost.name = "$withdraw_{monthly}$"
      costs.push(cost);
    });

    // test gas costs for a bulk transfer
    it("should produce gas costs for one user to withdraw special, then monthly", async () => {
      // dummy is for increment blocks, this test only works under testrpc
      const _dummy = await DummyMock.deployed();
      const [s, c] = await Promise.all([Savings.new(), gas.deployMVC(Token, Controller, Ledger)]);
      const expectedSpecial = 2500000;
      const expectedMonthly = 208333;

      await gas.mint(accs, 100000000, c.ledger);

      await s.setToken(c.token.address);
      await c.token.approve(s.address, 100000000);

      // everyone deposits
      let bulkDepositToList = [];
      for (let i = 0; i < 10; i++) {
        bulkDepositToList.push(gas.addressValue(accs[i], 10000000));
      }
      // bulk depositTo
      const tx = await s.bulkDepositTo(bulkDepositToList);

      // accumulate gas costs
      let totalGasUsed = 0;

      // lets assume case b == d, then each use should be getting 2.5mil instantly (no roundoffs)
      // lets assume the case of one particular user acc[0]
      await s.lock();
      await s.start(10);

      const txSpecial = await s.withdraw(); // 1 tx
      totalGasUsed += gas.cost(txSpecial.tx, price).gasUsed;

      const newBalance = await c.token.balanceOf(accs[0]);
      assert.equal(newBalance.toNumber(), expectedSpecial);

      let totalValue = expectedSpecial;
      for (let i = 0; i < 36; i++) {
        for (let j = 0; j < 9; j++) {
          await _dummy.increment.sendTransaction({from: accs[0], gasPrice: 1});
        }

        const txMonthly = await s.withdraw();
        totalGasUsed += gas.cost(txMonthly.tx, price).gasUsed;
        totalValue += expectedMonthly;

        const balance = await c.token.balanceOf(accs[0]);
        assert.equal(balance, totalValue);
      }

      let cost = gas.gasCost(totalGasUsed, price);
      costs.push(cost);
    });
  });

  describe("#default()", () => {
    it("should calculate the default gas costs for a base transaction", () => {
      let cost = gas.gasCost(21000, price);
      cost.name = "sendTransaction";
      costs.push(cost);
    });
  });

  after(() => {
    gas.logCSV("savings_costs.csv", costs);
  });
});