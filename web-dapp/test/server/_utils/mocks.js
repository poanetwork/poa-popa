'use strict';

const wallets = [
    '0x1aa2d288d03d8397c193d2327ee7a7443d4ec3a1',
    '0x123f681646d4a755815f9cb19e1acc8565a0c2ac',
    '0x6759ad42f3be6e578a949c63bbf5b8f95bc3fc43',
];

const badWallets = [
    '123f681646d4a755815f9cb19e1acc8565',
];

const confirmationCodes = [
    'h44hh7n5545',
];

const confirmationCodesSha3 = [
    '0x8c4d9d5a199f6619fe6ab0a3e319122048f0b10c10ace064d39657cbd37f123f'
];

const sessionKeys = [
    '0.8177204204187007',
];

const badSessionKeys = [
    0.8177204204187007,
];

const txIds = [
    '0xfd3c97d14b3979cc6356a92b79b3ac8038f0065fc5079c6a0a0ff9b0c0786291',
    '0xfd3c97d14b3979cc6356a92b79b3ac8038f0065fc5079c6a0a0ff9b0c0786292',
    '0xfd3c97d14b3979cc6356a92b79b3ac8038f0065fc5079c6a0a0ff9b0c0786293',
    '0xfd3c97d14b3979cc6356a92b79b3ac8038f0065fc5079c6a0a0ff9b0c0786294',
    '0xfd3c97d14b3979cc6356a92b79b3ac8038f0065fc5079c6a0a0ff9b0c0786295',
    '0x4d7af99cbbdb777d28c4586f71f5839d2b4839601d3ef6f51acab56a84d9c2d6',
];

const badTxIds = [
    111111111111111111111111111111111111111111111111111111111111111111,
];

const mockDb = {
    get: (sessionKey) => {
        if (sessionKey === badSessionKeys[0]) {
            return Promise.resolve({});
        }
        return Promise.resolve({
            wallet: wallets[0],
            confirmationCodePlain: confirmationCodes[0],
        });
    },
};

const mockGetTransaction = (txId) => {
    const response = {
        error: null,
        txDetails: null
    }
    if (txId === txIds[5]) {
        response.error = 'Error getting transaction';
    }
    if (txId === txIds[3]) {
        response.txDetails = {
            hash: txId,
            to: wallets[2],
            from: wallets[0],
        };
    }
    if (txId === txIds[2]) {
        response.txDetails = {
            hash: txId,
            to: wallets[1],
            from: wallets[2],
        };
    }
    if (txId === txIds[1]) {
        response.txDetails = {
            hash: txId,
            to: wallets[1],
            from: wallets[0],
        };
    }
    if (txId === txIds[0]) {
        response.txDetails = {
            hash: txId,
            to: wallets[1],
            from: wallets[0],
            blockNumber: 10,
        };
    }
    return new Promise((resolve) => {
        return resolve(response);
    });
};

const mockGetAddressIndex = () => {
    return new Promise((resolve) => {
        const err = null;
        const addressIndex = [true, true, false];
        return resolve({err, addressIndex});
    });
};

const mockGetAddressDetails = () => {
    return new Promise((resolve) => {
        const details = {
            name: 'John Doe',
            country: 'us',
            state: 'ca',
            city: 'los angeles',
            location: '185, Park drive',
            zip: '90017',
        };
        return resolve(details);
    });
};

const mockUserAddressByCreationBlock = (wallet, tx_bn, cb) => {
    const err = null;
    const addressIndex = [true, 10, false];
    return cb(err, addressIndex);
};

const mockWeb3GetTx = (tx_id, cb) => {
    const err = null;
    const txDetails = {
        hash: tx_id,
        to: wallets[1],
        from: wallets[0],
        blockNumber: 10,
    };
    return cb(err, txDetails);
};

module.exports = {
    wallets,
    badWallets,
    confirmationCodes,
    confirmationCodesSha3,
    sessionKeys,
    badSessionKeys,
    txIds,
    badTxIds,
    mockDb,
    mockGetTransaction,
    mockGetAddressIndex,
    mockGetAddressDetails,
    mockUserAddressByCreationBlock,
    mockWeb3GetTx,
};
