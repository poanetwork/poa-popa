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
                confirmation_code_plain: 'sxxsndac7y7'
            };
            return expect(prepareConTx.validateData(data)).rejects.toBeTruthy();
        });
        it('should reject if name is not valid', () => {
            const data = {
                wallet,
                confirmation_code_plain: 1234,
            };
            return expect(prepareConTx.validateData(data)).rejects.toBeTruthy();
        });
        it('should return wallet and params', () => {
            const data = {
                wallet,
                confirmation_code_plain: 'sxxsndac7y7'
            };

            return prepareConTx.validateData(data)
                .then(({wallet, params}) => {
                    expect(wallet).toEqual(data.wallet);
                    expect(params.confirmation_code_plain).toEqual(data.confirmation_code_plain.trim().toLowerCase());
                    expect(params).not.toHaveProperty('wallet');
                });
        });
    });

    describe('Hex params', () => {
        it('should return an object with hex values', () => {
            const params = {
                confirmation_code_plain: 'sxxsndac7y7'
            };
            const hexParams = prepareConTx.hexParams(params);
            const expected = Buffer.from(params.confirmation_code_plain, 'utf8');
            expect(hexParams.confirmation_code_plain).toEqual(expected);
        });
    });

    describe('Text to sign', () => {
        it('should return the text to sign', () => {
            const hexParams = prepareConTx.hexParams({confirmation_code_plain: 'sxxsndac7y7'});
            const ccp = Buffer.from(hexParams.confirmation_code_plain, 'utf8');
            const expected = wallet + Buffer.concat([ccp]).toString('hex');
            const text2sign = prepareConTx.text2sign(wallet, hexParams);
            expect(text2sign).toEqual(expected);
        });
    });

    describe('Sign', () => {
        it('should return the signout', () => {
            const hexParams = prepareConTx.hexParams({confirmation_code_plain: 'sxxsndac7y7'});
            const text2sign = prepareConTx.text2sign(wallet, hexParams);
            return expect(prepareConTx.getSign(text2sign)).resolves.toBeTruthy();
        });
    });
});
