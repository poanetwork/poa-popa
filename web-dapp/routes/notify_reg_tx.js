'use strict';

const logger = require('../server-lib/logger');
const express = require('express');
const send_response = require('../server-lib/send_response');
const notifyRegTxController = require('../controllers/notifyRegTx');

// eslint-disable-next-line no-unused-vars
module.exports = (opts) => {
    const router = express.Router();
    router.post('/notifyRegTx', function(req, res) {
        const log_prfx = req.log_prfx;
        const prelog = `[notifyRegTx] (${log_prfx})`;

        const body = req.body;
        const isValidData = notifyRegTxController.validateData({body, prelog});
        if (!isValidData.ok) {
            return send_response(res, { ok: isValidData.ok, err: isValidData.err });
        }

        const {wallet, tx_id, session_key} = notifyRegTxController.normalizeData(body);

        logger.log(`${prelog} fetching info by session_key: ${session_key}`);

        let confirmationCodePlain;
        return notifyRegTxController.getInfo({session_key, wallet, prelog})
            .then(info => {
                confirmationCodePlain = info.confirmation_code_plain;
                logger.log(`${prelog} fetching tx_details from blockchain by tx_id: ${tx_id}`);
                return notifyRegTxController.getTxBlocknumber({tx_id, wallet, prelog});
            })
            .then(tx_bn => {
                return notifyRegTxController.getAddressTxBn({wallet, tx_bn, prelog});
            })
            .then(address_index => {
                return notifyRegTxController.getAddressDetails({address_index, wallet, prelog});
            })
            .then(address => {
                return notifyRegTxController.createPostCard({wallet, tx_id, address, confirmationCodePlain, prelog});
            })
            .then(postcard => {
                logger.log(`${prelog} postcard: ${JSON.stringify(postcard)}`);
                return notifyRegTxController.removeUsedSessionKey({session_key, postcard, prelog});
            })
            .then(result => {
                return send_response(res, {ok: result.ok, result: result.result});
            })
            .catch(error => {
                return send_response(res, { ok: error.ok, err: error.err });
            });
    });

    return router;
};
