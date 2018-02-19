'use strict';

let db = {};
module.exports = function () {
    return {
        set: function (k,v) {
            return new Promise((resolve) => {
                db[k] = v;
                return resolve();
            });
        },
        get: (k) => {
            return new Promise((resolve) => {
                return resolve(db[k]);
            });
        },
        unset: (k) => {
            return new Promise((resolve) => {
                delete db[k];
                return resolve();
            });
        },
    };
};
