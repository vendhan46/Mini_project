import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Emotion.css';

const EmotionDetection = () => {
  const { state } = useLocation(); // Extract state (emotion, image) from location
  const navigate = useNavigate();
  const [error, setError] = useState(null); // State to handle error messages

  const handleOption = async (choice) => {
    let emotion = state.emotion;
  
    try {
      if (choice === 'change') {
        const response = await axios.post('http://127.0.0.1:5000/change_emotion', { emotion });
        emotion = response.data.new_emotion; // Get the new emotion from the backend
        navigate('/music-player', { state: { emotion, songUrl: response.data.song_url } });
      } else {
        const response = await axios.post('http://127.0.0.1:5000/recommend_music', { emotion });
        navigate('/music-player', { state: { emotion, songUrl: response.data.song_url } });
      }
    } catch (error) {
      console.error('Error detecting emotion:', error);
      
      // If the error response is 400, set a specific error message for "Face not detected"
      if (error.response && error.response.status === 400) {
        setError(error.response);
      } else {
        // For any other errors, you can show a generic message
        setError('An error occurred. Please try again.');
      }
    }
  };
  

  const recapture = () => {
    setError(null); // Clear any previous error messages
    navigate('/webcapture');
  };

  return (
    <div className='emotion'>
      <div className='head'>
      <h2 className='one'>Face Recognized !!!  </h2>
      <h2> Detected Emotion:<div className='emo'> {state.emotion}</div></h2>
      </div>
      
      <img src={`data:image/png;base64,${state.image}`} alt="Captured" className='imgg'  />
      
      {/* Display error message if any */}
      {error && <p className="error-message">{error}</p>}

      <div className='but'>
        {!error ? (
          <>
            <button onClick={() => handleOption('soak')}>Soak in Emotion</button>
            <button onClick={() => handleOption('change')}>Change the Mood</button>
            <p>- OR -</p>
            <button onClick={recapture}>Recapture</button>
          </>
        ) : (
          <>
            <button onClick={recapture}>Recapture</button>
          </>
        )}
      </div>
    </div>
  );
};

export default EmotionDetection;
