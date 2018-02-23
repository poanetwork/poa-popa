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

// Only for prepare_reg_tx and prepare_con_tx
const oldString = (str) => {
    if (typeof str !== 'string') return `incorrect type, expecting string, but got ${typeof str}`;
    str = str.trim();
    if (str === '') return 'empty';
    return '';
}
const oldWallet = (str) => {
    if (typeof str !== 'string') return `incorrect type, expecting string, but got ${typeof str}`;
    str = str.trim();
    if (str === '') return 'empty';
    if (!web3.isAddress(str)) return 'not a valid hex-encoded ethereum address';
    return '';
}

// these functions assume that their arguments have already been validated:
const normalizeString = (str) => {
    return str.trim().toLowerCase();
};

module.exports = {
    validate: {
        wallet: isWallet,
        string: isString,
        notEmpty: isNotEmpty,
        old: {
            string: oldString,
            wallet: oldWallet,
        },
    },
    normalize: {
        string: normalizeString,
    },
};
