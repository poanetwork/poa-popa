'use strict';
var path = require('path');
var fs = require('fs');
var Web3 = require('web3');

var rpc = 'http://localhost:8545';
var network = new Web3.providers.HttpProvider(rpc);

var cfg = {
    port: 3000,
    contract_output: path.join(__dirname, './src/contract-output.json'),
    signer: '0xdbde11e51b9fcc9c455de9af89729cf37d835156',
    rpc: rpc,
    network: network,
    code_length: 8,
    code_symbols: 'abcdefghijkmnpqrstuvwxyz23456789', // length of this should be divisor of 256
};

if (fs.existsSync('./server-config-private.js')) {
    let cfg_private = require('./server-config-private.js');
    for (let k in cfg_private) {
        cfg[k] = cfg_private[k];
    }
}

module.exports = cfg;
