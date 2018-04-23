let util = require('./util.js');

contract("Token", (accs) => {
  it("should run the bridge listening demo", (done) => {
    util.deployAll().then((c) => {
      /**
       * Setup an event listener, listening to the events emitted by 
       */
      let controllerBurnEvent = c.controller.ControllerBurn();
      let defaultBurnAddress = '0x0000000000000000000000000000000000000000';
      let otherNetworkAddress = '0x00000000000000000000000000000000000000000000000000000000deadbeef';

      c.ledger.multiMint(0, [util.addressValue(accs[0], 1000000)]).then((txid) => {
        return c.controller.enableBurning();
      }).then((txid) => {

        for (j = 0; j < 10; j++) {
          console.log("sending burn event from " + accs[0]);
          c.token.burn(otherNetworkAddress, j).then((txid) => {
            for (k = 0; k < txid.logs.length; k++) {
              let log = txid.logs[0];

              if (log.event == 'Burn') {
                console.log("[BRIDGE] from: " + log.args.from + " to: " + log.args.to + " value: " + log.args.value.c[0]);
              }
            }
          });
        }

      }).then((txid) => {
        done();
      });
    });
  });
});