from flask import Flask
from flask_cors import CORS

from test_api import test_api_blueprint

app = Flask(__name__)

app.register_blueprint(test_api_blueprint)

CORS(app)

if __name__ == '__main__':
    app.run(debug = True, port = 6080)