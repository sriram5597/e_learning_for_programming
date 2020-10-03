import os

from flask import Flask
from flask_cors import CORS

from course_api import course_blueprint_api

app = Flask(__name__)


app.register_blueprint(course_blueprint_api)

CORS(app)

if __name__ == '__main__':
    app.run(debug = True, threaded = True, port = 5000)