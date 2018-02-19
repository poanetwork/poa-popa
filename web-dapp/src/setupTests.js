import Enzyme from 'enzyme';
import EnzymeAdapter from 'enzyme-adapter-react-15';

// Configure Enzyme
Enzyme.configure({ adapter: new EnzymeAdapter() });

// External libraries stubs
global.swal = jest.fn();
global.Swipe = jest.fn();
global.$ = jest.fn(() => ({ on: jest.fn() }));
