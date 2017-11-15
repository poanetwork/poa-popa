import React from 'react';
import '../assets/stylesheets/application.css';

export const Loading = ({show}) => {
  console.log('Changing state!: ' + show);
  return <div className={show?"loading-container":""}>
    <div className="loading">
      <div className="loading-i"></div>
      <div className="loading-i"></div>
      <div className="loading-i"></div>
      <div className="loading-i"></div>
      <div className="loading-i"></div>
      <div className="loading-i"></div>
    </div>
  </div>
}
