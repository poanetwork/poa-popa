'use strict';
var path = require('path');
var Web3 = require('web3');

var rpc = 'http://localhost:8545';
var network = new Web3.providers.HttpProvider(rpc);

module.exports = {
    port: 3000,
    contract_output: path.join(__dirname, './src/contract-output.json'),
    signer: '0xdbde11e51b9fcc9c455de9af89729cf37d835156',
    private_key: '0x1dd9083e16e190fa5413f87837025556063c546bf16e38cc53fd5d018a3acfbb',
    rpc: rpc,
    network: network,
    code_length: 8,
    code_symbols: 'abcdefghijkmnpqrstuvwxyz23456789', // length of this should be divisor of 256
};
