

const config = require('../server-config');
const logger = require('./logger');

const type = config.session_store.type;
logger.log('[session_store] using session store of type: ' + type);
const session_store = require('./session-stores/' + type);

module.exports = session_store();
