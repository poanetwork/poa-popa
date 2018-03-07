'use strict';

const config = require('../server-config');
const db = require('../server-lib/session_store');
const post_api = require('../server-lib/post_api');
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
    // tx_id
    if (!validate.string(body.tx_id).ok) {
        logger.log(`${prelog} validation error on tx_id: body.tx_id, error: ${validate.string(body.tx_id).msg}`);
        return createResponseObject(false, validate.string(body.tx_id).msg);
    }
    // session_key
    if (!validate.string(body.session_key).ok) {
        logger.log(`${prelog} validation error on session_key: body.session_key, error: ${validate.string(body.session_key).msg}`);
        return createResponseObject(false, validate.string(body.session_key).msg);
    }
    return createResponseObject(true, '');
};

const normalizeData = (body) => {
    const wallet = body.wallet;
    const tx_id = normalize.string(body.tx_id);
    const session_key = normalize.string(body.session_key);
    return {wallet, tx_id, session_key};
};

const getTxInfo = (opts, prelog = '') => {
    const {session_key, wallet} = opts;
    logger.log(`${prelog} fetching info by session_key: ${session_key}`);

    return db.get(session_key)
        .then(info => (validateTxInfo({info, session_key, wallet})));
};

const getTxBlockNumber = (opts, prelog = '') => {
    const {tx_id, wallet, contractAddress, waitInterval, waitMaxTime, startedAt} = opts;


    logger.log(`${prelog} fetching tx_details from blockchain by tx_id: ${tx_id}`);
    return getTransaction(tx_id)
        .then((result) => {
            const {error, txDetails} = result;
            return validateTxDetails(error, txDetails, contractAddress, wallet);
        })
        .then(txDetails => {
            logger.log(`${prelog} got block number for tx_id: ${tx_id}, tx_bn: ${txDetails.blockNumber}`);
            return txDetails.blockNumber;
        })
        .then((blockNumber) => {
            logger.log(`${prelog} checking tx receipt for status`);
            return getTxReceipt(tx_id);
        })
        .then((result) => {
            const {error, txReceipt} = result;
            return validateTxReceipt(tx_id, error, txReceipt);
        })
        .catch((error) => {
            if (error.fatal || new Date() - startedAt > waitMaxTime) {
                throw new Error(error);
            }
            logger.error(`${prelog} ${error.msg}`);
            logger.log(`${prelog} check tx_id: ${tx_id} again in: ${waitInterval}ms`);
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
    const {wallet, tx_id, address, confirmationCodePlain} = opts;

    return new Promise((resolve, reject) => {
        post_api.create_postcard(wallet, address, tx_id, confirmationCodePlain, function (err, result) {
            if (err) {
                logger.error(`${prelog} error returned by create_postcard: ${err}`);
                return reject(createResponseObject(false, 'error while sending postcard'));
            }
            return resolve(result);
        });
    });
};

const removeUsedSessionKey = (opts, prelog) => {
    const {session_key, postcard} = opts;

    logger.log(`${prelog} removing used session_key from memory: ${session_key}`);
    return db.unset(session_key)
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
            logger.error(`${prelog} error removing used session_key: ${err}`);
            throw new Error(createResponseObject(false, 'error removing used session_key'));
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
