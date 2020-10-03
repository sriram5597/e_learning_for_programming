import jwt
import logging
import sys
import os

from flask import Blueprint
from jwt.contrib.algorithms.pycrypto import RSAAlgorithm
from jwt import InvalidSignatureError

course_flow_api_blueprint = Blueprint('course_flow_api', __name__)

stage = os.environ['STAGE']
host = os.environ['HOST']
if stage == 'dev':
    TABLE_NAME = 'artiklearn-course-flow-dev'

    inst_key = '-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAqoEYUxJ9JfiuKwjSS4Oy\nm4oloNrjXDtOFj6jI/Pd4BFDzU73TZHj'
    inst_key += '/Y0/Vz0SVpFDTJPbxbSDPeETQrlqvpzz\nrf+HZ/QcQf9E3r8iBUC9LFrnsh50TX5Z/teWyIBKjn5ydmcsOouGwMMRPV+lTv+S\nxuOq3mGaLE/is/cpkZFRoB+OerYIEw' 
    inst_key += '+NUKKlDET+CrV6fjdCav4qNNi3F6+nu8oO\nw66i3FzP2vC9iVcWgdVB6LfYPvWRz+xOJs4khkBmtDxqG95xpjwZ3eC78+l3OvLz\nnflB1vmrYwxociDqCgD3anLr8Jpc'
    inst_key += 'rN97i6cyVy+0Ya3a1rOyIlaGIffYxAKUqXLE\nbQIDAQAB\n-----END PUBLIC KEY-----'

    user_key = open(os.path.join(os.getcwd(), 'keys/user.dev.key'), 'r').read()

    if host == 'LOCAL':
        VIDEO_STREAMING_SERVICE = 'http://localhost:6000/stream'
        CONTENT_SERVICE = 'http://localhost:6060/content'
        TEST_SERVICE = 'http://localhost:6080/test'
        ONLINE_CODE_SERVICE = 'http://localhost:7000/code'
        MODULE_SERVICE = 'http://localhost:5050/module'
    else:
        VIDEO_STREAMING_SERVICE = 'https://video-streaming-serivce.local:6000/stream'
        CONTENT_SERVICE = 'https://content-service.local:6060/content'
        TEST_SERVICE = 'https://localhost:6080/test'
        ONLINE_CODE_SERVICE = 'https:online-code-service:7000/code'

else:
    TABLE_NAME = 'stacle-course-flow'

#jwt.register_algorithm('RS256', RSAAlgorithm(RSAAlgorithm.SHA256))

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

class NotFoundError(Exception):
    def __init__(self, value):
        self._value = value
    
    def __repr__(self):
        return repr(self.value + 'not found')

from . import routes