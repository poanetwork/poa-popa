'use strict';

const path = require('path');
const envPath = path.join(__dirname, '..', '.env');
require('dotenv').config({ path: envPath });

var fs = require('fs');
var Web3 = require('web3');

var cfg = {
    port: 3000,
    reqIdLength: 6,
    sessionStore: {
        type: 'memory',
        params: {},
    },

    rpc: 'http://localhost:8545',

    signer: '0xdbde11e51b9fcc9c455de9af89729cf37d835156',

    codeLength: 10,
    codeSymbols: 'abcdhkmnprstwxy345789',
    confirmationPageUrl: 'http://localhost:3000/confirm', // used only for postcard's front cover

    blockWaitIntervalMs:   7000,
    blockWaitMaxTimeMs:  70000,

    priceWei: '0.04e+18', // NOTE: this is in wei. If this value is set, other price_* options will be ignored
    priceUsCents: 1000, // NOTE: this is in cents! e.g. for $10 price, put 1000
    priceUpdIntervalMs: 60000,
};

if (fs.existsSync(path.join(__dirname, './server-config-private.js'))) {
    let cfgPrivate = require(path.join(__dirname, './server-config-private.js'))(cfg);
    for (let k in cfgPrivate) {
        cfg[k] = cfgPrivate[k];
    }
}

var network = new Web3.providers.HttpProvider(cfg.rpc);
var web3 = new Web3(network);
cfg.network = network;
cfg.web3 = web3;

if (!process.env.REACT_APP_POPA_CONTRACT_ADDRESS) {
    throw new Error('REACT_APP_POPA_CONTRACT_ADDRESS env var is not defined');
}

const popaContract = require('./src/ProofOfPhysicalAddress.json');

cfg.cconf = {};
cfg.cconf.abi = popaContract.abi;
cfg.cconf.address = process.env.REACT_APP_POPA_CONTRACT_ADDRESS;

cfg.contract = web3.eth.contract(cfg.cconf.abi).at(cfg.cconf.address);

module.exports = cfg;
