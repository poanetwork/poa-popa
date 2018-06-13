'use strict';

const createResponseObject = (ok, err) => {
    return { ok, msg: err, log: err };
};

module.exports = {
    createResponseObject,
};
