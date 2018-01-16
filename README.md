# poa-popa
DApp for proof of physical address

## How to test the current version locally
1. clone this repository
```
git clone https://github.com/poanetwork/poa-popa.git
```

2. make sure you have node.js version >= 6.9.1 installed

3. install Ganache CLI globally
```
npm install -g ganache-cli
```

4. cd to the repo folder and install dependencies.
```
cd poa-popa
npm install
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
        confirmation_page_url: '******************************',
    };
};

```
If this file is present, its keys will add to/replace keys in `web-dapp/server-config.js`.

5. open new tab in your terminal, and start testrpc with a set of predefined acounts
```
npm run start-rpc
```
leave this tab opened until your test is complete.

6. in the first tab of your terminal deploy the contract
```
npm run deploy
```
answer `yes` when confirmation appears.

7. then to compile react components and start dapp, run:
```
npm start
```
wait until a build is ready and `Listening on 3000` is printed in terminal

8. open file `scripts/start_rpc.sh` in text editor and import one of the accounts from there to MetaMask using its private key. You can choose any address-private-key pair except `0xdbde11e51b9fcc9c455de9af89729cf37d835156` which is reserved for contract's owner.

9. navigate to http://localhost:3000 in your browser and do tests.

To find out confirmation code, look for a line like
```
[prepareRegTx] confirmation confirmation_code_plain: y8t44s8yrt
```
in server logs

To find response details from Lob, including links to the postcard, look for a line like
```
[notifyRegTx] postcard: {"id":"psc_106fe1363e5b9521", ..., "to": ..., thumbnails": ... }
```
in server logs

## How to deploy to a real network
1. download the latest version from master branch
```
git clone https://github.com/poanetwork/poa-popa.git
```
2. install dependencies
```
cd poa-popa
npm install
```
3. deploy the contract, e.g. use Remix and Metamask
4. create file `poa-popa/web-dapp/src/contract-output.json` with the following structure:
```
    {
        "ProofOfPhysicalAddress": {
            "address": "*** CONTRACT ADDRESS, 0x... ***",
            "bytecode": "*** BYTECODE, 60606040... ***",
            "abi": [ *** ABI *** ]
        }
    }
```
5. create file `poa-popa/web-dapp/server-config-private.js` with the following content:
```
'use strict';

module.exports = function (cfg_public) {
    return {
        lob_api_key: '*** LOB TEST OR PROD API KEY ***',
        rpc: '*** PROBABLY INFURA ***',
        signer: '*** SIGNER ADDRESS, 0x... ***', // with 0x prefix
        signer_private_key: '*** SIGNER PRIVATE KEY ***', // without 0x prefix
        confirmation_page_url: '*** URL FOR CONFIRMATION PAGE, e.g. https://yourserver.com/confirm ***', // used only for postcard
        // it is recommended to install and use redis for keeping session keys
        session_store: {
            "type": "redis",
            "params": { *** REDIS CONNECTION PARAMETERS *** }
        },
    };
};
```
6. build react components
```
# in poa-popa/web-dapp
npm run build
```
7. start server
```
# in poa-popa/web-dapp
node server
```
or, still better, use pm2
```
# in poa-popa/web-dapp
pm2 start -i 0 server
```

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

* contract has `owner` which is the account that sent the transaction to deploy the contract.

* contract has `signer` which is the account that is used to calculate signatures on server-side and validate parameters from contract-side. By default when contract is created, `signer` is set to `owner`. You can change it later with `set_signer` method.

* main methods are
```
    function register_address(
        string name,
        string country, string state, string city, string location, string zip,
        uint256 price_wei,
        bytes32 confirmation_code_sha3, uint8 sig_v, bytes32 sig_r, bytes32 sig_s)
    public payable
 ```
 used to register a new address, and
 ```
    function confirm_address(string confirmation_code_plain, uint8 sig_v, bytes32 sig_r, bytes32 sig_s)
    public
```
used to confirm an address.

* `name` may be different for each new address

* `country`, `state`, `city`, `location` and `zip` are `trim()`ed and `toLowerCase()`ed by dapp before passing them to the contract.

* when confirmation code is entered, `user_address_by_confirmation_code` method is called by dapp to search for address with matching confirmation code.

### signing parameters
First, all relevant parameters for `register_address` and `confirm_address` need to be converted from utf8 strings to hex strings and then combined together into a single long hex string and then passed to `sign()` function (defined in `web-dapp/server-lib/sign.js`), e.g.

```
    var text2sign = wallet + Buffer.from(confirmation_code_plain, 'utf8').toString('hex');
    try {
        var sign_output = sign(web3, text2sign);
```
this function produces a signature, that is divided into three parameters `v`, `r` and `s` that need to be passed to client and then by the client to contract's method.
Contract uses built-in ethereum function `ecrecover` to verify that signer's address matches contract's `signer`:
```
    function signer_is_valid(bytes32 data, uint8 v, bytes32 r, bytes32 s)
    public constant returns (bool)
    {
        bytes memory prefix = '\x19Ethereum Signed Message:\n32';
        bytes32 prefixed = keccak256(prefix, data);
        return (ecrecover(prefixed, v, r, s) == signer);
    }
```
Note the use of magical `prefix`.
