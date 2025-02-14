import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage/HomePage';
import Webcapture from './pages/WebcamCapture/WebCapture';
import EmotionDetection from './pages/EmotionDetection/EmotionDetection';
import MusicPlayer from './pages/MusicPlayer/MusicPlayer';
import Navbar from './pages/Navbar/Navbar';

const App = () => {
  return (
    
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/webcapture" element={<Webcapture />} />
        <Route path="/emotion-detection" element={<EmotionDetection />} />
        <Route path="/music-player" element={<MusicPlayer />} />
      </Routes>
    </Router>
  );
};

export default App;
