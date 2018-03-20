'use strict';
const {normalize, validateParams} = require('../server-lib/validations');
const sign = require('../server-lib/sign');
const config = require('../server-config');

const signerPrivateKey = config.signer_private_key;

const validateWallet = (body) => {
    return validateParams(body, 'wallet');
};
const validateConfirmationCodePlain = (body) => {
    return validateParams(body, 'confirmationCodePlain');
};

const normalizeData = (data) => {
    const wallet = data.wallet;
    const params = {
        confirmationCodePlain: normalize.string(data.confirmationCodePlain),
    };
    return Promise.resolve({wallet, params});
};

const validateData = (data = {}) => {
    return new Promise((resolve, reject) => {
        if (!data) return reject({msg: 'request body empty'});
        return resolve(data);
    })
        .then(validateWallet)
        .then(validateConfirmationCodePlain)
        .then(normalizeData);
};

const hexParams = (params) => {
    return Object.keys(params)
        .map(p => ([p, Buffer.from(params[p], 'utf8')]))
        .reduce((o, [key, value]) => Object.assign(o, {[key]: value}), {});
};

const text2sign = (wallet, hexParams) => {
    const ccp = hexParams.confirmationCodePlain;
    return wallet + Buffer.concat([ccp]).toString('hex');
};

const getSign = (text2sign) => {
    return new Promise((resolve, reject) => {
        try {
            const signOutput = sign(text2sign, signerPrivateKey);
            return resolve(signOutput);
        } catch (err) {
            const log = `exception in sign(): ${err.stack}`;
            const msg = 'exception occured during signature calculation';
            return reject({ok: false, log, msg});
        }
    });
};

module.exports = {
    validateData,
    hexParams,
    text2sign,
    getSign,
};