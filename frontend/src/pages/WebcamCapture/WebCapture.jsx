import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './WebCapture.css'
import api from '../../utils/api';
import { trackHistory } from '../../utils/history';
const Webcapture = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject;

    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    setError(null);
    stopCamera();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch {
      setError('Unable to access camera. Please check camera permission and try again.');
    }
  };

  const captureImage = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video?.srcObject) {
      setError('Please start the camera before capturing.');
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Turn off webcam immediately after a frame is captured.
    stopCamera();

    canvas.toBlob(async (blob) => {
      if (!blob) {
        setError('Unable to capture image. Please try again.');
        return;
      }

      const formData = new FormData();
      formData.append('image', blob);

      try {
        const response = await api.post('/detect_emotion', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        await trackHistory({
          detectedEmotion: response.data.emotion,
          finalEmotion: response.data.emotion,
          action: 'emotion_detected',
        });

        // Navigate to the emotion detection page with response data
        navigate('/emotion-detection', { state: { image: response.data.image, emotion: response.data.emotion } });
      } catch (error) {
        console.error('Error detecting emotion:', error);
        
        // If the error response is 400, set a specific error message for "Face not detected"
        if (error.response && error.response.status === 400) {
          setError(error.response.data.error || 'No face detected. Please try again.');
        } else {
          // For any other errors, you can show a generic message
          setError('An error occurred. Please try again.');
        }
      }
    });
  };

  return (
    <div className='camera'>

      <video ref={videoRef} autoPlay></video>
      
      {error && <p className="error-message" style={{color: 'red', textAlign: 'center'}}>{error}</p>}

      <div className='but'>
      <button onClick={startCamera}>Start Camera</button>
      <button onClick={captureImage}>Capture Image</button>
      </div>
      <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
      
    </div>
  );
};

export default Webcapture;




