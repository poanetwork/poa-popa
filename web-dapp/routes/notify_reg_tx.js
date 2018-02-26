'use strict';

const logger = require('../server-lib/logger');
const express = require('express');
const config = require('../server-config');
const send_response = require('../server-lib/send_response');
const notifyRegTxController = require('../controllers/notifyRegTx');

// eslint-disable-next-line no-unused-vars
module.exports = (opts) => {
    const router = express.Router();
    router.post('/notifyRegTx', function(req, res) {
        const log_prfx = req.log_prfx;
        const prelog = `[notifyRegTx] (${log_prfx})`;

        const body = req.body;
        const isValidData = notifyRegTxController.validateData({body}, prelog);
        if (!isValidData.ok) return send_response(res, { ok: false, err: isValidData.err });

        const {wallet, tx_id, session_key} = notifyRegTxController.normalizeData(body);

        let confirmationCodePlain;
        return notifyRegTxController.getTxInfo({ session_key, wallet }, prelog)
            .then(info => {
                confirmationCodePlain = info.confirmation_code_plain;
                const contractAddress = config.cconf.address;
                const waitMaxTime = config.block_wait_max_time_ms;
                const waitInterval = config.block_wait_interval_ms;
                return notifyRegTxController.getTxBlockNumber({tx_id, wallet, contractAddress, waitMaxTime, waitInterval}, prelog)
            })
            .then(tx_bn => {
                return notifyRegTxController.getAddressByBN({wallet, tx_bn}, prelog);
            })
            .then(address => {
                return notifyRegTxController.createPostCard({wallet, tx_id, address, confirmationCodePlain}, prelog);
            })
            .then(postcard => {
                logger.log(`${prelog} postcard: ${JSON.stringify(postcard)}`);
                return notifyRegTxController.removeUsedSessionKey({session_key, postcard}, prelog);
            })
            .then(result => {
                return send_response(res, {ok: result.ok, result: result.result});
            })
            .catch(error => {
                logger.error(`${prelog} ${error.msg}`);
                return send_response(res, { ok: false, err: error.msg });
            });
    });

    return router;
};
