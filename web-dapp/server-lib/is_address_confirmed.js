'use strict';
const config = require('../server-config');

module.exports = ({wallet, addressIndex}) => {
    return new Promise((resolve, reject) => {
        config.contract.userAddressConfirmed(wallet, addressIndex, (err, isConfirmed) => {
            if (err) {
                return reject(new Error('error getting address confirmation status from contract'));
            }
            else {
                return resolve(isConfirmed);
            }
        });
    });
};
