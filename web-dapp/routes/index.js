'use strict';

var logger = require('../logger');
var express = require('express');
var fs = require('fs');

module.exports = function (web3) {
    var router = express.Router();
    var files = fs.readdirSync(__dirname).filter(f => f !== 'index.js');

    logger.log('Found ' + files.length + ' route(s): ' + JSON.stringify(files));
    for (let f of files) {
        router.use('/', require('./' + f)(web3) );
    }

    return router;
};
