import os

from flask import Flask, request, jsonify
from flask_mail import Mail
from flask_cors import CORS

app = Flask(__name__)

app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 465
app.config['MAIL_USERNAME'] = 'artiklearn@gmail.com'
app.config['MAIL_PASSWORD'] = 'dbjnlchxwitdkjbx'
app.config['MAIL_DEBUG'] = True
app.config['MAIL_USE_SSL'] = True

mail = Mail(app)
CORS(app)

from current_course_api import current_course_api_blueprint
app.register_blueprint(current_course_api_blueprint)

if __name__ == '__main__':
    app.run(debug = True, port = 9000)