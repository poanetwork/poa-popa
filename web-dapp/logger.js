'use strict';

module.exports = {
    log: function (msg) {
        console.log(new Date().toISOString(), msg);
    },
    error: function (msg) {
        var d = new Date().toISOString();
        console.log(d, msg);
        console.error(d, msg);
    },
};
