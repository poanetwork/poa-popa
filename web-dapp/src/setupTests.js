import Enzyme from 'enzyme';
import EnzymeAdapter from 'enzyme-adapter-react-15';

// Configure Enzyme
Enzyme.configure({ adapter: new EnzymeAdapter() });

// External libraries stubs
global.swal = jest.fn();
global.Swipe = jest.fn((element, { callback }) => callback(0));
global.$ = jest.fn(() => {
    const jQuery = {
        on: jest.fn(),
        ajax: jest.fn(),
        removeClass: jest.fn(() => jQuery),
        eq: jest.fn(() => jQuery),
        addClass: jest.fn(() => jQuery),
    };

    return jQuery;
});
