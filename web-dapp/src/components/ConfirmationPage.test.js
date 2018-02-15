import React from 'react';
import { mount } from 'enzyme';
import { stub } from 'sinon';

import ConfirmationPage from './ConfirmationPage';

describe('<ConfirmationPage />', () => {
  it('renders correctly', () => {
    stub(console, 'log');

    const page = mount(
      <ConfirmationPage/>
    );

    expect(page.root()).to.have.lengthOf(1);

    console.log.restore();
  });
});