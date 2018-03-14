
const config = require('../server-config');

module.exports = (opts) => {
    const {wallet, tx_bn} = opts;
    return new Promise((resolve) => {
        config.contract.user_address_by_creation_block(wallet, tx_bn, function (err, addressIndex) {
            return resolve({err, addressIndex});
        });
    });
};