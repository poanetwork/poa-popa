"use strict";

const express = require("express");
const router = express.Router();
const fs = require("fs");
const logger = require("../server-lib/logger");
const req_id = require('../server-lib/req_id');
const log_request = require('../server-lib/log_request');

module.exports = function(app) {
  const files = fs
    .readdirSync(__dirname)
    .filter(f => f !== "index.js" && f[0] !== "_");

  logger.log("Found " + files.length + " route(s): " + JSON.stringify(files));
  for (let f of files) {
    router.use("/", require("./" + f));
  }

  app.use("/api", req_id, log_request, router);
  app.use("/confirm/api", req_id, log_request, router);
};
