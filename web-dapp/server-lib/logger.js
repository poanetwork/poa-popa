'use strict';
const winston = require('winston');

const transports = [];

if (process.env.NODE_ENV !== 'test') {
    // Console transport
    const consoleTransport = new winston.transports.Console({
        level: process.env.LOG_LEVEL || 'debug',
        handleExceptions: true,
        humanReadableUnhandledException: true,
    });
    transports.push(consoleTransport);
}

const logger = new winston.Logger({
    transports: transports,
});

module.exports = {
    log: (msg) => {
        let logDate = new Date().toISOString();
        logger.info(logDate, msg);
    },
    error: (msg) => {
        let logDate = new Date().toISOString();
        logger.info(logDate, msg);
        logger.error(logDate, msg);
    },
};
