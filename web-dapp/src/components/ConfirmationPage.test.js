import React from 'react';
import { mount } from 'enzyme';

import ConfirmationPage from './ConfirmationPage';

describe('<ConfirmationPage />', () => {
  it('renders correctly', () => {
    const page = mount(<ConfirmationPage/>);

    expect(page.root()).toHaveLength(1);
  });
});