import React from 'react';
import { shallow } from 'enzyme';

import Header from './Header';

describe('<Header />', () => {
    describe('in home page', () => {
        let wrapper;

        beforeAll(() => {
            wrapper = shallow(<Header/>);
        });

        it('renders correctly', () => {
            expect(wrapper.find('.header')).toHaveLength(1);
            expect(wrapper.find('.header .container')).toHaveLength(1);
        });

        it('renders logo', () => {
            expect(wrapper.find('.header .container .logo')).toHaveLength(1);
        });

        it('renders verify button', () => {
            expect(wrapper.find('.header .container .button_verify')).toHaveLength(1);
        });
    });

    describe('in confirmation page', () => {
        let wrapper;

        beforeAll(() => {
            Object.defineProperty(window.location, 'pathname', {
                writable: true,
                value: '/confirm'
            });

            wrapper = shallow(<Header/>);
        });

        it('renders correctly', () => {
            expect(wrapper.find('.header')).toHaveLength(1);
            expect(wrapper.find('.header .container')).toHaveLength(1);
        });

        it('renders logo', () => {
            expect(wrapper.find('.header .container .logo')).toHaveLength(1);
        });

        it('not renders verify button', () => {
            expect(wrapper.find('.header .container .button_verify')).toHaveLength(0);
        });
    });
});
