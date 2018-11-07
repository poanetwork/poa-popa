var POPA = artifacts.require('ProofOfPhysicalAddress');
var PhysicalAddressClaim = artifacts.require('PhysicalAddressClaim');
var PhysicalAddressClaimMock = artifacts.require('mocks/PhysicalAddressClaimMock');
var EthereumClaimsRegistry = artifacts.require('EthereumClaimsRegistry');
var TestERC20 = artifacts.require('TestERC20');
var POPAKeyHolder = artifacts.require('ProofOfPhysicalAddressKeyHolder');

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
            ethereumClaimsRegistryAddress = '0xec9cd1a18CA13E8703bdbCc68419E0d08AEb3528';
        }

        if (network === 'test' || network === 'coverage') {
            await deployer.deploy(TestERC20);
            await deployer.link(PhysicalAddressClaim, PhysicalAddressClaimMock);
            await deployer.deploy(PhysicalAddressClaimMock);
        }

        const gas = network === 'coverage' ? '0xfffffffffff' : '6000000';

        await deployer.deploy(POPA, ethereumClaimsRegistryAddress, { gas });
        await deployer.deploy(POPAKeyHolder);
    });
};
