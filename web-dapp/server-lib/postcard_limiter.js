'use strict';

const db = require('./session_store');

const MAX_POSTCARDS_PER_DAY = Number(process.env.MAX_POSTCARDS_PER_DAY || 10);

function canSend() {
    return get()
        .then(postcardsSent => postcardsSent < MAX_POSTCARDS_PER_DAY);
}

function get() {
    const postcardsSentKey = getDaysAfterEpoch();

    return db.get(postcardsSentKey).then(x => {
        if (x) return Number(x);
        return 0;
    });
}

function inc() {
    const postcardsSentKey = getDaysAfterEpoch();

    return db.inc(postcardsSentKey);
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
