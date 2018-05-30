'use strict';

const request = require('supertest');
const app = require('../../app');

jest.mock('../../controllers/notifyRegTx', () => ({
    validateData: jest.fn((opts) => {
        let wallet = opts.body.wallet;
        if (wallet === '0x1aa2d288d03d8397c193d2327ee7a7443d4ec3a1' || wallet === '0x1aa2d288d03d8397c193d2327ee7a7443d4ec3a3') return { ok: true };
        return { ok: false };
    }),
    normalizeData: jest.fn((opts) => {
        let { wallet } = opts;
        console.log('🦄 wallet', wallet);
        let sessionKey;
        if (wallet === '0x1aa2d288d03d8397c193d2327ee7a7443d4ec3a3') {
            sessionKey = '0.9177204204187007';
        } else {
            sessionKey = '0.8177204204187007';
        }
        return {
            wallet: '0x1aa2d288d03d8397c193d2327ee7a7443d4ec3a1',
            txId: '0xfd3c97d14b3979cc6356a92b79b3ac8038f0065fc5079c6a0a0ff9b0c0786291',
            sessionKey,
        };
    }),
    getTxInfo: jest.fn((opts) => {
        if (opts.wallet === '0x1aa2d288d03d8397c193d2327ee7a7443d4ec3a1' && opts.sessionKey !== '0.8177204204187007') {
            return Promise.reject({ error: 'Error' });
        }
        return Promise.resolve({ confirmationCodePlain: 'ABC1234DEF' })
    }),
    getTxBlockNumber: jest.fn(() => Promise.resolve(10)),
    getAddressByBN: jest.fn(() => Promise.resolve('0x1aa2d288d03d8397c193d2327ee7a7443d4ec3a3')),
    createPostCard: jest.fn(() => Promise.resolve({ postcard: 'PostCard' })),
    removeUsedSessionKey: jest.fn(() => Promise.resolve({ ok: true, result: { postcard: 'PostCard' } })),
}));

describe('notify_reg_tx', () => {
    it('should return error if body is empty', () => {
        return request(app)
            .post('/api/notifyRegTx')
            .then(res => {
                return expect(res.body.ok).toBeFalsy();
            });
    });

    it('should return an error message if input data is invalid', () => {
        return request(app)
            .post('/api/notifyRegTx')
            .send({
                wallet: '0x1aa2d288d03d8397c193d2327ee7a7443d4ec3a2',
                txId: '0xfd3c97d14b3979cc6356a92b79b3ac8038f0065fc5079c6a0a0ff9b0c0786291',
                sessionKey: '0.8177204204187007',
            })
            .then(res => {
                return expect(res.body.ok).toBeFalsy();
            });
    });

    it('should return a valid response if the input data is valid', () => {
        return request(app)
            .post('/api/notifyRegTx')
            .send({
                wallet: '0x1aa2d288d03d8397c193d2327ee7a7443d4ec3a1',
                txId: '0xfd3c97d14b3979cc6356a92b79b3ac8038f0065fc5079c6a0a0ff9b0c0786291',
                sessionKey: '0.8177204204187007',
            })
            .then(res => {
                return expect(res.body.ok).toBeTruthy();
            });
    });

    it('should return an error', () => {
        return request(app)
            .post('/api/notifyRegTx')
            .send({
                wallet: '0x1aa2d288d03d8397c193d2327ee7a7443d4ec3a3',
                txId: '0xfd3c97d14b3979cc6356a92b79b3ac8038f0065fc5079c6a0a0ff9b0c0786291',
                sessionKey: '0.9177204204187007',
            })
            .then(res => {
                return expect(res.body.ok).toBeFalsy();
            });
    });
});
