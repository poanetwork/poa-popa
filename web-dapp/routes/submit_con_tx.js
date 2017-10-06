'use strict';

const logger = require('../logger');
const express = require('express');
const config = require('../server-config');
const validate = require('../server-lib/validations').validate;
const normalize = require('../server-lib/validations').normalize;
const post_api = require('../server-lib/post_api');
const db = require('../server-lib/simple_db');

const cconf = require(config.contract_output).ProofOfPhysicalAddress;
const contract = config.web3.eth.contract(cconf.abi).at(cconf.address);

module.exports = function (opts) {
    var router = express.Router();
    router.post('/submitConTx', function (req, res) {
        var prelog = '[submitConTx] ';
        if (!req.body) {
            logger.log(prelog + 'request body empty');
            return res.json({ ok: false, err: 'request body: empty' });
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
            return res.json({ ok: false, err: 'tx_id: ' + verr });
        }
        var tx_id = req.body.tx_id;

        // session_key
        verr = validate.num_str(req.body.session_key);
        if (verr) {
            logger.log(prelog + 'session_key: ' + verr);
            return res.json({ ok: false, err: 'session_key: ' + verr });
        }
        var session_key = normalize.num_str(req.body.session_key);

        var check = db.get(session_key);
        if (!check) {
            logger.log(prelog + 'no record with this session_key, skipping');
            return res.json({ ok: false, err: 'no record with this session_key' });
        }
        var wallet = check.wallet;
        var confirmation_code_plain = check.confirmation_code_plain;
        db.unset(session_key);

        config.web3.eth.getTransaction(tx_id, function (err, tx) {
            if (err) {
                logger.log(prelog + 'error in getTransaction: ' + err);
                return res.json({ ok: false, err: 'getTransaction error' });
            }

            if (tx.from !== wallet || tx.to !== config.signer) {
                logger.log(prelod + '(from, to) expected (' + wallet + ', ' + config.signer + '), instead got (' + tx.from + ', ' + tx.to + ')' );
                return res.json({ ok: false, err: 'incorrect "from" or "to" address in transaction' });
            }

            contract.user_address_by_creation_block(tx.blockNumber, function (err, result) {
                if (err) {
                    logger.log(prelog + 'error in user_address_by_creation_block: ' + err);
                    return res.json({ ok: false, err: 'error getting user address' });
                }

                var found = result[0];
                var ai = result[1];
                var confirmed = result[2];

                if (found) {
                    logger.log(prelog + 'address not found');
                    return res.json({ ok: false, err: 'address not found' });
                }

                if (confirmed) {
                    logger.log(prelog + 'address already confirmed');
                    return res.json({ ok: false, err: 'address already confirmed' });
                }

                contract.user_address(wallet, ai, function (err, result) {
                    var params = {};
                    params.country = result[0];
                    params.state = result[1];
                    params.city = result[2];
                    params.location = result[3];
                    params.zip = result[4];

                    post_api.create_postcard({ wallet, params }, confirmation_code_plain, { tx_id }, function (err, result) {
                        res.json({
                            ok: true,
                            result: {

                            },
                        });
                    });
                });

            });

        });
    });

    return router;
};
