import React from 'react';

class Footer extends React.Component {
    render () {
        return (
            <footer className="footer">
                <div className="container">
                    <p className="rights">{new Date().getFullYear()} POA Network. All rights reserved.</p>
                    <a href="/" className="logo"><span/></a>
                    <div className="socials">
                        <a href="https://twitter.com/poanetwork" className="social social_twitter"><span/></a>
                        <a href="https://t.me/oraclesnetwork" className="social social_telegram"><span/></a>
                        <a href="https://github.com/poanetwork" className="social social_github"><span/></a>
                    </div>
                </div>
            </footer>
        );
    }
}

export default Footer;
