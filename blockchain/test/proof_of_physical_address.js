const ProofOfPhysicalAddress = artifacts.require('ProofOfPhysicalAddress');

contract('ProofOfPhysicalAddress', function(accounts) {
  it('signer should be equal to owner', async function() {
    const popa = await ProofOfPhysicalAddress.deployed();
    const owner = await popa.owner()
    const signer = await popa.signer()
    assert.equal(owner, signer)
  });
});
