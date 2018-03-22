'use strict';
const [txId] = require('./_utils/mocks').txIds;
const getTransaction = require('../../server-lib/get_transaction');

describe('Get Address Index', () => {
    it('should return the user address index', () => {
        return expect(getTransaction(txId)).resolves.toBeTruthy();
    });
});
