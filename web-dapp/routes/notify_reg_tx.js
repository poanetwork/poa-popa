'use strict';

const logger = require('../server-lib/logger');
const express = require('express');
const config = require('../server-config');
const sendResponse = require('../server-lib/send_response');
const notifyRegTxController = require('../controllers/notifyRegTx');

module.exports = () => {
    const router = express.Router();
    router.post('/notifyRegTx', function(req, res) {
        const logPrfx = req.logPrfx;
        const prelog = `[notifyRegTx] (${logPrfx})`;

        const body = req.body;
        const isValidData = notifyRegTxController.validateData({body}, prelog);
        if (!isValidData.ok) return sendResponse(res, { ok: false, err: isValidData.err });

        const {wallet, txId, sessionKey} = notifyRegTxController.normalizeData(body);

        let confirmationCodePlain;
        return notifyRegTxController.getTxInfo({ sessionKey, wallet }, prelog)
            .then(info => {
                confirmationCodePlain = info.confirmationCodePlain;
                const contractAddress = config.cconf.address;
                const waitMaxTime = config.blockWaitMaxTimeMs;
                const waitInterval = config.blockWaitIntervalMs;
                const startedAt = new Date();
                return notifyRegTxController.getTxBlockNumber({txId, wallet, contractAddress, waitMaxTime, waitInterval, startedAt}, prelog);
            })
            .then(txBn => {
                return notifyRegTxController.getAddressByBN({wallet, txBn}, prelog);
            })
            .then(address => {
                const sha3cc = config.web3.sha3(confirmationCodePlain);
                return notifyRegTxController.validateTx(txId, sha3cc)
                    .then(() => address);
            })
            .then(address => {
                return notifyRegTxController.createPostCard({wallet, txId, address, confirmationCodePlain}, prelog);
            })
            .then(postcard => {
                logger.log(`${prelog} postcard: ${JSON.stringify(postcard)}`);
                return notifyRegTxController.removeUsedSessionKey({sessionKey, postcard}, prelog);
            })
            .then(result => {
                return sendResponse(res, {ok: result.ok, result: result.result});
            })
            .catch(error => {
                logger.error(`${prelog} ${error.msg}`);
                return sendResponse(res, { ok: false, err: error.msg });
            });
    });

    return router;
};
