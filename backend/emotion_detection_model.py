# emotion_detection.py
import cv2
import numpy as np
import tensorflow as tf
from tensorflow.keras.models import load_model
import base64
import os
import requests

# Model configuration
MODEL_URL = "https://drive.google.com/uc?id=1_CAoGrKamk4m5CCUiyszkyeQaO3eBKjl&export=download"
MODEL_PATH = "emo.h5"
FALLBACK_MODEL_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'emo.h5')

def download_model():
    """Download model from Google Drive if not present locally."""
    # Check if model exists in backend folder
    if os.path.exists(MODEL_PATH):
        print(f"Using model from: {MODEL_PATH}")
        return MODEL_PATH
    
    # # Check original location (project root)
    # if os.path.exists(FALLBACK_MODEL_PATH):
    #     print(f"Using model from: {FALLBACK_MODEL_PATH}")
    #     return FALLBACK_MODEL_PATH
    
    # Download from Google Drive
    print("Model not found locally. Downloading from Google Drive...")
    try:
        import requests
        session = requests.Session()
        
        # First request to get confirmation token
        response = session.get(MODEL_URL, stream=True)
        
        # Handle Google Drive's virus scan warning for large files
        token = None
        for key, value in response.cookies.items():
            if key.startswith('download_warning'):
                token = value
                break
        
        if token:
            params = {'confirm': token}
            response = session.get(MODEL_URL, params=params, stream=True)
        
        response.raise_for_status()
        
        # Download with progress
        with open(MODEL_PATH, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                if chunk:
                    f.write(chunk)
        
        print("Model downloaded successfully!")
        return MODEL_PATH
        
    except Exception as e:
        print(f"Failed to download model: {e}")
        raise FileNotFoundError(f"Model file not found. Please place emo.h5 in backend/ folder. Error: {e}")

# Download and load the model
model_path = download_model()
model = load_model(model_path)
#model.evaluate()
# Emotion class names
class_names = ['angry', 'disgust', 'fear', 'happy', 'neutral', 'sad', 'surprise']

# Define opposite emotions
opposite_emotions = {
    'angry': 'happy',
    'happy': 'angry',
    'fear': 'neutral',
    'neutral': 'fear',
    'sad': 'happy',
    'surprise': 'neutral',
    'disgust':'neutral'
}

def detect_emotion(image):
    # Convert base64 image to numpy array
    image = base64.b64decode(image)
    np_img = np.frombuffer(image, np.uint8)
    img = cv2.imdecode(np_img, cv2.IMREAD_COLOR)
    gray_img = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # Detect face and crop to face region for better accuracy
    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
    faces = face_cascade.detectMultiScale(gray_img, scaleFactor=1.1, minNeighbors=5)

    if len(faces) > 0:
        # Use the largest detected face
        x, y, w, h = max(faces, key=lambda f: f[2] * f[3])
        face_roi = gray_img[y:y+h, x:x+w]
    else:
        face_roi = gray_img  # Fallback to full image

    # Resize to 48x48 and normalize to [0, 1] (matching training preprocessing)
    resized_img = cv2.resize(face_roi, (48, 48)).astype('float32') / 255.0
    resized_img = resized_img.reshape(1, 48, 48, 1)

    # Predict emotion
    prediction = model.predict(resized_img)
    emotion = class_names[np.argmax(prediction)]

    # Encode image for frontend
    _, img_encoded = cv2.imencode('.png', img)
    img_base64 = base64.b64encode(img_encoded).decode('utf-8')

    return emotion, img_base64

def get_opposite_emotion(emotion):
    return opposite_emotions.get(emotion, emotion)
