const ProofOfPhysicalAddress = artifacts.require('ProofOfPhysicalAddress');

// solidity-coverage copies all the files to a directory one level deeper, so
// this is necessary for the tests to pass both when running `truffle test` and
// `solidity-coverage`
let buildSignature = null;
try {
  buildSignature = require('../../web-dapp/server-lib/buildSignature')
} catch (e) {
  buildSignature = require('../../../web-dapp/server-lib/buildSignature')
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
  'ab470a1366c59dec4058af0110d6447addf1bad57965bff5b01059cbd80ac47f'
]

contract('ownership', (accounts) => {
  it('signer should be equal to owner', async () => {
    const popa = await ProofOfPhysicalAddress.deployed();
    const owner = await popa.owner()
    const signer = await popa.signer()
    assert.equal(owner, signer)
  });
})

contract('address registration', function(accounts) {
  contract('', () => {
    it('registerAddress should register an address', async () => {
      const popa = await ProofOfPhysicalAddress.deployed();
      const args = buildRegisterAddressArgs(accounts[0])

      let addresses = await popa.totalAddresses()
      assert.equal(+addresses, 0)

      await registerAddress(popa, args, accounts[0])

      addresses = await popa.totalAddresses()
      assert.equal(+addresses, 1)
    })
  })

  contract('', () => {
    it('registerAddress should fail if name is empty', async () => {
      const popa = await ProofOfPhysicalAddress.deployed();
      const args = buildRegisterAddressArgs(accounts[0], { name: '' })

      await registerAddress(popa, args, accounts[0])
        .then(
          () => assert.fail(), // should reject
          async () => {
            const addresses = await popa.totalAddresses()
            assert.equal(+addresses, 0)
          }
        )
    })
  })

  contract('', () => {
    it('registerAddress should fail if country is empty', async () => {
      const popa = await ProofOfPhysicalAddress.deployed();
      const args = buildRegisterAddressArgs(accounts[0], { country: '' })

      await registerAddress(popa, args, accounts[0])
        .then(
          () => assert.fail(), // should reject
          async () => {
            const addresses = await popa.totalAddresses()
            assert.equal(+addresses, 0)
          }
        )
    })
  })

  contract('', () => {
    it('registerAddress should fail if state is empty', async () => {
      const popa = await ProofOfPhysicalAddress.deployed();
      const args = buildRegisterAddressArgs(accounts[0], { state: '' })

      await registerAddress(popa, args, accounts[0])
        .then(
          () => assert.fail(), // should reject
          async () => {
            const addresses = await popa.totalAddresses()
            assert.equal(+addresses, 0)
          }
        )
    })
  })

  contract('', () => {
    it('registerAddress should fail if city is empty', async () => {
      const popa = await ProofOfPhysicalAddress.deployed();
      const args = buildRegisterAddressArgs(accounts[0], { city: '' })

      await registerAddress(popa, args, accounts[0])
        .then(
          () => assert.fail(), // should reject
          async () => {
            const addresses = await popa.totalAddresses()
            assert.equal(+addresses, 0)
          }
        )
    })
  })

  contract('', () => {
    it('registerAddress should fail if address is empty', async () => {
      const popa = await ProofOfPhysicalAddress.deployed();
      const args = buildRegisterAddressArgs(accounts[0], { address: '' })

      await registerAddress(popa, args, accounts[0])
        .then(
          () => assert.fail(), // should reject
          async () => {
            const addresses = await popa.totalAddresses()
            assert.equal(+addresses, 0)
          }
        )
    })
  })

  contract('', () => {
    it('registerAddress should fail if zip code is empty', async () => {
      const popa = await ProofOfPhysicalAddress.deployed();
      const args = buildRegisterAddressArgs(accounts[0], { zip: '' })

      await registerAddress(popa, args, accounts[0])
        .then(
          () => assert.fail(), // should reject
          async () => {
            const addresses = await popa.totalAddresses()
            assert.equal(+addresses, 0)
          }
        )
    })
  })

  contract('', () => {
    it('registerAddress should fail if sent value is not enough', async () => {
      const popa = await ProofOfPhysicalAddress.deployed();
      const args = buildRegisterAddressArgs(accounts[0])

      await registerAddress(popa, args, accounts[0], '39999999999999999')
        .then(
          () => assert.fail(), // should reject
          async () => {
            const addresses = await popa.totalAddresses()
            assert.equal(+addresses, 0)
          }
        )
    })
  })
});

/**
 * Build arguments for registerAddress method
 *
 * The { v, r, s } values were signed with the PK of address 0xdbde11e51b9fcc9c455de9af89729cf37d835156,
 * 1dd9083e16e190fa5413f87837025556063c546bf16e38cc53fd5d018a3acfbb, for the requester address
 * 0x7e7693f12bfd372042b754b729d1474572a2dd01
 */
function buildRegisterAddressArgs(account, extraArgs = {}) {
  const baseArgs = {
    wallet: account,
    name: 'john doe',
    country: 'us',
    state: 'ca',
    city: 'san francisco',
    address: '185 berry st',
    zip: '94107',
    priceWei: '40000000000000000',
    cc: '8hwpyynkd9'
  }

  const args = Object.assign(baseArgs, extraArgs)

  args.sha3cc = web3.sha3(args.cc)

  const { v, r, s } = buildSignature(args, privateKeys[1])
  args.sigV = v
  args.sigR = r
  args.sigS = s

  return args
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
      value: value
    }
  )
}
