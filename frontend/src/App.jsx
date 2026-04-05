import React from 'react';
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import Webcapture from './pages/WebcamCapture/WebCapture';
import EmotionDetection from './pages/EmotionDetection/EmotionDetection';
import MusicPlayer from './pages/MusicPlayer/MusicPlayer';
import AuthPage from './pages/Auth/AuthPage';
import Dashboard from './pages/Dashboard/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/AppLayout';
import ComingSoon from './pages/ComingSoon/ComingSoon';
import { isLoggedIn } from './utils/auth';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<Navigate to={isLoggedIn() ? '/dashboard' : '/auth'} replace />} />
        <Route path='/auth' element={isLoggedIn() ? <Navigate to='/dashboard' replace /> : <AuthPage />} />
        <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route path='/dashboard' element={<Dashboard />} />
          <Route path='/music' element={<MusicPlayer />} />
          <Route path='/music-player' element={<MusicPlayer />} />
          <Route path='/capture' element={<Webcapture />} />
          <Route path='/webcapture' element={<Webcapture />} />
          <Route path='/emotion-detection' element={<EmotionDetection />} />
          <Route path='/insights' element={<ComingSoon title='Insights' description='A deeper analytics view for mood trends and listening patterns will land here.' />} />
          <Route path='/library' element={<ComingSoon title='Library' description='A saved-session and favourites area will be added here later.' />} />
          <Route path='*' element={<Navigate to='/dashboard' replace />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
