from flask import Flask, request, jsonify, g
from flask_cors import CORS
from dotenv import load_dotenv
from functools import wraps

# Load environment variables from .env file
load_dotenv()

from emotion_detection_model import detect_emotion, get_opposite_emotion
from music_recommendation import get_recommendation
from auth_db import (
    init_db,
    create_user,
    authenticate_user,
    create_session,
    delete_session,
    get_user_by_token,
    add_interaction,
    get_user_history,
    get_dashboard_summary,
)
import base64

app = Flask(__name__)
CORS(app)
init_db()


def extract_token():
    auth_header = request.headers.get('Authorization', '')
    if auth_header.startswith('Bearer '):
        return auth_header.split(' ', 1)[1].strip()
    return None


def require_auth(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        token = extract_token()
        if not token:
            return jsonify({'error': 'Authorization token required'}), 401

        user = get_user_by_token(token)
        if not user:
            return jsonify({'error': 'Invalid or expired token'}), 401

        g.current_user = user
        g.current_token = token
        return func(*args, **kwargs)

    return wrapper


@app.route('/auth/register', methods=['POST'])
def register_route():
    data = request.get_json(silent=True) or {}
    name = (data.get('name') or '').strip()
    email = (data.get('email') or '').strip().lower()
    password = data.get('password') or ''

    if not name or not email or not password:
        return jsonify({'error': 'name, email, and password are required'}), 400

    if len(password) < 6:
        return jsonify({'error': 'password must be at least 6 characters'}), 400

    user = create_user(name, email, password)
    if not user:
        return jsonify({'error': 'email already registered'}), 409

    token = create_session(user['id'])
    return jsonify({'token': token, 'user': user}), 201


@app.route('/auth/login', methods=['POST'])
def login_route():
    data = request.get_json(silent=True) or {}
    email = (data.get('email') or '').strip().lower()
    password = data.get('password') or ''

    if not email or not password:
        return jsonify({'error': 'email and password are required'}), 400

    user = authenticate_user(email, password)
    if not user:
        return jsonify({'error': 'invalid email or password'}), 401

    token = create_session(user['id'])
    return jsonify({'token': token, 'user': user})


@app.route('/auth/logout', methods=['POST'])
@require_auth
def logout_route():
    delete_session(g.current_token)
    return jsonify({'message': 'logged out'})


@app.route('/auth/me', methods=['GET'])
@require_auth
def me_route():
    return jsonify({'user': g.current_user})


@app.route('/user/history', methods=['GET'])
@require_auth
def history_route():
    limit = request.args.get('limit', default=30, type=int)
    limit = max(1, min(limit, 100))
    history = get_user_history(g.current_user['id'], limit=limit)
    return jsonify({'history': history})


@app.route('/user/history', methods=['POST'])
@require_auth
def add_history_route():
    data = request.get_json(silent=True) or {}
    action = (data.get('action') or '').strip()

    if not action:
        return jsonify({'error': 'action is required'}), 400

    add_interaction(
        user_id=g.current_user['id'],
        detected_emotion=data.get('detected_emotion'),
        final_emotion=data.get('final_emotion'),
        action=action,
        song_url=data.get('song_url'),
    )

    return jsonify({'message': 'interaction saved'}), 201


@app.route('/user/dashboard', methods=['GET'])
@require_auth
def dashboard_route():
    summary = get_dashboard_summary(g.current_user['id'])
    return jsonify({'summary': summary})


@app.route('/health', methods=['GET'])
def health_route():
    return jsonify({'status': 'ok'})

@app.route('/detect_emotion', methods=['POST'])
def detect_emotion_route():
    if 'image' not in request.files:
        return jsonify({'error': 'image file is required'}), 400

    file = request.files['image'].read()
    
    # Convert to base64 and pass directly to emotion detection
    # The emotion detection model handles face detection internally with fallback
    image_base64 = base64.b64encode(file).decode('utf-8')
    emotion, img_base64 = detect_emotion(image_base64)
    return jsonify({'emotion': emotion, 'image': img_base64})
    

@app.route('/recommend_music', methods=['POST'])
def recommend_music_route():
    data = request.get_json(silent=True) or {}
    emotion = data.get('emotion')
    if not emotion:
        return jsonify({'error': 'emotion is required'}), 400

    song_url = get_recommendation(emotion)
    return jsonify({'song_url': song_url})

@app.route('/change_emotion', methods=['POST'])
def change_emotion_route():
    data = request.get_json(silent=True) or {}
    current_emotion = data.get('emotion')
    if not current_emotion:
        return jsonify({'error': 'emotion is required'}), 400

    new_emotion = get_opposite_emotion(current_emotion)
    song_url = get_recommendation(new_emotion)
    return jsonify({'new_emotion': new_emotion, 'song_url': song_url})

if __name__ == '__main__':
    app.run(debug=True)
