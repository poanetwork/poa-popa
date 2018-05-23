import React from 'react';
import { Link } from 'react-router-dom';

class Header extends React.Component {
    render () {
        return (
            <div className="col-md-12">
                <Link to="/">
                    <a className="logo" href="/"></a>
                </Link>
            </div>
        );
    }
}

export default Header;
