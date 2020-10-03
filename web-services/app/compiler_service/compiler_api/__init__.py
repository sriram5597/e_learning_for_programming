import os
from flask import Blueprint

compiler_api_blueprint = Blueprint('compiler_api_blueprint', __name__)

stage = os.environ['STAGE']
if stage == 'dev':
    BUCKET_NAME = 'stacle-online-code-dev'

else:
    BUCKET_NAME = 'stacle-online-code'

UPLOAD_FOLDER = os.path.join(os.getcwd(), 'temp')

from . import routes