"use strict";
const should = require('should');
const sinon = require('sinon');
const logger = require('../server-lib/logger');

describe('Logger', () => {
    describe('Logger.log', () => {
        after(() => {
            logger.log.restore();
        });
        it('should show logger.log', () => {
            sinon.stub(logger, 'log');

            logger.log('lorem ipsum');

            should(logger.log.calledOnce).be.exactly(true);
        });
    });

    describe('Logger.error', () => {
        after(() => {
            logger.error.restore();
        });
        it('should show logger.error', () => {
            sinon.stub(logger, 'error');

            logger.error('lorem ipsum');

            should(logger.error.calledOnce).be.exactly(true);
        });
    });
});