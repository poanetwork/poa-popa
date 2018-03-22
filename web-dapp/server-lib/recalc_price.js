'use strict';

const config = require('../server-config');
const logger = require('./logger');
const prelog = '[recalc_price] ';

var initialized = false;
var currentPriceWei = null;
var updating = false;
var lastUpdated = false;

function recalc(done) {
    if (updating) {
        logger.error(prelog + 'currentPriceWei is still being updated');
        return setTimeout(() => done('currentPriceWei is still being updated'), 1);
    }
    updating = true;
    logger.log(prelog + 'updating currentPriceWei, old value: ' + currentPriceWei);

    // random exchange rate for now
    setTimeout((done) => {
        updating = false;

        var usdPer1eth = 250 + (350-250)*Math.random();

        logger.log(prelog + 'got exchange rate: 1 ETH = ' + usdPer1eth + ' USD');
        currentPriceWei = (new config.web3.BigNumber('1e+18')).times(config.priceUsCents).dividedBy(usdPer1eth.toString()).dividedBy(100).ceil();
        logger.log(prelog + 'currentPriceWei updated, new value: ' + currentPriceWei);
        lastUpdated = new Date();
        return done();
    }, 500, done);
}

module.exports = {
    init: function (done) {
        if (initialized) {
            logger.log(prelog + 'already initialized');
            return setTimeout(done, 1);
        }

        if (config.priceWei) {
            logger.log(prelog + 'using constant currentPriceWei: ' + config.priceWei);
            currentPriceWei = new config.web3.BigNumber(config.priceWei);
            initialized = true;
            return setTimeout(done, 1);
        }
        else {
            logger.log(prelog + 'calculating currentPriceWei for the first time');
            recalc(() => {
                initialized = true;
                done();
            });
            logger.log(prelog + 'setting price update interval: ' + config.priceUpdIntervalMs);
            setInterval(() => recalc(()=>{}), config.priceUpdIntervalMs);
        }
    },
    get_price_wei: function () {
        return currentPriceWei;
    },
    update_status: function () {
        return updating;
    },
    last_updated: function () {
        return lastUpdated;
    },
};
