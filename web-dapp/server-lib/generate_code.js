'use strict';
const config = require('../server-config');
const crypto = require('crypto');

function generate_code() {
    var clen = config.code_length;
    var slen = config.code_symbols.length;
    return crypto.randomBytes(clen).reduce((p,c) => p + config.code_symbols[c%slen], '');
}

module.exports = generate_code;
