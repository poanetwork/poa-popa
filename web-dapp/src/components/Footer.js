import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import '../assets/stylesheets/application.css';

class Footer extends Component {
    render() {
        return (
            <footer className="footer">
                <div className="container">
                <p className="rights">2017 Oracles. All rights reserved.</p>
                <a href="#" className="logo"></a>
                <div className="socials">
                    <a href="https://twitter.com/oraclesorg" className="social social_twitter"></a>
                    <a href="https://t.me/oraclesnetwork" className="social social_telegram"></a>
                    <a href="https://github.com/oraclesorg" className="social social_github"></a>
                </div>
                </div>
            </footer>
        );
    }
}

export default Footer;
