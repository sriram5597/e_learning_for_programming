import os
import jwt

from flask import Blueprint

current_course_api_blueprint = Blueprint('current_course_api', __name__)

stage = os.environ['STAGE']
if stage == 'dev':
    TABLE_NAME = 'artiklearn-current-course-dev'
    COURSE_SERVICE = 'http://localhost:5000/course'
    FEEDBACK_TABLE_NAME = 'artiklearn-user-feedback-dev'

    inst_key = '-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAqoEYUxJ9JfiuKwjSS4Oy\nm4oloNrjXDtOFj6jI/Pd4BFDzU73TZHj'
    inst_key += '/Y0/Vz0SVpFDTJPbxbSDPeETQrlqvpzz\nrf+HZ/QcQf9E3r8iBUC9LFrnsh50TX5Z/teWyIBKjn5ydmcsOouGwMMRPV+lTv+S\nxuOq3mGaLE/is/cpkZFRoB+OerYIEw' 
    inst_key += '+NUKKlDET+CrV6fjdCav4qNNi3F6+nu8oO\nw66i3FzP2vC9iVcWgdVB6LfYPvWRz+xOJs4khkBmtDxqG95xpjwZ3eC78+l3OvLz\nnflB1vmrYwxociDqCgD3anLr8Jpc'
    inst_key += 'rN97i6cyVy+0Ya3a1rOyIlaGIffYxAKUqXLE\nbQIDAQAB\n-----END PUBLIC KEY-----'

    user_key = open(os.path.join(os.getcwd(), 'keys/user.dev.key'), 'r').read()
    print(user_key)

else:
    TABLE_NAME = 'stacle-current-course'

def get_greeting(username):
    msg = {
        "subject": "Thank you for Providing Feedback",
    }

    msg['body'] = '''
    Hello %s,
        Thank you for providing your valuable feedback. We will surely work on it as soon as possible.

        happy learning!!!

        with regards,
        CEO,
        Artik Learn
    ''' % (username)

    return msg

def enroll_course_mail(name, course_title):
    msg = {
        "subject": 'Successfully enrolled for %s' % (course_title)
    }
    msg['body'] = '''
    Hello %s,
        Thank you for enrolling for %s course. We hope you will have a great learning experience with us. 
        Happy Learning!!
    ''' % (name, course_title)

    return msg

def unenroll_course_mail(name, course_title):
    msg = {
        "subject": "Unenrolled from %s course" % (course_title)
    }
    msg['body'] = '''
    Hello %s,
        You have successfully unenrolled from %s course. Thank you for providing your valuable feedback on this course. We are looking forward to
        serve you more. Have a good day.
    '''

    return msg
    
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