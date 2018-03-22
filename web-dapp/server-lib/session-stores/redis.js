'use strict';
const config = require('../../server-config');
const logger = require('../logger');
const redis = require('redis'); // https://github.com/NodeRedis/node_redis

const prelog = '[redis]';

module.exports = function () {
    logger.log(`${prelog} connecting`);

    const client = redis.createClient(config.sessionStore.params);

    client.on('error', (err) => {
        logger.error(`${prelog} error ${err}`);
    });
    client.on('ready', () => {
        logger.log(`${prelog} client ready, server info: ${JSON.stringify(client.server_info)}`);
    });
    client.on('reconnecting', () => {
        logger.log(`${prelog} client reconnecting`);
    });
    client.on('connect', () => {
        logger.log(`${prelog} client connected`);
    });
    client.on('end', () => {
        logger.error(`${prelog} connection closed`);
    });

    return {
        set: function (k, v) {
            return new Promise((resolve) => {
                client.set(k, JSON.stringify(v), () => {
                    return resolve(true);
                });
            });
        },
        get: (k) => {
            return new Promise((resolve, reject) => {
                client.get(k, (err, v) => {
                    if (err) return reject(err);
                    try {
                        v = JSON.parse(v);
                        return resolve(v);
                    }
                    catch (ex) {
                        return reject(ex);
                    }
                });
            });
        },
        unset: (k) => {
            return new Promise((resolve) => {
                client.del(k);
                return resolve(true);
            });
        },
    };
};
