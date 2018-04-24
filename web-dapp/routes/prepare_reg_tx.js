'use strict';

const logger = require('../server-lib/logger');
const express = require('express');
const sendResponse = require('../server-lib/send_response');

const prepareRegTx = require('../controllers/prepareRegTx');

module.exports = () => {
    const router = express.Router();
    router.post('/prepareRegTx', function(req, res) {
        const prelog = `[prepareRegTx] (${req.logPrfx}) `;
        let params;
        let wallet;
        let confirmationCodePlain;
        let sha3cc;
        let priceWei;
        let signOutput;
        return prepareRegTx.validateData(req.body)
            .then(data => {
                wallet = data.wallet;
                params = data.params;
                logger.log(`${prelog} normalized params: ${JSON.stringify(params)}`);
                const confirmationCodes = prepareRegTx.getConfirmationCodes();
                confirmationCodePlain = confirmationCodes.confirmationCodePlain;
                sha3cc = confirmationCodes.sha3cc;
                priceWei = prepareRegTx.getPriceWei();
                return prepareRegTx.sign(params, wallet, sha3cc, priceWei);
            })
            .then((result) => {
                signOutput = result.signOutput;

                logger.log(`${prelog} confirmation code plain: ${confirmationCodePlain}`);
                logger.log(`${prelog} priceWei: ${priceWei}`);
                logger.log(`${prelog} combining into text2sign hex string:`);
                logger.log(`${prelog} wallet:        ${wallet}`);
                logger.log(`${prelog} sha3(cc):      ${sha3cc}`);

                logger.log(`${prelog} sign() output: ${JSON.stringify(signOutput)}`);

                params = Object.assign(params, {priceWei: priceWei});
                return prepareRegTx.setSessionKey(wallet, confirmationCodePlain);
            })
            .then(sessionKey => {
                logger.log(`${prelog} setting sessionKey: ${sessionKey}`);
                return sendResponse(res, {
                    ok: true,
                    result: {
                        wallet,
                        params,
                        confirmationCodeSha3: sha3cc,
                        v: signOutput.v,
                        r: signOutput.r,
                        s: signOutput.s,
                        sessionKey,
                    },
                });
            })
            .catch(err => {
                logger.log(`${prelog} ${err.log}`);
                return sendResponse(res, {ok: err.ok, err: err.msg});
            });
    });

    return router;
};
