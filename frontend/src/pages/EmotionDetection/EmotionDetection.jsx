import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { trackHistory } from '../../utils/history';
import './Emotion.css';

const EmotionDetection = () => {
  const { state } = useLocation(); // Extract state (emotion, image) from location
  const navigate = useNavigate();
  const [error, setError] = useState(null); // State to handle error messages

  const handleOption = async (choice) => {
    if (!state?.emotion) {
      navigate('/webcapture');
      return;
    }

    let emotion = state.emotion;
  
    try {
      if (choice === 'change') {
        const response = await api.post('/change_emotion', { emotion });
        emotion = response.data.new_emotion; // Get the new emotion from the backend

        await trackHistory({
          detectedEmotion: state.emotion,
          finalEmotion: emotion,
          songUrl: response.data.song_url,
          action: 'mood_changed',
        });

        navigate('/music-player', { state: { emotion, songUrl: response.data.song_url, detectedEmotion: state.emotion } });
      } else {
        const response = await api.post('/recommend_music', { emotion });

        await trackHistory({
          detectedEmotion: state.emotion,
          finalEmotion: emotion,
          songUrl: response.data.song_url,
          action: 'soak_emotion',
        });

        navigate('/music-player', { state: { emotion, songUrl: response.data.song_url, detectedEmotion: state.emotion } });
      }
    } catch (error) {
      console.error('Error detecting emotion:', error);
      
      // If the error response is 400, set a specific error message for "Face not detected"
      if (error.response && error.response.status === 400) {
        setError(error.response?.data?.error || 'Unable to process emotion. Please try again.');
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
      {!state?.emotion ? (
        <div className='head'>
          <h2>No captured emotion found. Please capture again.</h2>
          <button onClick={recapture}>Go to Capture</button>
        </div>
      ) : (
        <>
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
      </>
      )}
    </div>
  );
};

export default EmotionDetection;
