var EthereumClaimsRegistry = artifacts.require("EthereumClaimsRegistry");

module.exports = async function(deployer, network, accounts) {
  await deployer.deploy(EthereumClaimsRegistry);
};
