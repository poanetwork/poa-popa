import React from 'react';
import { Link } from 'react-router-dom';

class Header extends React.Component {
    render () {
        const verifyButton = window.location.pathname !== '/confirm'
            ? <Link to="/confirm" className="button button_verify">Verify postcard</Link>
            : '';

        return (
            <header className="header">
                <div className="container">
                    <Link to="/" className="logo" title="Register address"/>
                    <Link to="/my-addresses" className="button button_my_addresses">My Addresses</Link>
                    {verifyButton}
                </div>
            </header>
        );
    }
}

export default Header;
