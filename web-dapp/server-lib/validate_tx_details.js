

module.exports = (error, txDetails, contractAddress, wallet) => {
    const tx_id = (txDetails && txDetails.hash) || null;
    return new Promise((resolve, reject) => {
        if (error) {
            return reject({msg: `error getting details from blockchain about tx: ${tx_id}`});
        }
        if (!txDetails) {
            return reject({msg: `no details for tx with this hash: ${tx_id}`});
        }
        if (txDetails.to !== contractAddress) {
            return reject({
                msg: `tx_details.to does not match contract address: tx_details.to = ${txDetails.to}, but config.cconf.address = ${contractAddress}`,
                error: 'to-address in transaction does not match contract address',
                fatal: true,
            });
        }
        if (txDetails.from !== wallet) {
            return reject({
                msg: `tx_details.from does not match user wallet: tx_details.from = ${txDetails.from}, but wallet = ${wallet}`,
                error: 'from-address in transaction does not match user wallet',
                fatal: true,
            });
        }
        if (!txDetails.blockNumber) {
            return reject({msg: `check tx_id: ${tx_id}, still not mined (empty tx.blockNumber)`});
        }
        return resolve(txDetails);
    });
};
