# POA network - Proof of Physical Address (PoPA)

[![Build Status](https://travis-ci.org/poanetwork/poa-popa.svg?branch=master)](https://travis-ci.org/poanetwork/poa-popa)
[![Coverage Status](https://coveralls.io/repos/github/poanetwork/poa-popa/badge.svg?branch=master)](https://coveralls.io/github/poanetwork/poa-popa?branch=master)
[![dependencies Status](https://david-dm.org/poanetwork/poa-popa/status.svg)](https://david-dm.org/poanetwork/poa-popa)
[![devDependencies Status](https://david-dm.org/poanetwork/poa-popa/dev-status.svg)](https://david-dm.org/poanetwork/poa-popa?type=dev)

- [Identity DApps](#identity-dapps)
- [Proof of Physical Address (PoPA)](#proof-of-physical-address-popa)
- [How to test the current version locally](#how-to-test-the-current-version-locally)
  - [Running tests on test network](#running-tests-on-test-network)
  - [Running javascript tests](#running-javascript-tests)
- [How to deploy to a real network](#how-to-deploy-to-a-real-network)
- [Description](#description)
- [Integration with EthereumClaimsRegistry (ERC780)](#integration-with-ethereumclaimsregistry-erc780)


## Identity DApps
In POA Network, identity of individual validators plays a major role for selected consensus. We propose additional checks of identity, performed in a decentralized way. Proof of Identity DApps is a series of decentralized applications focused on connecting a user's identity to his/her wallet. Applications can be run on any Ethereum-compatible network.

## Proof of Physical Address (PoPA)
Using Proof of Physical Address, a user can confirm his/her physical address. It can be used to prove connection between residency and a network address (wallet).
User submits a form with his physical address details (name, state, city, etc) on DApp main page. This data is added to the PoPA contract deployed to the network and thus a correspondence between a wallet and physical address is registered in the contract. However, this correspondence is not yet verified.

To verify the address server sends a postcard (via post office) with confirmation code to the registered physical address. Confirmation code is used by the user to call one of contract's methods (via DApp confirmation page) to verify the correspondence between the confirmation code and the wallet used initially to register the physical address.

A more detailed schematic view of the process:
![popa-scheme](https://raw.githubusercontent.com/poanetwork/wiki/master/assets/imgs/poa/papers/whitepaper/proof-of-address.png)

## Audit reports

* [smart contracts audit](./audit/BlockchainLabs) by BlockchainLabsNZ (added via https://github.com/poanetwork/poa-popa/pull/142 )
* [smart contracts and server audit](./audit/MixBytes) by MixBytes (added via https://github.com/poanetwork/poa-popa/pull/186)

## How to test the current version locally
1. Clone this repository:

    ```
    $ git clone https://github.com/poanetwork/poa-popa.git
    $ cd poa-popa
    ```

    In the following steps, we'll refer to this directory as `$REPO_DIR`.

1. Make sure you have node.js version >= 6.9.1 installed.

1. Install the project dependencies:

     ```
     $ npm install
     ```

1. Sensitive data (like lob api key) has to be added to
`web-dapp/server-config-private.js`. You can create this file by copying the
example:

    ```
    $ cd $REPO_DIR/web-dapp
    $ cp server-config-private.example.js server-config-private.js
    ```

    This file exports a config object whose keys will replace the ones in `web-dapp/server-config.js`.

    _Note:_ you can get the `lobApiKey` registering on [Lob](https://lob.com/) and copying your **Test API Key** from **User -> Settings -> API Keys**.

1. Open a new terminal and start testrpc with a set of predefined accounts:

    ```
    $ npm run start-testrpc
    ```

    Leave this tab open until your test is complete.

1. Deploy the contracts:

    ```
    $ cd $REPO_DIR/blockchain
    $ ./node_modules/.bin/truffle migrate
    ```

    This will send several transactions. One of them will create the PoPA contract. You have to have its address in the `.env` file. If you followed these steps, the address will be the same as the one in `.env.example`, so it will be enough to copy it:

    ```
    $ cd $REPO_DIR
    $ cp .env.example .env
    ```

1. Start the application. This will build the frontend and start the sever.

    ```
    $ cd $REPO_DIR
    $ npm start
    ```

    Wait until you see `Listening on 3000` in the terminal

1. Go to the terminal where you executed the `npm run start-testrpc` command and use those private keys or the mnemonic in MetaMask. You should have an account with a little less than 100 ETH (100 - contract deployment fee).

1. Navigate to http://localhost:3000 in your browser.

    To find out the confirmation code, look for a line like

    ```
    [prepareRegTx] confirmation confirmationCodePlain: y8t44s8yrt
    ```

    in the server logs (the terminal where you ran `npm start`).

    To find response details from Lob, including links to the postcard, look for a line like

    ```
    [notifyRegTx] postcard: {"id":"psc_106fe1363e5b9521", ..., "to": ..., thumbnails": ... }
    ```

    in the server logs.

    _Note:_ in the property `thumbnails` you can find the url of the front and back sides of the postcard with the confirmation code:
    
    ```json
    "thumbnails": [
        {
          "small": "https://s3.us-west-2.amazonaws.com/assets.lob.com/psc_...",
          "medium": "https://s3.us-west-2.amazonaws.com/assets.lob.com/psc_...",
          "large": "https://s3.us-west-2.amazonaws.com/assets.lob.com/psc_..."
        },
        {
          "small": "https://s3.us-west-2.amazonaws.com/assets.lob.com/psc_..",
          "medium": "https://s3.us-west-2.amazonaws.com/assets.lob.com/psc_..",
          "large": "https://s3.us-west-2.amazonaws.com/assets.lob.com/psc_.."
        }
    ]
    ```

### Running tests on test network:

1. Start testrpc

    ```
    $ cd $REPO_DIR
    $ npm run start-testrpc
    ```

1. In another terminal, go to the `blockchain` directory.

    ```
    $ cd $REPO_DIR/blockchain
    ```

1. Run tests

    ```
    ./node_modules/.bin/truffle test
    ```

### Running javascript tests:

1. Go to the root directory and run the tests:

    ```
    $ cd $REPO_DIR
    $ npm test
    ```

1. If you want to run the linter:

    ```
    $ npm run lint
    ```

    Note: Before running the `npm install` script, a `pre-push` hook will be copied to the `.git` folder, so, before each `git push`, it will run the tests. Also for some tests you need to have redis server running locally. If you don't have it, you can skip tests with `--no-verify` git flag and they will be run by travis.

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
4. create file `.env` with the following structure:
```
REACT_APP_POPA_CONTRACT_ADDRESS=0x...
```
put the correct PoPA contract address here.
5. create file `poa-popa/web-dapp/server-config-private.js` with the following content:
```
'use strict';

module.exports = function (cfgPublic) {
    return {
        lobApiKey: '*** LOB TEST OR PROD API KEY ***',
        lobApiVersion: '*** LOB TEST OR PROD API VERSION ***',
        rpc: '*** PROBABLY INFURA ***',
        signer: '*** SIGNER ADDRESS, 0x... ***', // with 0x prefix
        signerPrivateKey: '*** SIGNER PRIVATE KEY ***', // without 0x prefix
        confirmationPageUrl: '*** URL FOR CONFIRMATION PAGE, e.g. https://yourserver.com/confirm ***', // used only for postcard
        // it is recommended to install and use redis for keeping session keys
        sessionStore: {
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
Contract source file is `blockchain/contracts/ProofOfPhysicalAddress.sol`.
* main data structures are `User` and `PhysicalAddress`:
```solidity
struct PhysicalAddress {
    string name;

    string country;
    string state;
    string city;
    string location;
    string zip;

    uint256 creationBlock;
    bytes32 keccakIdentifier;
    bytes32 confirmationCodeSha3;
    uint256 confirmationBlock;
}

struct User {
    uint256 creationBlock;
    PhysicalAddress[] physicalAddresses;
}

mapping (address => User) public users;
```

`location` in contract is alias for `address` in dapp.

* there are also three variables for statistics
```solidity
uint64 public totalUsers;
uint64 public totalAddresses;
uint64 public totalConfirmed;
```
_Note_: they represent an overall number of users/addresses/confirmation, not number at any particular time
* contract has `owner` which is the account that sent the transaction to deploy the contract.

* contract has `signer` which is the account that is used to calculate signatures on server-side and validate parameters from contract-side. By default when contract is created, `signer` is set to `owner`. You can change it later with `setSigner` method.

* main methods are
```solidity
function registerAddress(
    string name,
    string country, string state, string city, string location, string zip,
    uint256 priceWei,
    bytes32 confirmationCodeSha3, uint8 sigV, bytes32 sigR, bytes32 sigS)
public payable
```
 used to register a new address,
```solidity
function confirmAddress(
    string confirmationCodePlain,
    uint8 sigV,
    bytes32 sigR,
    bytes32 sigS)
public
```
used to confirm an address and
```solidity
function unregisterAddress(
    string country,
    string state,
    string city,
    string location,
    string zip)
public
```
used to remove an existing address

* `name` may be different for each new address

* `country`, `state`, `city`, `location` and `zip` are `trim()`ed and `toLowerCase()`ed by dapp before passing them to the contract.

## Integration with EthereumClaimsRegistry (ERC780)
PoPA uses EthereumClaimsRegistry contract (the Register) proposed in https://github.com/ethereum/EIPs/issues/780 to store attestations
* when address is confirmed in PoPA, a new claim is added to the Register with the following structure
    * `issuer`: PoPA contract address
    * `subject`: user's eth wallet address
    * `key`: `keccakIdentifier` of the address
    * `value`: `bytes32` array containing confirmation date and library version

* when address is removed in PoPA, corresponding claim is removed from the Register
