from flask import Flask, jsonify, render_template, send_from_directory
import os, random, yaml


app = Flask(__name__,
            template_folder='../frontend',
            static_folder='../frontend/static')
IMAGE_FOLDER = '../frontend/static/images'

if __name__ == '__main__':
    app.run(debug=True)


@app.route('/')
def index():
    return render_template('index.html')

#Generate a random track image
@app.route('/track-image')
def track_image():
    # Get a list of all folders inside the trackImages directory
    folders = [f for f in os.listdir(IMAGE_FOLDER + '/trackImages') if os.path.isdir(os.path.join(IMAGE_FOLDER + '/trackImages', f))]
    
    # Choose a random folder
    random_folder = random.choice(folders)
    
    # Get a list of images inside the chosen random folder
    track_images = os.listdir(os.path.join(IMAGE_FOLDER + '/trackImages', random_folder))
    
    # Choose a random image from the selected folder
    track_image = random.choice(track_images)

    return jsonify({'image_url': f'static/images/trackImages/{random_folder}/{track_image}'})


def load_answers(filename='mapAnswers/mapAnswers.yaml'):
    with open(filename, 'r') as file:
        data = yaml.safe_load(file)  # Load the YAML file content
    return data

#Send the answer to server
@app.route('/update_coordinates')
def update_coordinates():
    answers = load_answers()
    return jsonify(answers)

if __name__ == '__main__':
    app.run(debug=True)