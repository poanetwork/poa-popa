import React from 'react';
import { shallow } from 'enzyme';

import Header from './Header';

describe('<Header />', () => {
  it('renders correctly', () => {
    const wrapper = shallow(<Header/>);

    expect(wrapper.find('.header')).toHaveLength(1);
  });
});