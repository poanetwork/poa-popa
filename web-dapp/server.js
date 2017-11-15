const express = require('express');
const body_parser = require('body-parser');
const helmet = require('helmet');
const logger = require('./logger');
const config = require('./server-config');
const req_id = require('./server-lib/req_id');
const recalc_price = require('./server-lib/recalc_price');

var app = express();

app.use(helmet());

// react front-end
app.use('/', express.static('build'));
app.use('/confirm', express.static('build'));
// api

function log_request(req, res, next) {
    req.log_prfx = 'ID=' + req.x_id;
    if (req.x_ip) req.log_prfx += ('|IP=' + req.x_ip);
    logger.log('[request] (' + req.log_prfx + ') ' + req.method + ' ' + req.path + ' by ' + JSON.stringify(req.headers));
    next();
}

app.use(body_parser.urlencoded({ extended: true }));
app.use(body_parser.json());
app.use('/api', req_id, log_request, require('./routes')({}));

recalc_price.init(function () {
    var port = process.env.PORT || config.port || 3000;
    app.listen(port, () => {
        logger.log('Listening on ' + port);
    });
});
