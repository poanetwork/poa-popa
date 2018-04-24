'use strict';
const path = require('path');
jasmine.DEFAULT_TIMEOUT_INTERVAL = 0;

const {
    wallets,
    badWallets,
    sessionKeys,
    badSessionKeys,
    txIds,
    badTxIds} = require(path.join(__dirname, './_utils/mocks'));
const [walletA, walletB, walletC] = wallets;
const [badWallet] = badWallets;
const [sessionKey] = sessionKeys;
const [badSessionKey] = badSessionKeys;
const [txIdA, , , , , , txIdG] = txIds;
const [badTxId] = badTxIds;

const {
    mockDb,
    mockGetTransaction,
    mockGetTxReceipt,
    mockGetAddressIndex,
    mockGetAddressDetails } = require('./_utils/mocks');

jest.mock('../../server-lib/session_store', () => ({
    get: jest.fn(mockDb.get),
}));
jest.mock('../../server-lib/get_transaction', () => jest.fn(mockGetTransaction));
jest.mock('../../server-lib/get_tx_receipt', () => jest.fn(mockGetTxReceipt));
jest.mock('../../server-lib/get_address_index', () => jest.fn(mockGetAddressIndex));
jest.mock('../../server-lib/get_address_details', () => jest.fn(mockGetAddressDetails));

const notifyRegTx = require('../../controllers/notifyRegTx');

describe('Notify Register Transactions', () => {
    describe('Validate Data', () => {
        it('Should validate body does not exists', () => {
            const opts = {};
            const result = notifyRegTx.validateData(opts);
            expect(result.ok).toBeFalsy();
        });
        it('should returns an error if the wallet is not valid', () => {
            const opts = {
                body: {
                    wallet: badWallet,
                    txId: txIdA,
                    sessionKey,
                },
            };
            const result = notifyRegTx.validateData(opts);
            expect(result.ok).toBeFalsy();
        });
        it('should returns an error if the txId is not valid', () => {
            const opts = {
                body: {
                    wallet: walletA,
                    txId: badTxId,
                    sessionKey,
                },
            };
            const result = notifyRegTx.validateData(opts);
            expect(result.ok).toBeFalsy();
        });
        it('should returns an error if the sessionKey is not valid', () => {
            const opts = {
                body: {
                    wallet: walletA,
                    txId: txIdA,
                    sessionKey: badSessionKey,
                },
            };
            const result = notifyRegTx.validateData(opts);
            expect(result.ok).toBeFalsy();
        });
        it('should return true if the opts param is right', () => {
            const opts = {
                body: {
                    wallet: walletA,
                    txId: txIdA,
                    sessionKey,
                },
            };
            const result = notifyRegTx.validateData(opts);
            expect(result.ok).toBeTruthy();
        });
    });

    describe('Normalize Data', () => {
        it('should normalize all the input data', () => {
            const body = {
                wallet: walletA,
                txId: txIdA,
                sessionKey,
            };
            const result = notifyRegTx.normalizeData(body);

            expect(result.wallet).toEqual(body.wallet);
            expect(result.txId).toEqual(body.txId.trim().toLowerCase());
            expect(result.sessionKey).toEqual(body.sessionKey.trim().toLowerCase());
        });
    });

    describe('Get Info', () => {
        it('should return info for the sessionKey', () => {
            const opts = {sessionKey, wallet: walletA};
            return expect(notifyRegTx.getTxInfo(opts)).resolves.toBeTruthy();
        });
        it('should return an error there is not info for the sessionKey', () => {
            const opts = {sessionKey: badSessionKey, wallet: walletA};
            return expect(notifyRegTx.getTxInfo(opts)).rejects.toBeTruthy();
        });
        it('should return an error if the wallet does not match', () => {
            const opts = {sessionKey, wallet: walletB};
            return expect(notifyRegTx.getTxInfo(opts)).rejects.toBeTruthy();
        });
    });

    describe('Get Transaction Blocknumber', () => {
        it('should return the blocknumber', () => {
            const opts = {
                wallet: walletA,
                txId: txIdA,
                contractAddress: walletB,
                waitMaxTime: 10000,
                waitInterval: 3000,
                startedAt: new Date(),
            };
            return expect(notifyRegTx.getTxBlockNumber(opts)).resolves.toBeTruthy();
        });
        it('should return fatal error if txDetails.to does not match with contract address', () => {
            const opts = {
                wallet: walletA,
                txId: txIdA,
                contractAddress: walletC,
                waitMaxTime: 10000,
                waitInterval: 3000,
                startedAt: new Date(),
            };
            return expect(notifyRegTx.getTxBlockNumber(opts)).rejects.toBeTruthy();
        });
        it('should return fatal error if txDetails.from does not match with wallet', () => {
            const opts = {
                wallet: walletC,
                txId: txIdA,
                contractAddress: walletB,
                waitMaxTime: 10000,
                waitInterval: 3000,
                startedAt: new Date(),
            };
            return expect(notifyRegTx.getTxBlockNumber(opts)).rejects.toBeTruthy();
        });
        it('should return fatal error if txReceipt.status is 0', () => {
            const opts = {
                wallet: walletA,
                txId: txIdG,
                contractAddress: walletB,
                waitMaxTime: 10000,
                waitInterval: 3000,
                startedAt: new Date(),
            };
            return expect(notifyRegTx.getTxBlockNumber(opts)).rejects.toBeTruthy();
        });
        it('should return fatal error if txReceipt.status is 0', () => {
            const opts = {
                wallet: walletA,
                txId: txIdG,
                contractAddress: walletB,
                waitMaxTime: 10000,
                waitInterval: 3000,
            };
            return expect(notifyRegTx.getTxBlockNumber(opts)).rejects.toBeTruthy();
        });
    });

    describe('Get user address by BlockNumber', () => {
        it('should get a full user address details', () => {
            const opts = {
                txBn: 10,
                wallet: walletA,
            };
            return expect(notifyRegTx.getAddressByBN(opts)).resolves.toBeTruthy();
        });
    });
});
