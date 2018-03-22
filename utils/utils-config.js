var path = require('path');
var Web3 = require('web3');

//var server_config = require('../web-dapp/server-config');

var rpc = 'http://localhost:8545';
var network = new Web3.providers.HttpProvider(rpc);
var utils_config = {
    owner: '$TEST',
    //owner: '0x00a329c0648769a73afac7f9381e08fb43dbea72',
    source_file: path.join(__dirname, '../blockchain/contracts/ProofOfPhysicalAddress.sol'),
    contract_name: 'ProofOfPhysicalAddress',
    network: network,
    contractOutput: path.join(__dirname, '../web-dapp/src/contract-output.json'),
};

module.exports = function () {
    //return Object.assign({}, utils_config, server_config);
    return utils_config;
}
