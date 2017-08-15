var path = require('path');
var Web3 = require('web3');

var server_config = require('../web-dapp/server-config');

var utils_config = {
    sender: '$TEST',
    //sender: '0x00a329c0648769a73afac7f9381e08fb43dbea72',
    source_file: path.join(__dirname, '../contract/Main.sol'),
    contract_name: 'ProofOfPhysicalAddress',
};

module.exports = function () {
    return Object.assign({}, utils_config, server_config);
}
