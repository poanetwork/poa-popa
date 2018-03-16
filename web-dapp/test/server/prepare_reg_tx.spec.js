'use strict';

const request = require('supertest');
const app = require('../../app');

jest.mock('../../server-lib/post_api', () => ({
    verify_address: jest.fn(() => (Promise.resolve(true))),
}));

describe('prepare_reg_tx', () => {
    it('should return error if body is empty', () => {
        return request(app)
            .post('/api/prepareRegTx')
            .then(res => {
                return expect(res.body.ok).toBeFalsy();
            });
    });

    it('should return a valid response if the input data is valid', () => {
        return request(app)
            .post('/api/prepareRegTx')
            .send({
                wallet: '0x1aa2d288d03d8397c193d2327ee7a7443d4ec3a1',
                name: 'John Doe',
                country: 'us',
                state: 'ca',
                city: 'Beverly Hills',
                address: '1234, Balboa Drive',
                zip: '90210',
            })
            .then(res => {
                return expect(res.body.ok).toBeTruthy();
            });
    });
});