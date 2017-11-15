import React from 'react';
import '../assets/stylesheets/application.css';

export const Loading = ({show}) => {
  console.log('Loading, state updated: ' + show);
  if (show) {
    return (<div className="loading-container">
      <div className="loading">
        <div className="loading-i"></div>
        <div className="loading-i"></div>
        <div className="loading-i"></div>
        <div className="loading-i"></div>
        <div className="loading-i"></div>
        <div className="loading-i"></div>
      </div>
    </div>);
  }
  else {
    return (<div></div>);
  }
}
