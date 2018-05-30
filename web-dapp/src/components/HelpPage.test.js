import React from 'react';
import { shallow } from 'enzyme';

import HelpPage from './HelpPage';

describe('<HelpPage />', () => {
    describe('in help page', () => {
        let wrapper;

        beforeAll(() => {
            wrapper = shallow(<HelpPage/>);
        });

        it('renders correctly', () => {
            expect(wrapper.find('.help-page')).toHaveLength(1);
        });
    });
});
