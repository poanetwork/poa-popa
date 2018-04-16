'use strict';

require('dotenv').config()

const logger = require('./server-lib/logger');
const config = require('./server-config');
const recalcPrice = require('./server-lib/recalc_price');

const app = require('./app');
const port = process.env.PORT || config.port || 3000;

recalcPrice.init(() => {
    app.listen(port, () => {
        logger.log(`Listening on ${port}`);
    });
});
