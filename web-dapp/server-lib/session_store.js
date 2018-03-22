'use strict';

const config = require('../server-config');
const logger = require('./logger');

const type = config.sessionStore.type;
logger.log('[sessionStore] using session store of type: ' + type);
const session_store = require('./session-stores/' + type);

module.exports = session_store();
