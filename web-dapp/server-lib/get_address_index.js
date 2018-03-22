'use strict';
const config = require('../server-config');

module.exports = (opts) => {
    const {wallet, txBn} = opts;
    return new Promise((resolve) => {
        config.contract.userAddressByCreationBlock(wallet, txBn, function (err, addressIndex) {
            return resolve({err, addressIndex});
        });
    });
};
