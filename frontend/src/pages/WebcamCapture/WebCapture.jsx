import React, { useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './WebCapture.css'
import { useState } from 'react';
const Webcapture = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const navigate = useNavigate();
  const [error, setError] = useState(null); 

  const startCamera = () => {
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      videoRef.current.srcObject = stream;
    });
  };

  const captureImage = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(async (blob) => {
      const formData = new FormData();
      formData.append('image', blob);

      try {
        const response = await axios.post('http://127.0.0.1:5000/detect_emotion', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        // Navigate to the emotion detection page with response data
        navigate('/emotion-detection', { state: { image: response.data.image, emotion: response.data.emotion } });
      } catch (error) {
        console.error('Error detecting emotion:', error);
        
        // If the error response is 400, set a specific error message for "Face not detected"
        if (error.response && error.response.status === 400) {
          navigate('/emotion-detection', { state: {  error: response.error } });
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
     
      <div className='but'>
      <button onClick={startCamera}>Start Camera</button>
      <button onClick={captureImage}>Capture Image</button>
      </div>
      <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
      
    </div>
  );
};

export default Webcapture;




