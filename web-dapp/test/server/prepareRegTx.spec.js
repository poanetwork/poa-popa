'use strict';
const {wallets, badWallets} = require('./_utils/mocks');
const [wallet] = wallets;
const [badWallet] = badWallets;

jest.mock('../../server-lib/post_api', () => ({
    verify_address: jest.fn(() => (Promise.resolve(true))),
}));
jest.mock('../../server-lib/buildSignature', () => jest.fn(() => ({
    v: 28,
    r: '0xe96cb9bb53cb3652f587161ad5f4edd6aef683210660601444f37860f20f7bb9',
    s: '0x1d2aed920f79979468fb2c069c2fd5f6af54331d0df353bba0c1d847f525905c',
})));
const prepareRegTx = require('../../controllers/prepareRegTx');

describe('Prepare Reg Transaction', () => {
    describe('Validate Data', () => {
        it('should reject if data is empty', () => {
            return expect(prepareRegTx.validateData()).rejects.toBeTruthy();
        });
        it('should reject if wallet is not valid', () => {
            const data = {
                wallet: badWallet,
                name: 'John Doe',
                country: 'us',
                state: 'ca',
                city: 'Los Angeles',
                address: '1219 Diane Street',
                zip: '90013',
            };
            return expect(prepareRegTx.validateData(data)).rejects.toBeTruthy();
        });
        it('should reject if name is not valid', () => {
            const data = {
                wallet,
                name: '',
                country: 'us',
                state: 'ca',
                city: 'Los Angeles',
                address: '1219 Diane Street',
                zip: '90013',
            };
            return expect(prepareRegTx.validateData(data)).rejects.toBeTruthy();
        });
        it('should reject if country is not valid', () => {
            const data = {
                wallet,
                name: 'John Doe',
                country: '',
                state: 'ca',
                city: 'Los Angeles',
                address: '1219 Diane Street',
                zip: '90013',
            };
            return expect(prepareRegTx.validateData(data)).rejects.toBeTruthy();
        });
        it('should reject if state is not valid', () => {
            const data = {
                wallet,
                name: 'John Doe',
                country: 'us',
                state: '',
                city: 'Los Angeles',
                address: '1219 Diane Street',
                zip: '90013',
            };
            return expect(prepareRegTx.validateData(data)).rejects.toBeTruthy();
        });
        it('should reject if city is not valid', () => {
            const data = {
                wallet,
                name: 'John Doe',
                country: 'us',
                state: 'ca',
                city: '',
                address: '1219 Diane Street',
                zip: '90013',
            };
            return expect(prepareRegTx.validateData(data)).rejects.toBeTruthy();
        });
        it('should reject if address is not valid', () => {
            const data = {
                wallet,
                name: 'John Doe',
                country: 'us',
                state: 'ca',
                city: 'Los Angeles',
                address: '',
                zip: '90013',
            };
            return expect(prepareRegTx.validateData(data)).rejects.toBeTruthy();
        });
        it('should reject if zip is not valid', () => {
            const data = {
                wallet,
                name: 'John Doe',
                country: 'us',
                state: 'ca',
                city: 'Los Angeles',
                address: '1219 Diane Street',
                zip: '',
            };
            return expect(prepareRegTx.validateData(data)).rejects.toBeTruthy();
        });
        it('should return wallet and params', () => {
            const data = {
                wallet,
                name: 'John Doe',
                country: 'us',
                state: 'ca',
                city: 'Los Angeles',
                address: '1219 Diane Street',
                zip: '90013',
            };
            return prepareRegTx.validateData(data)
                .then(({wallet, params}) => {
                    expect(wallet).toEqual(data.wallet);
                    expect(params.name).toEqual(data.name.trim().toLowerCase());
                    expect(params.country).toEqual(data.country.trim().toLowerCase());
                    expect(params.state).toEqual(data.state.trim().toLowerCase());
                    expect(params.city).toEqual(data.city.trim().toLowerCase());
                    expect(params.address).toEqual(data.address.trim().toLowerCase());
                    expect(params.zip).toEqual(data.zip.trim().toLowerCase());
                    expect(params).not.toHaveProperty('wallet');
                });
        });
    });

    describe('Sign', () => {
        it('should return the sign output, the price wei and the confirmation code (sha3 and plain)', () => {
            const params = {
                name: 'John Doe',
                country: 'us',
                state: 'ca',
                city: 'Los Angeles',
                address: '1219 Diane Street',
                zip: '90013',
            };

            return expect(prepareRegTx.sign(params, wallet)).resolves.toBeTruthy();
        });
    });

    describe('Set Session Key', () => {
        it('should return the session key', () => {
            const confirmationCodePlain = 'sxxsndac7y7';
            return expect(prepareRegTx.setSessionKey(wallet, confirmationCodePlain)).resolves.toBeTruthy();
        });
    });
});