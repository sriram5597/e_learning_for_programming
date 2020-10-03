import os

from flask import Flask, request, jsonify
from flask_cors import CORS

from flowchart_api import flowchart_api_blueprint

app = Flask(__name__)

app.register_blueprint(flowchart_api_blueprint)

CORS(app)

if __name__ == '__main__':
    app.run(debug = True, port = 7080)