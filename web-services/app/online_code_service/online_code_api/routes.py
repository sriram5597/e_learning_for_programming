import boto3
import os
import requests
import uuid
import math

from flask import make_response, jsonify, request, stream_with_context, Response
from werkzeug.utils import secure_filename
from zipfile import ZipFile
from botocore.exceptions import ClientError
from requests_toolbelt.multipart.encoder import MultipartEncoder
from jwt import ExpiredSignatureError
from boto3.dynamodb.conditions import Key, Attr
from datauri import DataURI

from . import online_code_api_blueprint, calculate_score, verify_instructor, verify_token, NotUniqueError
from . import BUCKET_NAME, UPLOAD_FOLDER, COURSE_FLOW_SERVICE, COMPILER_SERVICE, CURRENT_COURSE_SERVICE, TABLE_NAME, FLOWCHART_SERVICE

from .logs.logger import info_log, error_log

s3_client = boto3.client('s3', )
s3 = boto3.resource('s3')

dynamodb = boto3.resource('dynamodb')
online_code_table = dynamodb.Table(TABLE_NAME)

lanugage_ext = {
    'java': 'java',
    'python': 'py',
    'c++': 'cpp',
}

def get_problem(id):
    res = online_code_table.get_item(
        Key = {
            'problem_id': id
        }
    )

    return res['Item']

def has_token(request):
    if 'Authorization' in request.headers.keys():
        return True
    return False

@online_code_api_blueprint.route('/code/', methods = [ 'GET' ])
def health_check():
    info_log(200, '/', 'HEALTH CHECK')
    return make_response(jsonify(message = "Stacle online code service"), 200)

#-----------_Create Problem
@online_code_api_blueprint.route('/code/<course>/create/', methods = [ 'POST' ])
def create_problem_statement(course):
    try:
        if not has_token(request):
            error_log(401, 'Create Problem', "Token not Found")
            return make_response(jsonify(error = "Token Not Found"), 401)

        token = request.headers['Authorization'].split(' ')[-1]
        decoded = verify_instructor(token)
        data = {}
        
        data['author'] = decoded['username']

        data['course'] = course
        data['problem_id'] = str(uuid.uuid4())
        data['problem_description'] = request.json['problem_description']
        
        data['constraints'] = request.json['constraints']
        data['input_format'] = request.json['input_format']
        data['output_format'] = request.json['output_format']
        data['testcases'] = []
        data['hints'] = []

        data['need_flowchart'] = request.json['need_flowchart']
        
        data['max_score'] = int(request.json['max_score'])
        data['sample_testcases'] = []

        online_code_table.put_item(
            Item = data
        )
        
        info_log(200, 'Create Problem', 'Problem %s created' % (data['problem_id']))
        return make_response(jsonify(id = data['problem_id']), 200)

    except ExpiredSignatureError as err:
        error_log(401, 'Create Problem', err)
        return make_response(jsonify(error = '%s' % (err)), 401)

    except Exception as err:
        error_log(500, 'Create Problem', err)
        return make_response(jsonify(error = 'Something went wrong'), 500)

#---------delete problem
@online_code_api_blueprint.route('/code/<id>/', methods = [ 'DELETE' ])
def delete_prb(id):
    try:
        if not has_token(request):
            error_log(401, 'Create Problem', "Token not Found")
            return make_response(jsonify(error = "Token Not Found"), 401)

        token = request.headers['Authorization'].split(' ')[-1]
        decoded = verify_instructor(token)

        for obj in s3.Bucket(BUCKET_NAME).objects.filter(Prefix = 'testcases/%s/' % (id)):
            s3.Object(BUCKET_NAME, obj.key).delete()

        for obj in s3.Bucket(BUCKET_NAME).objects.filter(Prefix = 'code/%s/' % (id)):
            s3.Object(BUCKET_NAME, obj.key).delete()

        code = online_code_table.get_item(
            Key = {
                'problem_id': id
            }
        )['Item']

        online_code_table.delete_item(
            Key = {
                'problem_id': id
            }
        )
        
        info_log(200, 'Delete Problem', 'Problem %s deleted' % (id))
        return make_response(jsonify(points = str(code['max_score'])), 200)

    except ExpiredSignatureError as err:
        error_log(401, 'Create Problem', err)
        return make_response(jsonify(error = '%s' % (err)), 401)

    except Exception as err:
        error_log(500, 'Create Problem', err)
        return make_response(jsonify(error = 'Something went wrong'), 500)

#----------Upload testcase
@online_code_api_blueprint.route('/code/<id>/upload/testcase/', methods = ['POST'])
def upload_test_cases(id):
    try:
        if not has_token(request):
            error_log(401, 'Create Problem', "Token not Found")
            return make_response(jsonify(error = "Token Not Found"), 401)

        token = request.headers['Authorization'].split(' ')[-1]
        decoded = verify_instructor(token)
    
        ALLOWED_FILE_EXTENSIONSs3 = ['txt', ' zip']    

        ext = request.json['ext']

        prb = get_problem(id)
        
        if ext == 'txt':
            inp_file = request.json['input']
            out_file = request.json['output']
            
            count = len(prb['testcases']) + 1
            
            inp_file_path = 'testcases/%s/input/inp-0%s.txt' % (id, count)
            out_file_path = 'testcases/%s/output/out-0%s.txt' % (id, count)
            
            input_file = os.path.join(UPLOAD_FOLDER, 'inp.txt')
            output_file = os.path.join(UPLOAD_FOLDER, 'out.txt')

            inp = DataURI(inp_file)
            out = DataURI(out_file)
            open(input_file, 'w').write(inp.data)
            open(output_file, 'w').write(out.data)
            
            s3.Bucket(BUCKET_NAME).put_object(Key = inp_file_path, Body = open(input_file, 'rb').read())
            s3.Bucket(BUCKET_NAME).put_object(Key = out_file_path, Body = open(output_file, 'rb').read())

            test = dict(input = inp_file_path, output = out_file_path, points = '0.0')
            testcases = prb['testcases']
            testcases.append(test)

            if float(prb['max_score']) != 0:
                testcases = calculate_score(testcases, float(prb['max_score']), BUCKET_NAME)
            
            online_code_table.update_item(
                Key = {
                    'problem_id': id
                },
                UpdateExpression = 'SET testcases = :value',
                ExpressionAttributeValues = {
                    ':value': testcases
                }
            )
            
            os.system('rm -rf %s/*' % (UPLOAD_FOLDER))

            prb['max_score'] = str(prb['max_score'])
            info_log(200, 'Upload Testcase', 'Testcase added to %s' % (id))
            return make_response(jsonify(res = prb), 200)
        
        if ext == 'zip':
            if len(prb['testcases']) > 0:
                error_log(400, 'Upload Testcase', "%s contains testcases..Zip can be uploaded when there is 0 testcase" % (id))
                return make_response(jsonify(error = "Zip can be uploaded when there are no testcases"), 400)
            
            count = request.json['test_count']

            testcases = []
            for i in range(count):
                inp_file_path = os.path.join('testcases/%s/input' %(prb['problem_id']), 'inp-%s.txt' % (i))
                out_file_path = os.path.join('testcases/%s/output' %(prb['problem_id']), 'inp-%s.txt' % (i))

                temp = dict(input = inp_file_path, output = out_file_path, points = '0.0')

                testcases.append(temp)

            res = online_code_table.update_item(
                Key = {
                    'problem_id': id
                },
                UpdateExpression = 'SET testcases = :value',
                ExpressionAttributeValues = {
                    ':value': testcases
                },
                ReturnValues = 'ALL_NEW'
            )   

            key = 'testcases/%s/testcase.zip' % (id)
            credentials = s3_client.generate_presigned_post(BUCKET_NAME, key, ExpiresIn = 900)
            
            prb = res['Attributes']
            prb['max_score'] = str(prb['max_score'])

            info_log(200, 'Upload Testcase', "Tescase uploaded for %s" % (id))
            return make_response(jsonify(problem = prb, credentials = credentials), 200)

        os.system('rm -rf %s/*' % (UPLOAD_FOLDER))
        
        prb = res['Attributes']
        prb['max_score'] = str(prb['max_score'])

        info_log(200, 'Upload Testcase', "Tescase uploaded for %s" % (id))
        return make_response(jsonify(res = prb), 200)

    except ExpiredSignatureError as err:
        error_log(401, 'Upload Testcase', err)
        return make_response(jsonify(error = '%s' % (err)), 401)

    except Exception as err:
        error_log(500, 'Upload Testcase', err)
        return make_response(jsonify(error = 'Something went wrong'), 500)

#--------------------upload sample testcase
@online_code_api_blueprint.route('/code/<id>/sampletest/', methods = [ 'POST' ])
def set_sample(id):
    try:
        if not has_token(request):
            error_log(401, 'Create Problem', "Token not Found")
            return make_response(jsonify(error = "Token Not Found"), 401)

        token = request.headers['Authorization'].split(" ")[-1]
        decoded = verify_instructor(token)
        prb = get_problem(id)

        if 'op' not in request.args.keys():
            error_log(400, 'Update Sampletestcase', "Op is missing in args")
            return make_response(jsonify(error = "Op is missing in args"), 400)
        
        op = request.args.get('op')

        testcases = prb['sample_testcases']
        if op != 'delete':
            inp = request.json['input']
            out = request.json['output']
            explain = request.json['explain']

            data = {
                'input': inp,
                'output': out, 
                'explanation': explain
            }

            if op == 'add':
                testcases.append(data)            
            
            elif op == 'update':
                index = int(request.json['index'])
                testcases[index] = data
        
        elif op == 'delete':   
            index = int(request.json['index'])
            testcases.pop(index)

        else:
            error_log(400, 'Update Sample Testcase', 'Invalid OP')
            return make_response(jsonify(error = "Invalid Operation"), 400)
        
        res = online_code_table.update_item(
            Key = {
                'problem_id': id
            },
            UpdateExpression = 'SET #testcases = :data',
            ExpressionAttributeNames = {
                '#testcases': 'sample_testcases'
            },
            ExpressionAttributeValues = {
                ':data': testcases
            },
            ReturnValues = 'ALL_NEW'
        )

        prb = res['Attributes']
        prb['max_score'] = str(prb['max_score'])
        
        info_log(200, '%s Sample Testcase' % (op.upper()), 'Sample testcase for %s is added' % (id))
        return make_response(jsonify(res  = prb), 200)
             
    except ExpiredSignatureError as err:
        error_log(401, 'Update SampleTestcase', err)
        return make_response(jsonify(error = '%s' % (err)), 401)

    except Exception as err:
        error_log(500, 'Update SampleTestcase', err)
        return make_response(jsonify(error = 'Something went wrong'), 500)

#-------------validating testcases
@online_code_api_blueprint.route('/code/<id>/compile/', methods = [ 'POST' ])
def compile_code(id):
    try:
        if not has_token(request):
            error_log(401, 'Create Problem', "Token not Found")
            return make_response(jsonify(error = "Token Not Found"), 401)

        token = request.headers['Authorization'].split(" ")[-1]
        decoded = verify_token(token)

        if 'source-type' not in request.args.keys():
            error_log(400, 'Validate Testcase', "Missing source-type in args")
            return make_response(jsonify(error ="Source type missing in args"), 400)

        compile_type = request.args.get('type')
        source_type = request.args.get('source-type')
        code = ""
        
        if source_type == 'code':
            language = request.json['language']
            file_name = request.json['filename']

            f = True
            if request.json.get('code') is not None:
                f = False
                code = request.json['code']
            
            else:
                code = request.files['code']
        else:
            data = {
                'components': request.json['components'],
                'problem_id': id,
                'position': request.json['position']
            }

            header = { 'Authorization': request.headers['Authorization'], 'Content-Type': 'application/json'}
            res = requests.post('%s/get-code/' % (FLOWCHART_SERVICE), json = data, headers = header)

            if res.status_code == 400:
                return make_response(res.json(), 400)

            if res.status_code != 200:
                error_log(500, "Online Code Service -> Flowchart Service", "Error converting chart to Code")
                return make_response(jsonify(error = "Error converting chart to code"), 500)
            
            code = res.json()['code']
            language = res.json()['language']
            file_name = res.json()['filename']
            f = False
        
        if compile_type == 'sample': 
            sample = True
        else:
            sample = False

        prb = get_problem(id)
        file_path = os.path.join(UPLOAD_FOLDER, file_name)
        
        if sample:
            input_keys = [ inp['input'] for inp in prb['sample_testcases'] ]
            output_keys = [ out['output'] for out in prb['sample_testcases'] ]
        
        else:
            input_keys = [ inp['input'] for inp in prb['testcases'] ]
            output_keys = [ out['output'] for out in prb['testcases'] ]

        if not f:
            open(file_path, 'w').write(code)
        else:
            code.save(file_path)
        
        data = MultipartEncoder(
                fields = {
                    'code': (file_name, open(file_path, 'r').read(), 'text/plain'),
                    'language': language,
                    'input_keys': str(input_keys),
                    'output_keys': str(output_keys),
                }
            )
        
        if sample:    
            url = '%s/sampletestcases/' % (COMPILER_SERVICE)

        else:
            url = '%s/testcases/' % (COMPILER_SERVICE)

        response = requests.post(url, data = data, headers = {"Content-Type": data.content_type})    
        os.system('rm -f %s' %(file_path))    
        
        if response.status_code != 200:
            error_log(500, "Online Code -> Compiler Service", "Error validating testcase in compiler service")
            return make_response(jsonify(error = "Something went wrong"), 500)
        
        info_log(200, "Online Code -> Compiler Service", "Validated in compiler service")
        score = 0.0
        
        if compile_type != 'sample':
            input_cases = [k['input'] for k in prb['testcases']]

            for r in response.json()['result'].keys():
                if response.json()['result'][r]['status'] == 'passed':
                    ind = input_cases.index('testcases/%s/input/inp-%s.txt' % (id, r))
                    score += float(prb['testcases'][ind]['points'])

            score = round(score, 2) // 2
            
            if compile_type != 'preview':
                header = { 'Authorization': request.headers['Authorization'], 'content-type': "Application/json"}
                task = {
                    'type': 'CODE',
                    'total': str(prb['max_score']),
                    'scope': request.json['scope']
                }
                if source_type == 'code':
                    task['code'] = score
                else:
                    task['flowchart'] = score

                data = {
                    'id': id,
                    'task': task,
                }
                res = requests.patch("%s/%s/complete-task/" % (CURRENT_COURSE_SERVICE, prb['course']), json = data, headers = header)

                if res.status_code != 200:
                    error_log(500, 'Compute Score -> Current Course', 'Error adding Task to current course')
                    return make_response(jsonify(error = "Error adding Task to current course"), 500)
            
                info_log(200, 'Compute Score -> Current Course', "Task added to current course")
                info_log(200, 'Validate Testcase', 'Validated Testcase for %s' % (id))    

                return make_response(jsonify(res = response.json(), current = res.json(), score = score), 200)
                
            info_log(200, 'Validate Testcase', 'Validated Testcase for %s' % (id))
            return make_response(jsonify(res = response.json(), score = score), 200)
        
        info_log(200, 'Validate Sample Testcase', 'Validated Sample Testcase for %s' % (id))
        out = response.json()
        return make_response(jsonify(res = out), 200)
    
    except ExpiredSignatureError as err:
        error_log(401, 'Validate Testcase', err)
        return make_response(jsonify(error = '%s' % (err)), 401)

    except Exception as err:
        error_log(500, 'Validate Testcase', err)
        return make_response(jsonify(error = 'Something went wrong'), 500)

#_--------running a code
@online_code_api_blueprint.route('/code/run/', methods = ['POST'])
def run_code():
    try:
        if not has_token(request):
            error_log(401, 'Create Problem', "Token not Found")
            return make_response(jsonify(error = "Token Not Found"), 401)

        token = request.headers['Authorization'].split(" ")[-1]
        decoded = verify_token(token)

        source_type = request.args.get('source-type')
        inp = request.json['input']
        code = ""
        filename = ""
        language = ""

        f = True
        if source_type == 'code':
            language = request.json['language']
            file_name = request.json['filename']

            if 'code' in request.json.keys():
                f = False
                code = request.json['code']
            
            else:
                code = request.files['code']

        else:
            f = False
            data = {
                'components': request.json['components'],
                'position': request.json['position'],
                'problem_id': request.args.get('problem_id')
            }
            header = { 'Authorization': request.headers['Authorization'], 'Content-Type': 'application/json'}

            res = requests.post('%s/get-code/' % (FLOWCHART_SERVICE), json = data, headers = header)
            
            if res.status_code == 400:
                return make_response(res.json(), 400)

            if res.status_code != 200:
                error_log(500, "Online Code Service -> Flowchart Service", "Error converting chart to Code")
                return make_response(jsonify(error = "Error converting chart to code"), 500)
            
            code = res.json()['code']
            language = res.json()['language']
            file_name = res.json()['filename']
            
        prgm_file_path = os.path.join(UPLOAD_FOLDER, file_name)
        inp_file_path = os.path.join(UPLOAD_FOLDER, 'inp.txt')
        
        if not f:
            open(prgm_file_path, 'w').write(code)
        else:
            code.save(prgm_file_path)  
            
        open(inp_file_path, 'w').write(inp)

        data = MultipartEncoder(
            fields = {
                'code': (file_name, open(prgm_file_path, 'r').read(), 'text/plain'),
                'language': language,
                'input': ('inp.txt', open(inp_file_path, 'r').read(), 'text/plain')
            }
        )

        response = requests.post('%s/run/' % (COMPILER_SERVICE), data = data, headers = {"Content-Type": data.content_type})
        current = os.getcwd()
        
        os.chdir(UPLOAD_FOLDER)
        os.system('rm -rf *')
        os.chdir(current)

        if response.status_code != 200:
            error_log(500, "Run Code -> Compiler/Code/run", "Error compiling code")
            return make_response(jsonify(error = "Something went wrong"), 500)

        info_log(200, "Run Code -> Compiler/Code/run", "Code compiled successfully")
        info_log(200, 'Run Code', 'Code Compiled Successfully')
        return make_response(response.json(), 200)

    except ExpiredSignatureError as err:
        error_log(401, 'Run Code', err)
        return make_response(jsonify(error = '%s' % (err)), 401)

    except Exception as err:
        error_log(500, 'Run Code', err)
        return make_response(jsonify(error = 'Something went wrong'), 500)

#---------------------get problem
@online_code_api_blueprint.route('/code/<id>/', methods = [ 'GET' ])
def get_prb(id):
    try:
        if not has_token(request):
            error_log(401, 'Create Problem', "Token not Found")
            return make_response(jsonify(error = "Token Not Found"), 401)

        token = request.headers['Authorization'].split(" ")[-1]
        decoded = verify_token(token)
        
        res = online_code_table.get_item(
            Key = {
                'problem_id': id
            }
        )
        prb = res['Item']
        
        prb['max_score'] = str(prb['max_score'])

        if prb['author'] != decoded['username']:
            prb = { k: prb[k] for k in prb.keys() if k != 'testcases' and k != 'hints' and k != 'flowchart'}
        
        info_log(200, 'Get Problem', 'Problem %s' % (id))
        return make_response(jsonify(res = prb), 200)

    except KeyError as err:
        error_log(404, 'Get Problem', 'Problem %s not found' % (id))
        return make_response(jsonify(error = "%s not found" % (id)), 404)
    
    except ExpiredSignatureError as err:
        error_log(401, 'Get Problem', err)
        return make_response(jsonify(error = '%s' % (err)), 401)

    except Exception as err:
        error_log(500, 'Get Problem', err)
        return make_response(jsonify(error = "Something went wrong"), 500)

#---------------updating problem
@online_code_api_blueprint.route('/code/<id>/', methods = [ 'PATCH' ])
def update_problem(id):
    try:
        if not has_token(request):
            error_log(401, 'Create Problem', "Token not Found")
            return make_response(jsonify(error = "Token Not Found"), 401)

        token = request.headers['Authorization'].split(" ")[-1]
        decoded = verify_instructor(token)
        
        prb = get_problem(id)   

        if prb['author'] == decoded['username']:
            data = {}
            
            if 'problem_description' in request.json.keys():
                data['problem_description'] = request.json['problem_description']

            if 'input_format' in request.json.keys():
                data['input_format'] = request.json['input_format']

            if 'output_format' in request.json.keys():
                data['output_format'] = request.json['output_format']
            
            if 'constraints' in request.json.keys():
                data['constraints'] = request.json['constraints']

            if 'tags' in request.json.keys():
                data['tags'] = request.json['tags']

            if 'need_flowchart' in request.json.keys():
                data['need_flowchart'] = request.json['need_flowchart']

            if 'hints' in request.json.keys():
                data['hints'] = request.json['hints']
            
            if 'max_score' in request.json.keys():
                prb = get_problem(id)
                testcases = prb['testcases']
                data['max_score'] = int(request.json['max_score'])

                scores = calculate_score(testcases, int(data['max_score']), BUCKET_NAME)
                data['testcases'] = scores
            
            expr = 'SET '
            for k in data.keys():
                if k == 'constraints':
                    expr += 'conts = :conts,'
                else:
                    expr += '%s = :%s,' % (k, k)
            
            expr = expr[:len(expr) - 1]
            values = {':%s' % (k) : data[k] for k in data.keys() if k!='constraints'}
            if 'constraints' in data.keys():
                values[':conts'] = data['constraints']

            res = online_code_table.update_item(
                Key = {
                    'problem_id': id
                },
                UpdateExpression = expr,
                ExpressionAttributeValues = values,
                ReturnValues = 'ALL_NEW'
            )['Attributes']
            
            res['max_score'] = str(res['max_score'])

            info_log(200, 'Update Problem', 'Problem %s is updated' % (id))
            return make_response(jsonify(res = res), 200)

        else:
            return make_response(jsonify(error = "Forbidden"), 403)
    
    except ExpiredSignatureError as err:
        error_log(401, 'Update Problem', err)
        return make_response(jsonify(error = '%s' % (err)), 401)
        
    except Exception as err:
        error_log(500, 'Update Problem', err)
        return make_response(jsonify(error = "Something went wrong"), 500)

#----------------save code
@online_code_api_blueprint.route('/code/<id>/save-code/', methods = [ 'POST' ])
def save_code(id):
    try:
        if not has_token(request):
            error_log(401, 'Create Problem', "Token not Found")
            return make_response(jsonify(error = "Token Not Found"), 401)

        token = request.headers['Authorization'].split(" ")[-1]
        decoded = verify_token(token)
        prb = get_problem(id)   

        if 'code_file' in request.files:
            code_file = request.files['code_file']
            file_path = os.path.join(UPLOAD_FOLDER, code_file.filename)
            code_file.save(file_path)
            code = open(file_path, 'r').read()
            ext = code_file.filename.split('.')[-1]
            os.system('rm -f file_path')

        else:
            code = request.json['code']
            ext = request.json['filename'].split('.')[-1]

        file_name = '%s.%s' %(id, ext)

        key = 'code/%s/%s'%(decoded['username'], file_name)

        s3.Bucket(BUCKET_NAME).put_object(Key = key, Body = code)

        info_log(200, 'Save Code', 'code saved by %s' % (decoded['username']))
        return make_response(jsonify(message = "Code Saved"), 200)

    except KeyError as err:
        error_log(404, 'Save Code', 'Problem %s not found' % (id))
        return make_response(jsonify(error = "%s not found" % (id)), 404)
    
    except ExpiredSignatureError as err:
        error_log(401, 'Save Problem', err)
        return make_response(jsonify(error = '%s' % (err)), 401)
       
    except Exception as err:
        error_log(500, 'Save Code', err)
        return make_response(jsonify(error = "Something went wrong"), 500)

#------------load code
@online_code_api_blueprint.route('/code/<id>/load-code/', methods = [ 'GET' ])
def load_code(id):
    try:
        if not has_token(request):
            error_log(401, 'Create Problem', "Token not Found")
            return make_response(jsonify(error = "Token Not Found"), 401)

        token = request.headers['Authorization'].split(" ")[-1]
        decoded = verify_token(token)
        prb = get_problem(id)   

        if 'language' not in request.args.keys():
            return make_response(jsonify(error = "language missing in args"), 400)

        lanugage = request.args.get('language')

        key = 'code/%s/%s.%s' % (decoded['username'], id, lanugage_ext[lanugage])
        
        code = s3_client.get_object(Bucket = BUCKET_NAME, Key = key)['Body'].read()
        
        code = str(code, 'utf-8')
        
        info_log(200, 'Load Code', '%s loaded code for %s' % (decoded['username'], id))
        return make_response(jsonify(code = code), 200)
    
    except KeyError as err:
        error_log(404, 'Load Code', 'Problem %s not found' % (id))
        return make_response(jsonify(error = "%s not found" % (id)), 404)
    
    except ExpiredSignatureError as err:
        error_log(401, 'Load Code', err)
        return make_response(jsonify(error = '%s' % (err)), 401)
       
    except Exception as err:
        error_log(500, 'Load Code', err)
        return make_response(jsonify(error = "Something went wrong"), 500)

#------------delete testcases
@online_code_api_blueprint.route('/code/<id>/testcases/', methods = [ 'DELETE' ])
def delete_testcases(id):
    try:
        if not has_token(request):
            error_log(401, 'Create Problem', "Token not Found")
            return make_response(jsonify(error = "Token Not Found"), 401)

        token = request.headers['Authorization'].split(' ')[-1]
        decoded = verify_instructor(token)
        prb = get_problem(id)   

        if prb['author'] != decoded['username']:
            error_log(403, 'Delete Testcases', 'FORBIDDEN')
            return make_response(jsonify(error = "Forbidden"), 403)

        s3.Bucket(BUCKET_NAME).objects.filter(Prefix = "testcases/%s/input" %(id)).delete()
        s3.Bucket(BUCKET_NAME).objects.filter(Prefix = "testcases/%s/output" %(id)).delete()

        prb['testcases'] = []

        res = online_code_table.update_item(
            Key = {
                'problem_id': id
            },
            UpdateExpression = 'SET testcases = :val',
            ExpressionAttributeValues = {
                ':val': []
            },
            ReturnValues = 'ALL_NEW'
        )

        prb = res['Attributes']
        prb['max_score'] = int(prb['max_score'])

        info_log(200, 'Delete Testcases', 'Problem %s testcases deleted' % (id))
        return make_response(jsonify(res = prb), 200)

    except KeyError as err:
        error_log(404, 'Delete Testcases', 'Problem %s not found' % (id))
        return make_response(jsonify(error = "%s not found" % (id)), 404)
    
    except ExpiredSignatureError as err:
        error_log(401, 'Delete Testcases', err)
        return make_response(jsonify(error = '%s' % (err)), 401)
       
    except Exception as err:
        error_log(500, 'Delete Testcases', err)
        return make_response(jsonify(error = "Something went wrong"), 500)

#------------get testcase
@online_code_api_blueprint.route('/code/<id>/testcase/', methods= [ 'GET', 'DELETE' ])
def get_testcase(id):
    try:
        if not has_token(request):
            error_log(401, 'Create Problem', "Token not Found")
            return make_response(jsonify(error = "Token Not Found"), 401)

        token = request.headers['Authorization'].split(" ")[-1]
        decoded = verify_token(token)
        prb = get_problem(id)   

        if 'index' not in request.args.keys():
            return make_response(jsonify(error = 'Missing index in args'), 400)

        index = int(request.args.get('index'))
        
        testcase = prb['testcases'][index]
        testcases = prb['testcases']

        if request.method == 'DELETE':
            s3_client.delete_object(Bucket = BUCKET_NAME, Key = testcase['input'])
            s3_client.delete_object(Bucket = BUCKET_NAME, Key = testcase['output'])

            testcases.pop(index)

            scores = calculate_score(testcases, float(prb['max_score']), BUCKET_NAME)

            res = online_code_table.update_item(
                Key = {
                    'problem_id': id
                },
                UpdateExpression = 'SET testcases = :testcase',
                ExpressionAttributeValues = {
                    ':testcase': scores
                },
                ReturnValues = 'ALL_NEW'
            )

            prb = res['Attributes']
            prb['max_score'] = str(prb['max_score'])

            info_log(200, 'Delete Testcase', 'Testcase deleted from %s' % (id))
            return make_response(jsonify(res = prb), 200)

        else:
            inp = s3_client.get_object(Bucket = BUCKET_NAME, Key = testcase['input'])['Body'].read().decode('utf-8')
            out = s3_client.get_object(Bucket = BUCKET_NAME, Key = testcase['output'])['Body'].read().decode('utf-8')
        
            info_log(200, 'Get Testcase', 'Testcase fetched for %s' % (id))
            return make_response(jsonify(input = inp, output = out), 200)

    except ExpiredSignatureError as err:
        error_log(401, '%s Testcase' % (request.method), err)
        return make_response(jsonify(error = '%s' % (err)), 401)
       
    except Exception as err:
        error_log(500, '%s Testcase' % (request.method), err)
        return make_response(jsonify(error = "Something went wrong"), 500)

#------------support
@online_code_api_blueprint.route('/code/<id>/get-hint/', methods= [ 'GET' ])
def support(id):
    try:
        if not has_token(request):
            error_log(401, 'Create Problem', "Token not Found")
            return make_response(jsonify(error = "Token Not Found"), 401)

        token = request.headers['Authorization'].split(" ")[-1]
        decoded = verify_token(token)

        if request.args.get('index') is None:
            make_response(jsonify(error = "Index missing in args"), 400)

        problem = get_problem(id)
        
        index = int(request.args.get('index'))
        hint = problem['hints'][index]
        
        info_log(200, 'Get Hints', 'Hints fetched by %s' % (decoded['username']))
        return make_response(jsonify(hint = hint), 200)
            
    except ExpiredSignatureError as err:
        error_log(401, 'Get Hints', err)
        return make_response(jsonify(error = '%s' % (err)), 401)
       
    except Exception as err:
        error_log(500, 'Get Hints', err)
        return make_response(jsonify(error = "Something went wrong"), 500)

#------------test
@online_code_api_blueprint.route('/code/test/', methods= [ 'POST' ])
def test():
    try:
        print('requested')
      
        url = request.json['url']
        filename = request.json['filename']

        uri = DataURI(url)
        open(os.path.join(UPLOAD_FOLDER, filename), 'wb').write(uri.data)
        
        return make_response(jsonify(message = "uploaded"), 200)
               
    except Exception as err:
        error_log(500, 'Get Hints', err)
        return make_response(jsonify(error = "Something went wrong"), 500)