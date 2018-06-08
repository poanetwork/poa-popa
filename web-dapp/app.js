'use strict';

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const config = require('./server-config');

const app = express();

process.env.REACT_APP_PRICE = config.web3.fromWei(config.web3.toBigNumber(config.priceWei), 'wei');
process.env.REACT_APP_PRICE_SYMBOL = config.priceSymbol;

app.use(helmet());

// react front-end
app.use('/', express.static(path.join(__dirname, 'build')));
app.use('/register', express.static(path.join(__dirname, 'build')));
app.use('/confirm', express.static(path.join(__dirname, 'build')));
app.use('/help', express.static(path.join(__dirname, 'build')));
app.use('/my-addresses', express.static(path.join(__dirname, 'build')));

// api
app.use(bodyParser.urlencoded({ extended: true, limit: config.bodySizeLimit }));
app.use(bodyParser.json({ limit: config.bodySizeLimit }));

const routes = require('./routes')({});
app.use('/api', routes);
app.use('/confirm/api', routes);

module.exports = app;
