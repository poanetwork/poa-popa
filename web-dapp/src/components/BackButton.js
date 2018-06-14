import React from 'react';

import { Link } from 'react-router-dom';

export default () => (
    <Link to="/" className="primary-btn mt-3">
        Back
        <img className="btn-arrow btn-back" src={require('../assets/images/back.svg')} alt="arrow" />
    </Link>
);
