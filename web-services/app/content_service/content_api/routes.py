import requests
import boto3
import os
import uuid

from flask import make_response, jsonify, request
from werkzeug.utils import secure_filename
from jwt import ExpiredSignatureError

from . import content_api_blueprint, verify_instructor, verify_token, COURSE_FLOW_SERVICE, TABLE_NAME, UPLOAD_FOLDER, BUCKET_NAME
from .logs.logger import info_log, error_log

s3_client = boto3.client('s3')
s3 = boto3.resource('s3')
dynamodb = boto3.resource('dynamodb')
content_table = dynamodb.Table(TABLE_NAME)

def has_token(request):
    if 'Authorization' in request.headers.keys():
        return True
    return False

@content_api_blueprint.route('/content/', methods = [ 'GET' ])
def health_check():
    info_log(200, '/', 'HEALTH CHECK')
    return make_response(jsonify(message = 'Stacle course cotents service'), 200)

@content_api_blueprint.route('/content/<course>/create/', methods = ['POST'])
def create_content(course):
    try:
        if not has_token(request):
            error_log(401, 'Create Content', 'Token Not Found')
            return make_response(jsonify(error = "Token Not Found"), 401)
        
        token = request.headers['Authorization'].split(" ")[-1]
        decoded = verify_instructor(token)

        content_title = request.json['content_title']
        id = str(uuid.uuid4())

        content_table.put_item(
            Item = {
                'content_id': id,
                'course_id': course,
                'content': [],
                'content_title': content_title
            }
        )

        info_log(200, 'Add Content', 'Course content %s added to flow' % (id))
        return make_response(jsonify(content = id), 200)
    
    except ExpiredSignatureError as err:
        error_log(401, 'Add Content', err)
        return make_response(jsonify(error = '%s' % (err)), 401)
    
    except Exception as err:
        error_log(500, 'Add Content', err)
        return make_response(jsonify(error = "something went wrong"), 500)

@content_api_blueprint.route('/content/<id>/', methods = ['GET'])
def get_content(id):
    try:
        if not has_token(request):
            error_log(401, 'Get Content', 'Token Not Found')
            return make_response(jsonify(error = "Token Not Found"), 401)
        
        token = request.headers['Authorization'].split(" ")[-1]
        decoded = verify_token(token)

        res = content_table.get_item(
            Key = {
                'content_id': id
            }
        )

        info_log(200, 'Get Content', 'Content %s is fecthed' % (id))
        return make_response(jsonify(res = res['Item']), 200)
    
    except KeyError as err:
        error_log(404, 'Get Content', err)
        return make_response(jsonify(error = "Content Not Found"), 404)
    
    except ExpiredSignatureError as err:
        error_log(401, 'Get Content', err)
        return make_response(jsonify(error = '%s' % (err)), 401)
    
    except Exception as err:
        error_log(500, 'Get Content', err)
        return make_response(jsonify(error = 'something went wrong'), 500)

@content_api_blueprint.route('/content/<id>/', methods = [ 'DELETE' ])
def delete_content(id):
    try:
        if not has_token(request):
            error_log(401, 'Delete Content', 'Token Not Found')
            return make_response(jsonify(error = "Token Not Found"), 401)

        token = request.headers['Authorization'].split(" ")[-1]
        decoded = verify_instructor(token)
        
        content_table.delete_item(
            Key = {
                'content_id': id
            }
        )

        info_log(200, 'Delete Content', 'Content %s deleted' % (id))
        return make_response(jsonify(message = "%s deleted" % (id)), 200)
    
    except ExpiredSignatureError as err:
        error_log(401, 'Delete Content', err)
        return make_response(jsonify(error = '%s' % (err)), 401)
    
    except Exception as err:
        error_log(500, 'Delete Content', err)
        return make_response(jsonify(error = "something went wrong"), 500)

'''
#-----------Update Content
'''
@content_api_blueprint.route('/content/<id>/', methods = [ 'PATCH' ])
def update_content(id):
    try:
        if not has_token(request):
            error_log(401, 'Delete Content', 'Token Not Found')
            return make_response(jsonify(error = "Token Not Found"), 401)

        token = request.headers['Authorization'].split(" ")[-1]
        decoded = verify_instructor(token)

        data = {}
        expr = ''

        data['content'] = request.json['content']

        res = content_table.update_item(
            Key = {
                'content_id': id
            },
            UpdateExpression = 'SET content = :content',
            ExpressionAttributeValues = {
                ':content': data['content']
            },
            ReturnValues = 'ALL_NEW'
        )

        info_log(200, 'Update Content', 'Content %s updated' % (id))
        return make_response(jsonify(res = res['Attributes']), 200)
    
    except ExpiredSignatureError as err:
        error_log(401, 'Update Content', err)
        return make_response(jsonify(error = '%s' % (err)), 401)
    
    except Exception as err:
        error_log(500, 'Update Content', err)
        return make_response(jsonify(error = "Something went wrong"), 500)

@content_api_blueprint.route('/content/<id>/remove-content/', methods = [ 'POST' ])
def remove_content(id):
    try:
        if not has_token(request):
            error_log(401, 'Add Flowchart', 'Token Not Found')
            return make_response(jsonify(error = "Token Not Found"), 401)

        token = request.headers['Authorization'].split(" ")[-1]
        decoded = verify_instructor(token)

        index = request.json['index']
        t = request.json['type']

        if t == 'FLOWCHART':
            key = request.json['url'].split('/')[-2] + request.json['url'].split('/')[-1]

            obj = s3.Object(BUCKET_NAME, key)
            obj.delete()

        content = content_table.get_item(
            Key = {
                'content_id': id
            }
        )['Item']

        content['content'].pop(index)

        res = content_table.update_item(
            Key = {
                'content_id': id
            },
            UpdateExpression = 'SET content = :content',
            ExpressionAttributeValues = {
                ':content': content['content']
            },
            ReturnValues = 'ALL_NEW'
        )

        info_log(200, 'Delete Flowchart', 'Flowchart Deleted for %s' % (id))
        return make_response(jsonify(res = res['Attributes']), 200)
    
    except ExpiredSignatureError as err:
        error_log(401, 'Delete Flowchart', err)
        return make_response(jsonify(error = err), 401)
    
    except Exception as err:
        error_log(500, 'Delete Flowchart', err)
        return make_response(jsonify(error = "Something went wrong"), 500)

@content_api_blueprint.route('/content/<content_id>/add-flowchart/', methods = ['GET'])
def add_flowchart(content_id):
    try:
        if not has_token(request):
            error_log(401, 'Add Flowchart', 'Token Not Found')
            return make_response(jsonify(error = "Token Not Found"), 401)

        token = request.headers['Authorization'].split(" ")[-1]
        decoded = verify_instructor(token)
        
        flowchart_id = str(uuid.uuid4())
        index = int(request.args.get('index'))
        title = request.args.get('title')

        print(index)

        content = content_table.get_item(
            Key = {
                'content_id': content_id
            }
        )['Item']

        key = '%s/%s.png' % (content_id, flowchart_id)
        signed_url = s3_client.generate_presigned_post(BUCKET_NAME, key, ExpiresIn = 300)

        if index < len(content['content']):
            content['content'][index] = {
                "title": title,
                'type': 'FLOWCHART',
                'url': signed_url['url'] + signed_url['fields']['key']
            }
        else:
            content['content'].append({
                "title": title,
                'type': 'FLOWCHART',
                'url': signed_url['url'] + signed_url['fields']['key']
            })

        res = content_table.update_item(
            Key = {
                'content_id': content_id
            },
            UpdateExpression = 'SET content = :content',
            ExpressionAttributeValues = {
                ':content': content['content']
            },
        )

        return make_response(jsonify(credentials = signed_url), 200)

    except ExpiredSignatureError as err:
        error_log(401, 'Add Flowchart', err)
        return make_response(jsonify(error = '%s' %(err)), 401)
    
    except Exception as err:
        error_log(500, 'Add Flowchart', err)
        return make_response(jsonify(error = "Something went wrong"), 500)
