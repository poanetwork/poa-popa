'use strict';

const config = require('../server-config');
const alphanum_chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

function rnd_alphanum(str_length) {
    str_length = str_length || 6;
    var str = '';
    for (var i = 0; i < str_length; i++) {
        str += alphanum_chars[Math.floor(Math.random() * alphanum_chars.length)];
    }
    return str;
}

function req_id(req, res, next) {
    req.x_id = rnd_alphanum(config.req_id_length);
    var ip = req.headers && req.headers['x-forwarded-for'];
    if (ip) {
        if ( ip && (ip.indexOf(':') >= 0) && (ip.split(':').length - 1 == 1) ) {
            ip = (ip.split(':'))[0];
        }
        if ( ip && (ip.indexOf(',') >= 0) ) {
            var IPa = ip.split(',');
            if ( IPa[0].startsWith('192.168.') || IPa[0].startsWith('10.') || IPa[0].startsWith('192.0.0.') || IPa[0] === 'unknown' ) {
                ip = IPa[1] ? IPa[1].trim() : IPa[0];
            }
            else {
                ip = IPa[0];
            }
        }
        if (ip) {
            req.x_ip = ip;
        }
    }
    next();
}

module.exports = req_id;
