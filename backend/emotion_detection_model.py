# emotion_detection.py
import cv2
import numpy as np
import tensorflow as tf
from tensorflow.keras.models import load_model
import base64

# Load the trained emotion recognition model
model = load_model('/models/emo.h5')
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
    resized_img = cv2.resize(gray_img, (48, 48)).reshape(1, 48, 48, 1)

    # Predict emotion
    prediction = model.predict(resized_img)
    emotion = class_names[np.argmax(prediction)]

    # Encode image for frontend
    _, img_encoded = cv2.imencode('.png', img)
    img_base64 = base64.b64encode(img_encoded).decode('utf-8')

    return emotion, img_base64

def get_opposite_emotion(emotion):
    return opposite_emotions.get(emotion, emotion)
