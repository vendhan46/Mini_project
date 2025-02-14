import React from 'react';
import './HomePage.css'
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();

  const goToWebcapture = () => {
    navigate('/webcapture');
  };

  return (
    <div className='home'>
      <h1>Feel the vibes, let your emotions guide the music !!</h1>
      <button onClick={goToWebcapture}>Start Capturing Emotion</button>
    </div>
  );
};

export default HomePage;
