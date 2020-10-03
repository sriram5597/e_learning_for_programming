import os

from flask import Flask
from flask_cors import CORS

from online_code_api import online_code_api_blueprint

app = Flask(__name__)

app.register_blueprint(online_code_api_blueprint)

CORS(app)

if __name__ == '__main__':
    app.run(debug = True, port = 7000)