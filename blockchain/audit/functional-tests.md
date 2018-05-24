# Functional tests
Tests are conducted on the Kovan test network. The following contracts have been verified on Etherscan.

## PhysicalAddressClaim.sol [`0x597cb26`](https://kovan.etherscan.io/address/0x597cb26b0dadd5361bf4a544eea571405f0f7d82#code)
## EthereumClaimsRegistry.sol [`0x3ea4494`](https://kovan.etherscan.io/address/0x3ea4494de0f892359544ef1322edef389db15bbf#code)
## ProofOfPhysicalAddress.sol [`0x2dacccb`](https://kovan.etherscan.io/address/0x2dacccbea6443f43a2c96ab66d35ac3266f90145#code)

## Accounts

- Owner: [0x00B9aeCde3876eEF0CA818c3a8de55493e881e21](https://kovan.etherscan.io/address/0x00B9aeCde3876eEF0CA818c3a8de55493e881e21)
- Signer: [0x00B9aeCde3876eEF0CA818c3a8de55493e881e21](https://kovan.etherscan.io/address/0x00B9aeCde3876eEF0CA818c3a8de55493e881e21)

# Expected Behaviour tests

### Should succeed

- [x] `setSigner()` sets the signer [0x3a1016](https://kovan.etherscan.io/tx/0x3a1016d95846b9564716bb7d90ebdc3e46e29beabef385e3531eaf46991f5ed5)
- [x] `registerAddress()` registers address data [1] - [0x47ba0e](https://kovan.etherscan.io/tx/0x47ba0e18f27e06875da6d3fd3b46d20f9091b707616ce2c53ff4b7cb97b9af6e)
- [x] `confirmAddress()` confirms an address and increases total counters - [0x1885e66](https://kovan.etherscan.io/tx/0x1885e665506d0092f041bc07b91bafcb67c690986aed1bfc06769d589716f5d5)
- [x] `withdrawAll` retrieves the balance of the contracts - [0x451a2f](https://kovan.etherscan.io/tx/0x451a2f1dda9be7c9815517b84878dc0080cf2672ee92c01fcef9cdb615488f59)
- [x] `withdrawSome()` with amount set to 0 [0x5369](https://kovan.etherscan.io/tx/0x5369bd68c4cc6bacadfd54822ed74b96bd12fec27ba83af779f5c41933485e7b)
- [x] `unregisterAddress()` can be used to remove your own address [0x83c6bb](https://kovan.etherscan.io/tx/0x83c6bb517cdeb849f334a5c83a1e880c80dace86dde139071588196a4072be0f)
- [x] `registerAddress()` can be used even if you provide more eth than `priceWei` address data [1] - [0x11b43](https://kovan.etherscan.io/tx/0x11b43b9a39bf33ef208e696b807c8c2241902c88a374fa37dd0635c0292a4e0d)
- [x] `withdrawSome()` can be used to withdraw all eth from the contract [0x4594c](https://kovan.etherscan.io/tx/0x4594cb3d5e561d57f386875a39f36eb1e92ff3edfe778bb4655083ec692b1c29)
- [x] `setRegistry()` changes the registry address [0xa4fe6](https://kovan.etherscan.io/tx/0xa4fe64f24c0cf13ac6c95101b7948492070814ba966278ee01310237af64a00c)
- [x] `registerAddress()` works with this awful address data [2] - [0x5a9cf](https://kovan.etherscan.io/tx/0x5a9cf64b39775929691897b1ebf89a699e960972ec90e23b9c916f2986e79a74)
- [x] `confirmAddress()` works with the previous awful address data [2] - [0x1940b](https://kovan.etherscan.io/tx/0x1940b76fb3f716cbeb5de40587abd1234e173bb9ed9415ce230fed2d01fa2987)
- [x] `registerAddress()` can register a second address to the same eth address (and the same confirmation code) address data [3] - [0xb5c97](https://kovan.etherscan.io/tx/0xb5c97b8baba4881b8b60747079eaa09afe58cea820e8d57ba0b5aec8136c2bf5)
- [x] `registerAddress()` registering the same address as before with a different confirmation code, and a different zip code address data[4] - [0xb3a31](https://kovan.etherscan.io/tx/0xb3a318d50cb59868d589f7cb1ffa0dfb63d90b13f8272f6b4ba12e3b6461255f)
- [x] `confirmAddress()` for address data[4] - [0x02f91](https://kovan.etherscan.io/tx/0x02f91483ebf23400ed7ff43d43ee680138164c99784398816b9b1cc67b46fffc)


### Should revert

- [x] Should not be able to `setSigner` from a non-owner - [0x4baf4d](https://kovan.etherscan.io/tx/0x4baf4d7003ef696586811482efc2b71bb5319537246f254dacf115bc6d739e8d)
- [x] `registerAddress()` can't be called again with the same address for the same user [0x3bc6](https://kovan.etherscan.io/tx/0x3bc6e6281e17fb757c8c76bb641f998f9a098ff393e3ee568e1402db9e198d76)
- [x] You can not use `unregisterAddress()` if you don't have an address registered. [0xb7fa](https://kovan.etherscan.io/tx/0xb7fa66f760090be041eacd9b7ea3f170fa427e8494069218ad5b25548110d3ab)
- [x] `registerAddress()` should fail if you don't provide as much ether as `priceWei` [0x6d3f8](https://kovan.etherscan.io/tx/0x6d3f38431f517cbbd3144ee8e5e5a879a5ae0737984e0b968467ada19ebdcd8c)
- [x] Can't `confirmAddress()` for address which uses the same confirmation code as already confirmed address [0x72071](https://kovan.etherscan.io/tx/0x7207164553cd57f6179bed06d2689a308f1aa8c81d7a28c7e197729788f2b2e2)
- [x] Can't `setRegistry()` if you're not the owner [0xae9c](https://kovan.etherscan.io/tx/0xae9c42313de058ad10cbb4fb03da369b04ab4ecc583d9d70d5d1af8f5a9ee425)
- [x] Can't `withdrawSome()` if you're not the owner [0x90da](https://kovan.etherscan.io/tx/0x90da3d9e5e03a18dbed2a1e0d7dbfb80cdef6e0aad631c1fd9d86cccef7e072f)


__Address Data__
```
[1]: `name: 'john doe', 
   country: 'us', 
     state: 'ca', 
      city: 'san francisco', 
   address: '185 berry st', 
       zip: '94107', 
  priceWei: '40000000000000000', 
        cc: '8hwpyynkd9'`
[2]: `name: '!@#!()(!*@$()*!@*(UD@( 22321(F*@U!_(*FH@(*!UJIOFJJFI#QJFILWJF(@EEOL contract (blah) { }',
   country: '3',
     state: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      city: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
   address: '@#!@# (*&^',
       zip: 'aaa',
  priceWei: '40000000000000000',
        cc: '123456',
     shaCC: '0xc888c9ce9e098d5864d3ded6ebcc140a12142263bace3a23a36f9905f12bd64a'`
[3]: `name: 'another name',
   country: 'nz',
     state: 'na',
      city: 'wellington',
   address: '123 tory st',
       zip: '123',
  priceWei: '40000000000000000',
        cc: '123456'`
[4]: `name: 'another name',
   country: 'nz',
     state: 'na',
      city: 'wellington',
   address: '123 tory st',
       zip: '321',
  priceWei: '40000000000000000',
        cc: '54321',`
  ```