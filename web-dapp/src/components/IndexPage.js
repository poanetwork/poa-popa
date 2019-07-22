import React from 'react';
import { Link } from 'react-router-dom';

const REACT_APP_PRICE = process.env.REACT_APP_PRICE;
const REACT_APP_PRICE_SYMBOL = process.env.REACT_APP_PRICE_SYMBOL;

class IndexPage extends React.Component {
    render () {
        return (
            <div className="content home-page">
                <div className="col-md-12">
                    <h1 className="main-title">Proof of Physical Address</h1>
                    <p className="main-text">
                        Complete the form with your information to verify your physical address and remember that you can register as many physical addresses as you want.
                    </p>
                    <p className="main-text">
                        <strong>{REACT_APP_PRICE} {REACT_APP_PRICE_SYMBOL}</strong> is the price we charge for sending a postcard to you for each physical address verification.
                        </p>
                    <p className="main-text">If you have questions about how it works, check our help.</p>
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
                        Finish the process
                    </h4>
                    <p className="second-text">Complete the process by confirming the verification code that you received in the postcard. You can also consult and manage all your registered addresses, whether they are verified or not.</p>
                    <Link to="/confirm">
                        <button className="primary-btn mt-3">
                            Verify postcard/letter
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
