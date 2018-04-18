const util = require('../test/util.js')
const u = require('erc-utils');
const BigNumber = web3.BigNumber;

contract("Token Gas", (accs) => {
  let price;
  let costs = [];
  before(() => {
    u.setWeb3(web3);
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
  });

  describe("deployment", () => {
    it("should calculate costs for deployment", async() => {
      const c = await util.deployAll();

      let tokenCost = u.cost(c.token.transactionHash, price);
      let controllerCost = u.cost(c.controller.transactionHash, price);
      let ledgerCost = u.cost(c.ledger.transactionHash, price);

      tokenCost.name = "$Deploy_{t}$";
      controllerCost.name = "$Deploy_{c}$";
      ledgerCost.name = "$Deploy_{l}$";

      costs.push(tokenCost);
      costs.push(controllerCost);
      costs.push(ledgerCost);
    });
  });

  describe("#transfer()", () => {
    it("should calculate costs transfer 100 tokens from account 0 to account 1", async () => {
      const c = await util.deployAll();
      await c.ledger.multiMint(0, [util.addressValue(accs[0], 100)]);
      const firstTransfer = await c.token.transfer(accs[1], 50);
      const secondTransfer = await c.token.transfer(accs[1], 50);

      let ftCost = u.cost(firstTransfer.tx, price);
      let stCost = u.cost(secondTransfer.tx, price);

      ftCost.name = "$transfer_{zero}$"
      stCost.name = "$transfer_{non zero}$"

      costs.push(ftCost);
      costs.push(stCost);
    });
  });

  describe("#approve", () => {
    it("should calculate costs for approval", async () => {
      const c = await util.deployAll();
      await c.ledger.multiMint(0, [util.addressValue(accs[0], 100)]);
     
      const firstTransfer = await c.token.approve(accs[1], 50);
      const secondTransfer = await c.token.approve(accs[1], 50);

      let ftCost = u.cost(firstTransfer.tx, price);
      let stCost = u.cost(secondTransfer.tx, price);

      ftCost.name = "$approve_{zero}$"
      stCost.name = "$approve_{non zero}$"

      costs.push(ftCost);
      costs.push(stCost);
    });
  });

  describe("#transferFrom", () => {
    it("should calculate costs for transferFrom", async () => {
      const c = await util.deployAll();
      await c.ledger.multiMint(0, [util.addressValue(accs[0], 100)]);
      await c.token.approve(accs[0], 100);

      const tx1 = await c.token.transferFrom(accs[0], accs[1], 50);
      const tx2 = await c.token.transferFrom(accs[0], accs[1], 50);

      let c1 = u.cost(tx1.tx, price);
      let c2 = u.cost(tx2.tx, price);

      c1.name = "$transferFrom_{zero}$";
      c2.name = "$transferFrom_{non zero}$";

      costs.push(c1);
      costs.push(c2);
    });
  });

  describe("#burn()", () => {
    it("should calculate costs for a burn", async () => {
      const defaultBurnAddress = '0x0000000000000000000000000000000000000000';
      const otherNetworkAddress = '0x00000000000000000000000000000000000000000000000000000000deadbeef';
      
      const c = await util.deployAll();
      await c.ledger.multiMint(0, [util.addressValue(accs[0], 100)]);
      await c.controller.enableBurning();
      const tx1 = await c.token.burn(otherNetworkAddress, 99);
      const tx2 = await c.token.burn(otherNetworkAddress, 1);

      let c1 = u.cost(tx1.tx, price);
      let c2 = u.cost(tx2.tx, price);

      c1.name = "$burn_{zero}$";
      c2.name = "$burn_{non zero}$";

      costs.push(c1);
      costs.push(c2);
    });
  });

  describe("#multiMint()", async () => {
    it("should calculate the costs for a 100 person mint", async() => {
      let addrs = [];
      let addressValues = [];
      for (let i = 0; i < 100; i++) {
        const addr = "0x" + u.numberToAddress(i);
        addrs.push(addr);
        addressValues.push(u.addressValue(addr, 1000));
      }

      const c = await util.deployAll();
      const tx = await c.ledger.multiMint(0, addressValues);

      let cost = u.cost(tx.tx, price);
      cost.name = "multiMint (100)";
      costs.push(cost);
    });
  });

  after(() => {
    u.logCSV("token_costs.csv", costs);
  });
})