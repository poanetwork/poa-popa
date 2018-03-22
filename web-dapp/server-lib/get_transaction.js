'use strict';
const config = require('../server-config');

module.exports = (txId) => {
    return new Promise((resolve) => {
        config.web3.eth.getTransaction(txId, (error, txDetails) => {
            return resolve({error, txDetails});
        });
    });
};
