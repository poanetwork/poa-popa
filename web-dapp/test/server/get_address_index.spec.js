'use strict';
const {wallets, mockUserAddressByCreationBlock} = require('./_utils/mocks');
const [wallet] = wallets;
jest.mock('../../server-config', () => ({contract: {user_address_by_creation_block: jest.fn(mockUserAddressByCreationBlock)}}));
const getAddressIndex = require('../../server-lib/get_address_index');

describe('Get Address Index', () => {
    it('should return the user address index', () => {
        const opts = {
            wallet,
            tx_bn: 10,
        };
        expect(getAddressIndex(opts)).resolves.toBeTruthy();
    });
});
