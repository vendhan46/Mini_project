from flask import Flask, request, jsonify
from flask_cors import CORS
from emotion_detection_model import detect_emotion, get_opposite_emotion
from music_recommendation import get_recommendation
import base64
import cv2
import numpy as np

app = Flask(__name__)
CORS(app)

# Load the pre-trained Haar Cascade classifier for face detection
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

def is_face_detected(image):
    gray_image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)  # Convert to grayscale
    faces = face_cascade.detectMultiScale(gray_image, scaleFactor=1.1, minNeighbors=5)
    return len(faces) > 0

@app.route('/detect_emotion', methods=['POST'])
def detect_emotion_route():
    file = request.files['image'].read()
    image_np = np.frombuffer(file, np.uint8)  # Convert to numpy array
    image = cv2.imdecode(image_np, cv2.IMREAD_COLOR)  # Decode image

    # Check if a face is detected
    if not is_face_detected(image):
        return jsonify({'error': 'No face detected'}), 400
    
    image_base64 = base64.b64encode(file).decode('utf-8')
    emotion, img_base64 = detect_emotion(image_base64)
    return jsonify({'emotion': emotion, 'image': img_base64})
    

@app.route('/recommend_music', methods=['POST'])
def recommend_music_route():
    data = request.json
    emotion = data.get('emotion')
    song_url = get_recommendation(emotion)
    return jsonify({'song_url': song_url})

@app.route('/change_emotion', methods=['POST'])
def change_emotion_route():
    data = request.json
    current_emotion = data.get('emotion')
    new_emotion = get_opposite_emotion(current_emotion)
    song_url = get_recommendation(new_emotion)
    print(song_url)
    return jsonify({'new_emotion': new_emotion, 'song_url': song_url})

if __name__ == '__main__':
    app.run(debug=True)
