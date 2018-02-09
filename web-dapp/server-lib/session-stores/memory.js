'use strict';

let db = {};
module.exports = function () {
    return {
        set: function (k,v, done) {
            db[k] = v;
            setTimeout((k,v) => {
                db[k] = v;
                done();
            }, 1, k, v);
        },
        get: (k) => {
            return new Promise((resolve) => {
                return resolve(db[k]);
            });
        },
        unset: (k) => {
            return new Promise((resolve) => {
                delete db[k]
                return resolve();
            });
        },
    };
};
