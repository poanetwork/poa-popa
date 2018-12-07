'use strict';
const [wallet] = require('./_utils/mocks').wallets;
const contract = require('../../server-config').contract;
const isAddressConfirmed = require('../../server-lib/is_address_confirmed');

describe('Is Address Confirmed', () => {
    it('should invoke the corresponding contract methods with the given wallet and address index', () => {
        const opts = {
            wallet,
            addressIndex: 0,
        };
        let spy = jest.spyOn(contract, 'userAddressConfirmed');
        isAddressConfirmed(opts)
            .catch(() => {
                expect(spy).toHaveBeenCalledWith(
                    opts.wallet,
                    opts.addressIndex,
                    expect.any(Function)
                );
            });
    });

});
