'use strict';
const [wallet] = require('./_utils/mocks').wallets;
const mockUserAddress = ['us', 'ca', 'los angeles', 'Dennis Drive', '90017'];
const mockUserAddressInfo = ['john doe'];
jest.mock('../../server-config', () => ({
    contract: {
        user_address: jest.fn((a, b, cb) => cb(null,mockUserAddress)),
        user_address_info: jest.fn((a, b, cb) => cb(null, mockUserAddressInfo)),
    },
}));
const getAddressDetails = require('../../server-lib/get_address_details');

describe('Get Address Details', () => {
    it('should return the user address details', () => {
        const addressIndex = [true, 10, false];
        return expect(getAddressDetails(addressIndex, wallet)).resolves.toBeTruthy();
    });
});
