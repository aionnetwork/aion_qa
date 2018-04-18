const util = require('./util.js');

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