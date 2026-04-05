import React from 'react';
import './ComingSoon.css';

const ComingSoon = ({ title, description }) => {
  return (
    <div className='coming-soon-card'>
      <p className='coming-soon-label'>Coming soon</p>
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  );
};

export default ComingSoon;