const EthereumClaimsRegistry = artifacts.require('EthereumClaimsRegistry');
const assertRevert = require('./helpers/assertRevert');

contract('EthereumClaimsRegistry', accounts => {
    it('Can Issue a claim', async () => {
        const erc780 = await EthereumClaimsRegistry.deployed();
        await erc780.setClaim(accounts[1], web3.sha3('Key'), web3.sha3('Value'), {
            from: accounts[0],
        });
        assert.equal(
            await erc780.getClaim(accounts[0], accounts[1], web3.sha3('Key')),
            web3.sha3('Value')
        );
    });

    it('Can Issue a Self-Claim', async () => {
        const erc780 = await EthereumClaimsRegistry.deployed();
        await erc780.setSelfClaim(web3.sha3('Key'), web3.sha3('Value'), {
            from: accounts[0],
        });
        assert.equal(
            await erc780.getClaim(accounts[0], accounts[0], web3.sha3('Key')),
            web3.sha3('Value')
        );
    });

    it('Can remove a Claim as Issuer', async () => {
        const erc780 = await EthereumClaimsRegistry.deployed();
        await erc780.setClaim(accounts[1], web3.sha3('Key'), web3.sha3('Value'), {
            from: accounts[0],
        });

        await erc780.removeClaim(accounts[0], accounts[1], web3.sha3('Key'), {
            from: accounts[0],
        });

        assert.equal(
            await erc780.getClaim(accounts[0], accounts[1], web3.sha3('Key')),
            0x0
        );
    });

    it('Can remove a Claim as Subject', async () => {
        const erc780 = await EthereumClaimsRegistry.deployed();
        await erc780.setClaim(accounts[1], web3.sha3('Key'), web3.sha3('Value'), {
            from: accounts[0],
        });

        await erc780.removeClaim(accounts[0], accounts[1], web3.sha3('Key'), {
            from: accounts[1],
        });

        assert.equal(
            await erc780.getClaim(accounts[0], accounts[1], web3.sha3('Key')),
            0x0
        );
    });

    it('Can\'t remove a Claim if not a Subject or Issuer', async () => {
        const erc780 = await EthereumClaimsRegistry.deployed();
        await erc780.setClaim(accounts[1], web3.sha3('Key'), web3.sha3('Value'), {
            from: accounts[0],
        });

        try {
            await erc780.removeClaim(accounts[0], accounts[1], web3.sha3('Key'), {
                from: accounts[2],
            });
            assert.fail('should have thrown before');
        } catch (error) {
            assertRevert(error);
        }

        assert.equal(
            await erc780.getClaim(accounts[0], accounts[1], web3.sha3('Key')),
            web3.sha3('Value')
        );
    });
});
