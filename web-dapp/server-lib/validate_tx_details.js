'use strict';

module.exports = (error, txDetails, contractAddress, wallet) => {
    const txId = (txDetails && txDetails.hash) || null;
    return new Promise((resolve, reject) => {
        if (error) {
            return reject({msg: `error getting details from blockchain about tx: ${txId}`});
        }
        if (!txDetails) {
            return reject({msg: `no details for tx with this hash: ${txId}`});
        }
        if (txDetails.to.toLowerCase() !== contractAddress.toLowerCase()) {
            return reject({
                msg: `tx_details.to does not match contract address: tx_details.to = ${txDetails.to}, but config.cconf.address = ${contractAddress}`,
                error: 'to-address in transaction does not match contract address',
                fatal: true,
            });
        }
        if (txDetails.from !== wallet) {
            return reject({
                msg: `tx_details.from does not match user wallet: tx_details.from = ${txDetails.from}, but wallet = ${wallet}`,
                error: 'from-address in transacton does not match user wallet',
                fatal: true,
            });
        }
        if (!txDetails.blockNumber) {
            return reject({msg: `check txId: ${txId}, still not mined (empty tx.blockNumber)`});
        }
        return resolve(txDetails);
    });
};
