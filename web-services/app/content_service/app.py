import os

from flask import Flask
from flask_cors import CORS

from content_api import content_api_blueprint

app = Flask(__name__)

app.register_blueprint(content_api_blueprint)

CORS(app)

if __name__ == '__main__':
    app.run(debug = True, port = 6060)