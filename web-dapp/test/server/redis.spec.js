'use strict';

const redis = require('../../server-lib/session-stores/redis')();

describe('Rediss', () => {
    beforeAll(() => {
        return redis.set(0, 3);
    });
    it('should set a value', () => {
        return redis.set(1, 2)
            .then(result => {
                expect(result).toBeTruthy();
                expect(redis.get(1)).resolves.toEqual(2);
            });
    });
    it('should get a value', () => {
        return expect(redis.get(0)).resolves.toEqual(3);
    });
    it('should unset a value', () => {
        return redis.unset(0)
            .then(result => {
                expect(result).toBeTruthy();
                expect(redis.get(0)).resolves.toBeFalsy();
            });
    });
});