'use strict';

module.exports = (txId, error, txReceipt) => {
    return new Promise((resolve, reject) => {
        if (error) {
            return reject({msg: `error getting receipt of tx: ${txId}`});
        }
        if (!txReceipt) {
            return reject({msg: `missing receipt for tx: ${txId}`});
        }
        if (txReceipt.status === 1 || txReceipt.status === '1' || txReceipt.status === '0x1' || txReceipt.status === '0x01') {
            return resolve(txReceipt.blockNumber);
        }
        else {
            return reject({msg: `tx was unsuccessfull, receipt status: ${txReceipt.status}`, fatal: true});
        }
    });
};
