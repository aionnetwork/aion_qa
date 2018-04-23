const Swapper = artifacts.require('Swapper.sol');
const TokenMock = artifacts.require('TokenMock.sol');
const ControllerMock = artifacts.require('ControllerMock.sol');
const LedgerMock = artifacts.require('LedgerMock.sol');

const assert = require('chai').assert;

contract('Swapper', (accs) => {
  describe("#setTCL()", () => {
    it("sets Token, Controller and Ledger Mock", async () => {
      const [s, t, c, l] = await Promise.all(
        [Swapper.new(),
         TokenMock.new(),
         ControllerMock.new(),
         LedgerMock.new()]
      );

      await s.setTCL(t.address, c.address, l.address);
      assert.equal(await s.token(), t.address);
      assert.equal(await s.controller(), c.address);
      assert.equal(await s.ledger(), l.address);
    });
  });

  describe("#doAcceptTCLOwnership", () => {
    it("accepts ownership", async () => {
      const [s, t, c, l] = await Promise.all(
        [Swapper.new(),
         TokenMock.new(),
         ControllerMock.new(),
         LedgerMock.new()]
      );

      await Promise.all(
        [t.changeOwner(s.address),
         c.changeOwner(s.address),
         l.changeOwner(s.address)]
      );

      // set the TCL contracts
      await s.setTCL(t.address, c.address, l.address);

      // accept ownership (the `do` of TCL)
      await s.doAcceptTCLOwnership();

      assert.equal(await t.owner(), s.address);
      assert.equal(await c.owner(), s.address);
      assert.equal(await l.owner(), s.address);
    });
  });

  describe("#setTCLOwnership", () => {
    it("should set the heir", async () => {
      const [s, t, c, l] = await Promise.all(
        [Swapper.new(),
         TokenMock.new(),
         ControllerMock.new(),
         LedgerMock.new()]
      );

      await Promise.all(
        [
          t.changeOwner(s.address),
          c.changeOwner(s.address),
          l.changeOwner(s.address)
        ]);

      await s.setTCL(t.address, c.address, l.address);

      // accept ownership
      await s.doAcceptTCLOwnership();

      // transfer ownership back to accs[0]
      await s.setTCLOwnership(accs[0]);

      assert.equal(await s.TCLHeir(), accs[0]);
    });
  });

  describe("#doTransferTCLOwnership", () => {
    it("should set the heir", async () => {
      const [s, t, c, l] = await Promise.all(
        [Swapper.new(),
         TokenMock.new(),
         ControllerMock.new(),
         LedgerMock.new()]
      );

      await Promise.all(
        [
          t.changeOwner(s.address),
          c.changeOwner(s.address),
          l.changeOwner(s.address)
        ]);

      await s.setTCL(t.address, c.address, l.address);

      // accept ownership
      await s.doAcceptTCLOwnership();

      // transfer ownership to accs[1]
      await s.setTCLOwnership(accs[1]);
      await s.doTransferTCLOwnership();

      await Promise.all([
        t.acceptOwnership.sendTransaction({from: accs[1]}),
        c.acceptOwnership.sendTransaction({from: accs[1]}),
        l.acceptOwnership.sendTransaction({from: accs[1]})
      ]);

      assert.equal(await t.owner(), accs[1]);
      assert.equal(await c.owner(), accs[1]);
      assert.equal(await l.owner(), accs[1]);
    });
  });

  describe("#setNewControllerAddress", () => {
    it("should set the new controller address", async () => {
      const [s, c] = await Promise.all(
        [Swapper.new(),
         ControllerMock.new()]
      );

      await s.setNewControllerAddress(accs[1]);
      assert.equal(await s.newController(), accs[1]);
    });
  });

  describe("#doAcceptNewControllerOwnership", () => {
    it("should not accept ownership of controller if controller not set", async () => {
      const s = await Swapper.new();

      try {
        await s.doAcceptNewControllerOwnership();
      } catch (e) {
        // TODO: should match messages here to be sure
        return;
      }
      assert.fail("expected doAcceptNewControllerOwnership() to throw");
    });

    it("should fail to accept ownership if changeOwner not set", async () => {
      const [s, c] = await Promise.all(
        [
          Swapper.new(),
          ControllerMock.new()
      ]);

      await s.setNewControllerAddress(c.address);
      try {
        await s.doAcceptNewControllerOwnership();
      } catch (e) {
        return;
      }
      assert.fail("expected doAcceptNewControllerOwnership() to throw");
    });

    it("should accept ownership once controller is set", async () => {
      const [s, c] = await Promise.all(
        [
          Swapper.new(),
          ControllerMock.new()
        ]);

      await s.setNewControllerAddress(c.address);
      await c.changeOwner(s.address);
      await s.doAcceptNewControllerOwnership();
      assert.equal(await c.owner(), s.address);
    });
  });

  describe("#setControllerOwnership", () => {
    it("should not set new controller ownership if controller not set", async () => {
      const s = Swapper.new();
      try {
        // arbitrary
        await s.setNewControllerOwnership(accs[1]);
      } catch (e) {
        return;
      }
      assert.fail("expected setControllerOwnership() to throw");
    });

    it("should set new controller ownership", async () => {
      const [s, c] = await Promise.all([
        Swapper.new(),
        ControllerMock.new()
      ]);

      await s.setNewControllerAddress(c.address);
      await s.setNewControllerOwnership(accs[1]);
      assert.equal(await s.controllerHeir(), accs[1]);
    });
  });

  describe("#doTransferNewControllerOwnership()", () => {
    it("should not transfer ownership if controller heir not set", async () => {
      const [s, c] = await Promise.all([
        Swapper.new(),
        ControllerMock.new()
      ]);

      await s.setNewControllerAddress(c.address);
      await c.changeOwner(s.address);
      await s.doAcceptNewControllerOwnership();

      assert.equal(await c.owner(), s.address);

      // await s.setNewControllerOwnership(accs[1]);
      try {
        await s.doTransferNewControllerOwnership();
      } catch (e) {
        return;
      }
      assert.fail();
    });

    it("should transfer ownership", async () => {
      const [s, c] = await Promise.all([
        Swapper.new(),
        ControllerMock.new()
      ]);

      await s.setNewControllerAddress(c.address);
      await c.changeOwner(s.address);
      await s.doAcceptNewControllerOwnership();

      assert.equal(await c.owner(), s.address);

      await s.setNewControllerOwnership(accs[1]);
      await s.doTransferNewControllerOwnership();
      await c.acceptOwnership.sendTransaction({from: accs[1]});

      assert.equal(await c.owner(), accs[1]);   
    });
  });

  describe("#doSwapController()", () => {
    it("should not execute swap if tcl not set", async () => {
      const s = await Swapper.new();

      try {
        await s.doSwapController();
      } catch (e) {
        return;
      }
      assert.fail();
    });

    it("should not execute swap if new controller not set", async () => {
      const [s, t, c, l, nc] = await Promise.all([
        Swapper.new(),
        TokenMock.new(),
        ControllerMock.new(),
        LedgerMock.new(),
        ControllerMock.new()
      ]);

      await Promise.all([
        t.changeOwner(s.address),
        c.changeOwner(s.address),
        l.changeOwner(s.address),
        s.setTCL(t.address, c.address, l.address)
      ]);
      await s.doAcceptTCLOwnership();

      try {
        await s.doSwapController();
      } catch (e) {
        return;
      }
      assert.fail();
    });

    it("should not execute swap if stale controller heir not set", async () => {
      const [s, t, c, l, nc] = await Promise.all([
        Swapper.new(),
        TokenMock.new(),
        ControllerMock.new(),
        LedgerMock.new(),
        ControllerMock.new()
      ]);

      await Promise.all([
        t.changeOwner(s.address),
        c.changeOwner(s.address),
        l.changeOwner(s.address),
        nc.changeOwner(s.address),
        s.setTCL(t.address, c.address, l.address),
        s.setNewControllerAddress(nc.address)
      ]);
      await s.doAcceptTCLOwnership();
      await s.doAcceptNewControllerOwnership();

      try {
        await s.doSwapController();
      } catch (e) {
        return;
      }
      assert.fail();      
    });

    it("should not execute swap if required ownership is not obtained", async () => {
      const [s, t, c, l, nc] = await Promise.all([
        Swapper.new(),
        TokenMock.new(),
        ControllerMock.new(),
        LedgerMock.new(),
        ControllerMock.new()
      ]);

      await Promise.all([
        t.changeOwner(s.address),
        c.changeOwner(s.address),
        l.changeOwner(s.address),
        nc.changeOwner(s.address),
        s.setTCL(t.address, c.address, l.address),
        s.setNewControllerAddress(nc.address)
      ]);

      //await s.doAcceptTCLOwnership();
      await s.doAcceptNewControllerOwnership();
      await s.setStaleControllerOwnership(accs[1]);
      
      try {
        await s.doSwapController();
      } catch (e) {
        return;
      }
      assert.fail();
    });

    it("should execute swap", async () => {
      const [s, t, c, l, nc] = await Promise.all([
        Swapper.new(),
        TokenMock.new(),
        ControllerMock.new(),
        LedgerMock.new(),
        ControllerMock.new()
      ]);

      await Promise.all([
        t.changeOwner(s.address),
        c.changeOwner(s.address),
        l.changeOwner(s.address),
        nc.changeOwner(s.address),
        s.setTCL(t.address, c.address, l.address),
        s.setNewControllerAddress(nc.address)
      ]);

      await s.doAcceptTCLOwnership();
      await s.doAcceptNewControllerOwnership();
      await s.setStaleControllerOwnership(accs[1]);
      await s.doSwapController();

      assert.equal(await t.controller(), nc.address);
      assert.equal(await nc.token(), t.address);
      assert.equal(await nc.ledger(), l.address);
      assert.equal(await l.controller(), nc.address);

      await c.acceptOwnership.sendTransaction({from: accs[1]});
      assert.equal(await t.owner(), s.address);
      assert.equal(await nc.owner(), s.address);
      assert.equal(await l.owner(), s.address);
      assert.equal(await c.owner(), accs[1]);
    });
  });
});