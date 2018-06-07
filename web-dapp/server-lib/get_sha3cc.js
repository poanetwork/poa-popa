'use strict';

const config = require('../server-config');
const abi = require('ethereumjs-abi');

function parseTxData(input) {
    const registerAddressAbi = config.contract.abi.filter(x => x.name === 'registerAddress')[0];
    if (!registerAddressAbi) {
        throw new Error('Could not find ABI for registerAddress method');
    }
    const params = registerAddressAbi.inputs.map(x => x.type);
    const args = abi.rawDecode(params, Buffer.from(input.slice(10), 'hex'));

    return '0x' + args[7].toString('hex');
}

function getSha3cc(txId) {
    const { web3 } = config;

    return new Promise((resolve, reject) => {
        web3.eth.getTransaction(txId, (err, tx) => {
            if (err) {
                return reject(`Couldn't find transaction ${txId}: ${err}`);
            }

            const sha3cc = parseTxData(tx.input);

            return resolve(sha3cc);
        });
    });
}

module.exports = getSha3cc;
