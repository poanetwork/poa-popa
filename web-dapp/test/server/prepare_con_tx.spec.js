'use strict';

const request = require('supertest');
const app = require('../../app');


describe('prepare_con_tx', () => {
    it('should return error if body is empty', () => {
        return request(app)
            .post('/api/prepareConTx')
            .then(res => {
                return expect(res.body.ok).toBeFalsy();
            });
    });

    it('should return a valid response if the input data is valid', () => {
        return request(app)
            .post('/api/prepareConTx')
            .send({
                wallet: '0x1aa2d288d03d8397c193d2327ee7a7443d4ec3a1',
                confirmationCodePlain: 'sxxsndac7y7'
            })
            .then(res => {
                return expect(res.body.ok).toBeTruthy();
            });
    });
});