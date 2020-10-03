from video_streaming_api import video_streaming_api_blueprint
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)

app.register_blueprint(video_streaming_api_blueprint)

CORS(app)

if __name__ == '__main__':
    app.run(debug = True, port = 6000)