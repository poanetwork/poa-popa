'use strict';

const spy = require('sinon').spy;

const logger = require('../../server-lib/logger');

describe('Logger', () => {
    describe('Logger.log', () => {
        afterAll(() => {
            logger.log.restore();
        });

        it('should show logger.log', () => {
            spy(logger, 'log');

            logger.log('lorem ipsum');

            expect(logger.log.calledOnce).toBeTruthy();
        });
    });

    describe('Logger.error', () => {
        afterAll(() => {
            logger.error.restore();
        });

        it('should show logger.error', () => {
            spy(logger, 'error');

            logger.error('lorem ipsum');

            expect(logger.error.calledOnce).toBeTruthy();
        });
    });
});
