import jwt
import logging
import sys
import os

from flask import Blueprint
from jwt.contrib.algorithms.pycrypto import RSAAlgorithm

module_api_blueprint = Blueprint('module_api', __name__)

stage = os.environ['STAGE']
if stage == 'dev':
    TABLE_NAME = 'artiklearn-course-modules-dev'

    inst_key = '-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAqoEYUxJ9JfiuKwjSS4Oy\nm4oloNrjXDtOFj6jI/Pd4BFDzU73TZHj'
    inst_key += '/Y0/Vz0SVpFDTJPbxbSDPeETQrlqvpzz\nrf+HZ/QcQf9E3r8iBUC9LFrnsh50TX5Z/teWyIBKjn5ydmcsOouGwMMRPV+lTv+S\nxuOq3mGaLE/is/cpkZFRoB+OerYIEw' 
    inst_key += '+NUKKlDET+CrV6fjdCav4qNNi3F6+nu8oO\nw66i3FzP2vC9iVcWgdVB6LfYPvWRz+xOJs4khkBmtDxqG95xpjwZ3eC78+l3OvLz\nnflB1vmrYwxociDqCgD3anLr8Jpc'
    inst_key += 'rN97i6cyVy+0Ya3a1rOyIlaGIffYxAKUqXLE\nbQIDAQAB\n-----END PUBLIC KEY-----'

    user_key = open(os.path.join(os.getcwd(), 'keys/user.dev.key'), 'r').read()

else:
    TABLE_NAME = 'stacle-course-modules'

#jwt.register_algorithm('RS256', RSAAlgorithm(RSAAlgorithm.SHA256))

def verify_token(token, type = None):
    try:
        if type == 'instructor':
            decoded = jwt.decode(token, inst_key, algorithms = 'RS256')
        else:
            decoded = jwt.decode(token, user_key, algorithms = 'RS256')

        return decoded

    except jwt.ExpiredSignatureError as err:
        raise jwt.ExpiredSignatureError(err)

    except Exception as err:
        raise Exception(err)

class NotUniqueError(Exception):
    def __init__(self, value):
        self._value = value
    
    def __repr__(self):
        return repr(self.value + 'already exists')

from . import routes