# Dynamic Analysis
Performed by Blockchain Labs, 8 May, 2018

```

  Contract: EthereumClaimsRegistry
    ✓ Can Issue a claim (114ms)
    ✓ Can Issue a Self-Claim (93ms)
    ✓ Can remove a Claim as Issuer (127ms)
    ✓ Can remove a Claim as Subject (116ms)
    ✓ Can't remove a Claim if not a Subject or Issuer (87ms)
  Contract: PhysicalAddressClaim
    ✓ Should encodes the confirmation block number in a bytes32
    ✓ Should not encode if the confirmation block number is bigger than the Confirmation mask
    ✓ Should decodes the claim (38ms)
    ✓ Should not decode the claim if it is not the current version
    ✓ Should extracts the version
    ✓ Should extracts the confirmation block number
  Contract: ownership
    ✓ signer should be equal to owner (38ms)
  Contract: address registration (success)
    Contract: 
      ✓ registerAddress should register an address (266ms)
    Contract: 
      ✓ total_users should be incremented if it's the first address for that user (218ms)
    Contract: 
      ✓ total_confirmed should not change after registering an address (219ms)
    Contract: 
      ✓ should allow a user to register two different addresses (646ms)
    Contract: 
      ✓ should allow different users to register different addresses (604ms)
    Contract: 
      ✓ should allow different users to register the same address (881ms)
  Contract: address registration (fail)
    Contract: 
      ✓ registerAddress should fail if name is empty (60ms)
    Contract: 
      ✓ registerAddress should fail if country is empty (60ms)
    Contract: 
      ✓ registerAddress should fail if state is empty (58ms)
    Contract: 
      ✓ registerAddress should fail if city is empty (69ms)
    Contract: 
      ✓ registerAddress should fail if address is empty (79ms)
    Contract: 
      ✓ registerAddress should fail if zip code is empty (120ms)
    Contract: 
      ✓ registerAddress should fail if sent value is not enough (87ms)
    Contract: 
      ✓ registerAddress should fail if sender is different (180ms)
    Contract: 
      ✓ registerAddress should fail if name is different (244ms)
    Contract: 
      ✓ registerAddress should fail if country is different (129ms)
    Contract: 
      ✓ registerAddress should fail if state is different (131ms)
    Contract: 
      ✓ registerAddress should fail if city is different (107ms)
    Contract: 
      ✓ registerAddress should fail if location is different (104ms)
    Contract: 
      ✓ registerAddress should fail if zip is different (120ms)
    Contract: 
      ✓ registerAddress should fail if price is different (104ms)
    Contract: 
      ✓ registerAddress should fail if sha3 is different (106ms)
    Contract: 
      ✓ registerAddress should fail if args were signed with a different private key is different (111ms)
    Contract: 
      ✓ registerAddress should fail if address was already registered (466ms)
  Contract: address removal
    Contract: 
      ✓ should allow to unregister an address (415ms)
    Contract: 
      ✓ should not allow an user to unregister another user's address (244ms)
    Contract: 
      ✓ should delete the user if the unregistered address was their last one (385ms)
    Contract: 
      ✓ should not delete the user if the unregistered address was not their last one (804ms)
    Contract: 
      ✓ should not delete an address that an user has not registered (286ms)
  Contract: address confirmation
    Contract: 
      ✓ should succeed if the arguments are correct (730ms)
    Contract: 
      ✓ should fail if the confirmation code is empty (284ms)
    Contract: 
      ✓ should fail if the sender is different than the account that registered (240ms)
    Contract: 
      ✓ should fail if the data is signed with a different private key (256ms)
    Contract: 
      ✓ should fail if the confirmation code is invalid (292ms)
    Contract: 
      ✓ should fail if the address is already confirmed (570ms)
  Contract: withdrawals
    Contract: 
      ✓ should allow the owner to withdraw some (681ms)
    Contract: 
      ✓ should not allow to withdraw more than the contract's balance (650ms)
    Contract: 
      ✓ should not allow someone other than the owner to withdraw some (643ms)
    Contract: 
      ✓ should allow the owner to withdraw all (692ms)
    Contract: 
      ✓ should not allow the owner to withdraw all if the contract's balance is 0 (480ms)
    Contract: 
      ✓ should not allow someone other than the owner to withdraw all (658ms)
  Contract: setSigner
    Contract: 
      ✓ should allow the owner to change the signer (53ms)
    Contract: 
      ✓ should not allow someone that's not the owner to change the signer (78ms)
    Contract: 
      ✓ signerIsValid should change its result after the signer is changed (122ms)
  Contract: setRegistry
    Contract: 
      ✓ should allow the owner to change the registry (55ms)
    Contract: 
      ✓ should not allow someone that's not the owner to change the registry (54ms)
  Contract: helpers
    Contract: 
      ✓ userExists should return true after an user is added (215ms)
    Contract: 
      ✓ userAddressConfirmed should fail if user does not exist
    Contract: 
      ✓ userAddressConfirmed should return true after an address is confirmed (438ms)
    Contract: 
      ✓ userAddressByCreationBlock should fail if user does not exist (130ms)
    Contract: 
      ✓ userAddressByCreationBlock should return the index of the address created at that block (406ms)
    Contract: 
      ✓ userAddressByCreationBlock should indicate if the address is confirmed (503ms)
    Contract: 
      ✓ userAddressByCreationBlock should return false if the user exists but has no addresses created at that block (299ms)
    Contract: 
      ✓ userAddressByCreationBlock should work if the user has more than one address (556ms)
    Contract: 
      ✓ userAddressByConfirmationCode should fail if user does not exist
    Contract: 
      ✓ userAddressByConfirmationCode should return the index of the address created with that code (232ms)
    Contract: 
      ✓ userAddressByConfirmationCode should indicate if the address is confirmed (467ms)
    Contract: 
      ✓ userAddressByConfirmationCode should return false if the user exists but has no addresses created with that code (208ms)
    Contract: 
      ✓ userAddressByConfirmationCode should work if the user has more than one address (447ms)
    Contract: 
      ✓ userAddressByAddress should fail if user does not exist
    Contract: 
      ✓ userAddressByAddress should return the index of the matching address (250ms)
    Contract: 
      ✓ userAddressByAddress should indicate if the address is confirmed (415ms)
    Contract: 
      ✓ userAddressByAddress should return false if the user exists but has no matching addresses (218ms)
    Contract: 
      ✓ userAddressByAddress should work if the user has more than one address (490ms)
    Contract: 
      ✓ userLastSubmittedName should fail if user does not exist
    Contract: 
      ✓ userLastSubmittedName should return the last submitted name (200ms)
    Contract: 
      ✓ userLastSubmittedName should work if there are multiple addresses (381ms)
    Contract: 
      ✓ userLastConfirmedName should fail if user does not exist
    Contract: 
      ✓ userLastConfirmedName should return the last confirmed name (396ms)
    Contract: 
      ✓ userLastConfirmedName should work if there are multiple addresses confirmed (804ms)
    Contract: 
      ✓ userLastConfirmedName should work if there is a non-confirmed address and a confirmed address (610ms)
    Contract: 
      ✓ userLastConfirmedName should work if there is a confirmed address and a non-confirmed address (617ms)
    Contract: 
      ✓ userLastConfirmedName should return an empty string if there are addresses but none is confirmed (530ms)
    Contract: 
      ✓ userSubmittedAddressesCount should return 0 if the user does not exist
    Contract: 
      ✓ userSubmittedAddressesCount should return the number of registered addresses (407ms)
    Contract: 
      ✓ userConfirmedAddressesCount should return 0 if the user does not exist
    Contract: 
      ✓ userConfirmedAddressesCount should return the number of confirmed addresses (889ms)
    Contract: 
      ✓ userAddress must fail if user does not exist
    Contract: 
      ✓ userAddress must return the address data for the given index (245ms)
    Contract: 
      ✓ userAddressInfo must fail if user does not exist
    Contract: 
      ✓ userAddressInfo must return the address info for the given index (342ms)
  93 passing 
```
