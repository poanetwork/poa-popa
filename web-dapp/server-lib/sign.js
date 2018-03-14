
//const secp256k1 = require('secp256k1');
const config = require('../server-config');
const logger = require('./logger');
const prelog = '[sign] ';
/*
function sign2(text) {
    logger.log('[sign2] signer = ' + config.signer);
    logger.log('[sign2] text = ' + text);
    var sha = config.web3.sha3(text);
    logger.log('[sign2] sha = ' + sha);
    //var final_sha = config.web3.sha3(Buffer.concat([ Buffer.from('\x19Ethereum Signed Message:\n32', 'utf8'), Buffer.from(sha.substr(2), 'hex') ]).toString('utf8'));
    var final_sha = config.web3.sha3('\x19Ethereum Signed Message:\n32' + Buffer.from(sha.substr(2), 'hex').toString());
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

/*
// sign a string and return (v, r, s) used by ecrecover to regenerate the coinbase address;
function sign3(text) {
    logger.log(prelog + 'signer = ' + config.signer);
    logger.log(prelog + 'text (must be in hex) = ' + text);
    var sha = config.web3.sha3(text, { encoding: 'hex' });
    logger.log(prelog + 'sha3(text) = ' + sha);
    var sig = config.web3.eth.sign(config.signer, sha);
    logger.log(prelog + 'sig = ' + sig);
    sig = sig.substr(2, sig.length);
    var r = '0x' + sig.substr(0, 64);
    var s = '0x' + sig.substr(64, 64);
    var v = config.web3.toDecimal(sig.substr(128, 2)) + 27;
    logger.log(prelog + 'v = ' + v);
    logger.log(prelog + 'r = ' + r);
    logger.log(prelog + 's = ' + s);

    return { v, r, s };
}
*/

var secp256k1 = require('secp256k1');

function sign(text, privateKey) {
    logger.log(prelog + 'text (must be in hex): ' + text);
    var sha = config.web3.sha3(text, { encoding: 'hex' });
    logger.log(prelog + 'sha3(text): ' + sha); // hex string of sha3(text) => message

    // now concat buffers representing prefix + message.length + message
    var buff_prefix = Buffer.from('\u0019Ethereum Signed Message:\n', 'utf8');
    var buff_length = Buffer.from('32', 'utf8');
    var buff_message= Buffer.from(sha.substr(2), 'hex');
    var buff = Buffer.concat([buff_prefix, buff_length, buff_message]);
    var buff_sha3 = config.web3.sha3('0x' + buff.toString('hex'), { encoding: 'hex' });
    var sig_obj = secp256k1.sign(Buffer.from(buff_sha3.substr(2), 'hex'), Buffer.from(privateKey, 'hex'));
    var sig = '0x' + sig_obj.signature.toString('hex') + (sig_obj.recovery? '01' : '00');
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
