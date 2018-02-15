module.exports = {
    log: (msg) => {
        let logDate = new Date().toISOString();
        logger.log(logDate, msg);
    },
    error: (msg) => {
        let logDate = new Date().toISOString();
        logger.error(logDate, msg);
    },
};
