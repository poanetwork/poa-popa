'use strict';

const config = require('../server-config');
const crypto = require('crypto');

const max_b = 256-1 - 256%config.codeSymbols.length;
const crbl = Math.ceil( config.codeLength*256/(max_b+1) );

function generate_code() {
    var code = '';
    do {
        let rbytes = crypto.randomBytes(crbl);
        for (let i = 0; i < rbytes.length; i++) {
            let b = rbytes[i];
            if (b > max_b) {
                continue;
            }
            code += config.codeSymbols[b%config.codeSymbols.length];

            if (code.length >= config.codeLength) {
                break;
            }
        }
    } while (code.length < config.codeLength);

    return code;
}

module.exports = generate_code;
