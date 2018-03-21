'use strict';
const {wallets, badWallets} = require('./_utils/mocks');
const [wallet] = wallets;
const [badWallet] = badWallets;
jest.mock('../../server-lib/sign', () => jest.fn(() => ({
    v: 28,
    r: '0xe96cb9bb53cb3652f587161ad5f4edd6aef683210660601444f37860f20f7bb9',
    s: '0x1d2aed920f79979468fb2c069c2fd5f6af54331d0df353bba0c1d847f525905c',
})))
const prepareConTx = require('../../controllers/prepareConTx');

describe('Prepare Reg Transaction', () => {
    describe('Validate Data', () => {
        it('should reject if data is empty', () => {
            return expect(prepareConTx.validateData()).rejects.toBeTruthy();
        });
        it('should reject if wallet is not valid', () => {
            const data = {
                wallet: badWallet,
                confirmationCodePlain: 'sxxsndac7y7'
            };
            return expect(prepareConTx.validateData(data)).rejects.toBeTruthy();
        });
        it('should reject if name is not valid', () => {
            const data = {
                wallet,
                confirmationCodePlain: 1234,
            };
            return expect(prepareConTx.validateData(data)).rejects.toBeTruthy();
        });
        it('should return wallet and params', () => {
            const data = {
                wallet,
                confirmationCodePlain: 'sxxsndac7y7'
            };

            return prepareConTx.validateData(data)
                .then(({wallet, params}) => {
                    expect(wallet).toEqual(data.wallet);
                    expect(params.confirmationCodePlain).toEqual(data.confirmationCodePlain.trim().toLowerCase());
                    expect(params).not.toHaveProperty('wallet');
                });
        });
    });

    describe('Hex params', () => {
        it('should return an object with hex values', () => {
            const params = {
                confirmationCodePlain: 'sxxsndac7y7'
            };
            const hexParams = prepareConTx.hexParams(params);
            const expected = Buffer.from(params.confirmationCodePlain, 'utf8');
            expect(hexParams.confirmationCodePlain).toEqual(expected);
        });
    });

    describe('Text to sign', () => {
        it('should return the text to sign', () => {
            const hexParams = prepareConTx.hexParams({confirmationCodePlain: 'sxxsndac7y7'});
            const ccp = Buffer.from(hexParams.confirmationCodePlain, 'utf8');
            const expected = wallet + Buffer.concat([ccp]).toString('hex');
            const text2sign = prepareConTx.text2sign(wallet, hexParams);
            expect(text2sign).toEqual(expected);
        });
    });

    describe('Sign', () => {
        it('should return the signout', () => {
            const hexParams = prepareConTx.hexParams({confirmationCodePlain: 'sxxsndac7y7'});
            const text2sign = prepareConTx.text2sign(wallet, hexParams);
            return expect(prepareConTx.getSign(text2sign)).resolves.toBeTruthy();
        });
    });
});
