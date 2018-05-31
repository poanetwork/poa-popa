'use strict';

const memory = require('../../server-lib/session-stores/memory')();

describe('Memory',  () => {
    beforeEach(() => {
        return memory.set(0, 3);
    });
    it('should set a value', () => {
        return memory.set(1, 2)
            .then(result => {
                expect(result).toBeTruthy();
                expect(memory.get(1)).resolves.toEqual(2);
            });
    });
    it('should get a value', () => {
        return expect(memory.get(0)).resolves.toEqual(3);
    });
    it('should unset a value', () => {
        return memory.getAndLock(0)
            .then(result => {
                expect(result).toEqual(3);

                return memory.unset(0)
                    .then(result => {
                        expect(result).toBeTruthy();
                        return expect(memory.get('locked:0')).resolves.toBeFalsy();
                    });
            });
    });
});