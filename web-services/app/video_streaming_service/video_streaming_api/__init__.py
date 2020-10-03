import jwt
import logging
import sys
import time
import os
import boto3

from jwt import InvalidSignatureError
from flask import Blueprint
from jwt.contrib.algorithms.pycrypto import RSAAlgorithm

video_streaming_api_blueprint = Blueprint('video_streaming_api', __name__)

stage = os.environ['STAGE']
host = os.environ['HOST']

if stage == 'dev':
    BUCKET_NAME = 'coursevidehlsstream-dev-input-4t2nnryr'
    OUTPUT_BUCKET = 'coursevidehlsstream-dev-output-4t2nnryr'
    UPLOAD_FOLDER = os.path.join(os.getcwd(), 'tmp')

    inst_key = '-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAqoEYUxJ9JfiuKwjSS4Oy\nm4oloNrjXDtOFj6jI/Pd4BFDzU73TZHj'
    inst_key += '/Y0/Vz0SVpFDTJPbxbSDPeETQrlqvpzz\nrf+HZ/QcQf9E3r8iBUC9LFrnsh50TX5Z/teWyIBKjn5ydmcsOouGwMMRPV+lTv+S\nxuOq3mGaLE/is/cpkZFRoB+OerYIEw' 
    inst_key += '+NUKKlDET+CrV6fjdCav4qNNi3F6+nu8oO\nw66i3FzP2vC9iVcWgdVB6LfYPvWRz+xOJs4khkBmtDxqG95xpjwZ3eC78+l3OvLz\nnflB1vmrYwxociDqCgD3anLr8Jpc'
    inst_key += 'rN97i6cyVy+0Ya3a1rOyIlaGIffYxAKUqXLE\nbQIDAQAB\n-----END PUBLIC KEY-----'

    user_key = open(os.path.join(os.getcwd(), 'keys/user.dev.key'), 'r').read()

    if host == 'LOCAL':
        COURSE_FLOW_SERVICE = 'http://localhost:5080/course-flow'
    else:
        COURSE_FLOW_SERVICE = 'https://course-flow-service.local:5080/course-flow'

else:
    BUCKET_NAME = 'stacle-course-videos'
    COURSE_FLOW_SERVICE = 'http://course-flow-service.stacle.service:5080/course-flow'

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

sts_client = boto3.client('sts')

def get_policy(course):
    upload_policy = '''{
        "Version": "2012-10-17",
        "Statement": [
            {
                "Sid": "VisualStudioCode",
                "Effect": "Allow",
                "Action": [
                    "s3:PutObject",
                    "s3:GetObject"
                ],
                "Resource": "arn:aws:s3:::coursevidehlsstream-dev-input-4t2nnryr/*"
            }
        ]
    }
    '''  

    return upload_policy

def get_credentials(course):
    upload_policy = get_policy(course)
    cred = sts_client.assume_role(
        RoleArn = 'arn:aws:iam::502669402237:role/full-bucket-access',
        Policy = upload_policy,
        RoleSessionName = 'web-client-role',
        DurationSeconds = 2000
    )   

    return cred


from . import routes