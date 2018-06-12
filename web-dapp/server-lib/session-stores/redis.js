'use strict';
const config = require('../../server-config');
const logger = require('../logger');
const redis = require('redis'); // https://github.com/NodeRedis/node_redis
const PettyCache = require('petty-cache');

const pettyCache = new PettyCache();
const pettyCacheMutexOptions = {
    retry: {
        interval: 100,
        times: 1200,
    },
};
pettyCacheMutexOptions.ttl = pettyCacheMutexOptions.retry.interval * pettyCacheMutexOptions.retry.times;

const prelog = '[redis]';
const lockedPrefix = 'locked';

function k1(k) {
    return `${lockedPrefix}:${k}`;
}

function unlock(client, k) {
    return new Promise((resolve, reject) => {
        client.rename(k1(k), k, (err, res) => {
            if (err) return reject(err);

            resolve(res);
        });
    });
}

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

    client.keys(`${lockedPrefix}:*`, (err, keys) => {
        if (err) {
            logger.error('Could not get keys to unlock');
            return;
        }

        keys.forEach((key) => {
            unlock(client, key.replace(`${lockedPrefix}:`, ''))
                .catch((e) => {
                    logger.error(`Could not unlock key ${key}`, e);
                });
        });
    });

    return {
        set: function (k, v) {
            return new Promise((resolve) => {
                client.set(k, JSON.stringify(v), () => {
                    return resolve(true);
                });
            });
        },
        getAndLock: (k) => {
            return new Promise((resolve, reject) => {
                client.rename(k, k1(k), (err) => {
                    if (err) return reject(err);
                    client.get(k1(k), (err, v) => {
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
            });
        },
        unlock: (k) => {
            return unlock(client, k);
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
            return new Promise((resolve, reject) => {
                client.del(k1(k), (err) => {
                    if (err) return reject(err);
                    resolve(true);
                });
            });
        },
        inc: (k) => {
            return new Promise((resolve, reject) => {
                client.incr(k, err => {
                    if (err) return reject(err);
                    return resolve();
                });
            });;
        },
        mutexLock: (mutexName) => {
            return new Promise((resolve, reject) => {
                pettyCache.mutex.lock(mutexName, pettyCacheMutexOptions, err => {
                    if (err) {
                        logger.error(`${prelog} Could not lock mutex: ${mutexName}, err: ${err}`);
                        return reject(err);
                    }
                    return resolve();
                });
            });
        },
        mutexUnlock: (mutexName) => {
            return new Promise((resolve, reject) => {
                pettyCache.mutex.unlock(mutexName, err => {
                    if (err) logger.error(`${prelog} Could not unlock mutex: ${mutexName} (it will be automatically unlocked after ${pettyCacheMutexOptions.ttl} ms), err: ${err}`);
                    return resolve();
                });
            });
        },
    };
};
