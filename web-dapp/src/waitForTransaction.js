export default function waitForTransaction(web3, txId) {
    let transactionReceiptAsync;
    transactionReceiptAsync = function(txId, resolve, reject) {
        web3.eth.getTransactionReceipt(txId, (err, receipt) => {
            if (err) {
                reject(err)
            } else if (receipt == null) {
                setTimeout(function () {
                    transactionReceiptAsync(txId, resolve, reject);
                }, 500);
            } else {
                resolve(receipt);
            }
        });
    };

    return new Promise(function (resolve, reject) {
        transactionReceiptAsync(txId, resolve, reject);
    });
}
