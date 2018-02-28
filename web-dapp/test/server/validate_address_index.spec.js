'use strict';

const validateAddressIndex = require('../../server-lib/validate_address_index');

describe('Validate address index', () => {
    it('should reject if there is some error', () => {
        expect(validateAddressIndex({error: 'Error!'}, null)).rejects.toBeTruthy();
    });
    it('should reject if addressIndex[0] is false', () => {
        expect(validateAddressIndex(null, [false, 10, false])).rejects.toBeTruthy();
    });
    it('should reject if addressIndex[2] is true', () => {
        expect(validateAddressIndex(null, [true, 10, true])).rejects.toBeTruthy();
    });
    it('should resolve if addressIndex[0] is true, exists addressIndex[1] and addressIndex[2] is false', () => {
        expect(validateAddressIndex(null, [true, 10, false])).resolves.toBeTruthy();
    });
});