from flask import Flask
from flask_cors import CORS

from course_flow_api import course_flow_api_blueprint

app = Flask(__name__)

app.register_blueprint(course_flow_api_blueprint)

CORS(app)

if __name__ == '__main__':
    app.run(debug = True, port = 5080)