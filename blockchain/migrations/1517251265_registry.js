var EthereumClaimsRegistry = artifacts.require("EthereumClaimsRegistry");

module.exports = function(deployer, network, accounts) {
  deployer.deploy(EthereumClaimsRegistry);
};
