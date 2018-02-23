module.exports = {
    log: (msg) => {
        let logDate = new Date().toISOString();
        console.log(logDate, msg);
    },
    error: (msg) => {
        let logDate = new Date().toISOString();
        console.error(logDate, msg);
    },
};
