import tensorflow as tf
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.image import ImageDataGenerator
import numpy as np

# Path to your saved model (adjust this path based on where your model is saved)
model_path = 'C:/Users/harish/Desktop/XPressiify/backend/models/emo.h5'

# Load the saved model
model = load_model(model_path)

# Define the ImageDataGenerator for preprocessing the test data
test_datagen = ImageDataGenerator(rescale=1./255)

# Set the path to the test dataset
test_dir = 'C:/Users/harish/Desktop/XPressiify/backend/models/archive/archive/test'

# Create a test generator
test_generator = test_datagen.flow_from_directory(
    test_dir,
    target_size=(48, 48),  # Set the same image size as used during training
    batch_size=32,
    color_mode='grayscale',  # Change to 'rgb' if your model is trained on RGB images
    class_mode='categorical',
    shuffle=False
)

# Evaluate the model on the test set
loss, accuracy = model.evaluate(test_generator)
model.summary()
# Print the loss and accuracy
print(f"Test Loss: {loss}")
print(f"Test Accuracy: {accuracy}")
