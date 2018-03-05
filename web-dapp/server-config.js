'use strict';
var path = require('path');
var fs = require('fs');
var Web3 = require('web3');

var cfg = {
    port: 3000,
    req_id_length: 6,
    session_store: {
        type: 'memory',
        params: {},
    },

    rpc: 'http://localhost:8545',

    signer: '0xdbde11e51b9fcc9c455de9af89729cf37d835156',

    code_length: 10,
    code_symbols: 'abcdhkmnprstwxy345789',
    confirmation_page_url: 'http://localhost:3000/confirm', // used only for postcard's front cover

    block_wait_interval_ms:   7000,
    block_wait_max_time_ms:  70000,

    price_wei: '0.04e+18', // NOTE: this is in wei. If this value is set, other price_* options will be ignored
    price_us_cents: 1000, // NOTE: this is in cents! e.g. for $10 price, put 1000
    price_upd_interval_ms: 60000,
};

if (fs.existsSync(path.join(__dirname, './server-config-private.js'))) {
    let cfg_private = require(path.join(__dirname, './server-config-private.js'))(cfg);
    for (let k in cfg_private) {
        cfg[k] = cfg_private[k];
    }
}

var network = new Web3.providers.HttpProvider(cfg.rpc);
var web3 = new Web3(network);
cfg.network = network;
cfg.web3 = web3;

var contract_output = '';
if (process.env.NODE_ENV === 'test') {
    contract_output = path.join(__dirname, './test/server/_utils/mock-contract-output.json');
} else {
    contract_output = path.join(__dirname, './src/contract-output.json');
}
var cconf = require(contract_output).ProofOfPhysicalAddress;
cfg.contract_output = contract_output;
cfg.cconf = cconf;
cfg.contract = web3.eth.contract(cconf.abi).at(cconf.address);

module.exports = cfg;
