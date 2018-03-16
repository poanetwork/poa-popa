'use strict';

const logger = require('./server-lib/logger');
const config = require('./server-config');
const recalc_price = require('./server-lib/recalc_price');

const app = require('./app');
const port = process.env.PORT || config.port || 3000;

recalc_price.init(() => {
    app.listen(port, () => {
        logger.log(`Listening on ${port}`);
    });
});
