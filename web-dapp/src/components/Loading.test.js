import React from 'react';
import { shallow } from 'enzyme';

import { Loading } from './Loading';

describe('<Loading />', () => {
  it('renders correctly', () => {
    const wrapper = shallow(
      <Loading show={true}/>
    );

    expect(wrapper.find('.loading-container')).to.have.lengthOf(1);
  });
});
