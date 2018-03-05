'use strict';

const express = require('express');
const path = require('path');
const body_parser = require('body-parser');
const helmet = require('helmet');
const logger = require('./server-lib/logger');
const config = require('./server-config');
const recalc_price = require('./server-lib/recalc_price');

const app = express();
const port = process.env.PORT || config.port || 3000;

app.use(helmet());

// react front-end
app.use('/', express.static(path.join(__dirname, 'build')));
app.use('/confirm', express.static(path.join(__dirname, 'build')));

// api
app.use(body_parser.urlencoded({ extended: true }));
app.use(body_parser.json());

const routes = require('./routes')({});
app.use('/api', routes);
app.use('/confirm/api', routes);

recalc_price.init(() => {
    app.listen(port, () => {
        logger.log(`Listening on ${port}`);
    });
});
