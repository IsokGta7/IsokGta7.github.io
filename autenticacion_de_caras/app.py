from flask import Flask, render_template, request, jsonify
import tensorflow as tf
import numpy as np
from tensorflow.keras.models import model_from_json
from io import BytesIO
from PIL import Image
app = Flask(__name__)

# Load model
json_file = open('model.json', 'r')
loaded_model_json = json_file.read()
json_file.close()

model = model_from_json(loaded_model_json)
model.load_weights('model.h5')
FRmodel = model


# Function to process the image and get the embedding
def img_to_encoding(image_path, model):
    img = tf.keras.preprocessing.image.load_img(image_path, target_size=(160, 160))
    img = np.around(np.array(img) / 255.0, decimals=12)
    x_train = np.expand_dims(img, axis=0)
    embedding = model.predict_on_batch(x_train)
    return embedding / np.linalg.norm(embedding, ord=2)


# Initialize the database
database = {
    "victor": img_to_encoding("victor.jpg", FRmodel),
    "antonio": img_to_encoding("antonio.jpeg", FRmodel),
    "daniel": img_to_encoding("Daniel8A.jpg", FRmodel),
    "gael": img_to_encoding("gael.jpg", FRmodel),
    "santiago": img_to_encoding("gsrrobles.jpg", FRmodel),
    "isaac": img_to_encoding("Isaac.jpg", FRmodel),
    "manuel": img_to_encoding("manuel.jpg", FRmodel),
    "manuelM": img_to_encoding("ManuelM.jpg", FRmodel),
    "mario": img_to_encoding("mario.jpeg", FRmodel),
}


# Function to identify the person
def who_is_it(image, database, model):
    image = image.resize((160, 160))
    img = np.around(np.array(image) / 255.0, decimals=12)
    x_train = np.expand_dims(img, axis=0)
    embedding = model.predict_on_batch(x_train)
    encoding = embedding / np.linalg.norm(embedding, ord=2)
    min_dist = 100
    identity = None

    for (name, db_enc) in database.items():
        dist = np.linalg.norm(encoding - db_enc)
        if dist < min_dist:
            min_dist = dist
            identity = name

    if min_dist > 0.7:
        return f"Not in the database. {min_dist:.2f}"
    else:
        return f"It's {identity}, with a distance of {min_dist:.2f}"


@app.route('/')
def index():
    return render_template('index.html')


# Prediction route
@app.route('/predict', methods=['POST'])
def predict():
    # Check if an image file was uploaded
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'})

    file = request.files['file']

    if file.filename == '':
        return jsonify({'error': 'No selected file'})

    image = Image.open(BytesIO(file.read()))

    result = who_is_it(image, database, FRmodel)

    # Return the result
    return jsonify({'result': result})


if __name__ == '__main__':
    app.run(debug=True)

