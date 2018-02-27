'use strict';
const {txIds, mockWeb3GetTx} = require('./_utils/mocks');
const [tx_id] = txIds;
jest.mock('../../server-config', () => ({web3: {eth: {getTransaction: jest.fn(mockWeb3GetTx)}}}));
const getTransaction = require('../../server-lib/get_transaction');

describe('Get Address Index', () => {
    it('should return the user address index', () => {
        expect(getTransaction(tx_id)).resolves.toBeTruthy();
    });
});
