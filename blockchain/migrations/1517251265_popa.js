var POPA = artifacts.require('ProofOfPhysicalAddress');

module.exports = function(deployer, network, accounts) {
  deployer.deploy(POPA, { from: accounts[1] });
};
