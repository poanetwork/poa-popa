import React from 'react';
import { shallow } from 'enzyme';

import IndexPage from './IndexPage';

describe('<IndexPage />', () => {
    describe('in home page', () => {
        let wrapper;

        beforeAll(() => {
            wrapper = shallow(<IndexPage/>);
        });

        it('renders correctly', () => {
            expect(wrapper.find('.home-page')).toHaveLength(1);
        });

        it('renders 4 buttons', () => {
            expect(wrapper.find('button')).toHaveLength(4);
        });
    });
});
