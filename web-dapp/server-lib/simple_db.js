'use strict';

var db = {};

module.exports = function () {
    return {
        set: function (k,v) {
            db[k] = v;
        },
        get: function (k) {
            return db[k];
        },
        unset: function (k) {
            delete db[k];
        },
    };
};
