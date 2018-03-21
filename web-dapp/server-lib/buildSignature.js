'use strict';

const sign = require('./sign');
const Web3 = require('web3');

function buildSignature(params, privateKey) {
    const priceWei = Web3.prototype.padLeft(Web3.prototype.toBigNumber(params.priceWei).toString(16), 64);
    
    const text2sign =
        params.wallet +
        Buffer.concat([
            Buffer.from(params.name, 'utf8'),
            Buffer.from(params.country, 'utf8'),
            Buffer.from(params.state, 'utf8'),
            Buffer.from(params.city, 'utf8'),
            Buffer.from(params.address, 'utf8'),
            Buffer.from(params.zip, 'utf8'),
            Buffer.from(priceWei, 'hex'),
            Buffer.from(params.sha3cc.substr(2), 'hex'),
        ]).toString('hex');
    
    return sign(text2sign, privateKey);
}

module.exports = buildSignature;
