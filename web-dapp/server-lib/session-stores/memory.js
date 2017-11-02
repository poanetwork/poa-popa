'use strict';

var db = {};

module.exports = function (params) {
    return {
        set: function (k,v, done) {
            db[k] = v;
            return done();
        },
        get: function (k, done) {
            return done(null, db[k]);;
        },
        unset: function (k, done) {
            delete db[k];
            return done();
        },
    };
};
