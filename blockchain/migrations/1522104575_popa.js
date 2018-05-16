var POPA = artifacts.require('ProofOfPhysicalAddress');
var PhysicalAddressClaim = artifacts.require('PhysicalAddressClaim');
var EthereumClaimsRegistry = artifacts.require('EthereumClaimsRegistry');
var TestERC20 = artifacts.require('TestERC20');

module.exports = function(deployer, network) {
    return deployer.then(async () => {
        await deployer.deploy(PhysicalAddressClaim);
        await deployer.link(PhysicalAddressClaim, POPA);

        let ethereumClaimsRegistryAddress = null;
        if (network === 'development' || network === 'test' || network === 'coverage') {
            await deployer.deploy(EthereumClaimsRegistry);
            let ethereumClaimsRegistry = await EthereumClaimsRegistry.deployed();
            ethereumClaimsRegistryAddress = ethereumClaimsRegistry.address;
        } else {
            ethereumClaimsRegistryAddress = '0xaca1bcd8d0f5a9bfc95aff331da4c250cd9ac2da';
        }

        if (network === 'test' || network === 'coverage') {
            await deployer.deploy(TestERC20);
        }

        await deployer.deploy(POPA, ethereumClaimsRegistryAddress);
    });
};
