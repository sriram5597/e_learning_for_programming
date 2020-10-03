import os
import jwt

from flask import Blueprint
from jwt import InvalidSignatureError

flowchart_api_blueprint = Blueprint('flowchart_api', __name__)

stage = os.environ['STAGE']
if stage == 'dev':
    TABLE_NAME = 'stacle-flowchart-dev'
    COMPILER_SERVICE = 'http://localhost:7070/compiler'
    UPLOAD_FOLDER = os.path.join(os.getcwd(), 'tmp')
    BUCKET_NAME = 'stacle-flowchart-dev'

    inst_key = '-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAqoEYUxJ9JfiuKwjSS4Oy\nm4oloNrjXDtOFj6jI/Pd4BFDzU73TZHj'
    inst_key += '/Y0/Vz0SVpFDTJPbxbSDPeETQrlqvpzz\nrf+HZ/QcQf9E3r8iBUC9LFrnsh50TX5Z/teWyIBKjn5ydmcsOouGwMMRPV+lTv+S\nxuOq3mGaLE/is/cpkZFRoB+OerYIEw' 
    inst_key += '+NUKKlDET+CrV6fjdCav4qNNi3F6+nu8oO\nw66i3FzP2vC9iVcWgdVB6LfYPvWRz+xOJs4khkBmtDxqG95xpjwZ3eC78+l3OvLz\nnflB1vmrYwxociDqCgD3anLr8Jpc'
    inst_key += 'rN97i6cyVy+0Ya3a1rOyIlaGIffYxAKUqXLE\nbQIDAQAB\n-----END PUBLIC KEY-----'

    user_key = open(os.path.join(os.getcwd(), 'keys/user.dev.key'), 'r').read()

else:
    TABLE_NAME = 'stacle-flowchart'

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

def convert_to_code(comp, components, f, block_count = 0):
    if comp['type'] == 'STATEMENT':
        f.write(comp['statement'] + '\n')

    elif comp['type'] == 'PRINT':
        f.write('print(%s)\n' % (comp['print']))

    elif comp['type'] == 'INPUT':
        methods = {
            "Integer": 'int',
            'Decimal': 'float',
            'Boolean': 'bool',
            'Character': 'chr',
            'String': ''
        }

        if comp['isArray']:
            f.write('%s = [%s(i) for i in input().split()]\n' % (comp['var'], methods[comp['varType']]))
        else:
            f.write('%s = %s(input())\n' % (comp['var'], methods[comp['varType']]))
        
    elif comp['type'] == 'STOP':
        return 'COMPLETED'
    
    elif comp['type'] == 'DECISION':
        exitIndex = None
        loop = False
        block_count += 1
        print(block_count)

        if comp['branch'] == 'TWO':
            start = comp['index']
            temp = comp['connectedTo']['trueBlock']
            
            connectIndexes = [temp]
            while temp != '':
                if temp == start:
                    loop = True
                    exitIndex = start
                    break

                if components[temp]['type'] == 'DECISION':
                    if components[temp]['branch'] == 'TWO':
                        connectIndexes.append(components[temp]['connectedTo']['falseBlock'])
                        temp = components[temp]['connectedTo']['falseBlock']
                    else:
                        connectIndexes.append(components[temp]['connectedTo']['outerBlock'])
                        temp = components[temp]['connectedTo']['outerBlock']
                
                elif components[temp]['type'] == 'STOP':
                    connectIndexes.append(temp)
                    break

                else:
                    connectIndexes.append(components[temp]['connectedTo'])
                    temp = components[temp]['connectedTo']

            if not exitIndex:
                temp = comp['connectedTo']['falseBlock']
                while temp != '':
                    if temp in connectIndexes:
                        exitIndex = temp
                        break
                    
                    if components[temp]['type'] == 'DECISION':
                        if components[temp]['branch'] == 'TWO':
                            temp = components[temp]['connectedTo']['falseBlock']
                        else:
                            temp = components[temp]['connectedTo']['outerBlock']
                    else:
                        temp = components[temp]['connectedTo']

        else:
            exitIndex = comp['connectedTo']['outerBlock']

        if not loop:
            f.write('if %s:\n' % (comp['condition']))
            i = comp['connectedTo']['trueBlock']
            while i != exitIndex:
                f.write('\t' * block_count)
                i = convert_to_code(components[i], components, f, block_count)

            if comp['branch'] == 'TWO':
                f.write('\t' * (block_count - 1))
                f.write('else:\n')
                i = comp['connectedTo']['falseBlock']
                while i != exitIndex:
                    f.write('\t' * block_count)
                    i = convert_to_code(components[i], components, f, block_count)
                block_count -= 1
        
        else:
            f.write('while %s:\n' % (comp['condition']))
            i = comp['connectedTo']['trueBlock']
            while i != exitIndex:
                f.write('\t' * block_count)
                i = convert_to_code(components[i], components, f, block_count)
            
            block_count -= 1
            exitIndex = components[exitIndex]['connectedTo']['falseBlock']
        return exitIndex
    
    if comp['connectedTo'] == '':
        return 'CONNECTION_BROKEN'

    return comp['connectedTo']

def parse_components(components):
    path = os.path.join(UPLOAD_FOLDER, 'temp.py')
    f = open(path, 'w')

    comp = components[0]
    while comp != '':
        ind = convert_to_code(comp, components, f)
        if type(ind) == int:
            print(components[ind])
            comp = components[ind]
        
        elif ind == 'COMPLETED':
            break
        
        else:
            return ind
    f.close()
    return path

from . import routes