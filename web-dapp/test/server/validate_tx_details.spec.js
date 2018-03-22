'use strict';
const [walletA, walletB, walletC] = require('./_utils/mocks').wallets;
const [txId] = require('./_utils/mocks').txIds;
const validateTxDetails = require('../../server-lib/validate_tx_details');

describe('Validate transaction details', () => {
    it('should reject if there is some error', () => {
        const error = {error: 'Error!'};
        const txDetails = null;
        const contractAddress = null;
        const wallet = null;
        return expect(validateTxDetails(error, txDetails, contractAddress, wallet)).rejects.toBeTruthy();
    });
    it('should reject if txDetails does not exist', () => {
        const error = null;
        const txDetails = null;
        const contractAddress = null;
        const wallet = null;
        return expect(validateTxDetails(error, txDetails, contractAddress, wallet)).rejects.toBeTruthy();
    });
    it('should reject txDetails.to is different to contractAddress', () => {
        const error = null;
        const txDetails = {
            hash: txId,
            to: walletA,
            from: walletC,
            blockNumber: 10,
        };
        const contractAddress = walletB;
        const wallet = walletC;
        return expect(validateTxDetails(error, txDetails, contractAddress, wallet)).rejects.toBeTruthy();
    });
    it('should reject if txDetails.from is different to wallet', () => {
        const error = null;
        const txDetails = {
            hash: txId,
            to: walletB,
            from: walletC,
            blockNumber: 10,
        };
        const contractAddress = walletB;
        const wallet = walletA;
        return expect(validateTxDetails(error, txDetails, contractAddress, wallet)).rejects.toBeTruthy();
    });
    it('should reject if txDetails.blocknumber does not exist', () => {
        const error = null;
        const txDetails = {
            hash: txId,
            to: walletB,
            from: walletA,
            blockNumber: null,
        };
        const contractAddress = walletB;
        const wallet = walletA;
        return expect(validateTxDetails(error, txDetails, contractAddress, wallet)).rejects.toBeTruthy();
    });
    it('should resolves transaction details', () => {
        const error = null;
        const txDetails = {
            hash: txId,
            to: walletB,
            from: walletA,
            blockNumber: 10,
        };
        const contractAddress = walletB;
        const wallet = walletA;
        return expect(validateTxDetails(error, txDetails, contractAddress, wallet)).resolves.toBeTruthy();
    });
});