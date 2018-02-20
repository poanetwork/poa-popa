const ProofOfPhysicalAddress = artifacts.require('ProofOfPhysicalAddress');

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
    it('register_address should register an address', async () => {
      const popa = await ProofOfPhysicalAddress.deployed();
      const args = buildRegisterAddressArgs()

      let addresses = await popa.total_addresses()
      assert.equal(+addresses, 0)

      await registerAddress(popa, args, accounts[0])

      addresses = await popa.total_addresses()
      assert.equal(+addresses, 1)
    })
  })

  contract('', () => {
    it('register_address should fail if name is empty', async () => {
      const popa = await ProofOfPhysicalAddress.deployed();
      const args = buildRegisterAddressArgs({ name: '' })

      await registerAddress(popa, args, accounts[0])
        .then(
          () => assert.fail(), // should reject
          async () => {
            const addresses = await popa.total_addresses()
            assert.equal(+addresses, 0)
          }
        )
    })
  })

  contract('', () => {
    it('register_address should fail if country is empty', async () => {
      const popa = await ProofOfPhysicalAddress.deployed();
      const args = buildRegisterAddressArgs({ country: '' })

      await registerAddress(popa, args, accounts[0])
        .then(
          () => assert.fail(), // should reject
          async () => {
            const addresses = await popa.total_addresses()
            assert.equal(+addresses, 0)
          }
        )
    })
  })

  contract('', () => {
    it('register_address should fail if state is empty', async () => {
      const popa = await ProofOfPhysicalAddress.deployed();
      const args = buildRegisterAddressArgs({ state: '' })

      await registerAddress(popa, args, accounts[0])
        .then(
          () => assert.fail(), // should reject
          async () => {
            const addresses = await popa.total_addresses()
            assert.equal(+addresses, 0)
          }
        )
    })
  })

  contract('', () => {
    it('register_address should fail if city is empty', async () => {
      const popa = await ProofOfPhysicalAddress.deployed();
      const args = buildRegisterAddressArgs({ city: '' })

      await registerAddress(popa, args, accounts[0])
        .then(
          () => assert.fail(), // should reject
          async () => {
            const addresses = await popa.total_addresses()
            assert.equal(+addresses, 0)
          }
        )
    })
  })

  contract('', () => {
    it('register_address should fail if address is empty', async () => {
      const popa = await ProofOfPhysicalAddress.deployed();
      const args = buildRegisterAddressArgs({ location: '' })

      await registerAddress(popa, args, accounts[0])
        .then(
          () => assert.fail(), // should reject
          async () => {
            const addresses = await popa.total_addresses()
            assert.equal(+addresses, 0)
          }
        )
    })
  })

  contract('', () => {
    it('register_address should fail if zip code is empty', async () => {
      const popa = await ProofOfPhysicalAddress.deployed();
      const args = buildRegisterAddressArgs({ zip: '' })

      await registerAddress(popa, args, accounts[0])
        .then(
          () => assert.fail(), // should reject
          async () => {
            const addresses = await popa.total_addresses()
            assert.equal(+addresses, 0)
          }
        )
    })
  })

  contract('', () => {
    it('register_address should fail if sent value is not enough', async () => {
      const popa = await ProofOfPhysicalAddress.deployed();
      const args = buildRegisterAddressArgs()

      await registerAddress(popa, args, accounts[0], '39999999999999999')
        .then(
          () => assert.fail(), // should reject
          async () => {
            const addresses = await popa.total_addresses()
            assert.equal(+addresses, 0)
          }
        )
    })
  })
});

/**
 * Build arguments for register_address method
 *
 * The { v, r, s } values were signed with the PK of address 0xdbde11e51b9fcc9c455de9af89729cf37d835156,
 * 1dd9083e16e190fa5413f87837025556063c546bf16e38cc53fd5d018a3acfbb, for the requester address
 * 0x7e7693f12bfd372042b754b729d1474572a2dd01
 */
function buildRegisterAddressArgs(extraArgs = {}) {
  const baseArgs = {
    name: 'john doe',
    country: 'us',
    state: 'ca',
    city: 'san francisco',
    location: '185 berry st',
    zip: '94107',
    price_wei: '40000000000000000', // bignumber
    confirmation_code: '8hwpyynkd9',
    confirmation_code_sha3: '0x94db87942fb1d72ad3dc465491a87a85714fcd3c913dc496c7810667a3155d8a', // buffer
    sig_v: '27', // bignumber
    sig_r: '0x2562ce89c06b2d22a3a797031c64ab41bd3e89fa73b899c9e61d4da1ac3b47ca', // buffer
    sig_s: '0x11606e611465ecdad3fb0e4276aca50c63bccb061d53fff78b5527600904e8ff' // buffer
  }

  return Object.assign(baseArgs, extraArgs)
}

function registerAddress(popa, args, account, value = args.price_wei) {
  return popa.register_address(
    args.name,
    args.country,
    args.state,
    args.city,
    args.location,
    args.zip,
    args.price_wei,
    args.confirmation_code_sha3,
    args.sig_v,
    args.sig_r,
    args.sig_s,
    {
      from: account,
      value: value
    }
  )
}
