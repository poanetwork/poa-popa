import 'mocha';
import 'chai/register-expect';
import 'chai/register-should';

import { stub } from 'sinon';
import { JSDOM } from 'jsdom';
import Enzyme from 'enzyme';
import EnzymeAdapter from 'enzyme-adapter-react-15';

// Prevent mocha tests from breaking when trying to require a CSS file
require.extensions['.css'] = stub();

// Configure JSDOM
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');

global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator; // { userAgent: 'node.js' };

const src = dom.window;
const target = global;

const props = Object.getOwnPropertyNames(src)
  .filter(prop => typeof target[prop] === 'undefined')
  .reduce((result, prop) =>
      Object.assign({},
        result,
        { [prop]: Object.getOwnPropertyDescriptor(src, prop) }),
    {});

Object.defineProperties(target, props);

// External libraries stubs
global.window.swal = stub();
global.window.Swipe = stub();
global.window.$ = () => ({ on: function () {} });

// Configure Enzyme
Enzyme.configure({ adapter: new EnzymeAdapter() });
