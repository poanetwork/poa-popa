import React from 'react';
import { mount } from 'enzyme';

import RegisterAddressPage from './RegisterAddressPage';

describe('<RegisterAddressPage />', () => {
  it('renders correctly', () => {
    const page = mount(
      <RegisterAddressPage/>
    );

    expect(page.root()).to.have.lengthOf(1);
  });
});

