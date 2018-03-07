import React from 'react';
import { Link } from 'react-router-dom';

import '../assets/stylesheets/application.css';

class Header extends React.Component {
    render () {
        const verifyButton = window.location.pathname !== '/confirm'
            ? <Link to="/confirm" className="button button_verify">Verify postcard</Link>
            : '';

        return (
            <header className="header">
                <div className="container">
                    <Link to="/" className="logo" title="Register address"/>
                    {verifyButton}
                </div>
            </header>
        );
    }
}

export default Header;
