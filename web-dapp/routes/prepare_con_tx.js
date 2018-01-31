"use strict";

const logger = require("../server-lib/logger");
const express = require("express");
const config = require("../server-config");
const sign = require("../server-lib/sign");
const generate_code = require("../server-lib/generate_code");
const validate = require("../server-lib/validations").validate;
const normalize = require("../server-lib/validations").normalize;
const send_response = require("../server-lib/send_response");

var router = express.Router();
router.post("/prepareConTx", function(req, res) {
  var prelog = "[prepareConTx] (" + req.log_prfx + ") ";
  if (!req.body) {
    logger.log(prelog + "request body empty");
    return send_response(res, { ok: false, err: "request body: empty" });
  }

  var params = {};
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

  // confirmation_code_plain
  verr = validate.string(req.body.confirmation_code_plain);
  if (verr) {
    logger.log(
      prelog +
        "validation error on confirmation_code_plain: " +
        confirmation_code_plain +
        ", err: " +
        verr
    );
    return send_response(res, {
      ok: false,
      err: "confirmation_code_plain: " + verr
    });
  }
  params.confirmation_code_plain = normalize.string(
    req.body.confirmation_code_plain
  );

  // combine parameters and sign them
  var hex_params = {};
  Object.keys(params).forEach(p => {
    hex_params[p] = Buffer.from(params[p], "utf8");
  });
  logger.log(prelog + "combining into text2sign hex string:");
  logger.log(prelog + "wallet:                           " + wallet);
  logger.log(
    prelog +
      "hex confirmation_code_plain:      0x" +
      hex_params.confirmation_code_plain.toString("hex")
  );
  var text2sign =
    wallet +
    Buffer.concat([hex_params.confirmation_code_plain]).toString("hex");
  logger.log(prelog + "=> text2sign: " + text2sign);

  try {
    var sign_output = sign(text2sign);
    logger.log(prelog + "sign() output: " + JSON.stringify(sign_output));
    return send_response(res, {
      ok: true,
      result: {
        wallet: wallet,
        params: params,
        v: sign_output.v,
        r: sign_output.r,
        s: sign_output.s
      }
    });
  } catch (e) {
    logger.error(prelog + "exception in sign(): " + e.stack);
    return send_response(res, {
      ok: false,
      err: "exception occured during signature calculation"
    });
  }
});

module.exports = router;
