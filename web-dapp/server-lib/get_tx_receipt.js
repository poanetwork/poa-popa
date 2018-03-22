'use strict';
const config = require('../server-config');

module.exports = (txId) => {
    return new Promise((resolve) => {
        config.web3.eth.getTransactionReceipt(txId, (error, txReceipt) => {
            return resolve({error, txReceipt});
        });
    });
};
