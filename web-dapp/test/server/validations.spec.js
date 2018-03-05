'use strict';

const {validate, normalize} = require('../../server-lib/validations');

describe('Validate and Normalize', () => {
    describe('Validate', () => {
        it('should validate the string is an string', () => {
            const result = validate.string('str');
            expect(result.ok).toBeTruthy();
        });
        it('should validate the string is not an string', () => {
            const result = validate.string(123);
            expect(result.ok).toBeFalsy();
        });
        it('should validate the string is empty', () => {
            const result = validate.string(' ');
            expect(result.ok).toBeFalsy();
        });
        it('should validate the wallet is a wallet', () => {
            const result = validate.wallet('0x7e7693f12bfd372042b754b729d1474572a2dd01');
            expect(result.ok).toBeTruthy();
        });
        it('should validate the wallet is not a wallet', () => {
            const result = validate.wallet('7e7693f12bfd372042b754b729d1474572a2');
            expect(result.ok).toBeFalsy();
        });
        it('should validate the wallet is empty', () => {
            const result = validate.wallet('');
            expect(result.ok).toBeFalsy();
        });
    });

    describe('Normalize', () => {
        it('should normalize the string', () => {
            const result = normalize.string('ABC');
            expect(result).toEqual('abc');
        });
    });
});

