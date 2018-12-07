import React from 'react';
import { BrowserRouter } from 'react-router-dom'
import { mount, shallow } from 'enzyme';

import AddClaimToIdentityPage from './AddClaimToIdentityPage';
import BackButton from './BackButton';

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

const issueErc735ClaimOkResponse = {
    data : "0x347e05694d7ed94f9f9964e2d1998bce98ebf62437e01a868f2e4ef206ba038a",
    issuerAddress : "0xd0a01db20de37853c02bd33619485ef1ab961929",
    ok: true,
    signature: "0xccedc54ae3e8f7ed65769496a51ee995051cae915d67d9b402b42295ad96e70029fb8aa1d5d22bbaf976e4fe02c80c03dc0f8f1d099c615475fbdfafb88762fc00",
    uri : "http://popa.poa.network",
};

describe('<AddClaimToIdentityPage />', () => {
    it('renders correctly', () => {
        const page = mount(<AddClaimToIdentityPage/>);

        expect(page.root()).toHaveLength(1);
        expect(page.find('.claim-form-container')).toHaveLength(1);
        for (const field of fields) {
            expect(page.find(`[name="${field}"]`)).toHaveLength(1);
        }
        expect(page.find('#btnSubmit')).toHaveLength(1);
        expect(page.find(BackButton)).toHaveLength(1);
        expect(page.find('#addToIdentity')).toHaveLength(1);
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
        const generateClaimButton = page.find('#btnSubmit');
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
        const generateClaimButton = page.find('#btnSubmit');
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
        const generateClaimButton = page.find('#btnSubmit');

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
            'Generating ERC735 claim',
            [['Server error', 'Server Error (500)']]
        );
    });

    it('displays a message if received an empty response from server', () => {
        const page = mount(<AddClaimToIdentityPage my_web3={web3}/>);
        const generateClaimButton = page.find('#btnSubmit');

        for (const [field, value] of sample) {
            page.setState({ [field]: value });
        }
        window.$.ajax = jest.fn(({ success }) => success());
        generateClaimButton.simulate('click');

        expect(window.$.ajax).toHaveBeenCalled();
        expect(showAlert).toHaveBeenLastCalledWith(
            'error',
            'Generating ERC735 claim',
            [['Error', 'Empty response from server']]
        );
    });

    it('displays a message if received a not valid response', () => {
        const page = mount(<AddClaimToIdentityPage my_web3={web3}/>);
        const generateClaimButton = page.find('#btnSubmit');

        for (const [field, value] of sample) {
            page.setState({ [field]: value });
        }
        window.$.ajax = jest.fn(({ success }) => success({ x_id: 'test', err: 'fake error' }));
        generateClaimButton.simulate('click');

        expect(window.$.ajax).toHaveBeenCalled();
        expect(showAlert).toHaveBeenLastCalledWith(
            'error',
            'Generating ERC735 claim',
            [['Request ID', 'test'], ['Error', 'fake error']]
        );
    });

    it('displays a message if received a response without the fields needed to generate the claim', () => {
        const page = mount(<AddClaimToIdentityPage my_web3={web3}/>);
        const generateClaimButton = page.find('#btnSubmit');

        for (const [field, value] of sample) {
            page.setState({ [field]: value });
        }
        window.$.ajax = jest.fn(({ success }) => success({ ok: true, x_id: 'test' }));
        generateClaimButton.simulate('click');

        expect(window.$.ajax).toHaveBeenCalled();
        expect(showAlert).toHaveBeenLastCalledWith(
            'error',
            'Generating ERC735 claim',
            [['Request ID', 'test'], ['Error', 'Missing issuer address, signature, uri or hashed data field']]
        );
    });

    it('should show the generated erc735 claim, given a valid response was received', () => {
        const page = mount(<AddClaimToIdentityPage my_web3={web3}/>);
        const generateClaimButton = page.find('#btnSubmit');

        for (const [field, value] of sample) {
            page.setState({ [field]: value });
        }
        window.$.ajax = jest.fn((args) => args.success(issueErc735ClaimOkResponse));
        generateClaimButton.simulate('click');

        expect(window.$.ajax).toHaveBeenCalled();
        const ercClaimData = page.find('.erc735-claim-data');
        expect(ercClaimData).toHaveLength(1);
    });

    it('should display alert message if erc735 claim is not generated and add claim button is clicked', () => {
        window.$.ajax = jest.fn();

        const page = mount(<AddClaimToIdentityPage/>);
        const addToIdentity = page.find('#addToIdentity');
        page.setProps({ my_web3: web3 });
        addToIdentity.simulate('click');

        expect(showAlert).toHaveBeenLastCalledWith(
            'warning',
            'Execute add claim',
            `The ERC-735 claim must be generated first`
        );
    });

    it('should send a transaction to add the generated erc735 claim to the specified identity contract', () => {
      const page = mount(<AddClaimToIdentityPage my_web3={web3}/>);
      page.setProps({ my_web3: web3 });

      // Simulate erc735 claim generation
      for (const [field, value] of sample) {
          page.setState({ [field]: value });
      }
      window.$.ajax = jest.fn((args) => args.success(issueErc735ClaimOkResponse));
      const generateClaimButton = page.find('#btnSubmit');
      generateClaimButton.simulate('click');
      const ercClaimData = page.find('.erc735-claim-data');

      // Mock web3/contracts methods
      const userIdentityContractInstanceMock = {
        addClaim: { getData: () => true },
        execute: { getData: () => true }
      }
      const contractResultMock = {
        at: () => userIdentityContractInstanceMock
      };
      web3.eth.contract = jest.fn(() => contractResultMock);
      web3.eth.sendTransaction = jest.fn((options, cb) => {
        cb(null, 'fakeTxId')
      });

      // Simulate successful add to identity invocation
      const addToIdentity = page.find('#addToIdentity');
      addToIdentity.simulate('click');
      expect(web3.eth.sendTransaction).toHaveBeenCalledWith(
          expect.objectContaining({
              from: web3.eth.accounts[0],
              to: sample.get('identitycontractaddress'),
          }),
          expect.anything()
      );
    });

});
