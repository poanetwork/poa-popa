'use strict';

const PettyCache = require('petty-cache');
const pettyCache = new PettyCache();
const db = require("./session_store");

const MAX_POSTCARDS_PER_DAY = Number(process.env.MAX_POSTCARDS_PER_DAY || 10);

function canSend() {
    return get().then(postcardsSent => postcardsSent < MAX_POSTCARDS_PER_DAY);
}

function get() {
    const postcardsSentKey = getDaysAfterEpoch();
    const config = {
        retry: { interval: 100, times: 5 },
        ttl: 1000,
    };
    pettyCache.mutex.lock('postcardsSendMutex', config, err => {
        if (err) {
            //
        }
        return db.get(postcardsSentKey).then(x => {
            if (x) return Number(x);
            return 0;
        });
    });
}

function inc() {
    const postcardsSentKey = getDaysAfterEpoch();

    return db
        .inc(postcardsSentKey)
        .then(() => pettyCache.mutex.unlock('postcardsSendMutex'));
}

function getDaysAfterEpoch() {
    const now = new Date();
    const msInADay = 24 * 3600 * 1000;

    return Math.floor(now / msInADay);
}

module.exports = {
    canSend,
    get,
    inc,
    MAX_POSTCARDS_PER_DAY,
};
