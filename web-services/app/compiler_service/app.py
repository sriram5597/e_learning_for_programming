from flask import Flask
import os

app = Flask(__name__)

from compiler_api import compiler_api_blueprint

app.register_blueprint(compiler_api_blueprint)

if __name__ == '__main__':
    app.run(debug = True, port = 9090)