'use strict';

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const helmet = require('helmet');

const app = express();

app.use(helmet());

// react front-end
app.use('/', express.static(path.join(__dirname, 'build')));
app.use('/confirm', express.static(path.join(__dirname, 'build')));
app.use('/my-addresses', express.static(path.join(__dirname, 'build')));

// api
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const routes = require('./routes')({});
app.use('/api', routes);
app.use('/confirm/api', routes);

module.exports = app;