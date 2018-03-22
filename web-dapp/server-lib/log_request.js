'use strict';

const logger = require('./logger');

module.exports = (req, res, next) => {
    req.logPrfx = `ID=${req.x_id}`;
    if (req.x_ip) req.logPrfx += `|IP=${req.x_ip}`;

    const logPrfx = req.logPrfx;
    const method = req.method;
    const path = req.path;
    const headers = JSON.stringify(req.headers);
    logger.log(`[request] (${logPrfx}) ${method} ${path} by ${headers}`);
    next();
};
