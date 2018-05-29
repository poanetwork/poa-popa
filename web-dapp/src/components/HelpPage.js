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
