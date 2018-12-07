'use strict';
const {wallets, badWallets} = require('./_utils/mocks');
const [wallet] = wallets;
const [badWallet] = badWallets;

const issueErc735Claim = require('../../controllers/issueErc735Claim');
const addressIndex = '0';
const badAddressIndex = '';

describe('Issue ERC735 Claim', () => {
    describe('Validate Data', () => {
        it('should reject if data is empty', () => {
            return expect(issueErc735Claim.validateData()).rejects.toBeTruthy();
        });
        it('should reject if wallet is not valid', () => {
            const data = {
                wallet: badWallet,
                destinationClaimHolderAddress: wallet,
                addressIndex,
            };
            return expect(issueErc735Claim.validateData(data)).rejects.toBeTruthy();
        });
        it('should reject if destinationClaimHolderAddress is not valid', () => {
            const data = {
                destinationClaimHolderAddress: badWallet,
                wallet,
                addressIndex,
            };
            return expect(issueErc735Claim.validateData(data)).rejects.toBeTruthy();
        });
        it('should reject if addressIndex is not valid', () => {
            const data = {
                addressIndex: badAddressIndex,
                wallet,
                destinationClaimHolderAddress: wallet,
            };
            return expect(issueErc735Claim.validateData(data)).rejects.toBeTruthy();
        });
        it('should return wallet and params', () => {
            const data = {
                wallet,
                addressIndex,
                destinationClaimHolderAddress: wallet,
            };
            return issueErc735Claim.validateData(data)
                .then(data => {
                    expect(wallet).toEqual(data.wallet);
                    // We use 'wallet' as a valid address
                    expect(wallet).toEqual(data.destinationClaimHolderAddress);
                    expect(addressIndex).toEqual(data.addressIndex);
                });
        });
    });
});
