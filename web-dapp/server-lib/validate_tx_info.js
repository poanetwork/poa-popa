'use strict';

module.exports = (opts) => {
    const {info, sessionKey, wallet} = opts;
    return new Promise((resolve, reject) => {
        if (!info || Object.keys(info).length === 0 || !info.wallet || !info.confirmationCodePlain) {
            return reject(`no info for this sessionKey: ${sessionKey}`);
        }
        if (info.wallet !== wallet) {
            return reject(`wallets do not match: info.wallet: ${info.wallet}, but wallet: ${wallet}`);
        }

        return resolve(info);
    });
};
