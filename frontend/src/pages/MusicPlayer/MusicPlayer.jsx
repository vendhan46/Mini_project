import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ReactPlayer from 'react-player';
import api from '../../utils/api';
import { trackHistory } from '../../utils/history';
import './MusicPlayer.css'

const MusicPlayer = () => {
  const { state } = useLocation(); // Extract emotion and songUrl from location state
  const { emotion, songUrl } = state || {}; // Fallback to avoid undefined access
  const detectedEmotion = state?.detectedEmotion || emotion;
  const [currentSongUrl, setCurrentSongUrl] = useState(songUrl); // Store the current song URL
  const [musicEnded, setMusicEnded] = useState(false); // Check if music ended
  const [loading, setLoading] = useState(true); // Loading state for song
  const navigate = useNavigate();

  useEffect(() => {
    if (currentSongUrl) {
      setLoading(false); // Set loading to false once song URL is available
    }
  }, [currentSongUrl]);

  // Fetch another song URL for the same emotion
  const fetchNewSongForEmotion = async () => {
    try {
      setLoading(true); // Start loading when fetching a new song
      const response = await api.post('/recommend_music', { emotion });
      setCurrentSongUrl(response.data.song_url); // Update the song URL with the new one

      await trackHistory({
        detectedEmotion,
        finalEmotion: emotion,
        songUrl: response.data.song_url,
        action: 'continue_same_emotion',
      });

      setLoading(false); // Stop loading after fetching the song
      setMusicEnded(false); // Reset musicEnded state
    } catch (error) {
      console.error('Error fetching new song:', error);
      setLoading(false); // Stop loading in case of an error
    }
  };

  // Handle the end of the song in ReactPlayer
  const handleSongEnded = () => {
    setMusicEnded(true); // Set musicEnded to true when the song finishes
    trackHistory({
      detectedEmotion,
      finalEmotion: emotion,
      songUrl: currentSongUrl,
      action: 'song_finished',
    });
  };

  // Handle user's choice: continue with the same emotion or detect emotion again
  const handleChoice = (choice) => {
    if (choice === 'continue') {
      fetchNewSongForEmotion(); // Fetch a new song for the same emotion
    } else if (choice === 'detect') {
      trackHistory({
        detectedEmotion,
        finalEmotion: emotion,
        songUrl: currentSongUrl,
        action: 'detect_again_selected',
      });
      navigate('/webcapture'); // Redirect to the emotion detection page
    }
  };

  if (!emotion) {
    return (
      <div className='music-empty-state'>
        <h2>Music is ready after capture</h2>
        <p>
          Open Capture first so the app can detect an emotion and recommend the right track.
        </p>
        <button onClick={() => navigate('/capture')}>Go to Capture</button>
      </div>
    );
  }

  if (loading) {
    return <div className='load'>Loading song...</div>; // Show loading state while fetching the song URL
  }

  return (
    <div className='overall'>
      <div className='player'>
      {currentSongUrl ? (
        // Use ReactPlayer to play the song
        <ReactPlayer
          url={currentSongUrl}
          playing={true}
          controls={true}
          onEnded={handleSongEnded}
          width="100%"
          height="480px"
        />
      ) : (
        <div>No song available</div>
      )}
      </div>
      {musicEnded && (
        <div className='continue'>
          <h3>The song has ended. What would you like to do next?</h3>
          <div className='but'>
            <button onClick={() => handleChoice('continue')}>Continue with the same emotion</button>
            <button onClick={() => handleChoice('detect')}>Detect emotion again</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MusicPlayer;
