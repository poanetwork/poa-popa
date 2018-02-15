import React from 'react';
import { mount } from 'enzyme';

import Footer from './Footer';

describe('<Footer />', () => {
  it('renders correctly', () => {
    const wrapper = mount(<Footer/>);

    expect(wrapper.find('.footer')).to.have.lengthOf(1);
  });
});