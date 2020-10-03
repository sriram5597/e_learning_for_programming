import os
import jwt

from flask import Blueprint
from jwt import InvalidSignatureError

content_api_blueprint = Blueprint('content_api', __name__)

stage = os.environ['STAGE']
if stage == 'dev':
    TABLE_NAME = 'artiklearn-content-dev'
    UPLOAD_FOLDER = os.path.join(os.getcwd(), 'tmp')
    BUCKET_NAME = 'artiklearn-contents-dev'
    COURSE_FLOW_SERVICE = 'http://localhost:5080/course-flow'

    inst_key = '-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAqoEYUxJ9JfiuKwjSS4Oy\nm4oloNrjXDtOFj6jI/Pd4BFDzU73TZHj'
    inst_key += '/Y0/Vz0SVpFDTJPbxbSDPeETQrlqvpzz\nrf+HZ/QcQf9E3r8iBUC9LFrnsh50TX5Z/teWyIBKjn5ydmcsOouGwMMRPV+lTv+S\nxuOq3mGaLE/is/cpkZFRoB+OerYIEw' 
    inst_key += '+NUKKlDET+CrV6fjdCav4qNNi3F6+nu8oO\nw66i3FzP2vC9iVcWgdVB6LfYPvWRz+xOJs4khkBmtDxqG95xpjwZ3eC78+l3OvLz\nnflB1vmrYwxociDqCgD3anLr8Jpc'
    inst_key += 'rN97i6cyVy+0Ya3a1rOyIlaGIffYxAKUqXLE\nbQIDAQAB\n-----END PUBLIC KEY-----'

    user_key = open(os.path.join(os.getcwd(), 'keys/user.dev.key'), 'r').read()

else:
    TABLE_NAME = 'stacle-course-contents'
    UPLOAD_FOLDER = os.path.join(os.getcwd(), 'tmp')
    BUCKET_NAME = 'stacle-course-contents'
    COURSE_FLOW_SERVICE = 'http://course-flow-service.stacle.service:5080'


def verify_token(token, type = None):
    try:
        if type == 'instructor':
            decoded = jwt.decode(token, inst_key, algorithms = 'RS256')
        
        elif type == 'user':
            decoded = jwt.decode(token, user_key, algorithms = 'RS256')
        
        else:
            try:
                decoded = jwt.decode(token, inst_key, algorithms = 'RS256')
            
            except InvalidSignatureError as err:
                decoded = decoded = jwt.decode(token, user_key, algorithms = 'RS256')

        return decoded

    except jwt.ExpiredSignatureError as err:
        raise jwt.ExpiredSignatureError(err)

    except Exception as err:
        raise Exception(err)

def verify_instructor(token):
    decoded = verify_token(token, 'instructor')
    return decoded

def verify_user(token):
    decoded = verify_token(token, 'user')
    return decoded


class NotUniqueError(Exception):
    def __init__(self, value):
        self._value = value
    
    def __repr__(self):
        return repr(self.value + 'already exists')

from . import routes