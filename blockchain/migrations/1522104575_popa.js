var POPA = artifacts.require("ProofOfPhysicalAddress");
var PhysicalAddressClaim = artifacts.require("PhysicalAddressClaim");
var EthereumClaimsRegistry = artifacts.require("EthereumClaimsRegistry");

module.exports = async function(deployer, network, accounts) {
  let ethereumClaimsRegistry = await EthereumClaimsRegistry.deployed();
  await deployer.deploy(PhysicalAddressClaim);
  await deployer.link(PhysicalAddressClaim, POPA);
  await deployer.deploy(POPA, ethereumClaimsRegistry.address, {
    from: accounts[1]
  });
};
