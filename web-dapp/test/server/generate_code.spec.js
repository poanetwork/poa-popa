'use strict';

const generate_code = require('../../server-lib/generate_code');
const config = require('../../server-config');

const TRIES = 1e4;

const EXPECTED_FREQ = 1.0/config.code_symbols.length;
const MAX_DIFF = EXPECTED_FREQ*5e-2;

function safe_inc(obj, key, val = 1) {
    if (!obj[key]) {
        obj[key] = 0;
    }
    obj[key] += val;
}

function a_in_b(a,b) {
    for (let j = 0; j < a.length; j++) {
        if (b.indexOf(a[j]) < 0) return false;
    }
    return true;
}

describe('Confirmation code', () => {
    it('cc length should be equal to the one in config', () => {
        let pass = true;

        for (let i = 0; i < TRIES; i++) {
            let code = generate_code();
            if (code.length !== config.code_length) {
                pass = false;
                break;
            }
        }

        return expect(pass).toEqual(true);
    });

    it('cc symbols should be roughly equiprobable', () => {
        let symbs_stat = {};
        for (let i = 0; i < TRIES; i++) {
            let code = generate_code();
            for (let j = 0; j < code.length; j++) {
                safe_inc(symbs_stat, code[j]);
            }
        }

        // 1. check that all symbols are present
        let symbs = Object.keys(symbs_stat);
        expect(symbs.length === config.code_symbols.length);
        expect(a_in_b(symbs, config.code_symbols)).toEqual(true);
        expect(a_in_b(config.code_symbols, symbs)).toEqual(true);

        // 2. check frequencies
        let freqs_stat = {};
        for (let i = 0; i < symbs.length; i++) {
            freqs_stat[symbs[i]] = symbs_stat[symbs[i]]/(TRIES*config.code_length);
        }

        let freqs = Object.keys(freqs_stat);

        let max_diff = 0;
        for (let i = 0; i < freqs.length; i++) {
            let diff = Math.abs( freqs_stat[freqs[i]] - EXPECTED_FREQ );
            if (diff > max_diff) {
                max_diff = diff;
            }
        }

        expect(max_diff < MAX_DIFF).toEqual(true);
    });
});
