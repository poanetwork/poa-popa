import React from 'react';
import { Link } from 'react-router-dom';

class Header extends React.Component {
    render () {
        return (
            <div className="col-md-12 header">
                <Link to="/" className="logo"></Link>
            </div>
        );
    }
}

export default Header;
