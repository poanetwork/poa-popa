'use strict';

const express = require('express');
const path = require('path');
const body_parser = require('body-parser');
const helmet = require('helmet');

const app = express();

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

module.exports = app;