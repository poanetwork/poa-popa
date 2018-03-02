'use strict';
const {wallets, badWallets} = require('./_utils/mocks');
const [wallet] = wallets;
const [badWallet] = badWallets;
const prepareRegTx = require('../../controllers/prepareRegTx');

describe('Prepare Reg Transaction', () => {
    describe('Validate Data', () => {
        it('should reject if data is empty', () => {
            return expect(prepareRegTx.validateData()).rejects.toBeTruthy();
        });
        it('should reject if wallet is not valid', () => {
            const data = {
                wallet: badWallet + 'qweqw',
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