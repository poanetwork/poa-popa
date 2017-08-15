import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import '../assets/stylesheets/application.css';

class Header extends Component {
    render() {
        return (
            <header className="header">
            <div className="container">
                <Link to="/"><a href="#" className="logo" title="Register address"></a></Link>
                {window.location.pathname !== '/confirm' ? <Link to="/confirm"><a href="#" className="button button_verify">Verify postcard</a></Link> : ''}
            </div>
            </header>
        );
    }
}

export default Header;
