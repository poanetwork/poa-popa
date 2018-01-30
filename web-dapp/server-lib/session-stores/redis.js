'use strict';
const config = require('../../server-config');
const logger = require('../../utils/logger');
const redis = require('redis'); // https://github.com/NodeRedis/node_redis
const prelog = '[redis] ';

module.exports = function () {
    logger.log(prelog + 'connecting');
    const client = redis.createClient(config.session_store.params);
    client.on('error', (err) => {
        logger.error(prelog + 'error ' + err);
    });
    client.on('ready', () => {
        logger.log(prelog + 'client ready, server info: ' + JSON.stringify(client.server_info));
    });
    client.on('reconnecting', () => {
        logger.log(prelog + 'client reconnecting');
    });
    client.on('connect', () => {
        logger.log(prelog + 'client connected');
    });
    client.on('end', () => {
        logger.error(prelog + 'connection closed');
    });

    return {
        set: function (k, v, done) {
            client.set(k, JSON.stringify(v), done);
        },
        get: function (k, done) {
            client.get(k, (err, v) => {
                if (err) return done(err);
                try {
                    v = JSON.parse(v);
                    return done(null, v);
                }
                catch (ex) {
                    return done(ex);
                }
            });
        },
        unset: function (k, done) {
            client.del(k, done);
        },
    };
};
