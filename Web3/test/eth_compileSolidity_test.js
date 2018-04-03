const fs = require('fs');
require('../common.js');

const sol = fs.readFileSync(__dirname + '/contracts/personnel.sol', {
    encoding: 'utf8'
});

describe('compileSolidity', ()=>{
    it('sync', ()=>{
        let res = web3.eth.compile.solidity(sol);
        expect(res).not.to.be.null;
        let compiledName = Object.keys(res)[0];
        expect(compiledName).to.equal('Personnel');
        let compiled = res[compiledName];
        expect(compiled.code).not.to.be.null;
        expect(compiled.code.length).to.be.above(0);
        expect(compiled.info).not.to.be.null;
        expect(compiled.info.abiDefinition).not.to.be.null;
        expect(compiled.info.abiDefinition).to.be.an('array');
    });
    it('async', (done)=>{
        web3.eth.compile.solidity(sol, (err, res)=>{
            if(err)
                done(err);
            if(res){
                expect(res).not.to.be.null;
                let compiledName = Object.keys(res)[0];
                expect(compiledName).to.equal('Personnel');
                let compiled = res[compiledName];
                expect(compiled.code).not.to.be.null;
                expect(compiled.code.length).to.be.above(0);
                expect(compiled.info).not.to.be.null;
                expect(compiled.info.abiDefinition).not.to.be.null;
                expect(compiled.info.abiDefinition).to.be.an('array');
                done();
            }
        });
    });
});