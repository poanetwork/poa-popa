'use strict';

var db = {};

module.exports = function () {
    return {
        set: function (k,v, done) {
            db[k] = v;
            setTimeout((k,v) => {
                db[k] = v;
                done();
            }, 1);
        },
        get: function (k, done) {
            setTimeout((k) => {
                done(null, db[k])
            }, 1);
        },
        unset: function (k, done) {
            setTimeout((k) => {
                delete db[k];
                done()
            }, 1);
        },
    };
};
