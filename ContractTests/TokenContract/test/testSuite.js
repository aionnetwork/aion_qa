const fs = require('fs');
global.Web3 = require('../../aion_web3'); // directory where Web3 is stored, adjust accordingly
const web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:8545"));
const expect = require("chai").expect;

const unlock = require('./utils/unlock.js');
const compile = require('./utils/compile.js');
const deploy = require('./utils/deploy.js');

const Controller = fs.readFileSync(__dirname + '../contracts/Controller.sol', {
  encoding: 'utf8'
});
const Ledger = fs.readFileSync(__dirname + '../contracts/Ledger.sol', {
  encoding: 'utf8'
});
const Token = fs.readFileSync(__dirname + '../contracts/Token.sol', {
  encoding: 'utf8'
});
const SafeMathTester = fs.readFileSync(__dirname + '../contracts/mock/SafeMathTester.sol', {
  encoding: 'utf8'
});
const Migrations = fs.readFileSync(__dirname + '../contracts/Migrations.sol', {
  encoding: 'utf8'
});
/* const foundation = fs.readFileSync(__dirname + '../foundation_tools.js', {
  encoding: 'utf8'
}); */
const TokenReceivable = fs.readFileSync(__dirname + '../contracts/TokenReceivable.sol', {
  encoding: 'utf8'
});
const SafeMath = fs.readFileSync(__dirname + '../contracts/SafeMath.sol', {
  encoding: 'utf8'
});
const Pausable = fs.readFileSync(__dirname + '../contracts/Pausable.sol', {
  encoding: 'utf8'
});
const Owned = fs.readFileSync(__dirname + '../contracts/Owned.sol', {
  encoding: 'utf8'
});
const IToken = fs.readFileSync(__dirname + '../contracts/IToken.sol', {
  encoding: 'utf8'
});
const Finalizable = fs.readFileSync(__dirname + '../contracts/Finalizable.sol', {
  encoding: 'utf8'
});
const EventDefinitions = fs.readFileSync(__dirname + '../contracts/EventDefinitions.sol', {
  encoding: 'utf8'
});
const DummyToken = fs.readFileSync(__dirname + '../contracts/DummyToken.sol', {
  encoding: 'utf8'
});
const ControllerEventDefinitions = fs.readFileSync(__dirname + '../contracts/ControllerEventDefinitions.sol', {
  encoding: 'utf8'
});

let util = require('./util.js');

/* let deployed = {
   token: null,
   controller: null,
   ledger: null
 } */


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


let controllerAddr, tokenAddr, ledgerAddr, controllereventdefAddr, dummyAddr, eventdefAddr, finalizableAddr, itokAddr, migrationsAddr, 
    ownedAddr, pausableAddr, safemathAddr, tokenrecAddr;
let controllerContractInstance, tokenContractInstance, ledgerContractInstance, controllereventdefContractInstance, dummyContractInstance, 
    eventdefContractInstance, finalizableContractInstance, itokContractInstance, migrationsContractInstance, ownedContractInstance, 
    pausableContractInstance, safemathContractInstance, tokenrecContractInstance;
let controllerTx, tokenTx, ledgerTx, controllereventdefTx, dummyTx, eventdefTx, finalizableTx, itokTx, migrationsTx, 
    ownedTx, pausableTx, safemathTx, tokenrecTx;
let controllerAbi, tokenAbi, ledgerAbi, controllereventdefAbi, dummyAbi, eventdefAbi, finalizableAbi, itokAbi, migrationsAbi, 
    ownedAbi, pausableAbi, safemathAbi, tokenrecAbi;
let controllerCode, tokenCode, ledgerCode, controllereventdefCode, dummyCode, eventdefCode, finalizableCode, itokCode, migrationsCode, 
    ownedCode, pausableCode, safemathCode, tokenrecCode;  
let operation, events;
let acc = web3.personal.listAccounts;
let a0 = acc[0];
let pw = 'PLAT4life';

describe('ControllerEventsDefinition contract compile', () => {
  it('ControllerEventsDefinition contract compile', (done) => {
    compile(web3, sol).then((res) => {
      controllereventdefAbi = res.ControllerEventsDefinition.info.abiDefinition;
      controllereventdefCode = res.ControllerEventsDefinition.code;
      done();
    }, (err) => {
      done(err);
    });
  });

  it('ControllerEventsDefinition contract deploy' (done) => {
    unlock(web3, a0, pw),
    deploy(web3, a0, pw, controllereventdefAbi, controllereventdefCode)
      .then((res) => {
        controllereventdefAddr = res.address;
        controllereventdefContractInstance = web3.eth.describe(controllereventdefAbi).at(controllereventdefAddr);
        console.log('[log] ControllerEventsDefinition contract address: ', res.controllereventdefAddr);
        done();
      }, (err) => {
        done(err);
      });
  });
})
/* 
describe('EventDefinitions contract compile', () => {
  it('EventDefinitions contract compile', (done) => {
    compile(web3, sol).then((res) => {
      eventdefAddr = res.EventDefinitions.info.abiDefinition;
      eventdefCode = res.EventDefinitions.code;
      done();
    }, (err) => {
      done(err);
    })
  }).timeout(0);

  it('EventDefinitions contract deploy' (done) => {
    unlock(web3, a0, pw),
    deploy(web3, a0, pw, eventdefAbi, eventdefCode)
      .then((res) => {
        eventdefAddr = res.address;
        eventdefContractInstance = web3.eth.describe(eventdefAbi).at(eventdefAddr);
        console.log('[log] EventDefinitions contract address: ', res.eventdefAddr);
        done();
      }, (err) => {
        done(err);
      });
  }).timeout(0);
})

describe('Owned contract compile', () => {
  it('Owned contract compile', (done) => {
    compile(web3, sol).then((res) => {
      ownedAbi = res.Owned.info.abiDefinition;
      ownedCode = res.Owned.code;
      done();
    }, (err) => {
      done(err);
    })
  }).timeout(0);

  it('Owned contract deploy' (done) => {
    unlock(web3, a0, pw),
    deploy(web3, a0, pw, ownedAbi, ownedCode)
      .then((res) => {
        ownedAddr = res.address;
        ownedContractInstance = web3.eth.describe(ownedAbi).at(ownedAddr);
        console.log('[log] Owned contract address: ', res.ownedAddr);
        done();
      }, (err) => {
        done(err);
      });
  }).timeout(0);
})

describe('Finalizable contract compile', () => {
  it('Finalizable contract compile', (done) => {
    compile(web3, sol).then((res) => {
      finalizableAddr = res.Finalizable.info.abiDefinition;
      finalizableCode = res.Finalizable.code;
      done();
    }, (err) => {
      done(err);
    })
  }).timeout(0);

  it('Finalizable contract deploy' (done) => {
    unlock(web3, a0, pw),
    deploy(web3, a0, pw, finalizableAbi, finalizableCode)
      .then((res) => {
        finalizableAddr = res.address;
        finalizableContractInstance = web3.eth.describe(finalizableAbi).at(finalizableAddr);
        console.log('[log] Finalizable contract address: ', res.finalizableAddr);
        done();
      }, (err) => {
        done(err);
      });
  }).timeout(0);
})

describe('IToken contract compile', () => {
  it('IToken contract compile', (done) => {
    compile(web3, sol).then((res) => {
      itokAbi = res.IToken.info.abiDefinition;
      itokCode = res.IToken.code;
      done();
    }, (err) => {
      done(err);
    })
  }).timeout(0);

  it('IToken contract deploy' (done) => {
    unlock(web3, a0, pw),
    deploy(web3, a0, pw, itokAbi, itokCode)
      .then((res) => {
        itokAddr = res.address;
        itokContractInstance = web3.eth.describe(itokAbi).at(itokAddr);
        console.log('[log] IToken contract address: ', res.itokAddr);
        done();
      }, (err) => {
        done(err);
      });
  }).timeout(0);
})

describe('Pausable contract compile', () => {
  it('Pausable contract compile', (done) => {
    compile(web3, sol).then((res) => {
      pausableAbi = res.Pausable.info.abiDefinition;
      pausableCode = res.Pausable.code;
      done();
    }, (err) => {
      done(err);
    })
  }).timeout(0);

  it('Pausable contract deploy' (done) => {
    unlock(web3, a0, pw),
    deploy(web3, a0, pw, pausableAbi, pausableCode)
      .then((res) => {
        pausableAddr = res.address;
        pausableContractInstance = web3.eth.describe(pausableAbi).at(pausableAddr);
        console.log('[log] Pausable contract address: ', res.pausableAddr);
        done();
      }, (err) => {
        done(err);
      });
  }).timeout(0);
})

describe('SafeMath contract compile', () => {
  it('SafeMath contract compile', (done) => {
    compile(web3, sol).then((res) => {
      safemathAbi = res.SafeMath.info.abiDefinition;
      safemathCode = res.SafeMath.code;
      done();
    }, (err) => {
      done(err);
    })
  }).timeout(0);

  it('SafeMath contract deploy' (done) => {
    unlock(web3, a0, pw),
    deploy(web3, a0, pw, safemathAbi, safemathCode)
      .then((res) => {
        safemathAddr = res.address;
        safemathContractInstance = web3.eth.describe(safemathAbi).at(safemathAddr);
        console.log('[log] SafeMath contract address: ', res.safemathAddr);
        done();
      }, (err) => {
        done(err);
      });
  }).timeout(0);
})

describe('TokenReceivable contract compile', () => {
  it('TokenReceivable contract compile', (done) => {
    compile(web3, sol).then((res) => {
      tokenrecAbi = res.TokenReceivable.info.abiDefinition;
      tokenrecCode = res.TokenReceivable.code;
      done();
    }, (err) => {
      done(err);
    })
  }).timeout(0);

  it('TokenReceivable contract deploy' (done) => {
    unlock(web3, a0, pw),
    deploy(web3, a0, pw, tokenrecAbi, tokenrecCode)
      .then((res) => {
        tokenrecAddr = res.address;
        tokenrecContractInstance = web3.eth.describe(tokenrecAbi).at(tokenrecAddr);
        console.log('[log] TokenReceivable contract address: ', res.tokenrecAddr);
        done();
      }, (err) => {
        done(err);
      });
  }).timeout(0);
})

describe('Migrations contract compile', () => {
  it('Migrations contract compile', (done) => {
    compile(web3, sol).then((res) => {
      migrationsAbi = res.Migrations.info.abiDefinition;
      migrationsCode = res.Migrations.code;
      done();
    }, (err) => {
      done(err);
    })
  }).timeout(0);

  it('Migrations contract deploy' (done) => {
    unlock(web3, a0, pw),
    deploy(web3, a0, pw, migrationsAbi, migrationsCode)
      .then((res) => {
        migrationsAddr = res.address;
        migrationsContractInstance = web3.eth.describe(migrationsAbi).at(migrationsAddr);
        console.log('[log] Migrations contract address: ', res.migrationsAddr);
        done();
      }, (err) => {
        done(err);
      });
  }).timeout(0);
})

describe('DummyToken contract compile', () => {
  it('DummyToken contract compile', (done) => {
    compile(web3, sol).then((res) => {
      dummyAbi = res.DummyToken.info.abiDefinition;
      dummyCode = res.DummyToken.code;
      done();
    }, (err) => {
      done(err);
    })
  }).timeout(0);

  it('DummyToken contract deploy' (done) => {
    unlock(web3, a0, pw),
    deploy(web3, a0, pw, dummyAbi, dummyCode)
      .then((res) => {
        dummyAddr = res.address;
        dummyContractInstance = web3.eth.describe(dummyAbi).at(dummyAddr);
        console.log('[log] DummyToken contract address: ', res.dummyAddr);
        done();
      }, (err) => {
        done(err);
      });
  }).timeout(0);
})

describe('Token contract compile', () => {
  it('Token contract compile', (done) => {
    compile(web3, sol).then((res) => {
      tokenAbi = res.Token.info.abiDefinition;
      tokenCode = res.Token.code;
      done();
    }, (err) => {
      done(err);
    })
  }).timeout(0);

  it('Token contract deploy' (done) => {
    unlock(web3, a0, pw),
    deploy(web3, a0, pw, tokenAbi, tokenCode)
      .then((res) => {
        tokenAddr = res.address;
        tokenContractInstance = web3.eth.describe(tokenAbi).at(tokenAddr);
        console.log('[log] token contract address: ', res.tokenAddr);
        done();
      }, (err) => {
        done(err);
      });
  }).timeout(0);
})

describe('Ledger contract compile', () => {
  it('Ledger contract compile', (done) => {
    compile(web3, sol).then((res) => {
      ledgerAbi = res.Ledger.info.abiDefinition;
      ledgerCode = res.Ledger.code;
      done();
    }, (err) => {
      done(err);
    })
  }).timeout(0);

  it('Ledger contract deploy' (done) => {
    unlock(web3, a0, pw),
    deploy(web3, a0, pw, ledgerAbi, ledgerCode)
      .then((res) => {
        ledgerAddr = res.address;
        ledgerContractInstance = web3.eth.describe(ledgerAbi).at(ledgerAddr);
        console.log('[log] Ledger contract address: ', res.ledgerAddr);
        done();
      }, (err) => {
        done(err);
      });
  }).timeout(0);
})

describe('Controller contract compile', () => {
  it('Controller contract compile', (done) => {
    compile(web3, sol).then((res) => {
      controllerAbi = res.Controller.info.abiDefinition;
      controllerCode = res.Controller.code;
      done();
    }, (err) => {
      done(err);
    })
  }).timeout(0);

  it('Controller contract deploy' (done) => {
    unlock(web3, a0, pw),
    deploy(web3, a0, pw, controllerAbi, controllerCode)
      .then((res) => {
        controllerAddr = res.address;
        controllerContractInstance = web3.eth.describe(controllerAbi).at(controllerAddr);
        console.log('[log] controller contract address: ', res.controllerAddr);
        done();
      }, (err) => {
        done(err);
      });
  }).timeout(0);
})
*/





