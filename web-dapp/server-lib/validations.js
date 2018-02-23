'use strict';
const config = require('../server-config');
const web3 = config.web3;

const isString = (str) => {
    if (typeof str !== 'string') {
        return {
            ok: false,
            msg: `incorrect type, expecting string, but got ${typeof str}`,
        };
    }
    return {ok: true};
};

const isWallet = (wallet) => {
    if (!web3.isAddress(wallet)) {
        return {
            ok: false,
            msg: 'not a valid hex-encoded ethereum address',
        };
    }
    return {ok: true};
};

const isNotEmpty = (str) => {
    str = str.trim();
    if (str === '') {
        return {
            ok: false,
            msg: 'empty',
        };
    }
    return {ok: true};
};



// these functions assume that their arguments have already been validated:
const normalizeString = (str) => {
    return str.trim().toLowerCase();
};

module.exports = {
    validate: {
        wallet: isWallet,
        string: isString,
        notEmpty: isNotEmpty,
    },
    normalize: {
        string: normalizeString,
    },
};
