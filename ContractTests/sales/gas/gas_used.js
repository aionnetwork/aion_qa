const Sale = artifacts.require("Sale.sol");
const Receiver = artifacts.require("Receiver.sol");

const util = require('erc-utils');
const BigNumber = web3.BigNumber;
const fs = require('fs');

contract("Receiver & Sale", (accs) => {
  let price;
  let costs = [];
  before(async () => {
    util.setWeb3(web3);
    console.log("Current prices:");
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

  it("should calculate the cost for deployment", async () => {
    const [_sale, _r1, _r2] = await Promise.all([
      Sale.new(),
      Receiver.new(),
      Receiver.new()
    ]);
    let totalGasCost = 0;
    totalGasCost += util.cost(_sale.transactionHash, price).gasUsed;
    totalGasCost += util.cost(_r1.transactionHash, price).gasUsed;
    totalGasCost += util.cost(_r2.transactionHash, price).gasUsed;
    let cost = util.gasCost(totalGasCost, price);
    cost.name = "deployment";
    costs.push(cost);
  });

  describe("#init()", () => {
    it("should calculate the cost for initialization", async() => {
      const _sale = await Sale.new();
      const startTime = web3.eth.getBlock(web3.eth.blockNumber).timestamp;
      const endTime = startTime + 120000;
      const tx = await _sale.init(startTime, endTime, web3.toWei(1, 'ether'), web3.toWei(0.5, 'ether'));
      let cost = util.cost(tx.tx, price);
      cost.name = "init()";
      costs.push(cost);
    });
  })

  describe("#()", () => {
    it("should calculate the cost of a deposit", async () => {
      const [_sale, _r1, _r2, _r3] = await Promise.all([
        Sale.new(),
        Receiver.new(),
        Receiver.new(),
        Receiver.new()
      ]);

      await Promise.all([
        _sale.setReceivers(_r1.address, _r2.address, _r3.address),
        _r1.setSale(_sale.address),
        _r2.setSale(_sale.address),
        _r3.setSale(_sale.address)
      ]);

      // now deposit ether through a receiver and withdraw
      // arbitrary
      const startTime = web3.eth.getBlock(web3.eth.blockNumber).timestamp;
      const endTime = startTime + 120000;
      await _sale.init(startTime, endTime, web3.toWei(1, 'ether'), web3.toWei(0.5, 'ether'));

      const tx = await _r1.sendTransaction({from: accs[1], value: web3.toWei(0.1, 'ether')});
      let cost = util.cost(tx.tx, price);
      cost.name = "()";
      costs.push(cost);
    });
  });

  after(() => {
    util.logCSV("sales_gas.csv", costs);
  });
});