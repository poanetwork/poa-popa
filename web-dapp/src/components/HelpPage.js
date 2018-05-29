import React from 'react';

class HelpPage extends React.Component {
    render () {
        return (
            <div className="content">
                <div className="col-md-12">
                    <h1 className="main-title">How it works?</h1>
                    <p className="main-text">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
                        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
                        exercitation ullamco laboris.</p>
                    <div className="how-to swipe" id="slider">
                        <div className="swipe-wrap">
                            <div className="how-to-i how-to-i_fill-form">
                                <p className="how-to-title">
                                    <span>Step 1: </span>
                                    Fill form
                                </p>
                                <p className="how-to-description">
                                    Fill the form with your full name and postal address
                                </p>
                            </div>
                            <div className="how-to-i how-to-i_sign-transaction">
                                <p className="how-to-title">
                                    <span>Step 2: </span>
                                    Sign transaction
                                </p>
                                <p className="how-to-description">
                                    Sign transaction in MetaMask to add your data to smart contract and send you
                                    a postcard
                                </p>
                            </div>
                            <div className="how-to-i how-to-i_get-postcard">
                                <p className="how-to-title">
                                    <span>Step 3: </span>
                                    Get postcard
                                </p>
                                <p className="how-to-description">
                                    Check your mailbox for the postcard with confirmation code on it
                                </p>
                            </div>
                            <div className="how-to-i how-to-i_type-code">
                                <p className="how-to-title">
                                    <span>Step 4: </span>
                                    Type code
                                </p>
                                <p className="how-to-description">
                                    Open the webpage specified on the postcard and type in confirmation code
                                </p>
                            </div>
                            <div className="how-to-i how-to-i_finalize-proof">
                                <p className="how-to-title">
                                    <span>Step 5: </span>
                                    Finalize proof
                                </p>
                                <p className="how-to-description">
                                    Sign the second transaction to verify the code and finalize the process
                                </p>
                            </div>
                        </div>
                        <div className="how-to-navigation">
                            <div className="how-to-navigation-i how-to-navigation-i_active"/>
                            <div className="how-to-navigation-i"/>
                            <div className="how-to-navigation-i"/>
                            <div className="how-to-navigation-i"/>
                            <div className="how-to-navigation-i"/>
                        </div>
                    </div>
                    <a href="/" className="primary-btn mt-3">
                        Back
                        <img className="btn-arrow btn-back" src={require('../assets/images/back.svg')} alt="arrow" />
                    </a>
                </div>
            </div>
        );
    }
}

export default HelpPage;
