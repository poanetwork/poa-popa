import React from 'react';
import { mount } from 'enzyme';
import Web3 from 'web3';
import FakeProvider from 'web3-fake-provider';

import App from './App';
import Header from './Header';
import Footer from './Footer';
import IndexPage from './IndexPage'
import ConfirmationPage from './ConfirmationPage';

const web3 = new Web3(new FakeProvider());
const contract = require('../ProofOfPhysicalAddress.json');

const checkContract = jest.spyOn(App.prototype, 'check_contract');

describe('<App/>', () => {
    beforeAll(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.clearAllTimers();
    });

    it('renders without crashing', () => {
        const wrapper = mount(<App/>);

        jest.runTimersToTime(600);
        wrapper.setState({ web3Checker: true, my_web3: web3, contract });

        expect(wrapper.find(Header)).toHaveLength(1);
        expect(wrapper.find(Footer)).toHaveLength(1);
    });

    it('calls componentDidMount()', () => {
        const componentDidMount = jest.spyOn(App.prototype, 'componentDidMount');

        mount(<App/>);

        expect(componentDidMount).toHaveBeenCalled();
    });

    it('displays loading message', () => {
        const wrapper = mount(<App/>);

        expect(wrapper.find('.l-preload')).toHaveLength(1);
    });

    it('provides information if no wallet found', () => {
        const wrapper = mount(<App/>);

        jest.runTimersToTime(999);

        wrapper.setState({ my_web3: null, web3CheckerDur: 1001 });
        expect(wrapper.find('.title-mask').text()).toEqual('Wallet not found, or access to Ethereum account not granted');
    });

    it('detects when contract is not deployed', async () => {
        const wrapper = mount(<App/>);

        wrapper.setState({ my_web3: web3, contract: null });

        expect(wrapper.find('.title-mask').text()).toEqual('Contract is not deployed');
    });

    it('renders index page', async () => {
        const wrapper = mount(<App/>);

        jest.runTimersToTime(600);
        wrapper.setState({ web3Checker: true, my_web3: web3, contract });

        expect(wrapper.find(IndexPage)).toHaveLength(1);
    });

    it('renders confirmation page', async () => {
        Object.defineProperty(window.location, 'pathname', {
            writable: true,
            value: '/confirm'
        });

        const wrapper = mount(<App/>);

        jest.runTimersToTime(600);
        wrapper.setState({ web3Checker: true, my_web3: web3, contract,  });

        expect(wrapper.find(ConfirmationPage)).toHaveLength(1);
    });

    describe('checks contract', () => {
        beforeAll(() => {
            window.my_web3 = web3;
        });

        it('contract is OK', () => {
            const wrapper = mount(<App/>);

                window.my_web3.eth.getCode = jest.fn((address, callback) => {
                return callback(null, ['0x123', '0x456', '0x789']);
            });

            window.my_web3.eth.contract = jest.fn(() => {
                return {
                    at: jest.fn(() => {
                        return {
                            owner: jest.fn((callback) => {
                                return callback(null, [1, 2, 3]);
                            })
                        };
                    })
                };
            });

            jest.runTimersToTime(600);

            expect(checkContract).toHaveBeenCalled();
            expect(wrapper.state('contract')).toBeDefined();
            expect(wrapper.state('my_web3')).toBe(web3);
            expect(wrapper.state('web3Checker')).toBeNull();
            expect(wrapper.state('web3CheckerDur')).toBe(0);
        });

        it('contract is not OK', () => {
            const wrapper = mount(<App/>);

            window.my_web3.eth.getCode = jest.fn((address, callback) => {
                return callback(true);
            });

            jest.runTimersToTime(600);

            expect(checkContract).toHaveBeenCalled();
            expect(wrapper.state('contract')).toBeNull();
            expect(wrapper.state('my_web3')).toBe(web3);
            expect(wrapper.state('web3Checker')).toBeNull();
            expect(wrapper.state('web3CheckerDur')).toBe(0);
        });

        it('contract is not OK', () => {
            const wrapper = mount(<App/>);

            window.my_web3.eth.getCode = jest.fn((address, callback) => {
                return callback(null, []);
            });

            jest.runTimersToTime(600);

            expect(checkContract).toHaveBeenCalled();
            expect(wrapper.state('contract')).toBeNull();
            expect(wrapper.state('my_web3')).toBe(web3);
            expect(wrapper.state('web3Checker')).toBeNull();
            expect(wrapper.state('web3CheckerDur')).toBe(0);
        });

        it('contract is not OK', () => {
            const wrapper = mount(<App/>);

            window.my_web3.eth.getCode = jest.fn((address, callback) => {
                return callback(null, ['0x123', '0x456', '0x789']);
            });

            window.my_web3.eth.contract = jest.fn(() => {
                return {
                    at: jest.fn(() => {
                        return {
                            owner: jest.fn((callback) => {
                                return callback(true);
                            })
                        };
                    })
                };
            });

            jest.runTimersToTime(600);

            expect(checkContract).toHaveBeenCalled();
            expect(wrapper.state('contract')).toBeNull();
            expect(wrapper.state('my_web3')).toBe(web3);
            expect(wrapper.state('web3Checker')).toBeNull();
            expect(wrapper.state('web3CheckerDur')).toBe(0);
        });

        it('contract is not OK', () => {
            const wrapper = mount(<App/>);

            window.my_web3.eth.getCode = jest.fn((address, callback) => {
                return callback(null, ['0x123', '0x456', '0x789']);
            });

            window.my_web3.eth.contract = jest.fn(() => {
                return {
                    at: jest.fn(() => {
                        return {
                            owner: jest.fn((callback) => {
                                return callback(true);
                            })
                        };
                    })
                };
            });

            jest.runTimersToTime(600);

            expect(checkContract).toHaveBeenCalled();
            expect(wrapper.state('contract')).toBeNull();
            expect(wrapper.state('my_web3')).toBe(web3);
            expect(wrapper.state('web3Checker')).toBeNull();
            expect(wrapper.state('web3CheckerDur')).toBe(0);
        });

        it('contract is not OK', () => {
            const wrapper = mount(<App/>);

            window.my_web3.eth.getCode = jest.fn((address, callback) => {
                return callback(null, ['0x123', '0x456', '0x789']);
            });

            window.my_web3.eth.contract = jest.fn(() => {
                return {
                    at: jest.fn(() => {
                        return {
                            owner: jest.fn((callback) => {
                                return callback(null, []);
                            })
                        };
                    })
                };
            });

            jest.runTimersToTime(600);

            expect(checkContract).toHaveBeenCalled();
            expect(wrapper.state('contract')).toBeNull();
            expect(wrapper.state('my_web3')).toBe(web3);
            expect(wrapper.state('web3Checker')).toBeNull();
            expect(wrapper.state('web3CheckerDur')).toBe(0);
        });
    });
});
