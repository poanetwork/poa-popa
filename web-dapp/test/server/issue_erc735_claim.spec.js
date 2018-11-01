'use strict';

const request = require('supertest');
const app = require('../../app');
const config = require('../../server-config');
const POPA_ERC725_CONTRACT_ADDRESS = config.cconf.popaErc725ContractAddress;
const POPA_ERC725_URI = config.cconf.popaErc725Uri;

jest.mock('../../server-lib/is_address_confirmed', () => jest.fn(() => Promise.resolve(true)));
jest.mock('../../server-lib/get_address_details', () => jest.fn(() => Promise.resolve({some: 'address', random: 'details'})));

describe('issue_erc735_claim', () => {
    it('should return error if body is empty', () => {
        return request(app)
            .post('/api/issueErc735Claim')
            .then(res => {
                return expect(res.body.ok).toBeFalsy();
            });
    });

    it('should return a valid response if the input data is valid', () => {
        return request(app)
            .post('/api/issueErc735Claim')
            .send({
                wallet: '0x1aa2d288d03d8397c193d2327ee7a7443d4ec3a1',
                addressIndex: '0',
                destinationClaimHolderAddress: '0x1aa2d288d03d8397c193d2327ee7a7443d4ec3a1',
            })
            .then(res => {
                return expect(res.body.ok).toBeTruthy();
            });
    });

    it('should return in response signature, data (hashed), issuerAddress and uri for erc735 claim generation', (done) => {
        return request(app)
            .post('/api/issueErc735Claim')
            .send({
                wallet: '0x1aa2d288d03d8397c193d2327ee7a7443d4ec3a1',
                addressIndex: '0',
                destinationClaimHolderAddress: '0x1aa2d288d03d8397c193d2327ee7a7443d4ec3a1',
            })
            .then(res => {
                const {ok, signature, data, issuerAddress, uri} = res.body;
                expect(ok).toBeTruthy();
                expect(signature).toBeDefined();
                expect(data).toBeDefined();
                expect(issuerAddress).toEqual(POPA_ERC725_CONTRACT_ADDRESS);
                expect(uri).toEqual(POPA_ERC725_URI);
                done();
            });
    });
});
