'use strict';

let db = {};
function k1(k) {
    return `locked:${k}`;
}

module.exports = function () {
    return {
        set: function (k,v) {
            return new Promise((resolve) => {
                db[k] = v;
                return resolve(true);
            });
        },
        get: (k) => {
            return new Promise((resolve) => {
                return resolve(db[k]);
            });
        },
        getAndLock: (k) => {
            db[k1(k)] = db[k];
            delete db[k];
            return new Promise((resolve) => {
                return resolve(db[k1(k)]);
            });
        },
        unset: (k) => {
            delete db[k1(k)];
            return new Promise((resolve) => {
                return resolve(true);
            });
        },
        inc: (k) => {
            db[k] = db[k] || 0;
            db[k]++;

            return Promise.resolve(db[k]);
        },
    };
};
