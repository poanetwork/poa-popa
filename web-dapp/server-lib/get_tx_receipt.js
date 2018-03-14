
const config = require('../server-config');

module.exports = (tx_id) => {
    return new Promise((resolve) => {
        config.web3.eth.getTransactionReceipt(tx_id, (error, txReceipt) => {
            return resolve({error, txReceipt});
        });
    });
};
