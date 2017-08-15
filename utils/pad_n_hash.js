'use strict';
// Padds input code_str with \u0000 on the right
// then computes web3.sha3
// and then converts result to BigNumber

module.exports = function (web3) {
    return function (code_str) {
        var byte_length = Buffer.byteLength(code_str);
        var padded_buf = new Buffer(32).fill(code_str, 0, byte_length).fill(0, byte_length);
        var code_sha3 = web3.sha3(padded_buf.toString());
        var code_bn = new web3.BigNumber(code_sha3, 16);

        return code_bn;
    };
};
