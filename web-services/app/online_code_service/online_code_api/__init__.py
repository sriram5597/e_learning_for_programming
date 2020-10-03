import jwt
import logging
import sys
import os

from flask import Blueprint
import boto3
from botocore.exceptions import ClientError
from jwt import InvalidSignatureError

s3_client = boto3.client('s3', )

online_code_api_blueprint = Blueprint('online_code_api', __name__)

stage = os.environ['STAGE']
if stage == 'dev':
    TABLE_NAME = 'artiklearn-problem-dev'
    UPLOAD_FOLDER = os.path.join(os.getcwd(), 'tmp')
    BUCKET_NAME = 'artiklearn-problem-dev'
    COURSE_FLOW_SERVICE = 'http://localhost:5080/course-flow'
    COMPILER_SERVICE = 'http://localhost:9090/compiler'
    USER_SERVICE = 'http://localhost:8080/user'
    CURRENT_COURSE_SERVICE = 'http://localhost:9000/current-course'
    FLOWCHART_SERVICE = 'http://localhost:7080/flowchart'

    inst_key = '-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAqoEYUxJ9JfiuKwjSS4Oy\nm4oloNrjXDtOFj6jI/Pd4BFDzU73TZHj'
    inst_key += '/Y0/Vz0SVpFDTJPbxbSDPeETQrlqvpzz\nrf+HZ/QcQf9E3r8iBUC9LFrnsh50TX5Z/teWyIBKjn5ydmcsOouGwMMRPV+lTv+S\nxuOq3mGaLE/is/cpkZFRoB+OerYIEw' 
    inst_key += '+NUKKlDET+CrV6fjdCav4qNNi3F6+nu8oO\nw66i3FzP2vC9iVcWgdVB6LfYPvWRz+xOJs4khkBmtDxqG95xpjwZ3eC78+l3OvLz\nnflB1vmrYwxociDqCgD3anLr8Jpc'
    inst_key += 'rN97i6cyVy+0Ya3a1rOyIlaGIffYxAKUqXLE\nbQIDAQAB\n-----END PUBLIC KEY-----'

    user_key = open(os.path.join(os.getcwd(), 'keys/user.dev.key'), 'r').read()

else:
    TABLE_NAME = 'stacle-online-code'
    UPLOAD_FOLDER = os.path.join(os.getcwd(), 'tmp')
    BUCKET_NAME = 'stacle-online-code'


def calculate_score(testcases, max_score, bucket):
    low = 0.40
    high = 0.60
    
    res = {}
    result = testcases.copy()
    
    for i in range(len(testcases)):
        res[testcases[i]['input'] + '#%s' % (str(i))] = s3_client.head_object(Bucket = bucket, Key = testcases[i]['input'])['ContentLength']

    srtd = sorted(res, key = lambda v : res[v])

    srtd = srtd[::-1]
    scores = {}
    
    if len(testcases) == 0:
        return "No Testcases found"
    
    if len(testcases) == 1:
            testcases[0]['points'] = str(max_score)

    elif len(testcases) % 2 == 0:
        part = len(srtd) // 2
        part1 = round(low * max_score / part, 3)
        part2 = round(high * max_score / part, 3)

        for i in range(part):
            ind = int(srtd[i].split('#')[-1])
            result[ind]['points'] = str(part1)
        
        for i in range(part, len(testcases)):
            ind = int(srtd[i].split('#')[-1])
            result[ind]['points'] = str(part2)
    
    else:
        part = len(srtd) // 2
        keys = list(res.keys())

        dif_low = abs(res[keys[part - 1]] - res[keys[part]])
        dif_high = abs(res[keys[part + 1]] - res[keys[part]])

        if dif_low <= dif_high:
            part1 = part + 1
            part2 = len(srtd) - part1
        else:
            part1 = part
            part2 = len(srtd) - part1
        
        tot1 = round(low * max_score / part1, 3)
        tot2 = round(high * max_score / part2, 3)

        for i in range(part1):
            ind = int(srtd[i].split('#')[-1])
            result[ind]['points'] = str(tot1)
        
        for i in range(part1, len(testcases)):
            ind = int(srtd[i].split('#')[-1])
            result[ind]['points'] = str(tot2)

    return result


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
