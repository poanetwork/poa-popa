'use strict';

const should = require('should');
const sinon = require('sinon');
const logger = require('../server-lib/logger');
const log_request = require('../server-lib/log_request');

describe('Log Request', () => {
    after(() => {
        logger.log.restore();
    });

    it('should log the request', () => {
        sinon.stub(logger, 'log');

        const req = {
            x_id: 'P4cGqk',
            x_ip: '127.0.0.1',
            method: 'POST',
            path: '/prepareRegTx',
            headers: {
                'host': 'localhost:3000'
            }
        };
        const res = {};
        const next = () => {};

        log_request(req, res, next);

        should(logger.log.calledOnce).be.exactly(true);
    });
});