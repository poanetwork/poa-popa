import React from 'react';
import { spy, stub } from 'sinon';
import { mount } from 'enzyme';

import App from './App';

spy(App.prototype, 'componentDidMount');

describe('<App/>', () => {
  before(() => {
    global.setInterval = stub();
  });

  it('renders without crashing', () => {
    const wrapper = mount(<App/>);

    expect(App.prototype.componentDidMount.calledOnce).to.equal(true);
  });
});
