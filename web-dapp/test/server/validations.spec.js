'use strict';

const {validate, normalize} = require('../../server-lib/validations');

describe('Validate and Normalize', () => {
    describe('Validate', () => {
        it('should validate the input is an string', () => {
            const result = validate.string('str');
            expect(result.ok).toBeTruthy();
        });
        it('should validate the input is not an string', () => {
            const result = validate.string(123);
            expect(result.ok).toBeFalsy();
        });
        it('should validate the input is a wallet', () => {
            const result = validate.wallet('0x7e7693f12bfd372042b754b729d1474572a2dd01');
            expect(result.ok).toBeTruthy();
        });
        it('should validate the input is not a wallet', () => {
            const result = validate.wallet('7e7693f12bfd372042b754b729d1474572a2');
            expect(result.ok).toBeFalsy();
        });
        it('should validate the input is not empty', () => {
            const result = validate.notEmpty('abc');
            expect(result.ok).toBeTruthy();
        });
        it('should validate the input is empty', () => {
            const result = validate.notEmpty(' ');
            expect(result.ok).toBeFalsy();
        });
    });
});

