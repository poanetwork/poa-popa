'use strict';
const [tx_id] = require('./_utils/mocks').txIds;
const getTransaction = require('../../server-lib/get_transaction');

describe('Get Address Index', () => {
    it('should return the user address index', () => {
        expect(getTransaction(tx_id)).resolves.toBeTruthy();
    });
});
