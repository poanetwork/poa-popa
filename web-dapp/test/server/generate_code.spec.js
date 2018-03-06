'use strict';

const generate_code = require('../../server-lib/generate_code');
const config = require('../../server-config');

const TRIES = 1e4;

describe('Confirmation code', () => {
    it('cc length should be equal to the one in config', () => {
        var pass = true;

        for (let i = 0; i < TRIES; i++) {
            let code = generate_code();
            if (code.length !== config.code_length) {
                pass = false;
                break;
            }
        }

        return expect(pass).toEqual(true);
    });
});
