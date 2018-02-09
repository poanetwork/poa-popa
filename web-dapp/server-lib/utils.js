'use strict';

const createResponseObject = (ok, error) => {
    return {
        ok: false,
        err: error,
    };
};

module.exports = {
    createResponseObject,
};