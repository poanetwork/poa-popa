'use strict';
const config = require('../server-config');
const crypto = require('crypto');

const max_b = 256-1 - 256%config.code_symbols.length;
const crbl = Math.ceil( config.code_length*256/(max_b+1) );

function generate_code() {
    var code = '';
    do {
        let rbytes = crypto.randomBytes(crbl);
        for (let i = 0; i < rbytes.length; i++) {
            let b = rbytes[i];
            if (b > max_b) {
                continue;
            }
            code += config.code_symbols[b%config.code_symbols.length];
        }
    } while (code.length < config.code_length);

    return code;
}

module.exports = generate_code;
