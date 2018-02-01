"use strict";

const logger = require("../server-lib/logger");
const express = require("express");
const config = require("../server-config");
const validate = require("../server-lib/validations").validate;
const normalize = require("../server-lib/validations").normalize;
const post_api = require("../server-lib/post_api");
const db = require("../server-lib/session_store");
const send_response = require("../server-lib/send_response");

module.exports = (opts) => {
    var router = express.Router();
    router.post("/notifyRegTx", function(req, res) {
        var prelog = "[notifyRegTx] (" + req.log_prfx + ") ";
        if (!req.body) {
            logger.log(prelog + "request body empty");
            return send_response(res, { ok: false, err: "request body: empty" });
        }

        var verr;

        // wallet
        verr = validate.wallet(config.web3, req.body.wallet);
        if (verr) {
            logger.log(
                prelog + "validation error on wallet: " + wallet + ", err: " + verr
            );
            return send_response(res, { ok: false, err: "wallet: " + verr });
        }
        var wallet = req.body.wallet;

        // tx_id
        verr = validate.string(req.body.tx_id);
        if (verr) {
            logger.log(
                prelog + "validation error on tx_id: " + tx_id + ", err: " + verr
            );
            return send_response(res, { ok: false, err: "tx_id: " + verr });
        }
        var tx_id = normalize.string(req.body.tx_id);

        // session_key
        verr = validate.string(req.body.session_key);
        if (verr) {
            logger.log(
                prelog +
                "validation error on session_key: " +
                session_key +
                ", err: " +
                verr
            );
            return send_response(res, { ok: false, err: "session_key: " + verr });
        }
        var session_key = normalize.string(req.body.session_key);

        logger.log(prelog + "fetching info by session_key: " + session_key);
        db.get(session_key, function(err, info) {
            if (err) {
                logger.error(
                    prelog +
                    "error getting info by session_key: " +
                    session_key +
                    ", err: " +
                    err
                );
                return send_response(res, {
                    ok: false,
                    err: "error getting info by session_key"
                });
            }
            if (
                !info ||
                Object.keys(info).length === 0 ||
                !info.wallet ||
                !info.confirmation_code_plain
            ) {
                logger.log(prelog + "no info for this session_key: " + session_key);
                return send_response(res, {
                    ok: false,
                    err: "no info for this session_key"
                });
            }

            if (info.wallet !== wallet) {
                logger.log(
                    prelog +
                    "wallets do not match: info.wallet: " +
                    info.wallet +
                    ", but wallet: " +
                    wallet
                );
                return send_response(res, { ok: false, err: "wallets do not match" });
            }

            logger.log(
                prelog + "fetching tx_details from blockchain by tx_id: " + tx_id
            );
            var tx_bn = null;
            var get_bn_job = {
                id: null,
                started_at: null
            };

            var get_tx_bn = () => {
                config.web3.eth.getTransaction(tx_id, function(err, tx_details) {
                    var err = null;
                    var fatal = false;
                    if (err) {
                        logger.error(
                            prelog +
                            "error getting details from blockchain about tx: " +
                            tx_id +
                            ", err: " +
                            err
                        );
                        err = "error getting tx details from blockchain";
                    } else if (!tx_details) {
                        logger.log(prelog + "no details for tx with this hash: " + tx_id);
                        err = "no details for tx with this hash: " + tx_id;
                    } else if (tx_details.to !== config.cconf.address) {
                        fatal = true;
                        logger.log(
                            prelog +
                            "tx_details.to does not match contract address: tx_details.to = " +
                            tx_details.to +
                            ", but config.cconf.address = " +
                            config.cconf.address
                        );
                        err = "to-address in transaction does not match contract address";
                    } else if (tx_details.from !== wallet) {
                        fatal = true;
                        logger.log(
                            prelog +
                            "tx_details.from does not match user wallet: tx_details.from = " +
                            tx_details.from +
                            ", but wallet = " +
                            wallet
                        );
                        err = "from-address in transaction does not match user wallet";
                    }

                    if (err || !tx_details.blockNumber) {
                        if (
                            fatal ||
                            new Date() - get_bn_job.started_at > config.block_wait_max_time_ms
                        ) {
                            logger.log(prelog + "giving up on tx_id: " + tx_id);
                            return send_response(res, {
                                ok: false,
                                err: err || "Empty tx.blockNumber"
                            });
                        } else {
                            if (err) {
                                logger.log(prelog + "check tx_id: " + tx_id + ", err: " + err);
                            } else if (!tx_details.blockNumber) {
                                logger.log(
                                    prelog +
                                    "check tx_id: " +
                                    tx_id +
                                    ", still not mined (empty tx.blockNumber)"
                                );
                            }
                            logger.log(
                                prelog +
                                "check tx_id: " +
                                tx_id +
                                " again in: " +
                                config.block_wait_interval_ms +
                                " ms"
                            );
                            setTimeout(get_tx_bn, config.block_wait_interval_ms);
                        }
                    } else {
                        tx_bn = tx_details.blockNumber;
                        logger.log(
                            prelog +
                            "got block number for tx_id: " +
                            tx_id +
                            ", tx_bn: " +
                            tx_bn
                        );
                        return send_postcard();
                    }
                });
            };

            var send_postcard = () => {
                config.contract.user_address_by_creation_block(wallet, tx_bn, function(
                    err,
                    addr_index
                ) {
                    if (err) {
                        logger.error(prelog + "error getting address by tx_bn: " + err);
                        return send_response(res, {
                            ok: false,
                            err: "error getting address from transaction"
                        });
                    }
                    logger.log(prelog + "addr_index: " + JSON.stringify(addr_index));

                    if (!addr_index[0]) {
                        logger.log(prelog + "address not found by creation block number");
                        return send_response(res, {
                            ok: false,
                            err: "address not found by creation block number"
                        });
                    }

                    if (addr_index[2]) {
                        logger.log(prelog + "address already confirmed");
                        return send_response(res, {
                            ok: false,
                            err: "address already confirmed"
                        });
                    }

                    var addr = {};
                    logger.log(prelog + "getting address details from contract");
                    config.contract.user_address(wallet, addr_index[1], function(
                        err,
                        adet1
                    ) {
                        if (err) {
                            logger.error(
                                prelog + "error getting address details from contract: " + err
                            );
                            return send_response(res, {
                                ok: false,
                                err: "error getting address details from contract"
                            });
                        }

                        addr = {
                            country: adet1[0],
                            state: adet1[1],
                            city: adet1[2],
                            location: adet1[3],
                            zip: adet1[4]
                        };
                        logger.log(prelog + "getting more address details from contract");
                        var confirmation_code_plain = info.confirmation_code_plain;
                        config.contract.user_address_info(wallet, addr_index[1], function(
                            err,
                            adet2
                        ) {
                            if (err) {
                                logger.error(
                                    prelog +
                                    "error getting more address details from contract: " +
                                    err
                                );
                                return send_response(res, {
                                    ok: false,
                                    err: "error getting additional address details from contract"
                                });
                            }

                            addr.name = adet2[0];
                            logger.log(prelog + "full address: " + JSON.stringify(addr));
                            logger.log(prelog + "calling create_postcard");
                            post_api.create_postcard(
                                wallet,
                                addr,
                                tx_id,
                                info.confirmation_code_plain,
                                function(err, result) {
                                    if (err) {
                                        logger.error(
                                            prelog + "error returned by create_postcard: " + err
                                        );
                                        return send_response(res, {
                                            ok: false,
                                            err: "error while sending postcard"
                                        });
                                    }
                                    logger.log(prelog + "postcard: " + JSON.stringify(result));
                                    logger.log(
                                        prelog +
                                        "removing used session_key from memory: " +
                                        session_key
                                    );
                                    db.unset(session_key, function(err) {
                                        if (err) {
                                            logger.error(
                                                prelog + "error removing used session_key: " + err
                                            );
                                        }
                                        return send_response(res, {
                                            ok: true,
                                            result: {
                                                mail_type: result.mail_type,
                                                expected_delivery_date: result.expected_delivery_date
                                            }
                                        });
                                    });
                                }
                            );
                        });
                    });
                });
            };

            get_bn_job.started_at = new Date();
            get_tx_bn();
        });
    });

    return router;
};
