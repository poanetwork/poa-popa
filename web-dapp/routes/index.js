

const express = require('express');
const fs = require('fs');
const logger = require('../server-lib/logger');
const req_id = require('../server-lib/req_id');
const log_request = require('../server-lib/log_request');

module.exports = (opts) => {
    const router = express.Router();
    const files = fs
        .readdirSync(__dirname)
        .filter(f => f !== 'index.js' && f[0] !== '_' && f[0] !== '.');

    logger.log('Found ' + files.length + ' route(s): ' + JSON.stringify(files));
    for (let f of files) {
        router.use('/', req_id, log_request, require('./' + f)(opts));
    }

    return router;
};
