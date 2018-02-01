'use strict';

const logger = require('./logger');

module.exports = (req, res, next) => {
    req.log_prfx = `ID=${req.x_id}`;
    if (req.x_ip) req.log_prfx += `|IP=${req.x_ip}`;

    const logPrfx = req.log_prfx;
    const method = req.method;
    const path = req.path;
    const headers = JSON.stringify(req.headers);
    logger.log(`[request] (${logPrfx}) ${method} ${path} by ${headers}`);
    next();
};
