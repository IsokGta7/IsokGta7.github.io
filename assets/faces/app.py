from flask import Flask, render_template, request, jsonify
import tensorflow as tf
import numpy as np
from tensorflow.keras.models import model_from_json
from io import BytesIO
from PIL import Image
# Cambiar los directorios por defecto
app = Flask(
    __name__
)

# Load model
json_file = open('model_faces.json', 'r')
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
    "Victor": img_to_encoding("victor.jpg", FRmodel),
    "Antonio": img_to_encoding("antonio.jpeg", FRmodel),
    "Daniel": img_to_encoding("Daniel8A.jpg", FRmodel),
    "Gael": img_to_encoding("gael.jpg", FRmodel),
    "Santiago": img_to_encoding("gsrrobles.jpg", FRmodel),
    "Isaac": img_to_encoding("Isaac.jpg", FRmodel),
    "Manuel": img_to_encoding("manuel.jpg", FRmodel),
    "Manuel M": img_to_encoding("ManuelM.jpg", FRmodel),
    "Mario": img_to_encoding("mario.jpeg", FRmodel),
    "Edelmira": img_to_encoding("edelmira.png", FRmodel),
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
    return render_template('caras.html')


@app.route('/predict', methods=['POST'])
def predict():
    file = request.files['image']
    image = Image.open(file.stream)
    result = who_is_it(image, database, FRmodel)
    return jsonify({"result": result})


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3031, debug=True)


print(app.url_map)
