'use strict';
const {validate, normalize} = require('../server-lib/validations');
const config = require('../server-config');

const signerPrivateKey = config.signer_private_key;

const validateParams = (body, param) => {
    return new Promise((resolve, reject) => {
        const result = (param === 'wallet') ? validate.wallet(body[param]) : validate.string(body[param]);
        if (!result.ok) {
            const log = `validation error on ${param}: ${body[param]}, err: ${result.msg}`;
            return reject({...result, log});
        }
        return resolve(body)
    });
};

const validateBody = (body) => {
    return new Promise((resolve, reject) => {
        if (!body) return reject({msg: 'request body empty'});
        return resolve(body);
    });
};
const validateWallet = (body) => {
    return validateParams(body, 'wallet');
};
const validateConfirmationCodePlain = (body) => {
    return validateParams(body, 'confirmation_code_plain');
};

const normalizeData = (data) => {
    const wallet = data.wallet;
    const params = {
        confirmation_code_plain: normalize.string(data.confirmation_code_plain),
    };
    return Promise.resolve({wallet, params});
};

const validateData = (data = {}) => {
    return validateBody(data)
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
    const ccp = hexParams.confirmation_code_plain;
    return wallet + Buffer.concat([ccp]).toString('hex');
};

const sign = (text2sign) => {
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
    sign,
};