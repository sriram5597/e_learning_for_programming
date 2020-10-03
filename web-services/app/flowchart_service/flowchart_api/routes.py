import requests
import os
import boto3

from decimal import Decimal
from flask import make_response, jsonify, request
from jwt import ExpiredSignatureError
from requests_toolbelt.multipart.encoder import MultipartEncoder
from datauri import DataURI

from . import flowchart_api_blueprint, verify_token, verify_instructor, parse_components, TABLE_NAME, COMPILER_SERVICE, UPLOAD_FOLDER, BUCKET_NAME
from .logs.logger import info_log, error_log

s3 = boto3.resource('s3')
s3_client = boto3.client('s3')
dynamob = boto3.resource('dynamodb')
flowchart_table = dynamob.Table(TABLE_NAME)

def has_token(request):
    if 'Authorization' in request.headers.keys():
        return True
    return False

@flowchart_api_blueprint.route('/flowchart/', methods = [ 'GET' ])
def health_check():
    info_log(200, '/', 'HEALTH CHECK')
    return make_response(jsonify(message = "Stacle Flow Chart Service"), 200)

@flowchart_api_blueprint.route('/flowchart/get-code/', methods = [ 'POST' ])
def convert_flowchart():
    try:
        if not has_token(request):
            error_log(401, 'Execute Flowchart', 'Token not Found')
            return make_response(jsonify(error = "Token not found"), 401)

        token = request.headers['Authorization'].split(" ")[-1]
        decoded = verify_token(token)
        
        components = request.json['components']
        position = request.json['position']
        
        file_path = parse_components(components)

        if file_path == 'CONNECTION_BROKEN':
            info_log(400, 'Execute Flowchart', 'Flow Incomplete')
            return make_response(jsonify(error = "Connection Broken in Flowchart"), 400)
        
        data = {
            'code': open(file_path, 'r').read(),
            'language': 'python',
            'filename': 'temp.py'
        }
    
        #os.system('rm -rf %s/*' % (UPLOAD_FOLDER)
        
        flowchart_table.put_item(
            Item = {
                'username': decoded['username'],
                'problem_id': request.json['problem_id'],
                'components': components,
                'position': position
            }
        )

        info_log(200, 'Convert Flowchart', 'converted flowchart')
        return make_response(jsonify(data), 200)
    
    except ExpiredSignatureError as err:
        error_log(401, 'Convert Flowchart', err)
        return make_response(jsonify(error = '%s' % (err)), 401)
    
    except Exception as err:
        error_log(500, 'Convert Flowchart', err)
        return make_response(jsonify(error = 'something went wrong'), 500)


@flowchart_api_blueprint.route('/flowchart/save-chart/', methods = [ 'POST' ])
def save_flowchart():
    try:
        if not has_token(request):
            error_log(401, 'Execute Flowchart', 'Token not Found')
            return make_response(jsonify(error = "Token not found"), 401)

        token = request.headers['Authorization'].split(" ")[-1]
        decoded = verify_token(token)

        if 'problem_id' not in request.args.keys():
            return make_response(jsonify(error = "Problem Id missing in args"), 400)

        prb_id = request.args.get('problem_id')
        
        img = request.json['chart']

        img = DataURI(img)

        s3.Bucket(BUCKET_NAME).put_object(Key = '%s/%s.png' % (decoded['username'], prb_id), Body = img.data)

        info_log(200, 'Save Flowchart', 'Saved flowchart')
        return make_response(jsonify(message = "Chart Saved"), 200)
    
    except ExpiredSignatureError as err:
        error_log(401, 'Save Flowchart', err)
        return make_response(jsonify(error = '%s' % (err)), 401)
    
    except Exception as err:
        error_log(500, 'Save Flowchart', err)
        return make_response(jsonify(error = 'something went wrong'), 500)

@flowchart_api_blueprint.route('/flowchart/load-chart/', methods = [ 'GET' ])
def load_flowchart():
    try:
        if not has_token(request):
            error_log(401, 'Execute Flowchart', 'Token not Found')
            return make_response(jsonify(error = "Token not found"), 401)

        token = request.headers['Authorization'].split(" ")[-1]
        decoded = verify_token(token)
        
        if 'problem_id' not in request.args.keys():
            return make_response(jsonify(error = "Problem Id missing in args"), 400)

        prb_id = request.args.get('problem_id')

        res = s3_client.generate_presigned_url('get_object', Params = {'Bucket': BUCKET_NAME, 'Key': '%s/%s.png' % (decoded['username'], prb_id)},
                ExpiresIn = 7000
        )

        info_log(200, 'load Flowchart', 'loaded flowchart')
        return make_response(jsonify(url = res), 200)
    
    except ExpiredSignatureError as err:
        error_log(401, 'load Flowchart', err)
        return make_response(jsonify(error = '%s' % (err)), 401)
    
    except Exception as err:
        error_log(500, 'load Flowchart', err)
        return make_response(jsonify(error = 'something went wrong'), 500)

#load components
@flowchart_api_blueprint.route('/flowchart/load-components/', methods = [ 'GET' ])
def load_components():
    try:
        if not has_token(request):
            error_log(401, 'Execute Flowchart', 'Token not Found')
            return make_response(jsonify(error = "Token not found"), 401)

        token = request.headers['Authorization'].split(" ")[-1]
        decoded = verify_token(token)

        if 'problem_id' not in request.args.keys():
            return make_response(jsonify(error = "Problem Id missing in args"), 400)
        
        prb_id = request.args.get('problem_id')

        res = flowchart_table.get_item(
            Key = {
                'username': decoded['username'],
                'problem_id': prb_id
            }
        )['Item']

        components = []
        for comp in res['components']:
            comp['index'] = float(comp['index'])
            if 'connectedTo' in comp.keys():
                comp['connectedTo'] = float(comp['connectedTo'])
            components.append(comp)

        position = {}
        for pos in res['position']:
            res['position'][pos]['x'] = float(res['position'][pos]['x'])
            res['position'][pos]['y'] = float(res['position'][pos]['y'])
            position[pos] = res['position'][pos]
        
        info_log(200, 'load Components', 'loaded components')
        return make_response(jsonify(res = {'components': components, 'position': position}), 200)
    
    except ExpiredSignatureError as err:
        error_log(401, 'load Components', err)
        return make_response(jsonify(error = '%s' % (err)), 401)
    
    except Exception as err:
        error_log(500, 'load Components', err)
        return make_response(jsonify(error = 'something went wrong'), 500)