# Gas consumption report
Performed by Blockchain Labs, 8 May, 2018

```
  Contract: EthereumClaimsRegistry
    ✓ Can Issue a claim (79896 gas)
    ✓ Can Issue a Self-Claim (103982 gas)
    ✓ Can remove a Claim as Issuer (112269 gas)
    ✓ Can remove a Claim as Subject (99319 gas)
    ✓ Can't remove a Claim if not a Subject or Issuer (104748 gas)
  Contract: PhysicalAddressClaim
    ✓ Should encodes the confirmation block number in a bytes32 (27173 gas)
    ✓ Should not encode if the confirmation block number is bigger than the Confirmation mask (27173 gas)
    ✓ Should decodes the claim (27173 gas)
    ✓ Should not decode the claim if it is not the current version (27173 gas)
    ✓ Should extracts the version (27173 gas)
    ✓ Should extracts the confirmation block number (27173 gas)
  Contract: ownership
    ✓ signer should be equal to owner (27173 gas)
  Contract: address registration (success)
    Contract: 
      ✓ registerAddress should register an address (361156 gas)
    Contract: 
      ✓ total_users should be incremented if it's the first address for that user (361156 gas)
    Contract: 
      ✓ total_confirmed should not change after registering an address (361156 gas)
    Contract: 
      ✓ should allow a user to register two different addresses (652938 gas)
    Contract: 
      ✓ should allow different users to register different addresses (680721 gas)
    Contract: 
      ✓ should allow different users to register the same address (680075 gas)
  Contract: address registration (fail)
    Contract: 
      ✓ registerAddress should fail if name is empty (65119 gas)
    Contract: 
      ✓ registerAddress should fail if country is empty (67619 gas)
    Contract: 
      ✓ registerAddress should fail if state is empty (69799 gas)
    Contract: 
      ✓ registerAddress should fail if city is empty (71275 gas)
    Contract: 
      ✓ registerAddress should fail if address is empty (73455 gas)
    Contract: 
      ✓ registerAddress should fail if zip code is empty (76019 gas)
    Contract: 
      ✓ registerAddress should fail if sent value is not enough (78652 gas)
    Contract: 
      ✓ registerAddress should fail if sender is different (91630 gas)
    Contract: 
      ✓ registerAddress should fail if name is different (91694 gas)
    Contract: 
      ✓ registerAddress should fail if country is different (91630 gas)
    Contract: 
      ✓ registerAddress should fail if state is different (91630 gas)
    Contract: 
      ✓ registerAddress should fail if city is different (91310 gas)
    Contract: 
      ✓ registerAddress should fail if location is different (92212 gas)
    Contract: 
      ✓ registerAddress should fail if zip is different (91630 gas)
    Contract: 
      ✓ registerAddress should fail if price is different (91374 gas)
    Contract: 
      ✓ registerAddress should fail if sha3 is different (91630 gas)
    Contract: 
      ✓ registerAddress should fail if args were signed with a different private key is different (91630 gas)
    Contract: 
      ✓ registerAddress should fail if address was already registered (460951 gas)
  Contract: address removal
    Contract: 
      ✓ should allow to unregister an address (459308 gas)
    Contract: 
      ✓ should not allow an user to unregister another user's address (392828 gas)
    Contract: 
      ✓ should delete the user if the unregistered address was their last one (459308 gas)
    Contract: 
      ✓ should not delete the user if the unregistered address was not their last one (787409 gas)
    Contract: 
      ✓ should not delete an address that an user has not registered (408852 gas)
  Contract: address confirmation
    Contract: 
      ✓ should succeed if the arguments are correct (481900 gas)
    Contract: 
      ✓ should fail if the confirmation code is empty (390047 gas)
    Contract: 
      ✓ should fail if the sender is different than the account that registered (394899 gas)
    Contract: 
      ✓ should fail if the data is signed with a different private key (406776 gas)
    Contract: 
      ✓ should fail if the confirmation code is invalid (421672 gas)
    Contract: 
      ✓ should fail if the address is already confirmed (561753 gas)
  Contract: withdrawals
    Contract: 
      ✓ should allow the owner to withdraw some (396852 gas)
    Contract: 
      ✓ should not allow to withdraw more than the contract's balance (388261 gas)
    Contract: 
      ✓ should not allow someone other than the owner to withdraw some (385548 gas)
    Contract: 
      ✓ should allow the owner to withdraw all (396788 gas)
    Contract: 
      ✓ should not allow the owner to withdraw all if the contract's balance is 0 (53619 gas)
    Contract: 
      ✓ should not allow someone other than the owner to withdraw all (385084 gas)
  Contract: setSigner
    Contract: 
      ✓ should allow the owner to change the signer (59341 gas)
    Contract: 
      ✓ should not allow someone that's not the owner to change the signer (52505 gas)
    Contract: 
      ✓ signerIsValid should change its result after the signer is changed (59341 gas)
  Contract: setRegistry
    Contract: 
      ✓ should allow the owner to change the registry (59473 gas)
    Contract: 
      ✓ should not allow someone that's not the owner to change the registry (52637 gas)
  Contract: helpers
    Contract: 
      ✓ userExists should return true after an user is added (361156 gas)
    Contract: 
      ✓ userAddressConfirmed should fail if user does not exist (27173 gas)
    Contract: 
      ✓ userAddressConfirmed should return true after an address is confirmed (481900 gas)
    Contract: 
      ✓ userAddressByCreationBlock should fail if user does not exist (27173 gas)
    Contract: 
      ✓ userAddressByCreationBlock should return the index of the address created at that block (361156 gas)
    Contract: 
      ✓ userAddressByCreationBlock should indicate if the address is confirmed (481900 gas)
    Contract: 
      ✓ userAddressByCreationBlock should return false if the user exists but has no addresses created at that block (361156 gas)
    Contract: 
      ✓ userAddressByCreationBlock should work if the user has more than one address (652938 gas)
    Contract: 
      ✓ userAddressByConfirmationCode should fail if user does not exist (27173 gas)
    Contract: 
      ✓ userAddressByConfirmationCode should return the index of the address created with that code (361156 gas)
    Contract: 
      ✓ userAddressByConfirmationCode should indicate if the address is confirmed (481900 gas)
    Contract: 
      ✓ userAddressByConfirmationCode should return false if the user exists but has no addresses created with that code (361156 gas)
    Contract: 
      ✓ userAddressByConfirmationCode should work if the user has more than one address (652938 gas)
    Contract: 
      ✓ userAddressByAddress should fail if user does not exist (27173 gas)
    Contract: 
      ✓ userAddressByAddress should return the index of the matching address (361156 gas)
    Contract: 
      ✓ userAddressByAddress should indicate if the address is confirmed (481900 gas)
    Contract: 
      ✓ userAddressByAddress should return false if the user exists but has no matching addresses (361156 gas)
    Contract: 
      ✓ userAddressByAddress should work if the user has more than one address (652938 gas)
    Contract: 
      ✓ userLastSubmittedName should fail if user does not exist (27173 gas)
    Contract: 
      ✓ userLastSubmittedName should return the last submitted name (361156 gas)
    Contract: 
      ✓ userLastSubmittedName should work if there are multiple addresses (651896 gas)
    Contract: 
      ✓ userLastConfirmedName should fail if user does not exist (27173 gas)
    Contract: 
      ✓ userLastConfirmedName should return the last confirmed name (481900 gas)
    Contract: 
      ✓ userLastConfirmedName should work if there are multiple addresses confirmed (895074 gas)
    Contract: 
      ✓ userLastConfirmedName should work if there is a non-confirmed address and a confirmed address (774778 gas)
    Contract: 
      ✓ userLastConfirmedName should work if there is a confirmed address and a non-confirmed address (772192 gas)
    Contract: 
      ✓ userLastConfirmedName should return an empty string if there are addresses but none is confirmed (651896 gas)
    Contract: 
      ✓ userSubmittedAddressesCount should return 0 if the user does not exist (27173 gas)
    Contract: 
      ✓ userSubmittedAddressesCount should return the number of registered addresses (651896 gas)
    Contract: 
      ✓ userConfirmedAddressesCount should return 0 if the user does not exist (27173 gas)
    Contract: 
      ✓ userConfirmedAddressesCount should return the number of confirmed addresses (895074 gas)
    Contract: 
      ✓ userAddress must fail if user does not exist (27173 gas)
    Contract: 
      ✓ userAddress must return the address data for the given index (361156 gas)
    Contract: 
      ✓ userAddressInfo must fail if user does not exist (27173 gas)
    Contract: 
      ✓ userAddressInfo must return the address info for the given index (361156 gas)
·------------------------------------------------------------------------------------------|-----------------------------------·
│                                           Gas                                            ·  Block limit: 17592186044415 gas  │
··························································|································|····································
│  Methods                                                ·          21 gwei/gas           ·          769.65 usd/eth           │
····································|·····················|··········|··········|··········|················|···················
│  Contract                         ·  Method             ·  Min     ·  Max     ·  Avg     ·  # calls       ·  usd (avg)       │
····································|·····················|··········|··········|··········|················|···················
│  EthereumClaimsRegistryInterface  ·  removeClaim        ·   23287  ·   23309  ·   23294  ·             3  ·            0.38  │
····································|·····················|··········|··········|··········|················|···················
│  EthereumClaimsRegistryInterface  ·  setClaim           ·   37723  ·   52723  ·   49723  ·             5  ·            0.80  │
····································|·····················|··········|··········|··········|················|···················
│  EthereumClaimsRegistryInterface  ·  setSelfClaim       ·       -  ·       -  ·   51259  ·             2  ·            0.83  │
····································|·····················|··········|··········|··········|················|···················
│  ProofOfPhysicalAddress           ·  confirmAddress     ·  120296  ·  122882  ·  121134  ·            13  ·            1.96  │
····································|·····················|··········|··········|··········|················|···················
│  ProofOfPhysicalAddress           ·  registerAddress    ·  291258  ·  333983  ·  325222  ·            62  ·            5.26  │
····································|·····················|··········|··········|··········|················|···················
│  ProofOfPhysicalAddress           ·  setRegistry        ·       -  ·       -  ·   32300  ·             1  ·            0.52  │
····································|·····················|··········|··········|··········|················|···················
│  ProofOfPhysicalAddress           ·  setSigner          ·       -  ·       -  ·   32168  ·             2  ·            0.52  │
····································|·····················|··········|··········|··········|················|···················
│  ProofOfPhysicalAddress           ·  unregisterAddress  ·   98152  ·  134471  ·  110258  ·             3  ·            1.78  │
····································|·····················|··········|··········|··········|················|···················
│  ProofOfPhysicalAddress           ·  withdrawAll        ·       -  ·       -  ·   35632  ·             1  ·            0.58  │
····································|·····················|··········|··········|··········|················|···················
│  ProofOfPhysicalAddress           ·  withdrawSome       ·       -  ·       -  ·   35696  ·             1  ·            0.58  │
·-----------------------------------|---------------------|----------|----------|----------|----------------|------------------·
  93 passing (1m)
```