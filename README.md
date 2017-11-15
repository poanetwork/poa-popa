# oracles-dapps-proof-of-physical-address
DApp for proof of physical address

This is still work-in-progress, for the latest version please checkout [dev branch](https://github.com/oraclesorg/oracles-dapps-proof-of-physical-address/tree/dev)

## How to test the current version
1. clone this repository
```
git clone https://github.com/oraclesorg/oracles-dapps-proof-of-physical-address.git
git checkout dev
```

2. make sure you have node.js version >= 6.9.1 installed

3. install ethereum testrpc globally
```
npm install -g ethereumjs-testrpc
```

4. cd to the repo folder and install dependencies
```
cd oracles-dapps-proof-of-physical-address
npm install
cd web-dapp
npm install
cd ..
```

4. sensitive data (like lob api key) can be provided by creating `web-dapp/server-config-private.js` file that exports config object like so:
```
'use strict';

module.exports = function (cfg_public) {
    return {
        lob_api_key: '******************************',
        rpc: '******************************',
        signer: '0x****************************', // with 0x prefix
        signer_private_key: '******************************', // without 0x prefix
    };
};

```
If this file is present, its keys will add to/replace keys in `web-dapp/server-config.js`.

5. open new tab in your terminal, cd to `utils` folder and start testrpc with a set of predefined acounts
```
cd utils
bash start_rpc.sh
```
leave this tab opened until your test is complete.

6. in the first tab of your terminal, go to `utils` folder too and deploy the contract
```
cd utils
node deploy_contract
```
answer `yes` when confirmation appears.

7. then to compile react components and start dapp, run:
```
bash run_web.sh
```
wait until a build is ready and `Listening on 3000` is printed in terminal

8. open file `utils/start_rpc.sh` in text editor and import one of the accounts from there to MetaMask using its private key. You can choose any address-private-key pair except `0xdbde11e51b9fcc9c455de9af89729cf37d835156` which is reserved for contract's owner.

9. navigate to http://localhost:3000 in your browser and do tests.

To find out confirmation code, look for a line like
```
[prepareRegTx] confimration confirmation_code_plain: y8t44s8yrt
```
in server logs

To find response details from Lob, including links to the postcard, look for a line like
```
[notifyRegTx] postcard: {"id":"psc_106fe1363e5b9521", ..., "to": ..., thumbnails": ... }
```
in server logs

## Description
### contract
Contract source file is `contract/Mail.sol`.
* main data structures are `User` and `PhysicalAddress`:
```
    struct PhysicalAddress
    {
        string name;

        string country;
        string state;
        string city;
        string location;
        string zip;

        uint256 creation_block;
        bytes32 confirmation_code_sha3;
        uint256 confirmation_block;
    }

    struct User
    {
        uint256 creation_block;
        PhysicalAddress[] physical_addresses;
    }

    mapping (address => User) public users;
```

`location` in contract is alias for `address` in dapp.

* there are also three variables for statistics
```
    uint64 public total_users;
    uint64 public total_addresses;
    uint64 public total_confirmed;
```

* contract has `owner` which is the account that sent the transaction to deploy the contract. This account is also used by the server to create signatures. Therefore, it needs to be unlocked. In `utils/start_rpc.sh` predefined `0xdbde11e51b9fcc9c455de9af89729cf37d835156` is used. You can use another unlocked account, however you'd need to change `signer` property in `web-dapp/server-config.js` to your account's address and `sender` property in `utils/utils-config.js`.

* main methods are
```
    function register_address(
        string name,
        string country, string state, string city, string location, string zip,
        bytes32 confirmation_code_sha3, uint8 sig_v, bytes32 sig_r, bytes32 sig_s)
    public
 ```
 used to register a new address, and
 ```
    function confirm_address(string confirmation_code_plain, uint8 sig_v, bytes32 sig_r, bytes32 sig_s)
    public
```
used to confirm an address.

* `name` maybe different for each new address

* `country`, `state`, `city`, `location` and `zip` are `trim()`ed and `toLowerCase()`ed by dapp before passing them to the contract.

* when confirmation code is entered, `user_address_by_confirmation_code` method is called by dapp to search for address with matching confirmation code.

### transaction signatures
First, all relevant parameters for `register_address` and `confirm_address` need to be converted from utf8 strings to hex strings and then combined together into a single long hex string and then passed to `sign()` function (defined in `web-dapp/server-lib/sign.js`), e.g.

```
    var text2sign = wallet + Buffer.from(confirmation_code_plain, 'utf8').toString('hex');
    try {
        var sign_output = sign(web3, text2sign);
```
this function uses [`web3.eth.sign`](https://github.com/ethereum/wiki/wiki/JavaScript-API#web3ethsign) method to produce a signature, that is divided into three parameters `v`, `r` and `s` that need to be passed to client and then by the client to contract's method.
Contract uses built-in ethereum function `ecrecover` to verify that signer's address matches contract's `owner`:
```
    function signer_is_valid(bytes32 data, uint8 v, bytes32 r, bytes32 s)
    public constant returns (bool)
    {
        bytes memory prefix = '\x19Ethereum Signed Message:\n32';
        bytes32 prefixed = sha3(prefix, data);
        return (ecrecover(prefixed, v, r, s) == owner);
    }
```
Note the use of magical `prefix`.
