'use strict';
const logger = require('../logger');

function send_response(res, obj) {
    if (res.req.x_id && typeof obj === 'object' && obj != null && !obj.x_id) {
        obj.x_id = res.req.x_id;
    }
    logger.log(res.req.log_prfx + 'sending response: ' + JSON.stringify(obj));
    return res.json(obj);
}

module.exports = send_response;
