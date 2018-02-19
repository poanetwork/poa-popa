import React from 'react';
import ReactDOM from 'react-dom';

import App from './App';

describe('<App/>', () => {
  it('renders without crashing', () => {
    const app = document.createElement('div');

    ReactDOM.render(<App/>, app);
  });
});
