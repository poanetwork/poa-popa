import React from 'react';
import { mount } from 'enzyme';
import Web3 from 'web3';
import FakeProvider from 'web3-fake-provider';

import App from './App';
import Header from './Header';
import Footer from './Footer';
import RegisterAddressPage from './RegisterAddressPage';
import ConfirmationPage from './ConfirmationPage';

const web3 = new Web3(new FakeProvider());
const contract = require('../../test/server/_utils/mock-contract-output');

const checkContract = jest.spyOn(App.prototype, 'check_contract');

jest.mock('../contract-output', () => {
    return require('../../test/server/_utils/mock-contract-output');
});

describe('<App/>', () => {
    beforeAll(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.clearAllTimers();
    });

    it('renders without crashing', () => {
        const wrapper = mount(<App/>);

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

        expect(wrapper.find('h2').text()).toEqual('Loading, please wait');
    });

    it('provides download information if no MetaMask found', () => {
        const wrapper = mount(<App/>);

        wrapper.setState({ my_web3: null, web3_checker_dur: 500 });
        expect(wrapper.find('h2').text()).toEqual('Loading, please wait');

        jest.runTimersToTime(999);

        wrapper.setState({ my_web3: null, web3_checker_dur: 1001 });
        expect(wrapper.find('h2').text()).toEqual('No MetaMask found!');
    });

    it('detects when contract is not deployed', async () => {
        const wrapper = mount(<App/>);

        wrapper.setState({ my_web3: web3, contract: null });

        expect(wrapper.find('h2').text()).toEqual('Contract is not deployed');
    });

    it('renders register address page', async () => {
        const wrapper = mount(<App/>);

        jest.runTimersToTime(600);
        wrapper.setState({ web3_checker: true, my_web3: web3, contract });

        expect(wrapper.find(RegisterAddressPage)).toHaveLength(1);
    });

    it('renders confirmation page', async () => {
        Object.defineProperty(window.location, 'pathname', {
            writable: true,
            value: '/confirm'
        });

        const wrapper = mount(<App/>);

        jest.runTimersToTime(600);
        wrapper.setState({ web3_checker: true, my_web3: web3, contract,  });

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
            expect(wrapper.state('web3_checker')).toBeNull();
            expect(wrapper.state('web3_checker_dur')).toBe(0);
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
            expect(wrapper.state('web3_checker')).toBeNull();
            expect(wrapper.state('web3_checker_dur')).toBe(0);
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
            expect(wrapper.state('web3_checker')).toBeNull();
            expect(wrapper.state('web3_checker_dur')).toBe(0);
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
            expect(wrapper.state('web3_checker')).toBeNull();
            expect(wrapper.state('web3_checker_dur')).toBe(0);
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
            expect(wrapper.state('web3_checker')).toBeNull();
            expect(wrapper.state('web3_checker_dur')).toBe(0);
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
            expect(wrapper.state('web3_checker')).toBeNull();
            expect(wrapper.state('web3_checker_dur')).toBe(0);
        });
    });
});
