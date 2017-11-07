'use strict';

const logger = require('../logger');
const express = require('express');
const config = require('../server-config');
const validate = require('../server-lib/validations').validate;
const normalize = require('../server-lib/validations').normalize;
const post_api = require('../server-lib/post_api');
const db = require('../server-lib/session_store');
const send_response = require('../server-lib/send_response');

const cconf = require(config.contract_output).ProofOfPhysicalAddress;
const contract = config.web3.eth.contract(cconf.abi).at(cconf.address);

module.exports = function (opts) {
    var router = express.Router();
    router.post('/submitConTx', function (req, res) {
        var prelog = '[submitConTx] (' + req.log_prfx + ') ';
        if (!req.body) {
            logger.log(prelog + 'request body empty');
            return send_response(res, { ok: false, err: 'request body: empty' });
        }

        var params = {};
        var verr;

/*
        // wallet
        verr = validate.wallet(config.web3, req.body.wallet);
        if (verr) {
            logger.log(prelog + 'wallet: ' + verr);
            return res.json({ ok: false, err: 'wallet: ' + verr });
        }
        var wallet = req.body.wallet;
*/

        // tx_id
        verr = validate.tx_id(req.body.tx_id);
        if (verr) {
            logger.log(prelog + 'tx_id: ' + verr);
            return send_response(res, { ok: false, err: 'tx_id: ' + verr });
        }
        var tx_id = req.body.tx_id;

        // session_key
        verr = validate.num_str(req.body.session_key);
        if (verr) {
            logger.log(prelog + 'session_key: ' + verr);
            return send_response(res, { ok: false, err: 'session_key: ' + verr });
        }
        var session_key = normalize.num_str(req.body.session_key);

        db.get(session_key, function (err, check) {
            if (err) {
                logger.error(prelog + 'error getting session_key: ' + err);
                return send_response(res, { ok: false, err: 'error getting session_key' });
            }
            if (!check) {
                logger.log(prelog + 'no record with this session_key, skipping');
                return send_response(res, { ok: false, err: 'no record with this session_key' });
            }
            var wallet = check.wallet;
            var confirmation_code_plain = check.confirmation_code_plain;
            logger.log(prelog + 'removing session_key: ' + session_key);
            db.unset(session_key, function (err) {
                if (err) {
                    logger.error(prelog + 'error removing session_key: ' + err);
                }
                config.web3.eth.getTransaction(tx_id, function (err, tx) {
                    if (err) {
                        logger.error(prelog + 'error in getTransaction: ' + err);
                        return send_response(res, { ok: false, err: 'getTransaction error' });
                    }

                    if (tx.from !== wallet || tx.to !== config.signer) {
                        logger.log(prelod + '(from, to) expected (' + wallet + ', ' + config.signer + '), instead got (' + tx.from + ', ' + tx.to + ')' );
                        return send_response(res, { ok: false, err: 'incorrect "from" or "to" address in transaction' });
                    }

                    contract.user_address_by_creation_block(tx.blockNumber, function (err, result) {
                        if (err) {
                            logger.error(prelog + 'error in user_address_by_creation_block: ' + err);
                            return send_response(res, { ok: false, err: 'error getting user address' });
                        }

                        var found = result[0];
                        var ai = result[1];
                        var confirmed = result[2];

                        if (found) {
                            logger.log(prelog + 'address not found');
                            return send_response(res, { ok: false, err: 'address not found' });
                        }

                        if (confirmed) {
                            logger.log(prelog + 'address already confirmed');
                            return send_response(res, { ok: false, err: 'address already confirmed' });
                        }

                        contract.user_address(wallet, ai, function (err, result) {
                            var params = {};
                            params.country = result[0];
                            params.state = result[1];
                            params.city = result[2];
                            params.location = result[3];
                            params.zip = result[4];

                            post_api.create_postcard({ wallet, params }, confirmation_code_plain, { tx_id }, function (err, result) {
                                return send_response(res, {
                                    ok: true,
                                    result: {

                                    },
                                });
                            });
                        });

                    });
                });
            });
        });
    });

    return router;
};
