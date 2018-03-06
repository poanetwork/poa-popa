'use strict';
const config = require('../server-config');
const web3 = config.web3;


const isString = (str) => {
    return (typeof str === 'string');
};

const isWallet = (wallet) => {
    return (web3.isAddress(wallet));
};

const isEmpty = (str) => {
    return (str.trim() === '');
};

const validString = (str) => {
    if (!isString(str)) return {ok: false, msg: `incorrect type, expecting string, but got ${typeof str}`};
    if (isEmpty(str)) return {ok: false, msg: 'empty'};
    return {ok: true};
};

const validWallet = (wallet) => {
    if (!isString(wallet)) return {ok: false, msg: `incorrect type, expecting string, but got ${typeof wallet}`};
    if (isEmpty(wallet)) return {ok: false, msg: 'empty'};
    if (!isWallet(wallet)) return {ok: false, msg: 'not a valid hex-encoded ethereum address'};
    return {ok: true};
};

// these functions assume that their arguments have already been validated:
const normalizeString = (str) => {
    return str.trim().toLowerCase();
};

const validateParams = (body, param) => {
    return new Promise((resolve, reject) => {
        const result = (param === 'wallet') ? validWallet(body[param]) : validString(body[param]);
        if (!result.ok) {
            const log = `validation error on ${param}: ${body[param]}, err: ${result.msg}`;
            return reject({...result, log});
        }
        return resolve(body)
    });
};

module.exports = {
    validate: {
        wallet: validWallet,
        string: validString,
    },
    normalize: {
        string: normalizeString,
    },
    validateParams
};
