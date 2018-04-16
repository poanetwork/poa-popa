import React from 'react';

export const Loading = ({ show }) => {
    if (show) {
        return (<div className="loading-container">
            <div className="loading">
                <div className="loading-i"/>
                <div className="loading-i"/>
                <div className="loading-i"/>
                <div className="loading-i"/>
                <div className="loading-i"/>
                <div className="loading-i"/>
            </div>
        </div>);
    } else {
        return (<div/>);
    }
};
