import React from 'react';
import { BrowserRouter } from 'react-router-dom'
import { mount, shallow } from 'enzyme';

import AddClaimToIdentityPage from './AddClaimToIdentityPage';


const onChange = jest.spyOn(AddClaimToIdentityPage.prototype, 'on_change');

const web3 = {
  eth: {
    accounts: ['0x555553F12BFd372042B754B729D1474572A4444'],
  },
  isAddress: () => true
};
const showAlert = jest.spyOn(window, 'show_alert');

jest.mock('./BackButton', () => () => (<span>Back</span>));
const fields = ['identitycontractaddress']
const sample = new Map([
  ['identitycontractaddress', '0x7e7693F12BFd372042B754B729D1474572A2DD01']
]);

describe('<AddClaimToIdentityPage />', () => {
    it('renders correctly', () => {
        const page = mount(<AddClaimToIdentityPage/>);

        expect(page.root()).toHaveLength(1);
        expect(page.find('#addToIdentityForm')).toHaveLength(1);
        for (const field of fields) {
            expect(page.find(`[name="${field}"]`)).toHaveLength(1);
        }
        expect(page.find('#generateClaim')).toHaveLength(1);
    });

    it('receive web3 instance as property', () => {
        const page = mount(<AddClaimToIdentityPage my_web3={web3}/>);
        expect(page.prop('my_web3')).toBe(web3);
    });

    it('handles form changes', () => {
        const page = mount(<AddClaimToIdentityPage/>);

        for (const field of fields) {
            const value = sample.get(field);
            const input = page.find(`[name="${field}"]`);
            expect(input).toHaveLength(1);
            input.simulate('change', { target: { name: field, value } });
        }

        expect(onChange).toHaveBeenCalledTimes(sample.size);
    });

    it('should display alert message if identity contract address field is empty', () => {
        window.$.ajax = jest.fn();

        const page = mount(<AddClaimToIdentityPage/>);
        const generateClaimButton = page.find('#generateClaim');
        page.setProps({ my_web3: web3 });
        generateClaimButton.simulate('click');

        expect(showAlert).toHaveBeenLastCalledWith(
            'warning',
            'Verification',
            `Please provide a valid IDENTITY CONTRACT ADDRESS`
        );
        expect(window.$.ajax).not.toHaveBeenCalled();
    });

    it('should display alert message if web3.isAddress is false for the provided identity contract address', () => {
        window.$.ajax = jest.fn();
        const web3 = { isAddress: () => false };

        const page = mount(<AddClaimToIdentityPage/>);
        const generateClaimButton = page.find('#generateClaim');
        page.setProps({ my_web3: web3 });
        generateClaimButton.simulate('click');

        expect(showAlert).toHaveBeenLastCalledWith(
            'warning',
            'Verification',
            `Please provide a valid IDENTITY CONTRACT ADDRESS`
        );
        expect(window.$.ajax).not.toHaveBeenCalled();
    });

    it('displays a message if received an error response', () => {
        const page = mount(<AddClaimToIdentityPage my_web3={web3}/>);
        const generateClaimButton = page.find('#generateClaim');

        for (const [field, value] of sample) {
            page.setState({ [field]: value });
        }
        window.$.ajax = jest.fn(({ error }) => {
          return error({ statusText: 'Server Error', status: 500 });
        });
        generateClaimButton.simulate('click');

        expect(window.$.ajax).toHaveBeenCalled();
        expect(showAlert).toHaveBeenLastCalledWith(
            'error',
            'Generating ERC725 claim',
            [['Server error', 'Server Error (500)']]
        );
    });

    it('displays a message if received an empty response from server', () => {
        const page = mount(<AddClaimToIdentityPage my_web3={web3}/>);
        const generateClaimButton = page.find('#generateClaim');

        for (const [field, value] of sample) {
            page.setState({ [field]: value });
        }
        window.$.ajax = jest.fn(({ success }) => success());
        generateClaimButton.simulate('click');

        expect(window.$.ajax).toHaveBeenCalled();
        expect(showAlert).toHaveBeenLastCalledWith(
            'error',
            'Generating ERC725 claim',
            [['Error', 'Empty response from server']]
        );
    });

    it('displays a message if received a not valid response', () => {
        const page = mount(<AddClaimToIdentityPage my_web3={web3}/>);
        const generateClaimButton = page.find('#generateClaim');

        for (const [field, value] of sample) {
            page.setState({ [field]: value });
        }
        window.$.ajax = jest.fn(({ success }) => success({ x_id: 'test', err: 'fake error' }));
        generateClaimButton.simulate('click');

        expect(window.$.ajax).toHaveBeenCalled();
        expect(showAlert).toHaveBeenLastCalledWith(
            'error',
            'Generating ERC725 claim',
            [['Request ID', 'test'], ['Error', 'fake error']]
        );
    });

    it('displays a message if received a response without the fields needed to generate the claim', () => {
        const page = mount(<AddClaimToIdentityPage my_web3={web3}/>);
        const generateClaimButton = page.find('#generateClaim');

        for (const [field, value] of sample) {
            page.setState({ [field]: value });
        }
        window.$.ajax = jest.fn(({ success }) => success({ ok: true, x_id: 'test' }));
        generateClaimButton.simulate('click');

        expect(window.$.ajax).toHaveBeenCalled();
        expect(showAlert).toHaveBeenLastCalledWith(
            'error',
            'Generating ERC725 claim',
            [['Request ID', 'test'], ['Error', 'Missing issuer address, signature, uri or hashed data field']]
        );
    });

});
