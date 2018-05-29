import React from 'react';
import { Link } from 'react-router-dom';

class IndexPage extends React.Component {
    render () {
        return (
            <div className="content">
                <div className="col-md-12">
                    <h1 className="main-title">Proof of Physical Address</h1>
                    <p className="main-text">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
                        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
                        exercitation ullamco laboris.</p>
                    <Link to="/help">
                        <button className="primary-btn mt-3">
                            How it works
                            <img className="btn-arrow" src={require('../assets/images/how-it-works.svg')} alt="how-it-works" />
                        </button>
                    </Link>
                    <Link to="/register">
                        <button className="action-btn mt-3">
                            Continue
                            <img className="btn-arrow" src={require('../assets/images/arrow.svg')} alt="arrow" />
                        </button>
                    </Link>
                </div>
                <div className="col-md-12">
                    <h4 className="second-title">
                        Lorem ipsum dolor sit amet
                    </h4>
                    <p className="second-text">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
                        tempor incididunt ut labore et dolore magna aliqua.</p>
                    <Link to="/confirm">
                        <button className="primary-btn mt-3">
                            Verify postcard
                            <img className="btn-arrow" src={require('../assets/images/verify.svg')} alt="verify" />
                        </button>
                    </Link>
                    <Link to="/my-addresses">
                        <button className="primary-btn mt-3">
                            My addresses
                            <img className="btn-arrow" src={require('../assets/images/my-addresses.svg')} alt="my-addresses" />
                        </button>
                    </Link>
                </div>
            </div>
        );
    }
}

export default IndexPage;
