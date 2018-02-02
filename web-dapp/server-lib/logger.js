'use strict';

module.exports = {
    log: (msg) => {
        let logDate = new Date().toISOString();
        // eslint-disable-next-line no-console
        console.log(logDate, msg);
    },
    error: (msg) => {
        let logDate = new Date().toISOString();
        // eslint-disable-next-line no-console
        console.error(logDate, msg);
    },
};
