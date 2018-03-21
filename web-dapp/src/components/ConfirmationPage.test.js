import React from 'react';
import { mount } from 'enzyme';

import ConfirmationPage from './ConfirmationPage';

const web3 = { eth: { accounts: ['0x1aa2d288d03d8397c193d2327ee7a7443d4ec3a1'] } };
const contract = require('../../test/server/_utils/contract-output');

window.$ = { ajax: jest.fn() };
const ajaxCall = jest.spyOn(window.$, 'ajax');
const componentDidMount = jest.spyOn(ConfirmationPage.prototype, 'componentDidMount');
const checkUserExists = jest.spyOn(ConfirmationPage.prototype, 'check_user_exists');
const checkWalletSame = jest.spyOn(ConfirmationPage.prototype, 'check_wallet_same');
const confirmAddress = jest.spyOn(ConfirmationPage.prototype, 'confirmAddress');
const confirmClicked = jest.spyOn(ConfirmationPage.prototype, 'confirm_clicked');
const findAddress = jest.spyOn(ConfirmationPage.prototype, 'find_address');
const onChange = jest.spyOn(ConfirmationPage.prototype, 'on_change');
const showAlert = jest.spyOn(window, 'show_alert');

describe('<ConfirmationPage />', () => {
    const addressDetails = {
        country: 'US',
        state: 'NM',
        city: 'Albuquerque',
        address: '3828 Piermont Dr NE',
        zip: '87111'
    };

    it('renders correctly', () => {
        const page = mount(<ConfirmationPage/>);

        expect(page.root()).toHaveLength(1);
        expect(page.find('.postcard-form')).toHaveLength(1);
        expect(page.find('.postcard-input')).toHaveLength(1);
        expect(page.find('.postcard-button')).toHaveLength(1);
    });

    it('should call componentDidMount()', () => {
        const page = mount(<ConfirmationPage/>);

        expect(page.root()).toHaveLength(1);
        expect(componentDidMount).toHaveBeenCalled();
    });

    it('receive web3 instance as property', () => {
        const page = mount(<ConfirmationPage my_web3={web3}/>);

        expect(componentDidMount).toHaveBeenCalled();
        expect(page.prop('my_web3')).toBe(web3);
    });

    it('receive contract as property', () => {
        const page = mount(<ConfirmationPage contract={contract}/>);

        expect(componentDidMount).toHaveBeenCalled();
        expect(page.prop('contract')).toBe(contract);
    });

    it('handles form changes', () => {
        const page = mount(<ConfirmationPage/>);

        const input = page.find('.postcard-input');
        input.instance().value = '12345';
        input.simulate('change');

        expect(onChange).toHaveBeenCalled();
        expect(page.state('confirmationCodePlain')).toBe('12345');
    });

    it('displays a message if the form is sent empty', () => {
        const page = mount(<ConfirmationPage/>);
        const confirmButton = page.find('.postcard-button');

        confirmButton.simulate('click');

        expect(confirmClicked).toHaveBeenCalled();
        expect(showAlert).toHaveBeenCalledWith(
            'warning',
            'Verification',
            'Please enter the confirmation code first'
        );
    });

    it('displays a message if MetaMask isn\'t unlocked', () => {
        const page = mount(<ConfirmationPage/>);

        const input = page.find('.postcard-input');
        input.instance().value = '12345';
        input.simulate('change');

        const confirmButton = page.find('.postcard-button');
        confirmButton.simulate('click');

        expect(confirmClicked).toHaveBeenCalled();
        expect(showAlert).toHaveBeenCalledWith(
            'warning',
            'MetaMask account',
            'Please unlock your account in MetaMask and refresh the page first'
        );
    });

    it('displays a message if there was an error checking user', () => {
        const page = mount(
            <ConfirmationPage
                my_web3={web3}
                contract={{ userExists: jest.fn((wallet, opts, callback) => callback({ message: 'fake error' })) }}
            />
        );

        page.setState({ confirmationCodePlain: 'h44hh7n5545' });
        page.find('.postcard-button').simulate('click');

        expect(checkUserExists).toHaveBeenCalled();
        expect(checkWalletSame).toHaveBeenCalled();
        expect(ajaxCall).not.toHaveBeenCalled();
        expect(showAlert).toHaveBeenLastCalledWith(
            'error',
            'Checking if user exists',
            [['Error', 'fake error']]
        );
    });

    it('displays a message if user not exists', () => {
        const page = mount(
            <ConfirmationPage
                my_web3={web3}
                contract={{ userExists: jest.fn((wallet, opts, callback) => callback(null, false)) }}
            />
        );

        page.setState({ confirmationCodePlain: 'h44hh7n5545' });
        page.find('.postcard-button').simulate('click');

        expect(checkUserExists).toHaveBeenCalled();
        expect(checkWalletSame).toHaveBeenCalled();
        expect(ajaxCall).not.toHaveBeenCalled();
        expect(showAlert).toHaveBeenLastCalledWith(
            'warning',
            'Checking if user exists',
            'There are no addresses registered under your current MetaMask account'
        );
    });

    it('displays a message if there was an error preparing confirmation transaction', () => {
        const page = mount(
            <ConfirmationPage
                my_web3={web3}
                contract={{ userExists: jest.fn((wallet, opts, callback) => callback(null, true)) }}
            />
        );

        page.setState({ confirmationCodePlain: 'h44hh7n5545' });

        ajaxCall.mockImplementationOnce(({ error }) => {
            return error({ statusText: 'Server Error', status: 500 });
        });

        page.find('.postcard-button').simulate('click');

        expect(checkUserExists).toHaveBeenCalled();
        expect(checkWalletSame).toHaveBeenCalled();
        expect(ajaxCall).toHaveBeenCalled();
        expect(showAlert).toHaveBeenLastCalledWith(
            'error',
            'Preparing confirmation transaction',
            [['Error', 'Server Error (500)']]
        );
    });

    it('displays a message if received an empty response from server', () => {
        const page = mount(
            <ConfirmationPage
                my_web3={web3}
                contract={{ userExists: jest.fn((wallet, opts, callback) => callback(null, true)) }}
            />
        );

        page.setState({ confirmationCodePlain: 'h44hh7n5545' });

        ajaxCall.mockImplementationOnce(({ success }) => {
            return success();
        });

        page.find('.postcard-button').simulate('click');

        expect(checkUserExists).toHaveBeenCalled();
        expect(checkWalletSame).toHaveBeenCalled();
        expect(ajaxCall).toHaveBeenCalled();
        expect(showAlert).toHaveBeenLastCalledWith(
            'error',
            'Preparing confirmation transaction',
            [['Error', 'Empty response from server']]
        );
    });

    it('displays a message if received an error response', () => {
        const page = mount(
            <ConfirmationPage
                my_web3={web3}
                contract={{ userExists: jest.fn((wallet, opts, callback) => callback(null, true)) }}
            />
        );

        page.setState({ confirmationCodePlain: 'h44hh7n5545' });

        ajaxCall.mockImplementationOnce(({ success }) => {
            return success({ x_id: 'test', err: 'fake error' });
        });

        page.find('.postcard-button').simulate('click');

        expect(checkUserExists).toHaveBeenCalled();
        expect(checkWalletSame).toHaveBeenCalled();
        expect(ajaxCall).toHaveBeenCalled();
        expect(showAlert).toHaveBeenLastCalledWith(
            'error',
            'Preparing confirmation transaction',
            [['RequestID', 'test'], ['Error', 'fake error']]
        );
    });

    it('displays a message if received an response without result', () => {
        const page = mount(
            <ConfirmationPage
                my_web3={web3}
                contract={{ userExists: jest.fn((wallet, opts, callback) => callback(null, true)) }}
            />
        );

        page.setState({ confirmationCodePlain: 'h44hh7n5545' });

        ajaxCall.mockImplementationOnce(({ success }) => {
            return success({ ok: true, x_id: 'test' });
        });

        page.find('.postcard-button').simulate('click');

        expect(checkUserExists).toHaveBeenCalled();
        expect(checkWalletSame).toHaveBeenCalled();
        expect(ajaxCall).toHaveBeenCalled();
        expect(showAlert).toHaveBeenLastCalledWith(
            'error',
            'Preparing confirmation transaction',
            [['RequestID', 'test'], ['Error', 'Missing result field']]
        );
    });

    it('displays a message if there was an error finding the address to confirm', () => {
        const page = mount(
            <ConfirmationPage
                my_web3={web3}
                contract={{ userExists: jest.fn((wallet, opts, callback) => callback(null, true)) }}
            />
        );

        page.setState({ confirmationCodePlain: 'h44hh7n5545' });

        ajaxCall.mockImplementationOnce(({ success }) => {
            return success({ ok: true, x_id: 'test', result: {} });
        });

        findAddress.mockImplementationOnce((opts, callback) => {
            return callback({ message: 'fake error' });
        });

        page.find('.postcard-button').simulate('click');

        expect(checkUserExists).toHaveBeenCalled();
        expect(checkWalletSame).toHaveBeenCalled();
        expect(ajaxCall).toHaveBeenCalled();
        expect(findAddress).toHaveBeenCalled();
        expect(showAlert).toHaveBeenLastCalledWith(
            'error',
            'Finding address to confirm',
            [['Error', 'fake error']]
        );
    });

    it('displays a message if address is not found', () => {
        const page = mount(
            <ConfirmationPage
                my_web3={web3}
                contract={{ userExists: jest.fn((wallet, opts, callback) => callback(null, true)) }}
            />
        );

        ajaxCall.mockImplementationOnce(({ success }) => {
            return success({ ok: true, x_id: 'test', result: {} });
        });

        findAddress.mockImplementationOnce((opts, callback) => {
            return callback(null, { found: false });
        });

        page.setState({ confirmationCodePlain: 'h44hh7n5545' });

        page.find('.postcard-button').simulate('click');

        expect(checkUserExists).toHaveBeenCalled();
        expect(checkWalletSame).toHaveBeenCalled();
        expect(ajaxCall).toHaveBeenCalled();
        expect(findAddress).toHaveBeenCalled();
        expect(showAlert).toHaveBeenLastCalledWith(
            'error',
            'Finding address to confirm',
            [
                ['This confirmation code does not correspond to any of your registered addresses.'],
                ['Please double check confirmation code and account selected in MetaMask']
            ]
        );
    });

    it('displays a message if address is already confirmed', () => {
        const page = mount(
            <ConfirmationPage
                my_web3={web3}
                contract={{ userExists: jest.fn((wallet, opts, callback) => callback(null, true)) }}
            />
        );

        ajaxCall.mockImplementationOnce(({ success }) => {
            return success({ ok: true, x_id: 'test', result: {} });
        });

        findAddress.mockImplementationOnce((opts, callback) => {
            return callback(null, { found: true, confirmed: true, ...addressDetails });
        });

        page.setState({ confirmationCodePlain: 'h44hh7n5545' });

        page.find('.postcard-button').simulate('click');

        expect(checkUserExists).toHaveBeenCalled();
        expect(checkWalletSame).toHaveBeenCalled();
        expect(ajaxCall).toHaveBeenCalled();
        expect(findAddress).toHaveBeenCalled();
        expect(showAlert).toHaveBeenLastCalledWith(
            'warning',
            'Finding address to confirm',
            [
                ['This confirmation code corresponds to address that is already confirmed'],
                ['Country', 'US'],
                ['State', 'NM'],
                ['City', 'ALBUQUERQUE'],
                ['Address', '3828 PIERMONT DR NE'],
                ['ZIP code', '87111']
            ]
        );
    });

    it('displays a message if there was an error confirming address', () => {
        const page = mount(
            <ConfirmationPage
                my_web3={web3}
                contract={{
                    userExists: jest.fn((wallet, opts, callback) => callback(null, true))
                }}
            />
        );

        page.setState({ confirmationCodePlain: 'h44hh7n5545' });

        ajaxCall.mockImplementationOnce(({ success }) => {
            return success({ ok: true, x_id: 'test', result: {} });
        });

        findAddress.mockImplementationOnce((opts, callback) => {
            return callback(null, { found: true, ...addressDetails });
        });

        confirmAddress.mockImplementationOnce((opts, callback) => {
            return callback({ message: 'fake confirmation error' });
        });

        page.find('.postcard-button').simulate('click');

        expect(checkUserExists).toHaveBeenCalled();
        expect(checkWalletSame).toHaveBeenCalled();
        expect(ajaxCall).toHaveBeenCalled();
        expect(findAddress).toHaveBeenCalled();
        expect(showAlert).toHaveBeenLastCalledWith(
            'error',
            'Confirming address',
            [['Error', 'fake confirmation error']]
        );
    });

    it('displays a message when received an unexpected JSON RPC response', () => {
        const page = mount(
            <ConfirmationPage
                my_web3={web3}
                contract={{ userExists: jest.fn((wallet, opts, callback) => callback(null, true)) }}
            />
        );

        page.setState({ confirmationCodePlain: 'h44hh7n5545' });

        ajaxCall.mockImplementationOnce(({ success }) => {
            return success({ ok: true, x_id: 'test', result: {} });
        });

        findAddress.mockImplementationOnce((opts, callback) => {
            return callback(null, { found: true, ...addressDetails });
        });

        confirmAddress.mockImplementationOnce((opts, callback) => {
            return callback();
        });

        page.find('.postcard-button').simulate('click');

        expect(checkUserExists).toHaveBeenCalled();
        expect(checkWalletSame).toHaveBeenCalled();
        expect(ajaxCall).toHaveBeenCalled();
        expect(findAddress).toHaveBeenCalled();
        expect(showAlert).toHaveBeenLastCalledWith(
            'error',
            'Confirming address',
            'Error is empty but tx_id is also empty'
        );
    });

    it('displays a message if there was an error estimating gas for transaction', () => {
        const page = mount(
            <ConfirmationPage
                my_web3={web3}
                contract={{
                    userExists: jest.fn((wallet, opts, callback) => callback(null, true)),
                    confirmAddress: {
                        estimateGas: jest.fn((code, v, r, s, opts, callback) => {
                            return callback({ message: 'fake error' });
                        })
                    }
                }}
            />
        );

        page.setState({ confirmationCodePlain: 'h44hh7n5545' });

        ajaxCall.mockImplementationOnce(({ success }) => {
            return success({
                ok: true,
                x_id: 'test',
                result: {
                    wallet: '0x1aa2d288d03d8397c193d2327ee7a7443d4ec3a1',
                    params: {
                        confirmationCodePlain: 'h44hh7n5545'
                    }
                }
            });
        });

        findAddress.mockImplementationOnce((opts, callback) => {
            return callback(null, { found: true, ...addressDetails });
        });

        page.find('.postcard-button').simulate('click');

        expect(checkUserExists).toHaveBeenCalled();
        expect(checkWalletSame).toHaveBeenCalled();
        expect(ajaxCall).toHaveBeenCalled();
        expect(findAddress).toHaveBeenCalled();
        expect(showAlert).toHaveBeenLastCalledWith(
            'error',
            'Confirming address',
            [['Error', 'fake error']]
        );
    });

    it('displays a message when a address was confirmed successfully', () => {
        const contract = {
            userExists: jest.fn((wallet, opts, callback) => callback(null, true)),
            confirmAddress: jest.fn((code, v, r, s, opts, callback) => {
                return callback(null, '0xfd3c97d14b3979cc6356a92b79b3ac8038f0065fc5079c6a0a0ff9b0c0786291');
            })
        };

        contract.confirmAddress.estimateGas = jest.fn((code, v, r, s, opts, callback) => {
            return callback(null, 1);
        });

        const page = mount(
            <ConfirmationPage my_web3={web3} contract={contract}/>
        );

        page.setState({ confirmationCodePlain: 'h44hh7n5545' });

        ajaxCall.mockImplementationOnce(({ success }) => {
            return success({
                ok: true,
                x_id: 'test',
                result: {
                    wallet: '0x1aa2d288d03d8397c193d2327ee7a7443d4ec3a1',
                    params: {
                        confirmationCodePlain: 'h44hh7n5545'
                    }
                }
            });
        });

        findAddress.mockImplementationOnce((opts, callback) => {
            return callback(null, { found: true, ...addressDetails });
        });

        page.find('.postcard-button').simulate('click');

        expect(checkUserExists).toHaveBeenCalled();
        expect(checkWalletSame).toHaveBeenCalled();
        expect(ajaxCall).toHaveBeenCalled();
        expect(findAddress).toHaveBeenCalled();
        expect(showAlert).toHaveBeenLastCalledWith(
            'success',
            'Address confirmed!',
            [
                ['Transaction to confirm address was submitted'],
                ['Transaction ID', '0xfd3c97d14b3979cc6356a92b79b3ac8038f0065fc5079c6a0a0ff9b0c0786291'],
                ['Country', 'US'],
                ['State', 'NM'],
                ['City', 'ALBUQUERQUE'],
                ['Address', '3828 PIERMONT DR NE'],
                ['ZIP code', '87111']
            ]
        );
    });

    it('displays a message when a address was confirmed successfully', () => {
        const page = mount(
            <ConfirmationPage
                my_web3={web3}
                contract={{ userExists: jest.fn((wallet, opts, callback) => callback(null, true)) }}
            />
        );

        page.setState({ confirmationCodePlain: 'h44hh7n5545' });

        ajaxCall.mockImplementationOnce(({ success }) => {
            return success({ ok: true, x_id: 'test', result: {} });
        });

        findAddress.mockImplementationOnce((opts, callback) => {
            return callback(null, { found: true, ...addressDetails });
        });

        confirmAddress.mockImplementationOnce((opts, callback) => {
            return callback(null, '0xfd3c97d14b3979cc6356a92b79b3ac8038f0065fc5079c6a0a0ff9b0c0786291');
        });

        page.find('.postcard-button').simulate('click');

        expect(checkUserExists).toHaveBeenCalled();
        expect(checkWalletSame).toHaveBeenCalled();
        expect(ajaxCall).toHaveBeenCalled();
        expect(findAddress).toHaveBeenCalled();
        expect(showAlert).toHaveBeenLastCalledWith(
            'success',
            'Address confirmed!',
            [
                ['Transaction to confirm address was submitted'],
                ['Transaction ID', '0xfd3c97d14b3979cc6356a92b79b3ac8038f0065fc5079c6a0a0ff9b0c0786291'],
                ['Country', 'US'],
                ['State', 'NM'],
                ['City', 'ALBUQUERQUE'],
                ['Address', '3828 PIERMONT DR NE'],
                ['ZIP code', '87111']
            ]
        );
    });
});
