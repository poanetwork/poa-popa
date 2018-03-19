'use strict';
const config = require('../server-config');

module.exports = (tx_id) => {
    return new Promise((resolve) => {
        config.web3.eth.getTransaction(tx_id, (error, txDetails) => {
            return resolve({error, txDetails});
        });
    });
};
