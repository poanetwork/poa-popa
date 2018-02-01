'use strict';

function validate_wallet(web3, wallet) {
    if (typeof wallet !== 'string') return 'incorrect type, expecting string, but got ' + typeof wallet;
    wallet = wallet.trim();
    if (wallet === '') return 'empty';
    if (!web3.isAddress(wallet)) return 'not a valid hex-encoded ethereum address';
    return '';
}

function validate_string(str) {
    if (typeof str !== 'string') return 'incorrect type, expecting string, but got ' + typeof str;
    str = str.trim();
    if (str === '') return 'empty';
    return '';
}

// these functions assume that their arguments have already been validated:

function normalize_string(str) {
    return str.trim().toLowerCase();
}

module.exports = {
    validate: {
        wallet: validate_wallet,
        string: validate_string,
    },
    normalize: {
        string: normalize_string,
    }
};
