'use strict';

const logger = require('../server-lib/logger');
const express = require('express');
const send_response = require('../server-lib/send_response');

const prepareRegTx = require('../controllers/prepareRegTx');

// eslint-disable-next-line no-unused-vars
module.exports = (opts) => {
    const router = express.Router();
    router.post('/prepareRegTx', function(req, res) {
        const prelog = `[prepareRegTx] (${req.log_prfx}) `;
        let params;
        let wallet;
        let confirmation_code_sha3;
        let sign_output;
        return prepareRegTx.validateData(req.body)
            .then(data => {
                wallet = data.wallet;
                params = data.params;
                logger.log(`${prelog} normalized params: ${JSON.stringify(params)}`);
                return prepareRegTx.sign(params, wallet);
            })
            .then(({confirmationCodePlain, sha3cc, priceWei, signOutput}) => {
                confirmation_code_sha3 = sha3cc;
                sign_output = signOutput;

                logger.log(`${prelog} confirmation code plain: ${confirmationCodePlain}`);
                logger.log(`${prelog} price_wei: ${priceWei}`);
                logger.log(`${prelog} combining into text2sign hex string:`);
                logger.log(`${prelog} wallet:        ${wallet}`);
                logger.log(`${prelog} sha3(cc):      ${sha3cc}`);

                logger.log(`${prelog} sign() output: ${JSON.stringify(sign_output)}`);

                params = Object.assign(params, {price_wei: priceWei});
                return prepareRegTx.setSessionKey(wallet, confirmationCodePlain);
            })
            .then(session_key => {
                logger.log(`${prelog} setting session_key: ${session_key}`);
                return send_response(res, {
                    ok: true,
                    result: {
                        wallet,
                        params,
                        confirmation_code_sha3,
                        v: sign_output.v,
                        r: sign_output.r,
                        s: sign_output.s,
                        session_key,
                    },
                });
            })
            .catch(err => {
                logger.log(`${prelog} ${err.log}`);
                return send_response(res, {ok: err.ok, err: err.msg});
            });
    });

    return router;
};
