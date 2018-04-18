'use strict';

const config = require('../server-config');
const db = require('../server-lib/session_store');
const postApi = require('../server-lib/post_api');
const logger = require('../server-lib/logger');
const {validate, normalize} = require('../server-lib/validations');
const {createResponseObject} = require('../server-lib/utils');
const getTransaction = require('../server-lib/get_transaction');
const getTxReceipt = require('../server-lib/get_tx_receipt');
const validateTxInfo = require('../server-lib/validate_tx_info');
const validateTxDetails = require('../server-lib/validate_tx_details');
const validateTxReceipt = require('../server-lib/validate_tx_receipt');
const validateAddressIndex = require('../server-lib/validate_address_index');
const getAddressIndex = require('../server-lib/get_address_index');
const getAddressDetails = require('../server-lib/get_address_details');

const validateData = (opts, prelog = '') => {
    if (!opts.body) return createResponseObject(false, 'request body: empty');
    const {body} = opts;

    // wallet
    if (!validate.wallet(body.wallet).ok) {
        logger.log(`${prelog} validation error on wallet: body.wallet, error: ${validate.wallet(body.wallet).msg}`);
        return createResponseObject(false, validate.wallet(body.wallet).msg);
    }
    // txId
    if (!validate.string(body.txId).ok) {
        logger.log(`${prelog} validation error on txId: body.txId, error: ${validate.string(body.txId).msg}`);
        return createResponseObject(false, validate.string(body.txId).msg);
    }
    // sessionKey
    if (!validate.string(body.sessionKey).ok || isNaN(Number(body.sessionKey))) {
        logger.log(`${prelog} validation error on sessionKey: body.sessionKey, error: ${validate.string(body.sessionKey).msg}`);
        return createResponseObject(false, validate.string(body.sessionKey).msg);
    }
    return createResponseObject(true, '');
};

const normalizeData = (body) => {
    const wallet = body.wallet;
    const txId = normalize.string(body.txId);
    const sessionKey = normalize.string(body.sessionKey);
    return {wallet, txId, sessionKey};
};

const getTxInfo = (opts, prelog = '') => {
    const {sessionKey, wallet} = opts;
    logger.log(`${prelog} fetching info by sessionKey: ${sessionKey}`);

    return db.get(sessionKey)
        .then(info => (validateTxInfo({info, sessionKey, wallet})));
};

const getTxBlockNumber = (opts, prelog = '') => {
    const {txId, wallet, contractAddress, waitInterval, waitMaxTime, startedAt} = opts;


    logger.log(`${prelog} fetching tx_details from blockchain by txId: ${txId}`);
    return getTransaction(txId)
        .then((result) => {
            const {error, txDetails} = result;
            return validateTxDetails(error, txDetails, contractAddress, wallet);
        })
        .then(txDetails => {
            logger.log(`${prelog} got block number for txId: ${txId}, txBn: ${txDetails.blockNumber}`);
            return txDetails.blockNumber;
        })
        .then((blockNumber) => {
            logger.log(`${prelog} checking tx receipt for status`);
            return getTxReceipt(txId);
        })
        .then((result) => {
            const {error, txReceipt} = result;
            return validateTxReceipt(txId, error, txReceipt);
        })
        .catch((error) => {
            if (error.fatal || new Date() - startedAt > waitMaxTime) {
                throw new Error(error);
            }
            logger.error(`${prelog} ${error.msg}`);
            logger.log(`${prelog} check txId: ${txId} again in: ${waitInterval}ms`);
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve(getTxBlockNumber(opts));
                }, waitInterval);
            });
        });
};

const getAddressByBN = (opts, prelog = '') => {
    const {wallet} = opts;

    return getAddressIndex(opts)
        .then(result => {
            const {err, addressIndex} = result;
            return validateAddressIndex(err, addressIndex);
        })
        .then(addressIndex => {
            logger.log(`${prelog} getting address details from contract`);
            return getAddressDetails(addressIndex, wallet);
        })
        .then(addressDetails => {
            logger.log(`${prelog} full address: ${JSON.stringify(addressDetails)}`);
            return addressDetails;
        });
};

const createPostCard = (opts, prelog) => {
    const {wallet, txId, address, confirmationCodePlain} = opts;

    return new Promise((resolve, reject) => {
        postApi.create_postcard(wallet, address, txId, confirmationCodePlain, function (err, result) {
            if (err) {
                logger.error(`${prelog} error returned by create_postcard: ${err}`);
                return reject(createResponseObject(false, 'error while sending postcard'));
            }
            return resolve(result);
        });
    });
};

const removeUsedSessionKey = (opts, prelog) => {
    const {sessionKey, postcard} = opts;

    logger.log(`${prelog} removing used sessionKey from memory: ${sessionKey}`);
    return db.unset(sessionKey)
        .then(() => {
            return {
                ok: true,
                result: {
                    mail_type: postcard.mail_type,
                    expected_delivery_date: postcard.expected_delivery_date,
                },
            };
        })
        .catch(err => {
            logger.error(`${prelog} error removing used sessionKey: ${err}`);
            throw new Error(createResponseObject(false, 'error removing used sessionKey'));
        });
};

module.exports = {
    validateData,
    normalizeData,
    getTxInfo,
    getTxBlockNumber,
    getAddressByBN,
    createPostCard,
    removeUsedSessionKey,
};
