'use strict';
const config = require('../server-config');
const logger = require('./logger');
const prelog = '[sign] ';

var secp256k1 = require('secp256k1');

function sign(text, privateKey) {
    logger.log(prelog + 'text (must be in hex): ' + text);
    var sha = config.web3.sha3(text, { encoding: 'hex' });
    logger.log(prelog + 'sha3(text): ' + sha); // hex string of sha3(text) => message

    // now concat buffers representing prefix + message.length + message
    var buffPrefix = Buffer.from('\u0019Ethereum Signed Message:\n', 'utf8');
    var buffLength = Buffer.from('32', 'utf8');
    var buffMessage= Buffer.from(sha.substr(2), 'hex');
    var buff = Buffer.concat([buffPrefix, buffLength, buffMessage]);
    var buffSha3 = config.web3.sha3('0x' + buff.toString('hex'), { encoding: 'hex' });
    var sigObj = secp256k1.sign(Buffer.from(buffSha3.substr(2), 'hex'), Buffer.from(privateKey, 'hex'));
    var sig = '0x' + sigObj.signature.toString('hex') + (sigObj.recovery? '01' : '00');
    logger.log(prelog + 'signature: ' + sig);
    sig = sig.substr(2, sig.length);
    var r = '0x' + sig.substr(0, 64);
    var s = '0x' + sig.substr(64, 64);
    var v = config.web3.toDecimal(sig.substr(128, 2)) + 27;
    logger.log(prelog + 'v: ' + v);
    logger.log(prelog + 'r: ' + r);
    logger.log(prelog + 's: ' + s);
    return { v, r, s };
}

module.exports = sign;
