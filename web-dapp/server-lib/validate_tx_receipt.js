'use strict';

module.exports = (tx_id, error, txReceipt) => {
    return new Promise((resolve, reject) => {
        if (error) {
            return reject({msg: `error getting receipt of tx: ${tx_id}`});
        }
        if (!txReceipt) {
            return reject({msg: `missing receipt for tx: ${tx_id}`});
        }
        if (txReceipt.status === 1 || txReceipt.status === '1' || txReceipt.status === '0x1' || txReceipt.status === '0x01') {
            return resolve(txReceipt.blockNumber);
        }
        else {
            return reject({msg: `tx was unsuccessfull, receipt status: ${txReceipt.status}`, fatal: true});
        }
    });
};
