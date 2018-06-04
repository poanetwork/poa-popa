'use strict';

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const helmet = require('helmet');

const app = express();

app.use(helmet());

// react front-end
app.use('/', express.static(path.join(__dirname, 'build')));
app.use('/register', express.static(path.join(__dirname, 'build')));
app.use('/confirm', express.static(path.join(__dirname, 'build')));
app.use('/help', express.static(path.join(__dirname, 'build')));
app.use('/my-addresses', express.static(path.join(__dirname, 'build')));

const BODY_SIZE_LIMIT = '3kb';
// api
app.use(bodyParser.urlencoded({ extended: true, limit: BODY_SIZE_LIMIT }));
app.use(bodyParser.json({ limit: BODY_SIZE_LIMIT }));

const routes = require('./routes')({});
app.use('/api', routes);
app.use('/confirm/api', routes);

module.exports = app;
