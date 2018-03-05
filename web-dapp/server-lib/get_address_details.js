'use strict';
const config = require('../server-config');
const {createResponseObject} = require('./utils');

module.exports = (address_index, wallet) => {
    const addressDetails1Pr = new Promise((resolve, reject) => {
        config.contract.user_address(wallet, address_index[1], function (err, details) {
            if (err) return reject(createResponseObject(false, 'error getting address details from contract'));
            const address_details = {
                country: details[0],
                state: details[1],
                city: details[2],
                location: details[3],
                zip: details[4],
            };
            return resolve(address_details);
        })
    });
    const addressDetails2Pr = new Promise((resolve, reject) => {
        config.contract.user_address_info(wallet, address_index[1], function (err, details) {
            if (err) return reject(createResponseObject(false, 'error getting address details from contract'));
            const address_details = {
                name: details[0],
            };
            return resolve(address_details);
        });
    });

    return Promise.all([addressDetails1Pr, addressDetails2Pr])
        .then(([firstAddressDetails, secondAddressDetails]) => {
            return {...firstAddressDetails, ...secondAddressDetails};
        });
};
