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
        });

        it('renders logo', () => {
            expect(wrapper.find('.header .logo')).toHaveLength(1);
        });
    });
});
