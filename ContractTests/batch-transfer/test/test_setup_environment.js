const Token = artifacts.require("TokenMock.sol");
const Controller = artifacts.require("ControllerMock.sol");
const Ledger = artifacts.require("LedgerMock.sol");
const BatchTransfer = artifacts.require("BatchTransfer.sol");

const assert = require('chai').assert;

// TODO: swap to own utility once complete
const util = require('erc-utils');

const deployERC20Mint = async (accs, amount) => {
  const [t, c, l] = await Promise.all([Token.new(), Controller.new(), Ledger.new()]);
  await Promise.all([
    t.setController(c.address),
    c.setToken(t.address),
    c.setLedger(l.address),
    l.setController(c.address)
  ]);

  let addressValueList = [];
  for (let i = 0; i < 10; i++) {
    addressValueList.push(util.addressValue(accs[i], amount));
  }

  await l.multiMint(0, addressValueList);
  return {token: t, controller: c, ledger: l};
}

contract("environment", (accs) => {
  it("should setup the environment", async () => {
    console.log("acc[0]: " + accs[0]);
    const c = await deployERC20Mint(accs, 14792500000000);
    const batchTransfer = await BatchTransfer.new();
    console.log("transfer address: " + batchTransfer.address);
    console.log("token address: " + c.token.address);

    await batchTransfer.setToken(c.token.address);
    await c.token.transfer(batchTransfer.address, 14792500000000);
    const mintingNonce = await batchTransfer.nonce();

    console.log("mintingNonce: " + mintingNonce);
    // at this point, environment should be setup;
  });
});