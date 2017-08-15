'use strict';
//const secp256k1 = require('secp256k1');
const config = require('../server-config');
const logger = require('../logger');

/*
function sign2(web3, text) {
    logger.log('[sign2] signer = ' + config.signer);
    logger.log('[sign2] text = ' + text);
    var sha = web3.sha3(text);
    logger.log('[sign2] sha = ' + sha);
    //var final_sha = web3.sha3(Buffer.concat([ Buffer.from('\x19Ethereum Signed Message:\n32', 'utf8'), Buffer.from(sha.substr(2), 'hex') ]).toString('utf8'));
    var final_sha = web3.sha3('\x19Ethereum Signed Message:\n32' + Buffer.from(sha.substr(2), 'hex').toString());
    logger.log('[sign2] final_sha = ' + final_sha);
    var sig = secp256k1.sign(Buffer.from(final_sha.substr(2), 'hex'), Buffer.from(config.private_key.substr(2), 'hex'));
    var sig_hex = '0x' + Buffer.from(sig.signature).toString('hex');
    logger.log('[sign2] sig_hex = ' + sig_hex);
    var r = '0x' + sig_hex.substr(2).substr(0, 64);
    var s = '0x' + sig_hex.substr(2).substr(64, 64);
    var v = sig.recovery + 27;
    logger.log('[sign2] v = ' + v);
    logger.log('[sign2] r = ' + r);
    logger.log('[sign2] s = ' + s);
    return { v, r, s };
}
*/

// sign a string and return (v, r, s) used by ecrecover to regenerate the coinbase address;
function sign(web3, text) {
    logger.log('[sign] signer = ' + config.signer);
    logger.log('[sign] text (must be in hex) = ' + text);
    var sha = web3.sha3(text, { encoding: 'hex' });
    logger.log('[sign] sha3(text) = ' + sha);
    var sig = web3.eth.sign(config.signer, sha);
    logger.log('[sign] sig = ' + sig);
    sig = sig.substr(2, sig.length);
    var r = '0x' + sig.substr(0, 64);
    var s = '0x' + sig.substr(64, 64);
    var v = web3.toDecimal(sig.substr(128, 2)) + 27;
    logger.log('[sign] v = ' + v);
    logger.log('[sign] r = ' + r);
    logger.log('[sign] s = ' + s);
    return { v, r, s };
}

module.exports = sign;
