'use strict';
const path = require('path');
jasmine.DEFAULT_TIMEOUT_INTERVAL = 0;

const {
    wallets,
    badWallets,
    confirmationCodes,
    sessionKeys,
    badSessionKeys,
    txIds,
    badTxIds} = require(path.join(__dirname, './_utils/mocks'));
const [walletA, walletB, walletC] = wallets;
const [badWallet] = badWallets;
const [confCodePlain] = confirmationCodes;
const [sessionKey] = sessionKeys;
const [badSessionKey] = badSessionKeys;
const [txIdA, txIdB, txIdC, txIdD, txIdE, txIdF] = txIds;
const [badTxId] = badTxIds;

const info = {
    wallet: walletA,
    confirmation_code_plain: confCodePlain,
};

const {
    mockDb,
    mockGetTransaction,
    mockGetAddressIndex,
    mockGetAddressDetails } = require('./_utils/mocks');

jest.mock('../../server-lib/session_store', () => ({
    get: jest.fn(mockDb.get)
}));
jest.mock('../../server-lib/get_transaction', () => jest.fn(mockGetTransaction));
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
                    tx_id: txIdA,
                    session_key: sessionKey,
                },
            };
            const result = notifyRegTx.validateData(opts);
            expect(result.ok).toBeFalsy();
        });
        it('should returns an error if the tx_id is not valid', () => {
            const opts = {
                body: {
                    wallet: walletA,
                    tx_id: badTxId,
                    session_key: sessionKey,
                },
            };
            const result = notifyRegTx.validateData(opts);
            expect(result.ok).toBeFalsy();
        });
        it('should returns an error if the session_key is not valid', () => {
            const opts = {
                body: {
                    wallet: walletA,
                    tx_id: txIdA,
                    session_key: badSessionKey,
                },
            };
            const result = notifyRegTx.validateData(opts);
            expect(result.ok).toBeFalsy();
        });
        it('should return true if the opts param is right', () => {
            const opts = {
                body: {
                    wallet: walletA,
                    tx_id: txIdA,
                    session_key: sessionKey,
                }
            };
            const result = notifyRegTx.validateData(opts);
            expect(result.ok).toBeTruthy();
        });
    });

    describe('Normalize Data', () => {
        it('should normalize all the input data', () => {
            const body = {
                wallet: walletA,
                tx_id: txIdA,
                session_key: sessionKey,
            };
            const result = notifyRegTx.normalizeData(body);

            expect(result.wallet).toEqual(body.wallet);
            expect(result.tx_id).toEqual(body.tx_id.trim().toLowerCase());
            expect(result.session_key).toEqual(body.session_key.trim().toLowerCase());
        });
    });

    describe('Get Info', () => {
        it('should return info for the session_key', () => {
            const opts = {session_key: sessionKey, wallet: walletA};
            expect(notifyRegTx.getTxInfo(opts)).resolves.toBeTruthy()
        });
        it('should return an error there is not info for the session_key', () => {
            const opts = {session_key: badSessionKey, wallet: walletA};
            expect(notifyRegTx.getTxInfo(opts)).rejects.toBeTruthy();
        });
        it('should return an error if the wallet does not match', () => {
            const opts = {session_key: sessionKey, wallet: walletB};
            expect(notifyRegTx.getTxInfo(opts)).rejects.toBeTruthy();
        });
    });

    describe('Get Transaction Blocknumber', () => {
        it('should return the blocknumber', () => {
            const opts = {
                wallet: walletA,
                tx_id: txIdA,
                contractAddress: walletB,
                waitMaxTime: 10000,
                waitInterval: 3000,
            };
            expect(notifyRegTx.getTxBlockNumber(opts)).resolves.toBeTruthy();
        });
        it('should return fatal error if txDetails.to does not match with contract address', () => {
            const opts = {
                wallet: walletA,
                tx_id: txIdA,
                contractAddress: walletC,
                waitMaxTime: 10000,
                waitInterval: 3000,
            };
            expect(notifyRegTx.getTxBlockNumber(opts)).rejects.toBeTruthy();
        });
        it('should return fatal error if txDetails.from does not match with wallet', () => {
            const opts = {
                wallet: walletC,
                tx_id: txIdA,
                contractAddress: walletB,
                waitMaxTime: 10000,
                waitInterval: 3000,
            };
            expect(notifyRegTx.getTxBlockNumber(opts)).rejects.toBeTruthy();
        });
    });

    describe('Get user address by BlockNumber', () => {
        it('should get a full user address details', () => {
            const opts = {
                tx_bn: 10,
                wallet: walletA,
            };
            expect(notifyRegTx.getAddressByBN(opts)).resolves.toBeTruthy();
        });
    });
});
