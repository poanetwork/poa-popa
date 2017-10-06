const express = require('express');
const body_parser = require('body-parser');
const helmet = require('helmet');
const logger = require('./logger');
const config = require('./server-config');

var app = express();

app.use(helmet());

// react front-end
app.use('/', express.static('build'));

// api
app.use(body_parser.urlencoded({ extended: true }));
app.use(body_parser.json());
app.use('/api', require('./routes')({}));

var port = process.env.PORT || config.port || 3000;
app.listen(port, () => {
    logger.log('Listening on ' + port);
});
