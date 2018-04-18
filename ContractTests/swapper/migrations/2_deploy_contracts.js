const Swapper = artifacts.require('Swapper.sol');
const TokenMock = artifacts.require('TokenMock.sol');
const ControllerMock = artifacts.require('ControllerMock.sol');
const LedgerMock = artifacts.require('LedgerMock.sol');

module.exports = function(deployer) {
    deployer.deploy(Swapper);
};
