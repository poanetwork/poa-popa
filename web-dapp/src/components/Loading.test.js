import React from 'react';
import { mount } from 'enzyme';

import { Loading } from './Loading';

describe('<Loading />', () => {
    it('renders correctly', () => {
        const wrapper = mount(<Loading show={true}/>);

        expect(wrapper.find('.loading-container')).toHaveLength(1);
    });
});
