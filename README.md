# 🎵 Xpressify - Emotion-Based Music Recommendation System

**Xpressify** is an innovative facial emotion recognition and music recommendation platform. It detects users’ emotions from facial expressions using a CNN model trained on the FER2013 dataset and recommends music tracks that match the user's mood in real time.

---

## 📂 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Screenshots](#screenshots)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

---

## 🚀 Features

- Real-time facial emotion detection using OpenCV
- CNN model trained on FER2013 dataset (`emo.h5`)
- Music recommendation based on detected emotion
- Frontend in React with a clean and responsive UI
- Backend using Flask for model prediction and API integration

---

## 💻 Tech Stack

**Frontend**  
- React.js  
- HTML5, CSS3  
- Bootstrap

**Backend**  
- Python Flask  
- TensorFlow / Keras (CNN model)  
- OpenCV

**Model & Dataset**  
- FER2013 for emotion classification  
- Custom-trained model (`emo.h5`)

---

## ⚙️ Installation

### Prerequisites

- Python 3.8+
- Node.js and npm
- pip

### Backend Setup

bash
git clone https://github.com/your-username/xpressify.git
cd xpressify/backend

# Install Python dependencies
pip install -r requirements.txt

# Run the Flask server
python app.py


###Frontend Setup
cd ../frontend

# Install frontend dependencies
npm install

# Start the React app
npm start
