'use strict';

const config = require('../server-config');
const db = require('../server-lib/session_store');
const post_api = require('../server-lib/post_api');
const logger = require('../server-lib/logger');
const {validate, normalize} = require('../server-lib/validations');
const {createResponseObject} = require('../server-lib/utils');

const validateData = (opts) => {
    if (!opts.body) return createResponseObject('body', 'req.body', 'request body: empty');
    const body = opts.body;
    const prelog = opts.prelog ? opts.prelog : '';

    // wallet
    const walletError = validate.wallet(config.web3, body.wallet);
    // tx_id
    const txIdError = validate.string(body.tx_id);
    // session_key
    const sessionKeyError = validate.string(body.session_key);

    if (walletError) {
        logger.log(`${prelog} validation error on wallet: body.wallet, error: ${walletError}`);
        return createResponseObject(false, walletError);
    }
    if (txIdError) {
        logger.log(`${prelog} validation error on tx_id: body.tx_id, error: ${txIdError}`);
        return createResponseObject(false, txIdError);
    }
    if (sessionKeyError) {
        logger.log(`${prelog} validation error on session_key: body.session_key, error: ${sessionKeyError}`);
        return createResponseObject(false, sessionKeyError);
    }
    return {ok: true};
};

const normalizeData = (body) => {
    const wallet = body.wallet;
    const tx_id = normalize.string(body.tx_id);
    const session_key = normalize.string(body.session_key);

    return {wallet, tx_id, session_key};
};

const getInfo = (opts) => {
    const {session_key, wallet} = opts;
    const prelog = opts.prelog ? opts.prelog : '';
    return db.get(session_key)
        .then(info => {
            if (!info || Object.keys(info).length === 0 || !info.wallet || !info.confirmation_code_plain) {
                logger.error(`${prelog} no info for this session_key: ${session_key}`);
                throw new Error(createResponseObject(false, 'no info for this session_key'));
            }

            if (info.wallet !== wallet) {
                logger.error(`${prelog} wallets do not match: info.wallet: ${info.wallet}, but wallet: ${wallet}`);
                throw new Error(createResponseObject(false, 'wallets do not match'));
            }
            return info;
        })
        .catch(err => {
            logger.error(`${prelog} error getting info by session_key: ${session_key}, error: ${err}`);
            throw new Error(createResponseObject(false, 'error getting info by session_key'));
        });
};

const getTxBlocknumber = (opts) => {
    const {tx_id, wallet} = opts;
    const prelog = opts.prelog ? opts.prelog : '';
    let tx_bn = null;
    let get_bn_job = {
        id: null,
        started_at: new Date(),
    };
    return new Promise((resolve, reject) => {
        config.web3.eth.getTransaction(tx_id, function(err, tx_details) {
            let error = {
                fatal: false,
                msg: '',
            };
            if (err) {
                logger.error(`${prelog} error getting details from blockchain about tx: ${tx_id}, error: ${err}`);
                error.msg = 'error getting details from blockchain';
            } else if(!tx_details) {
                logger.error(`${prelog} no details for tx with this hash: ${tx_id}`);
                error.msg = `no details for tx with this hash: ${tx_id}`;
            } else if (tx_details.to !== config.cconf.address) {
                logger.error(`${prelog} tx_details.to does not match contract address: tx_details.to = ${tx_details.to}, but config.cconf.address = ${config.cconf.address}`);
                error.fatal = true;
                error.msg = 'to-address in transaction does not match contract address';
            } else if (tx_details.from !== wallet) {
                logger.error(`${prelog} tx_details.from does not match user wallet: tx_details.from = ${tx_details.from}, but wallet = ${wallet}`);
                error.fatal = true;
                error.msg = 'from-address in transaction does not match user wallet';
            }

            if (error.msg || !tx_details.blockNumber) {
                if (error.fatal || new Date() - get_bn_job.started_at > config.block_wait_max_time_ms) {
                    logger.error(`${prelog} giving up on tx_id: ${tx_id}`);
                    return reject(createResponseObject(false, error.msg || 'Empty tx.blockNumber'));
                } else {
                    if (error.msg) {
                        logger.error(`${prelog} check tx_id: ${tx_id}, error: ${error.msg}`);
                    } else if (!tx_details.blockNumber) {
                        logger.error(`${prelog} check tx_id: ${tx_id}, still not mined (empty tx.blockNumber)`);
                    }
                    logger.log(`${prelog} check tx_id: ${tx_id} again in: ${config.block_wait_interval_ms}ms`);
                    setTimeout(getTxBn(opts), config.block_wait_interval_ms);
                }
            } else {
                tx_bn = tx_details.blockNumber;
                logger.log(`${prelog} got block number for tx_id: ${tx_id}, tx_bn: ${tx_bn}`);
                return resolve(tx_bn);
            }
        });
    });
};

const getAddressTxBn = (opts) => {
    const {wallet, tx_bn} = opts;
    const prelog = opts.prelog ? opts.prelog : '';

    return new Promise((resolve, reject) => {
        config.contract.user_address_by_creation_block(wallet, tx_bn, function(err, addr_index) {
            if (err) {
                logger.error(prelog + 'error getting address by tx_bn: ' + err);
                return reject(createResponseObject(false, 'error getting address from transaction'));
            }
            logger.log(`${prelog} addr_index: ${JSON.stringify(addr_index)}`);
            if (!addr_index[0]) {
                logger.log(`${prelog} address not found by creation block number`);
                return reject(createResponseObject(false, 'address not found by creation block number'));
            }

            if (addr_index[2]) {
                logger.log(`${prelog} address already confirmed`);
                return reject(createResponseObject(false, 'address already confirmed'));
            }
            return resolve(addr_index);
        });
    });
};

const getAddressDetails = (opts) => {
    const {address_index, wallet} = opts;
    const prelog = opts.prelog ? opts.prelog : '';

    return new Promise((resolve, reject) => {
        logger.log(`${prelog} getting address details from contract`);
        config.contract.user_address(wallet, address_index[1], function(err, details) {
            if (err) {
                logger.error(`${prelog} error getting address details from contract: ${err}`);
                return reject(createResponseObject(false, 'error getting address details from contract'));
            }
            let address_details = {
                country: details[0],
                state: details[1],
                city: details[2],
                location: details[3],
                zip: details[4],
            };
            logger.log(`${prelog} getting more address details from contract`);
            config.contract.user_address_info(wallet, address_index[1], function(err, details) {
                if (err) {
                    logger.error(`${prelog} error getting address details from contract: ${err}`);
                    return reject(createResponseObject(false, 'error getting address details from contract'));
                }
                address_details.name = details[0];
                logger.log(`${prelog} full address: ${JSON.stringify(address_details)}`);
                return resolve(address_details);
            });
        });
    });
};

const createPostCard = (opts) => {
    const {wallet, tx_id, address, confirmationCodePlain} = opts;
    const prelog = opts.prelog ? opts.prelog : '';

    return new Promise((resolve, reject) => {
        post_api.create_postcard(wallet, address, tx_id, confirmationCodePlain, function(err, result) {
            if (err) {
                logger.error(`${prelog} error returned by create_postcard: ${err}`);
                return reject(createResponseObject(false, 'error while sending postcard'));
            }
            return resolve(result);
        });
    });
};

const removeUsedSessionKey = (opts) => {
    const {session_key, postcard} = opts;
    const prelog = opts.prelog ? opts.prelog : '';

    logger.log(`${prelog} removing used session_key from memory: ${session_key}`);
    return db.unset(session_key)
        .then(() => {
            return {
                ok: true,
                result: {
                    mail_type: postcard.mail_type,
                    expected_delivery_date: postcard.expected_delivery_date,
                }
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
    getInfo,
    getTxBlocknumber,
    getAddressTxBn,
    getAddressDetails,
    createPostCard,
    removeUsedSessionKey,
};