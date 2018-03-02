'use strict';
const [wallet] = require('./_utils/mocks').wallets;
const getAddressIndex = require('../../server-lib/get_address_index');

describe('Get Address Index', () => {
    it('should return the user address index', () => {
        const opts = {
            wallet,
            tx_bn: 10,
        };
        return expect(getAddressIndex(opts)).resolves.toBeTruthy();
    });
});
