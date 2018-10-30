'use strict';

const request = require('supertest');
const app = require('../../app');

jest.mock('../../server-lib/is_address_confirmed', () => jest.fn(() => Promise.resolve(true)));
jest.mock('../../server-lib/get_address_details', () => jest.fn(() => Promise.resolve({some: 'address', random: 'details'})));

describe('issue_erc725_claim', () => {
    it('should return error if body is empty', () => {
        return request(app)
            .post('/api/issueErc725Claim')
            .then(res => {
                return expect(res.body.ok).toBeFalsy();
            });
    });

    it('should return a valid response if the input data is valid', () => {
        return request(app)
            .post('/api/issueErc725Claim')
            .send({
                wallet: '0x1aa2d288d03d8397c193d2327ee7a7443d4ec3a1',
                addressIndex: '0',
                destinationClaimHolderAddress: '0x1aa2d288d03d8397c193d2327ee7a7443d4ec3a1',
            })
            .then(res => {
                return expect(res.body.ok).toBeTruthy();
            });
    });
});
