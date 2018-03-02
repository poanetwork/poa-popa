'use strict';
const [wallet] = require('./_utils/mocks').wallets;
const getAddressDetails = require('../../server-lib/get_address_details');

describe('Get Address Details', () => {
    it('should return the user address details', () => {
        const addressIndex = [true, 10, false];
        return expect(getAddressDetails(addressIndex, wallet)).resolves.toBeTruthy();
    });
});
