from flask import Flask
from flask_cors import CORS

from module_api import module_api_blueprint

app = Flask(__name__)

app.register_blueprint(module_api_blueprint)

CORS(app)

if __name__ == '__main__':
    app.run(debug = True, port = 5050)