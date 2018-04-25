const ProofOfPhysicalAddress = artifacts.require('ProofOfPhysicalAddress');
const BigNumber = require('bignumber.js');

// solidity-coverage copies all the files to a directory one level deeper, so
// this is necessary for the tests to pass both when running `truffle test` and
// `solidity-coverage`
let buildSignature = null;
let sign = null;
try {
    buildSignature = require('../web-dapp/server-lib/buildSignature');
    sign = require('../web-dapp/server-lib/sign');
} catch (e) {
    try {
        buildSignature = require('../../web-dapp/server-lib/buildSignature');
        sign = require('../../web-dapp/server-lib/sign');
    } catch (e) {
        buildSignature = require('../../../web-dapp/server-lib/buildSignature');
        sign = require('../../../web-dapp/server-lib/sign');
    }
}

// Private keys of accounts generated when running `npm run start-testrpc`
const privateKeys = [
    '68d90a98fc4b8e66a016f66cb8363904a4e521a2480602bd78cc67945676e9cd',
    '1dd9083e16e190fa5413f87837025556063c546bf16e38cc53fd5d018a3acfbb',
    'a2fbd494c3031335d595cc5ad89a9c97d3e5a7f6b00d191d91af915b8b039d34',
    'ed8aa8f379bac1ff5eafc5f792c32b40a5419edf528a37addbfc8ce36c487463',
    '81193e26e271a824fda36511b2814e9d47e0c16ebd31304e88c25a6d659286b8',
    '6ee2f0da244d4eea41bd2d92eb8af046589956790ca83055d72d6cb3fe425a57',
    'b66c237da44e8f9d4411fa9b15c6d6e2df81f93bc5f03430895ccb5cc0a6aff9',
    '27d7d3598f704da770bb126df3f7b073809ce2ea8cd0d7b75a409e320bf31b05',
    '9095ed8f4917235794b9c4fe9438fec29de759916bf216a8aa28f647664a35ff',
    'ab470a1366c59dec4058af0110d6447addf1bad57965bff5b01059cbd80ac47f',
];

contract('ownership', () => {
    it('signer should be equal to owner', async () => {
        const popa = await ProofOfPhysicalAddress.deployed();
        const owner = await popa.owner();
        const signer = await popa.signer();
        assert.equal(owner, signer);
    });
});

contract('address registration (success)', function(accounts) {
    contract('', () => {
        it('registerAddress should register an address', async () => {
            const popa = await ProofOfPhysicalAddress.deployed();
            const args = buildRegisterAddressArgs(accounts[0]);

            let addresses = await popa.totalAddresses();
            assert.equal(+addresses, 0);

            await registerAddress(popa, args, accounts[0]);

            addresses = await popa.totalAddresses();
            assert.equal(+addresses, 1);
        });
    });

    contract('', () => {
        it('total_users should be incremented if it\'s the first address for that user', async () => {
            const popa = await ProofOfPhysicalAddress.deployed();
            const args = buildRegisterAddressArgs(accounts[0]);

            let users = await popa.totalUsers();
            assert.equal(+users, 0);

            await registerAddress(popa, args, accounts[0]);

            users = await popa.totalUsers();
            assert.equal(+users, 1);
        });
    });

    contract('', () => {
        it('total_confirmed should not change after registering an address', async () => {
            const popa = await ProofOfPhysicalAddress.deployed();
            const args = buildRegisterAddressArgs(accounts[0]);

            let confirmed = await popa.totalConfirmed();
            assert.equal(+confirmed, 0);

            await registerAddress(popa, args, accounts[0]);

            confirmed = await popa.totalConfirmed();
            assert.equal(+confirmed, 0);
        });
    });

    contract('', () => {
        it('should allow a user to register two different addresses', async () => {
            const popa = await ProofOfPhysicalAddress.deployed();
            const args1 = buildRegisterAddressArgs(accounts[0]);

            let addresses = await popa.totalAddresses();
            let users = await popa.totalUsers();
            let confirmed = await popa.totalConfirmed();
            assert.equal(+addresses, 0);
            assert.equal(+users, 0);
            assert.equal(+confirmed, 0);

            await registerAddress(popa, args1, accounts[0]);

            addresses = await popa.totalAddresses();
            users = await popa.totalUsers();
            confirmed = await popa.totalConfirmed();
            assert.equal(+addresses, 1);
            assert.equal(+users, 1);
            assert.equal(+confirmed, 0);

            const args2 = buildRegisterAddressArgs(accounts[0], { state: 'al' });
            await registerAddress(popa, args2, accounts[0]);

            addresses = await popa.totalAddresses();
            users = await popa.totalUsers();
            confirmed = await popa.totalConfirmed();
            assert.equal(+addresses, 2);
            assert.equal(+users, 1);
            assert.equal(+confirmed, 0);
        });
    });

    contract('', () => {
        it('should allow different users to register different addresses', async () => {
            const popa = await ProofOfPhysicalAddress.deployed();
            const args1 = buildRegisterAddressArgs(accounts[0]);

            let addresses = await popa.totalAddresses();
            let users = await popa.totalUsers();
            let confirmed = await popa.totalConfirmed();
            assert.equal(+addresses, 0);
            assert.equal(+users, 0);
            assert.equal(+confirmed, 0);

            await registerAddress(popa, args1, accounts[0]);

            addresses = await popa.totalAddresses();
            users = await popa.totalUsers();
            confirmed = await popa.totalConfirmed();
            assert.equal(+addresses, 1);
            assert.equal(+users, 1);
            assert.equal(+confirmed, 0);

            const args2 = buildRegisterAddressArgs(accounts[1], { address: '742 evergreen terrace' });
            await registerAddress(popa, args2, accounts[1]);

            addresses = await popa.totalAddresses();
            users = await popa.totalUsers();
            confirmed = await popa.totalConfirmed();
            assert.equal(+addresses, 2);
            assert.equal(+users, 2);
            assert.equal(+confirmed, 0);
        });
    });

    contract('', () => {
        it('should allow different users to register the same address', async () => {
            const popa = await ProofOfPhysicalAddress.deployed();
            const args1 = buildRegisterAddressArgs(accounts[0]);

            let addresses = await popa.totalAddresses();
            let users = await popa.totalUsers();
            let confirmed = await popa.totalConfirmed();
            assert.equal(+addresses, 0);
            assert.equal(+users, 0);
            assert.equal(+confirmed, 0);

            await registerAddress(popa, args1, accounts[0]);

            addresses = await popa.totalAddresses();
            users = await popa.totalUsers();
            confirmed = await popa.totalConfirmed();
            assert.equal(+addresses, 1);
            assert.equal(+users, 1);
            assert.equal(+confirmed, 0);

            const args2 = buildRegisterAddressArgs(accounts[1]);
            await registerAddress(popa, args2, accounts[1]);

            addresses = await popa.totalAddresses();
            users = await popa.totalUsers();
            confirmed = await popa.totalConfirmed();
            assert.equal(+addresses, 2);
            assert.equal(+users, 2);
            assert.equal(+confirmed, 0);
        });
    });
});

contract('address registration (fail)', function(accounts) {
    contract('', () => {
        it('registerAddress should fail if name is empty', async () => {
            const popa = await ProofOfPhysicalAddress.deployed();
            const args = buildRegisterAddressArgs(accounts[0], { name: '' });

            await registerAddress(popa, args, accounts[0])
                .then(
                    () => assert.fail(), // should reject
                    async () => {
                        const addresses = await popa.totalAddresses();
                        assert.equal(+addresses, 0);
                    }
                );
        });
    });

    contract('', () => {
        it('registerAddress should fail if country is empty', async () => {
            const popa = await ProofOfPhysicalAddress.deployed();
            const args = buildRegisterAddressArgs(accounts[0], { country: '' });

            await registerAddress(popa, args, accounts[0])
                .then(
                    () => assert.fail(), // should reject
                    async () => {
                        const addresses = await popa.totalAddresses();
                        assert.equal(+addresses, 0);
                    }
                );
        });
    });

    contract('', () => {
        it('registerAddress should fail if state is empty', async () => {
            const popa = await ProofOfPhysicalAddress.deployed();
            const args = buildRegisterAddressArgs(accounts[0], { state: '' });

            await registerAddress(popa, args, accounts[0])
                .then(
                    () => assert.fail(), // should reject
                    async () => {
                        const addresses = await popa.totalAddresses();
                        assert.equal(+addresses, 0);
                    }
                );
        });
    });

    contract('', () => {
        it('registerAddress should fail if city is empty', async () => {
            const popa = await ProofOfPhysicalAddress.deployed();
            const args = buildRegisterAddressArgs(accounts[0], { city: '' });

            await registerAddress(popa, args, accounts[0])
                .then(
                    () => assert.fail(), // should reject
                    async () => {
                        const addresses = await popa.totalAddresses();
                        assert.equal(+addresses, 0);
                    }
                );
        });
    });

    contract('', () => {
        it('registerAddress should fail if address is empty', async () => {
            const popa = await ProofOfPhysicalAddress.deployed();
            const args = buildRegisterAddressArgs(accounts[0], { address: '' });

            await registerAddress(popa, args, accounts[0])
                .then(
                    () => assert.fail(), // should reject
                    async () => {
                        const addresses = await popa.totalAddresses();
                        assert.equal(+addresses, 0);
                    }
                );
        });
    });

    contract('', () => {
        it('registerAddress should fail if zip code is empty', async () => {
            const popa = await ProofOfPhysicalAddress.deployed();
            const args = buildRegisterAddressArgs(accounts[0], { zip: '' });

            await registerAddress(popa, args, accounts[0])
                .then(
                    () => assert.fail(), // should reject
                    async () => {
                        const addresses = await popa.totalAddresses();
                        assert.equal(+addresses, 0);
                    }
                );
        });
    });

    contract('', () => {
        it('registerAddress should fail if sent value is not enough', async () => {
            const popa = await ProofOfPhysicalAddress.deployed();
            const args = buildRegisterAddressArgs(accounts[0]);

            await registerAddress(popa, args, accounts[0], '39999999999999999')
                .then(
                    () => assert.fail(), // should reject
                    async () => {
                        const addresses = await popa.totalAddresses();
                        assert.equal(+addresses, 0);
                    }
                );
        });
    });

    contract('', () => {
        it('registerAddress should fail if sender is different', async () => {
            const popa = await ProofOfPhysicalAddress.deployed();
            const args = buildRegisterAddressArgs(accounts[0]);

            await registerAddress(popa, args, accounts[1])
                .then(
                    () => assert.fail(), // should reject
                    async () => {
                        const addresses = await popa.totalAddresses();
                        assert.equal(+addresses, 0);
                    }
                );
        });
    });

    contract('', () => {
        it('registerAddress should fail if name is different', async () => {
            const popa = await ProofOfPhysicalAddress.deployed();
            const args = buildRegisterAddressArgs(accounts[0]);
            args.name += '!';

            await registerAddress(popa, args, accounts[0])
                .then(
                    () => assert.fail(), // should reject
                    async () => {
                        const addresses = await popa.totalAddresses();
                        assert.equal(+addresses, 0);
                    }
                );
        });
    });

    contract('', () => {
        it('registerAddress should fail if country is different', async () => {
            const popa = await ProofOfPhysicalAddress.deployed();
            const args = buildRegisterAddressArgs(accounts[0]);
            args.country = 'ar';

            await registerAddress(popa, args, accounts[0])
                .then(
                    () => assert.fail(), // should reject
                    async () => {
                        const addresses = await popa.totalAddresses();
                        assert.equal(+addresses, 0);
                    }
                );
        });
    });

    contract('', () => {
        it('registerAddress should fail if state is different', async () => {
            const popa = await ProofOfPhysicalAddress.deployed();
            const args = buildRegisterAddressArgs(accounts[0]);
            args.state = 'al';

            await registerAddress(popa, args, accounts[0])
                .then(
                    () => assert.fail(), // should reject
                    async () => {
                        const addresses = await popa.totalAddresses();
                        assert.equal(+addresses, 0);
                    }
                );
        });
    });

    contract('', () => {
        it('registerAddress should fail if city is different', async () => {
            const popa = await ProofOfPhysicalAddress.deployed();
            const args = buildRegisterAddressArgs(accounts[0]);
            args.city = 'new york';

            await registerAddress(popa, args, accounts[0])
                .then(
                    () => assert.fail(), // should reject
                    async () => {
                        const addresses = await popa.totalAddresses();
                        assert.equal(+addresses, 0);
                    }
                );
        });
    });

    contract('', () => {
        it('registerAddress should fail if location is different', async () => {
            const popa = await ProofOfPhysicalAddress.deployed();
            const args = buildRegisterAddressArgs(accounts[0]);
            args.address = '742 evergreen terrace';

            await registerAddress(popa, args, accounts[0])
                .then(
                    () => assert.fail(), // should reject
                    async () => {
                        const addresses = await popa.totalAddresses();
                        assert.equal(+addresses, 0);
                    }
                );
        });
    });

    contract('', () => {
        it('registerAddress should fail if zip is different', async () => {
            const popa = await ProofOfPhysicalAddress.deployed();
            const args = buildRegisterAddressArgs(accounts[0]);
            args.zip = '12345';

            await registerAddress(popa, args, accounts[0])
                .then(
                    () => assert.fail(), // should reject
                    async () => {
                        const addresses = await popa.totalAddresses();
                        assert.equal(+addresses, 0);
                    }
                );
        });
    });

    contract('', () => {
        it('registerAddress should fail if price is different', async () => {
            const popa = await ProofOfPhysicalAddress.deployed();
            const args = buildRegisterAddressArgs(accounts[0]);
            args.priceWei = '10';

            await registerAddress(popa, args, accounts[0])
                .then(
                    () => assert.fail(), // should reject
                    async () => {
                        const addresses = await popa.totalAddresses();
                        assert.equal(+addresses, 0);
                    }
                );
        });
    });

    contract('', () => {
        it('registerAddress should fail if sha3 is different', async () => {
            const popa = await ProofOfPhysicalAddress.deployed();
            const args = buildRegisterAddressArgs(accounts[0]);
            args.sha3cc = web3.sha3('foobar');

            await registerAddress(popa, args, accounts[0])
                .then(
                    () => assert.fail(), // should reject
                    async () => {
                        const addresses = await popa.totalAddresses();
                        assert.equal(+addresses, 0);
                    }
                );
        });
    });

    contract('', () => {
        it('registerAddress should fail if args were signed with a different private key is different', async () => {
            const popa = await ProofOfPhysicalAddress.deployed();
            const args = buildRegisterAddressArgs(accounts[0], {}, privateKeys[1]);

            await registerAddress(popa, args, accounts[0])
                .then(
                    () => assert.fail(), // should reject
                    async () => {
                        const addresses = await popa.totalAddresses();
                        assert.equal(+addresses, 0);
                    }
                );
        });
    });

    contract('', () => {
        it('registerAddress should fail if address was already registered', async () => {
            const popa = await ProofOfPhysicalAddress.deployed();
            const args = buildRegisterAddressArgs(accounts[0]);

            let addresses = await popa.totalAddresses();
            assert.equal(+addresses, 0);

            await registerAddress(popa, args, accounts[0]);

            addresses = await popa.totalAddresses();
            assert.equal(+addresses, 1);

            await registerAddress(popa, args, accounts[0])
                .then(
                    () => assert.fail(), // should reject
                    async () => {
                        const addresses = await popa.totalAddresses();
                        assert.equal(+addresses, 1);
                    }
                );
        });
    });
});

contract('address removal', function(accounts) {
    contract('', () => {
        it('should allow to unregister an address', async () => {
            const popa = await ProofOfPhysicalAddress.deployed();
            const args = buildRegisterAddressArgs(accounts[0]);

            await registerAddress(popa, args, accounts[0]);

            let addressesCount = await popa.userSubmittedAddressesCount(accounts[0]);
            assert.equal(+addressesCount, 1);

            await unregisterAddress(popa, args, accounts[0]);

            addressesCount = await popa.userSubmittedAddressesCount(accounts[0]);
            assert.equal(+addressesCount, 0);
        });
    });

    contract('', () => {
        it('should not allow an user to unregister another user\'s address', async () => {
            const popa = await ProofOfPhysicalAddress.deployed();
            const args = buildRegisterAddressArgs(accounts[0]);

            await registerAddress(popa, args, accounts[0]);

            let addressesCount = await popa.userSubmittedAddressesCount(accounts[0]);
            assert.equal(+addressesCount, 1);

            await unregisterAddress(popa, args, accounts[1])
                .then(
                    () => assert.fail(), // should reject
                    () => {}
                );

            addressesCount = await popa.userSubmittedAddressesCount(accounts[0]);
            assert.equal(+addressesCount, 1);
        });
    });

    contract('', () => {
        it('should delete the user if the unregistered address was their last one', async () => {
            const popa = await ProofOfPhysicalAddress.deployed();
            const args = buildRegisterAddressArgs(accounts[0]);

            await registerAddress(popa, args, accounts[0]);

            let userExists = await popa.userExists(accounts[0]);
            assert.isTrue(userExists);

            await unregisterAddress(popa, args, accounts[0]);

            userExists = await popa.userExists(accounts[0]);
            assert.isFalse(userExists);
        });
    });

    contract('', () => {
        it('should not delete the user if the unregistered address was not their last one', async () => {
            const popa = await ProofOfPhysicalAddress.deployed();
            const args1 = buildRegisterAddressArgs(accounts[0]);
            const args2 = buildRegisterAddressArgs(accounts[0], {
                address: '186 berry st',
            });

            await registerAddress(popa, args1, accounts[0]);
            await registerAddress(popa, args2, accounts[0]);

            let userExists = await popa.userExists(accounts[0]);
            assert.isTrue(userExists);

            await unregisterAddress(popa, args1, accounts[0]);

            userExists = await popa.userExists(accounts[0]);
            assert.isTrue(userExists);
        });
    });

    contract('', () => {
        it('should not delete an address that an user has not registered', async () => {
            const popa = await ProofOfPhysicalAddress.deployed();
            const args1 = buildRegisterAddressArgs(accounts[0]);
            const args2 = buildRegisterAddressArgs(accounts[0], {
                address: '186 berry st',
            });

            await registerAddress(popa, args1, accounts[0]);

            let addressesCount = await popa.userSubmittedAddressesCount(accounts[0]);
            assert.equal(+addressesCount, 1);

            await unregisterAddress(popa, args2, accounts[0])
                .then(
                    () => assert.fail(), // should reject
                    () => {}
                );

            addressesCount = await popa.userSubmittedAddressesCount(accounts[0]);
            assert.equal(+addressesCount, 1);
        });
    });
});

contract('address confirmation', function(accounts) {
    contract('', () => {
        it('should succeed if the arguments are correct', async () => {
            const popa = await ProofOfPhysicalAddress.deployed();
            const args = buildRegisterAddressArgs(accounts[0]);

            let addressesCount = await popa.userSubmittedAddressesCount(accounts[0]);
            let confirmed = await popa.totalConfirmed();
            let users = await popa.totalUsers();
            assert.equal(+addressesCount, 0);
            assert.equal(+confirmed, 0);
            assert.equal(+users, 0);

            await registerAddress(popa, args, accounts[0]);

            addressesCount = await popa.userSubmittedAddressesCount(accounts[0]);
            confirmed = await popa.totalConfirmed();
            users = await popa.totalUsers();
            let [, , confirmationBlock] = await popa.userAddressInfo(accounts[0], 0);
            assert.equal(+addressesCount, 1);
            assert.equal(+confirmed, 0);
            assert.equal(+users, 1);
            assert.equal(+confirmationBlock, 0);

            await confirmAddress(popa, args.cc, accounts[0]);

            addressesCount = await popa.userSubmittedAddressesCount(accounts[0]);
            confirmed = await popa.totalConfirmed();
            users = await popa.totalUsers();
            [, , confirmationBlock] = await popa.userAddressInfo(accounts[0], 0);
            assert.equal(+addressesCount, 1);
            assert.equal(+confirmed, 1);
            assert.equal(+users, 1);
            assert.equal(+confirmationBlock, web3.eth.blockNumber);
        });
    });

    contract('', () => {
        it('should fail if the confirmation code is empty', async () => {
            const popa = await ProofOfPhysicalAddress.deployed();
            const args = buildRegisterAddressArgs(accounts[0]);

            let confirmed = await popa.totalConfirmed();
            assert.equal(+confirmed, 0);

            await registerAddress(popa, args, accounts[0]);
            await confirmAddress(popa, '', accounts[0])
                .then(
                    () => assert.fail(), // should reject
                    async () => {
                        confirmed = await popa.totalConfirmed();
                        assert.equal(+confirmed, 0);
                    }
                );
        });
    });

    contract('', () => {
        it('should fail if the sender is different than the account that registered', async () => {
            const popa = await ProofOfPhysicalAddress.deployed();
            const args = buildRegisterAddressArgs(accounts[0]);

            let confirmed = await popa.totalConfirmed();
            assert.equal(+confirmed, 0);

            await registerAddress(popa, args, accounts[0]);
            await confirmAddress(popa, args.cc, accounts[1])
                .then(
                    () => assert.fail(), // should reject
                    async () => {
                        confirmed = await popa.totalConfirmed();
                        assert.equal(+confirmed, 0);
                    }
                );
        });
    });

    contract('', () => {
        it('should fail if the data is signed with a different private key', async () => {
            const popa = await ProofOfPhysicalAddress.deployed();
            const args = buildRegisterAddressArgs(accounts[0]);

            let confirmed = await popa.totalConfirmed();
            assert.equal(+confirmed, 0);

            await registerAddress(popa, args, accounts[0]);
            await confirmAddress(popa, args.cc, accounts[0], privateKeys[1])
                .then(
                    () => assert.fail(), // should reject
                    async () => {
                        confirmed = await popa.totalConfirmed();
                        assert.equal(+confirmed, 0);
                    }
                );
        });
    });

    contract('', () => {
        it('should fail if the confirmation code is invalid', async () => {
            const popa = await ProofOfPhysicalAddress.deployed();
            const args = buildRegisterAddressArgs(accounts[0]);

            let confirmed = await popa.totalConfirmed();
            assert.equal(+confirmed, 0);

            await registerAddress(popa, args, accounts[0]);

            await confirmAddress(popa, 'foobar', accounts[0])
                .then(
                    () => assert.fail(), // should reject
                    async () => {
                        confirmed = await popa.totalConfirmed();
                        assert.equal(+confirmed, 0);
                    }
                );
        });
    });

    contract('', () => {
        it('should fail if the address is already confirmed', async () => {
            const popa = await ProofOfPhysicalAddress.deployed();
            const args = buildRegisterAddressArgs(accounts[0]);

            let confirmed = await popa.totalConfirmed();
            assert.equal(+confirmed, 0);

            await registerAddress(popa, args, accounts[0]);

            await confirmAddress(popa, args.cc, accounts[0]);

            confirmed = await popa.totalConfirmed();
            assert.equal(+confirmed, 1);

            await confirmAddress(popa, args.cc, accounts[0])
                .then(
                    () => assert.fail(), // should reject
                    async () => {
                        confirmed = await popa.totalConfirmed();
                        assert.equal(+confirmed, 1);
                    }
                );
        });
    });
});

contract('withdrawals', function(accounts) {
    contract('', () => {
        it('should allow the owner to withdraw some', async () => {
            const popa = await ProofOfPhysicalAddress.deployed();
            const args = buildRegisterAddressArgs(accounts[0]);

            await registerAddress(popa, args, accounts[0]);

            const contractBalanceBefore = web3.eth.getBalance(popa.address);
            const ownerBalanceBefore = web3.eth.getBalance(accounts[0]);
            assert.equal(contractBalanceBefore.toFixed(), args.priceWei);

            const withdrawalAmount = '1000000';
            const tx = await popa.withdrawSome(withdrawalAmount, {
                gasPrice: '1', // make 1 gas === 1 wei
            });
            const gasUsed = tx.receipt.gasUsed;

            const contractBalanceAfter = web3.eth.getBalance(popa.address);
            const ownerBalanceAfter = web3.eth.getBalance(accounts[0]);
            assert.equal(contractBalanceAfter.toFixed(), contractBalanceBefore.minus(withdrawalAmount).toFixed());
            assert.equal(ownerBalanceAfter.toFixed(), ownerBalanceBefore.plus(withdrawalAmount).minus(gasUsed).toFixed());
        });
    });

    contract('', () => {
        it('should not allow to withdraw more than the contract\'s balance', async () => {
            const popa = await ProofOfPhysicalAddress.deployed();
            const args = buildRegisterAddressArgs(accounts[0]);

            await registerAddress(popa, args, accounts[0]);

            const contractBalanceBefore = web3.eth.getBalance(popa.address);
            const ownerBalanceBefore = web3.eth.getBalance(accounts[0]);
            assert.equal(contractBalanceBefore.toFixed(), args.priceWei);

            const withdrawalAmount = new BigNumber(args.priceWei).plus(1);
            await popa.withdrawSome(withdrawalAmount, { gasPrice: '1' })
                .then(
                    () => assert.fail(), // should reject
                    async () => {
                        const contractBalanceAfter = web3.eth.getBalance(popa.address);
                        const ownerBalanceAfter = web3.eth.getBalance(accounts[0]);
                        assert.equal(contractBalanceAfter.toFixed(), contractBalanceBefore.toFixed());
                        assert.isTrue(ownerBalanceAfter.lt(ownerBalanceBefore));
                    }
                );
        });
    });

    contract('', () => {
        it('should not allow someone other than the owner to withdraw some', async () => {
            const popa = await ProofOfPhysicalAddress.deployed();
            const args = buildRegisterAddressArgs(accounts[0]);

            await registerAddress(popa, args, accounts[0]);

            const contractBalanceBefore = web3.eth.getBalance(popa.address);
            const userBalanceBefore = web3.eth.getBalance(accounts[1]);
            assert.equal(contractBalanceBefore.toFixed(), args.priceWei);

            const withdrawalAmount = '1000000';
            await popa.withdrawSome(withdrawalAmount, { from: accounts[1], gasPrice: '1' })
                .then(
                    () => assert.fail(), // should reject
                    async () => {
                        const contractBalanceAfter = web3.eth.getBalance(popa.address);
                        const userBalanceAfter = web3.eth.getBalance(accounts[1]);
                        assert.equal(contractBalanceAfter.toFixed(), contractBalanceBefore.toFixed());
                        assert.isTrue(userBalanceAfter.lt(userBalanceBefore));
                    }
                );
        });
    });

    contract('', () => {
        it('should allow the owner to withdraw all', async () => {
            const popa = await ProofOfPhysicalAddress.deployed();
            const args = buildRegisterAddressArgs(accounts[0]);

            await registerAddress(popa, args, accounts[0]);

            const contractBalanceBefore = web3.eth.getBalance(popa.address);
            const ownerBalanceBefore = web3.eth.getBalance(accounts[0]);
            assert.equal(contractBalanceBefore.toFixed(), args.priceWei);

            const tx = await popa.withdrawAll({
                gasPrice: '1', // make 1 gas === 1 wei
            });
            const gasUsed = tx.receipt.gasUsed;

            const contractBalanceAfter = web3.eth.getBalance(popa.address);
            const ownerBalanceAfter = web3.eth.getBalance(accounts[0]);
            assert.equal(contractBalanceAfter.toFixed(), '0');
            assert.equal(ownerBalanceAfter.toFixed(), ownerBalanceBefore.plus(args.priceWei).minus(gasUsed).toFixed());
        });

    });
    contract('', () => {
        it('should not allow the owner to withdraw all if the contract\'s balance is 0', async () => {
            const popa = await ProofOfPhysicalAddress.deployed();

            const contractBalanceBefore = web3.eth.getBalance(popa.address);
            const ownerBalanceBefore = web3.eth.getBalance(accounts[0]);
            assert.equal(contractBalanceBefore.toFixed(), '0');

            await popa.withdrawAll({ gasPrice: '1' })
                .then(
                    () => assert.fail(), // should reject
                    async () => {
                        const contractBalanceAfter = web3.eth.getBalance(popa.address);
                        const ownerBalanceAfter = web3.eth.getBalance(accounts[0]);
                        assert.equal(contractBalanceAfter.toFixed(), '0');
                        assert.isTrue(ownerBalanceAfter.lt(ownerBalanceBefore));
                    }
                );
        });
    });

    contract('', () => {
        it('should not allow someone other than the owner to withdraw all', async () => {
            const popa = await ProofOfPhysicalAddress.deployed();
            const args = buildRegisterAddressArgs(accounts[0]);

            await registerAddress(popa, args, accounts[0]);

            const contractBalanceBefore = web3.eth.getBalance(popa.address);
            const userBalanceBefore = web3.eth.getBalance(accounts[1]);
            assert.equal(contractBalanceBefore.toFixed(), args.priceWei);

            await popa.withdrawAll({ from: accounts[1], gasPrice: '1' })
                .then(
                    () => assert.fail(), // should reject
                    async () => {
                        const contractBalanceAfter = web3.eth.getBalance(popa.address);
                        const userBalanceAfter = web3.eth.getBalance(accounts[1]);
                        assert.equal(contractBalanceAfter.toFixed(), contractBalanceBefore.toFixed());
                        assert.isTrue(userBalanceAfter.lt(userBalanceBefore));
                    }
                );
        });
    });
});

contract('setSigner', function(accounts) {
    contract('', () => {
        it('should allow the owner to change the signer', async () => {
            const popa = await ProofOfPhysicalAddress.deployed();

            const signerBefore = await popa.signer();

            await popa.setSigner(accounts[1]);

            const signerAfter= await popa.signer();

            assert.notEqual(signerBefore, signerAfter);
            assert.equal(accounts[1], signerAfter);
        });
    });

    contract('', () => {
        it('should not allow someone that\'s not the owner to change the signer', async () => {
            const popa = await ProofOfPhysicalAddress.deployed();

            const signerBefore = await popa.signer();

            await popa.setSigner(accounts[2], { from: accounts[1] })
                .then(
                    () => assert.fail(), // should reject
                    async () => {
                        const signerAfter= await popa.signer();

                        assert.equal(signerBefore, signerAfter);
                    }
                );
        });
    });

    contract('', () => {
        it('signerIsValid should change its result after the signer is changed', async () => {
            const popa = await ProofOfPhysicalAddress.deployed();

            const { v, r, s } = sign('foobar', privateKeys[0]);

            const data = web3.sha3('foobar', { encoding: 'hex' });

            const resultBefore = await popa.signerIsValid(data, v, r, s);
            assert.isTrue(resultBefore);

            await popa.setSigner(accounts[1]);

            const resultAfter = await popa.signerIsValid(data, v, r, s);
            assert.isFalse(resultAfter);
        });
    });
});

contract('helpers', function(accounts) {
    // userExists
    contract('', () => {
        it('userExists should return true after an user is added', async () => {
            const popa = await ProofOfPhysicalAddress.deployed();
            const args = buildRegisterAddressArgs(accounts[0]);

            let userExists = await popa.userExists(accounts[0]);
            assert.isFalse(userExists);

            await registerAddress(popa, args, accounts[0]);

            userExists = await popa.userExists(accounts[0]);
            assert.isTrue(userExists);
        });
    });

    // userAddressConfirmed
    contract('', () => {
        it('userAddressConfirmed should fail if user does not exist', async () => {
            const popa = await ProofOfPhysicalAddress.deployed();

            await popa.userAddressConfirmed(accounts[0], 0)
                .then(
                    () => assert.fail(), // should reject
                    () => {}
                );
        });
    });

    contract('', () => {
        it('userAddressConfirmed should return true after an address is confirmed', async () => {
            const popa = await ProofOfPhysicalAddress.deployed();
            const args = buildRegisterAddressArgs(accounts[0]);

            await registerAddress(popa, args, accounts[0]);

            let isConfirmed = await popa.userAddressConfirmed(accounts[0], 0);
            assert.isFalse(isConfirmed);

            await confirmAddress(popa, args.cc, accounts[0]);

            isConfirmed = await popa.userAddressConfirmed(accounts[0], 0);
            assert.isTrue(isConfirmed);
        });
    });

    // userAddressByCreationBlock
    contract('', () => {
        it('userAddressByCreationBlock should fail if user does not exist', async () => {
            const popa = await ProofOfPhysicalAddress.deployed();

            await popa.userAddressByCreationBlock(accounts[0], web3.eth.blockNumber)
                .then(
                    () => assert.fail(), // should reject
                    () => {}
                );
        });
    });

    contract('', () => {
        it('userAddressByCreationBlock should return the index of the address created at that block', async () => {
            const popa = await ProofOfPhysicalAddress.deployed();
            const args = buildRegisterAddressArgs(accounts[0]);

            await registerAddress(popa, args, accounts[0]);
            const creationBlock = web3.eth.blockNumber;

            const [found, index, isConfirmed] = await popa.userAddressByCreationBlock(accounts[0], creationBlock);
            assert.isTrue(found);
            assert.equal(+index, 0);
            assert.isFalse(isConfirmed);
        });
    });

    contract('', () => {
        it('userAddressByCreationBlock should indicate if the address is confirmed', async () => {
            const popa = await ProofOfPhysicalAddress.deployed();
            const args = buildRegisterAddressArgs(accounts[0]);

            await registerAddress(popa, args, accounts[0]);
            const creationBlock = web3.eth.blockNumber;

            await confirmAddress(popa, args.cc, accounts[0]);

            const [found, index, isConfirmed] = await popa.userAddressByCreationBlock(accounts[0], creationBlock);
            assert.isTrue(found);
            assert.equal(+index, 0);
            assert.isTrue(isConfirmed);
        });
    });

    contract('', () => {
        it('userAddressByCreationBlock should return false if the user exists but has no addresses created at that block', async () => {
            const popa = await ProofOfPhysicalAddress.deployed();
            const args = buildRegisterAddressArgs(accounts[0]);

            await registerAddress(popa, args, accounts[0]);
            const creationBlock = web3.eth.blockNumber;

            const [found, index, isConfirmed] = await popa.userAddressByCreationBlock(accounts[0], creationBlock - 1);
            assert.isFalse(found);
            assert.equal(+index, 0);
            assert.isFalse(isConfirmed);
        });
    });

    contract('', () => {
        it('userAddressByCreationBlock should work if the user has more than one address', async () => {
            const popa = await ProofOfPhysicalAddress.deployed();
            const args1 = buildRegisterAddressArgs(accounts[0]);
            const args2 = buildRegisterAddressArgs(accounts[0], { state: 'al' });

            await registerAddress(popa, args1, accounts[0]);
            await registerAddress(popa, args2, accounts[0]);
            const creationBlock = web3.eth.blockNumber;

            const [found, index, isConfirmed] = await popa.userAddressByCreationBlock(accounts[0], creationBlock);
            assert.isTrue(found);
            assert.equal(+index, 1);
            assert.isFalse(isConfirmed);
        });
    });

    // userAddressByConfirmationCode
    contract('', () => {
        it('userAddressByConfirmationCode should fail if user does not exist', async () => {
            const popa = await ProofOfPhysicalAddress.deployed();
            const args = buildRegisterAddressArgs(accounts[0]);

            await popa.userAddressByConfirmationCode(accounts[0], args.sha3cc)
                .then(
                    () => assert.fail(), // should reject
                    () => {}
                );
        });
    });

    contract('', () => {
        it('userAddressByConfirmationCode should return the index of the address created with that code', async () => {
            const popa = await ProofOfPhysicalAddress.deployed();
            const args = buildRegisterAddressArgs(accounts[0]);

            await registerAddress(popa, args, accounts[0]);

            const [found, index, isConfirmed] = await popa.userAddressByConfirmationCode(accounts[0], args.sha3cc);
            assert.isTrue(found);
            assert.equal(+index, 0);
            assert.isFalse(isConfirmed);
        });
    });

    contract('', () => {
        it('userAddressByConfirmationCode should indicate if the address is confirmed', async () => {
            const popa = await ProofOfPhysicalAddress.deployed();
            const args = buildRegisterAddressArgs(accounts[0]);

            await registerAddress(popa, args, accounts[0]);
            await confirmAddress(popa, args.cc, accounts[0]);

            const [found, index, isConfirmed] = await popa.userAddressByConfirmationCode(accounts[0], args.sha3cc);
            assert.isTrue(found);
            assert.equal(+index, 0);
            assert.isTrue(isConfirmed);
        });
    });

    contract('', () => {
        it('userAddressByConfirmationCode should return false if the user exists but has no addresses created with that code', async () => {
            const popa = await ProofOfPhysicalAddress.deployed();
            const args = buildRegisterAddressArgs(accounts[0]);
            const args2 = buildRegisterAddressArgs(accounts[0], { cc: 'quux' });

            await registerAddress(popa, args, accounts[0]);

            const [found, index, isConfirmed] = await popa.userAddressByConfirmationCode(accounts[0], args2.sha3cc);
            assert.isFalse(found);
            assert.equal(+index, 0);
            assert.isFalse(isConfirmed);
        });
    });

    contract('', () => {
        it('userAddressByConfirmationCode should work if the user has more than one address', async () => {
            const popa = await ProofOfPhysicalAddress.deployed();
            const args1 = buildRegisterAddressArgs(accounts[0]);
            const args2 = buildRegisterAddressArgs(accounts[0], { state: 'al', cc: 'quux' });

            await registerAddress(popa, args1, accounts[0]);
            await registerAddress(popa, args2, accounts[0]);

            const [found, index, isConfirmed] = await popa.userAddressByConfirmationCode(accounts[0], args2.sha3cc);
            assert.isTrue(found);
            assert.equal(+index, 1);
            assert.isFalse(isConfirmed);
        });
    });

    // userAddressByAddress
    contract('', () => {
        it('userAddressByAddress should fail if user does not exist', async () => {
            const popa = await ProofOfPhysicalAddress.deployed();
            const args = buildRegisterAddressArgs(accounts[0]);

            await popa.userAddressByAddress(accounts[0], args.country, args.state, args.city, args.address, args.zip)
                .then(
                    () => assert.fail(), // should reject
                    () => {}
                );
        });
    });

    contract('', () => {
        it('userAddressByAddress should return the index of the matching address', async () => {
            const popa = await ProofOfPhysicalAddress.deployed();
            const args = buildRegisterAddressArgs(accounts[0]);

            await registerAddress(popa, args, accounts[0]);

            const [found, index, isConfirmed] = await popa.userAddressByAddress(accounts[0], args.country, args.state, args.city, args.address, args.zip);
            assert.isTrue(found);
            assert.equal(+index, 0);
            assert.isFalse(isConfirmed);
        });
    });

    contract('', () => {
        it('userAddressByAddress should indicate if the address is confirmed', async () => {
            const popa = await ProofOfPhysicalAddress.deployed();
            const args = buildRegisterAddressArgs(accounts[0]);

            await registerAddress(popa, args, accounts[0]);
            await confirmAddress(popa, args.cc, accounts[0]);

            const [found, index, isConfirmed] = await popa.userAddressByAddress(accounts[0], args.country, args.state, args.city, args.address, args.zip);
            assert.isTrue(found);
            assert.equal(+index, 0);
            assert.isTrue(isConfirmed);
        });
    });

    contract('', () => {
        it('userAddressByAddress should return false if the user exists but has no matching addresses', async () => {
            const popa = await ProofOfPhysicalAddress.deployed();
            const args = buildRegisterAddressArgs(accounts[0]);

            await registerAddress(popa, args, accounts[0]);

            const [found, index, isConfirmed] = await popa.userAddressByAddress(accounts[0], args.country, 'al', args.city, args.address, args.zip);
            assert.isFalse(found);
            assert.equal(+index, 0);
            assert.isFalse(isConfirmed);
        });
    });

    contract('', () => {
        it('userAddressByAddress should work if the user has more than one address', async () => {
            const popa = await ProofOfPhysicalAddress.deployed();
            const args1 = buildRegisterAddressArgs(accounts[0]);
            const args2 = buildRegisterAddressArgs(accounts[0], { state: 'al' });

            await registerAddress(popa, args1, accounts[0]);
            await registerAddress(popa, args2, accounts[0]);

            const [found, index, isConfirmed] = await popa.userAddressByAddress(accounts[0], args2.country, args2.state, args2.city, args2.address, args2.zip);
            assert.isTrue(found);
            assert.equal(+index, 1);
            assert.isFalse(isConfirmed);
        });
    });

    // userLastSubmittedName
    contract('', () => {
        it('userLastSubmittedName should fail if user does not exist', async () => {
            const popa = await ProofOfPhysicalAddress.deployed();

            await popa.userLastSubmittedName(accounts[0])
                .then(
                    () => assert.fail(), // should reject
                    () => {}
                );
        });
    });

    contract('', () => {
        it('userLastSubmittedName should return the last submitted name', async () => {
            const popa = await ProofOfPhysicalAddress.deployed();
            const args = buildRegisterAddressArgs(accounts[0]);

            await registerAddress(popa, args, accounts[0]);

            const name = await popa.userLastSubmittedName(accounts[0]);
            assert.equal(name, args.name);
        });
    });

    contract('', () => {
        it('userLastSubmittedName should work if there are multiple addresses', async () => {
            const popa = await ProofOfPhysicalAddress.deployed();
            const args1 = buildRegisterAddressArgs(accounts[0], { name: 'john', address: '1 street'});
            const args2 = buildRegisterAddressArgs(accounts[0], { name: 'paul', address: '2 street'});

            await registerAddress(popa, args1, accounts[0]);
            await registerAddress(popa, args2, accounts[0]);

            const name = await popa.userLastSubmittedName(accounts[0]);
            assert.equal(name, args2.name);
        });
    });

    // userLastConfirmedName
    contract('', () => {
        it('userLastConfirmedName should fail if user does not exist', async () => {
            const popa = await ProofOfPhysicalAddress.deployed();

            await popa.userLastConfirmedName(accounts[0])
                .then(
                    () => assert.fail(), // should reject
                    () => {}
                );
        });
    });

    contract('', () => {
        it('userLastConfirmedName should return the last confirmed name', async () => {
            const popa = await ProofOfPhysicalAddress.deployed();
            const args = buildRegisterAddressArgs(accounts[0]);

            await registerAddress(popa, args, accounts[0]);
            await confirmAddress(popa, args.cc, accounts[0]);

            const name = await popa.userLastConfirmedName(accounts[0]);
            assert.equal(name, args.name);
        });
    });

    contract('', () => {
        it('userLastConfirmedName should work if there are multiple addresses confirmed', async () => {
            const popa = await ProofOfPhysicalAddress.deployed();
            const args1 = buildRegisterAddressArgs(accounts[0], { cc: 'foo', name: 'john', address: '1 street'});
            const args2 = buildRegisterAddressArgs(accounts[0], { cc: 'bar', name: 'paul', address: '2 street'});

            await registerAddress(popa, args1, accounts[0]);
            await registerAddress(popa, args2, accounts[0]);
            await confirmAddress(popa, args1.cc, accounts[0]);
            await confirmAddress(popa, args2.cc, accounts[0]);

            const name = await popa.userLastConfirmedName(accounts[0]);
            assert.equal(name, args2.name);
        });
    });

    contract('', () => {
        it('userLastConfirmedName should work if there is a non-confirmed address and a confirmed address', async () => {
            const popa = await ProofOfPhysicalAddress.deployed();
            const args1 = buildRegisterAddressArgs(accounts[0], { cc: 'foo', name: 'john', address: '1 street'});
            const args2 = buildRegisterAddressArgs(accounts[0], { cc: 'bar', name: 'paul', address: '2 street'});

            await registerAddress(popa, args1, accounts[0]);
            await registerAddress(popa, args2, accounts[0]);
            await confirmAddress(popa, args2.cc, accounts[0]);

            const name = await popa.userLastConfirmedName(accounts[0]);
            assert.equal(name, args2.name);
        });
    });

    contract('', () => {
        it('userLastConfirmedName should work if there is a confirmed address and a non-confirmed address', async () => {
            const popa = await ProofOfPhysicalAddress.deployed();
            const args1 = buildRegisterAddressArgs(accounts[0], { cc: 'foo', name: 'john', address: '1 street'});
            const args2 = buildRegisterAddressArgs(accounts[0], { cc: 'bar', name: 'paul', address: '2 street'});

            await registerAddress(popa, args1, accounts[0]);
            await registerAddress(popa, args2, accounts[0]);
            await confirmAddress(popa, args1.cc, accounts[0]);

            const name = await popa.userLastConfirmedName(accounts[0]);
            assert.equal(name, args1.name);
        });
    });

    contract('', () => {
        it('userLastConfirmedName should return an empty string if there are addresses but none is confirmed', async () => {
            const popa = await ProofOfPhysicalAddress.deployed();
            const args1 = buildRegisterAddressArgs(accounts[0], { cc: 'foo', name: 'john', address: '1 street'});
            const args2 = buildRegisterAddressArgs(accounts[0], { cc: 'bar', name: 'paul', address: '2 street'});

            await registerAddress(popa, args1, accounts[0]);
            await registerAddress(popa, args2, accounts[0]);

            const name = await popa.userLastConfirmedName(accounts[0]);
            assert.equal(name, '');
        });
    });

    // userSubmittedAddressesCount
    contract('', () => {
        it('userSubmittedAddressesCount should return 0 if the user does not exist', async () => {
            const popa = await ProofOfPhysicalAddress.deployed();

            const submittedCount = await popa.userSubmittedAddressesCount(accounts[0]);

            assert.equal(+submittedCount, 0);
        });
    });

    contract('', () => {
        it('userSubmittedAddressesCount should return the number of registered addresses', async () => {
            const popa = await ProofOfPhysicalAddress.deployed();
            const args1 = buildRegisterAddressArgs(accounts[0], { cc: 'foo', name: 'john', address: '1 street'});
            const args2 = buildRegisterAddressArgs(accounts[0], { cc: 'bar', name: 'paul', address: '2 street'});

            await registerAddress(popa, args1, accounts[0]);
            let submittedCount = await popa.userSubmittedAddressesCount(accounts[0]);
            assert.equal(+submittedCount, 1);

            await registerAddress(popa, args2, accounts[0]);
            submittedCount = await popa.userSubmittedAddressesCount(accounts[0]);
            assert.equal(+submittedCount, 2);
        });
    });

    // userConfirmedAddressesCount
    contract('', () => {
        it('userConfirmedAddressesCount should return 0 if the user does not exist', async () => {
            const popa = await ProofOfPhysicalAddress.deployed();

            const confirmedCount = await popa.userConfirmedAddressesCount(accounts[0]);

            assert.equal(+confirmedCount, 0);
        });
    });

    contract('', () => {
        it('userConfirmedAddressesCount should return the number of confirmed addresses', async () => {
            const popa = await ProofOfPhysicalAddress.deployed();
            const args1 = buildRegisterAddressArgs(accounts[0], { cc: 'foo', name: 'john', address: '1 street'});
            const args2 = buildRegisterAddressArgs(accounts[0], { cc: 'bar', name: 'paul', address: '2 street'});

            await registerAddress(popa, args1, accounts[0]);
            await registerAddress(popa, args2, accounts[0]);

            await confirmAddress(popa, args1.cc, accounts[0]);
            let confirmedCount = await popa.userConfirmedAddressesCount(accounts[0]);
            assert.equal(+confirmedCount, 1);

            await confirmAddress(popa, args2.cc, accounts[0]);
            confirmedCount = await popa.userConfirmedAddressesCount(accounts[0]);
            assert.equal(+confirmedCount, 2);
        });
    });

    // userAddress
    contract('', () => {
        it('userAddress must fail if user does not exist', async () => {
            const popa = await ProofOfPhysicalAddress.deployed();

            await popa.userAddress(accounts[0], 0)
                .then(
                    () => assert.fail(), // should reject
                    () => {}
                );
        });
    });

    contract('', () => {
        it('userAddress must return the address data for the given index', async () => {
            const popa = await ProofOfPhysicalAddress.deployed();
            const args = buildRegisterAddressArgs(accounts[0]);

            await registerAddress(popa, args, accounts[0]);

            const [country, state, city, location, zip] = await popa.userAddress(accounts[0], 0);

            assert.equal(country, args.country);
            assert.equal(state, args.state);
            assert.equal(city, args.city);
            assert.equal(location, args.address);
            assert.equal(zip, args.zip);
        });
    });

    // userAddressInfo
    contract('', () => {
        it('userAddressInfo must fail if user does not exist', async () => {
            const popa = await ProofOfPhysicalAddress.deployed();

            await popa.userAddressInfo(accounts[0], 0)
                .then(
                    () => assert.fail(), // should reject
                    () => {}
                );
        });
    });

    contract('', () => {
        it('userAddressInfo must return the address info for the given index', async () => {
            const popa = await ProofOfPhysicalAddress.deployed();
            const args = buildRegisterAddressArgs(accounts[0]);

            await registerAddress(popa, args, accounts[0]);

            const [name, creationBlock, confirmationBlock, keccakIdentifier] = await popa.userAddressInfo(accounts[0], 0);

            assert.equal(name, args.name);
            assert.equal(+creationBlock, web3.eth.blockNumber);
            assert.equal(+confirmationBlock, 0);
            assert.equal(keccakIdentifier, web3.sha3(args.country + args.state + args.city + args.address + args.zip));
        });
    });
});

/**
 * Build arguments for registerAddress method
 *
 * The { v, r, s } values were signed with the PK of address 0xdbde11e51b9fcc9c455de9af89729cf37d835156,
 * 1dd9083e16e190fa5413f87837025556063c546bf16e38cc53fd5d018a3acfbb, for the requester address
 * 0x7e7693f12bfd372042b754b729d1474572a2dd01
 */
function buildRegisterAddressArgs(account, extraArgs = {}, privateKey = privateKeys[0]) {
    const baseArgs = {
        wallet: account,
        name: 'john doe',
        country: 'us',
        state: 'ca',
        city: 'san francisco',
        address: '185 berry st',
        zip: '94107',
        priceWei: '40000000000000000',
        cc: '8hwpyynkd9',
    };

    const args = Object.assign(baseArgs, extraArgs);

    args.sha3cc = web3.sha3(args.cc);

    const { v, r, s } = buildSignature(args, privateKey);
    args.sigV = v;
    args.sigR = r;
    args.sigS = s;

    return args;
}

function registerAddress(popa, args, account, value = args.priceWei) {
    return popa.registerAddress(
        args.name,
        args.country,
        args.state,
        args.city,
        args.address,
        args.zip,
        args.priceWei,
        args.sha3cc,
        args.sigV,
        args.sigR,
        args.sigS,
        {
            from: account,
            value: value,
        }
    );
}

function confirmAddress(popa, cc, account, privateKey = privateKeys[0]) {
    const ccBuffer = Buffer.from(cc).toString('hex');
    const text2Sign = account + ccBuffer;
    const { v, r, s } = sign(text2Sign, privateKey);
    return popa.confirmAddress(
        cc,
        v,
        r,
        s,
        {
            from: account,
        }
    );
}

function unregisterAddress(popa, args, account) {
    return popa.unregisterAddress(
        args.country,
        args.state,
        args.city,
        args.address,
        args.zip,
        {
            from: account,
        }
    );
}
