import os
import requests
import boto3
import sys
import logging
import requests
import uuid

from flask import make_response, jsonify, request
from . import course_blueprint_api, BUCKET_NAME, REGION, MODULE_SERVICE, UPLOAD_SERVICE
from datetime import datetime
from jwt import ExpiredSignatureError
from boto3.dynamodb.conditions import Key, Attr

from . import verify_token, TABLE_NAME
from .logs.logger import error_log, info_log

upload_path = os.path.join(os.getcwd(), 'tmp')

s3_client = boto3.client('s3')
s3 = boto3.resource('s3')
db = boto3.resource('dynamodb')

S3_URL = 'https://%s.s3.ap-south-1.amazonaws.com' %(BUCKET_NAME)

db_table = db.Table(TABLE_NAME)
cat_table = db.Table('artiklearn-course-categories-dev')

def has_token(request):
    if 'Authorization' in request.headers.keys():
        return True
    return False

def verify_instructor(token):
    decoded = verify_token(token, 'instructor')
    return decoded

def verify_user(token):
    decoded = verify_token(token, 'user')
    return decoded

def add_category(cat):
    res = db_table.scan(
        FilterExpression = Attr('category').eq(cat)
    )['Items']

    if len(res) == 0:
        cat_table.put_item(
            Item = {
                'category': cat
            }
        )
        
    return 

@course_blueprint_api.route('/course/', methods = ['GET'])
def home():
    info_log(200, '/', 'HEALTH CHECK')
    return make_response(jsonify(message = "Welocome to stacle course services"), 200)

@course_blueprint_api.route('/course/create/', methods = ['POST'])
def add_course():
    try:
        if not has_token(request):
            error_log(401, 'Create Course', 'Token Not Found')
            return make_response(jsonify(errror = "Token not found"), 401)

        token = request.headers['Authorization'].split(" ")[-1]
        decoded = verify_instructor(token)
        
        course_id = str(uuid.uuid4())
        title = request.json['course_title']
        description = request.json['description']
        outcome = request.json['outcomes']
        pre_requisites = request.json['pre_requisites']
        category = request.json['category']
        author = decoded['username']
        price = int(request.json['price'])

        add_category(category)
        
        db_table.put_item(
            Item = {
                'course_id': course_id,
                'course_title': title,
                'description': description,
                'outcomes': outcome,
                'pre_requisites': pre_requisites,
                'category': category,
                'author': author,
                'published': False,
                'price': price
            }
        )
    
        info_log(201, 'CREATE COURSE', '%s created %s' % (author, title))
        return make_response(jsonify({'course_id': course_id}), 201)

    except ExpiredSignatureError as err:
        error_log(401, 'CREATE COURSE', err)
        return make_response(jsonify(error = "Token expired"), 401)

    except Exception as err:
        error_log(500, 'CREATE COURSE', err)
        return make_response(jsonify({'error': 'Something went wrong'}), 500)

@course_blueprint_api.route('/course/categories/', methods = [ 'GET' ])
def get_categories():
    try:
        res = cat_table.scan()

        info_log(200, 'GET CATEGORIES', 'Request from %s' % (request.remote_addr))
        return make_response(jsonify(categories= res['Items']), 200)
    
    except Exception as e:
        error_log(500, 'GET CATEGORIES', e)
        return make_response(jsonify({'error': 'Something went wrong'}), 500)

@course_blueprint_api.route('/course/all/', methods = ['GET'])
def get_courses():
    try:
        res = db_table.scan(
            FilterExpression = Attr('published').eq(True)
        )['Items']

        for c in range(len(res)):
            res[c]['price'] = int(res[c]['price'])

        info_log(200, 'GET ALL COURSES', 'Request from %s' % (request.remote_addr))
        
        return make_response(jsonify({'courses': res}), 200)

    except KeyError as err:
        error_log(404, 'GET ALL COURSES', err)
        return make_response(jsonify(error = "No Courses"), 404)
    
    except Exception as err:
        error_log(500, 'GET ALL COURSES', err)
        return make_response(jsonify(error = "Something went wrong"))

@course_blueprint_api.route('/course/<id>/', methods = ['GET'])
def get_course(id):
    try:
        res = db_table.get_item(
            Key = {
                'course_id': id
            }
        )

        if 'Item' not in res.keys():
            raise KeyError('course Not Found')
        
        res['Item']['price'] = int(res['Item']['price'])

        info_log(200, 'GET COURSE', 'Request from %s' % (request.remote_addr))
        return make_response(jsonify({'course': res['Item']}), 200)
    
    except KeyError as err:
        error_log(404, 'GET COURSE', '%s' % (err))
        return make_response(jsonify(error = "Course not found"), 404)
    
    except ExpiredSignatureError as err:
        error_log(401, 'CREATE COURSE', err)
        return make_response(jsonify(error = "Token expired"), 401)
    
    except Exception as err:
        error_log(500, 'GET COURSE', '%s' % (err))
        return make_response(jsonify(error = "Something went wrong"), 500)

@course_blueprint_api.route('/course/<id>/', methods = ['DELETE', 'PATCH'])
def delete_course(id):
    try:
        if not has_token(request):
            error_log(401, 'Create Course', 'Token Not Found')
            return make_response(jsonify(errror = "Token not found"), 401)
            
        token = request.headers['Authorization'].split(" ")[-1]
        decoded = verify_instructor(token)

        res = db_table.get_item(Key = {'course_id': id})
        if 'Item' not in res.keys():
            raise KeyError()
        
        if res['Item']['author'] != decoded['username']:
            error_log(403, '%s course' % (request.method), 'FORBIDDEN')
            return make_response(jsonify(error = "FORBIDDEN"), 403)
        
        if request.method == 'DELETE':
            db_table.delete_item(
                Key = {
                    'course_id': id
                }
            )

            info_log(200, 'DELETE COURSE', '%s deleted %s' % (decoded['username'], id))

            return make_response(jsonify({'message': 'Course Deleted'}), 200)

        elif request.method == 'PATCH':
            update_expr = ', '.join(['%s = :%s' % (k, k) for k in request.json.keys()])
            
            expr_values = {}
            for k in request.json.keys():
                key = ':%s' % (k)
                expr_values[key] = request.json[k]

            res = db_table.update_item(
                Key = {
                    'course_id': id
                },
                UpdateExpression = 'SET %s' % (update_expr),
                ExpressionAttributeValues = expr_values,
                ReturnValues = 'ALL_NEW'
            )

            res['Attributes']['price'] = str(res['Attributes']['price'])

            info_log(200, 'UPDATE COURSE', '%s updated %s' % (decoded['username'], id))
            
            return make_response(jsonify(res = res['Attributes']), 200)

    except KeyError as err:
        error_log(404, '%s COURSE' % (request.method.upper()), '%s' %(err))
        return make_response(jsonify(error = "Course not Found"), 404)
    
    except ExpiredSignatureError as err:
        error_log(401, '%s COURSE' % (request.method), err)
        return make_response(jsonify(error = "Token expired"), 401)
    
    except Exception as err:
        error_log(500, '%s COURSE', '%s' %(request.method.upper(), err))
        return make_response(jsonify(error = "Something went wrong"), 500)

@course_blueprint_api.route('/course/<id>/publish/', methods = [ 'GET' ])
def publishCourse(id):
    try:
        if not has_token(request):
            error_log(401, 'Create Course', 'Token Not Found')
            return make_response(jsonify(errror = "Token not found"), 401)
            
        token = request.headers['Authorization'].split(" ")[-1]
        decoded = verify_instructor(token)

        res = db_table.update_item(
            Key = {
                'course_id': id
            },
            UpdateExpression = 'SET published = :private',
            ExpressionAttributeValues = {
                ':private': True,
            },
            ReturnValues = 'ALL_NEW'
        )
        
        info_log(200, 'PUBLISH COURSE', '%s is published by %s' % (id, decoded['username']))
        res['Attributes']['price'] = str(res['Attributes']['price'])
        
        return make_response(jsonify(res = res['Attributes']), 200)
    
    except KeyError as err:
        error_log(404, 'PUBLISH COURSE', '%s' %(err))
        return make_response(jsonify(error = "Course not Found"), 404)

    except ExpiredSignatureError as err:
        error_log(401, 'PUBLISH COURSE', '%s' %(err))
        return make_response(jsonify(error = "Token expired"), 401)

    except Exception as err:
        error_log(500, 'PUBLISH COURSE', '%s' %(err))
        return make_response(jsonify(error = "Something went wrong"), 500)

@course_blueprint_api.route('/course/home/', methods = [ 'GET' ])
def get_inst_courses():
    try:    
        if not has_token(request):
            error_log(401, 'Create Course', 'Token Not Found')
            return make_response(jsonify(errror = "Token not found"), 401)
            
        print(request.headers)
        token = request.headers['Authorization'].split(" ")[-1]
        decoded = verify_instructor(token)

        res = db_table.scan(
            FilterExpression = Attr('author').eq(decoded['username'])
        )['Items']

        for c in range(len(res)):
            res[c]['price'] = str(res[c]['price'])
        
        info_log(200, 'GET COURSES', '%s courses' % (decoded['username']))

        return make_response(jsonify(courses = res), 200)
            
    except KeyError as err:
        error_log(404, 'GET COURSES', '%s' %(err))
        return make_response(jsonify(error = "Course not Found"), 404)

    except ExpiredSignatureError as err:
        error_log(401, 'GET COURSES', '%s' %(err))
        return make_response(jsonify(error = "Token expired"), 401)
    
    except Exception as err:
        error_log(500, 'GET COURSES', '%s' %(err))
        return make_response(jsonify(error = "Something went wrong"), 500)

@course_blueprint_api.route('/course/user-courses/', methods = [ 'POST' ])
def get_user_courses():
    try:
        if not has_token(request):
            error_log(401, 'Create Course', 'Token Not Found')
            return make_response(jsonify(errror = "Token not found"), 401)
            
        token = request.headers['Authorization'].split(" ")[-1]
        decoded = verify_user(token)

        courses = request.json['courses']

        res = []
        for c in courses:
            temp = db_table.get_item(
                Key = {
                    'course_id': c
                },
                ProjectionExpression = "course_id, course_title, description, price, image_url, category"
            )['Item']
            temp['price'] = str(temp['price'])
            res.append(temp)
        
        info_log(200, 'GET User COURSES', '%s courses' % (decoded['username']))

        return make_response(jsonify(courses = res), 200)
            
    except KeyError as err:
        error_log(404, 'GET COURSES', '%s' %(err))
        return make_response(jsonify(error = "Course not Found"), 404)

    except ExpiredSignatureError as err:
        error_log(401, 'GET COURSES', '%s' %(err))
        return make_response(jsonify(error = "Token expired"), 401)
    
    except Exception as err:
        error_log(500, 'GET COURSES', '%s' %(err))
        return make_response(jsonify(error = "Something went wrong"), 500)


@course_blueprint_api.route('/course/<id>/upload/<type>/', methods = [ 'GET' ])
def upload_image(id, type):
    try:
        if not has_token(request):
            error_log(401, 'Create Course', 'Token Not Found')
            return make_response(jsonify(errror = "Token not found"), 401)
        
        token = request.headers['Authorization'].split(" ")[-1]
        decoded = verify_instructor(token)

        ext = request.args.get('ext')

        data = {
            'service': "course_service",
            "duration": 900
        }

        cred = requests.post(UPLOAD_SERVICE + '/gen-credentials/', json = data)

        if cred.status_code != 200:
            error_log(500, "Course Service -> Upload Service", "Error generating credentials")
            return make_response(jsonify(error = "Something went wrong"), 500)

        res = ""
        if type == 'image':
            key = 'images/%s.%s' % (id, ext)

            res = db_table.update_item(
                Key = {
                    'course_id': id
                },
                UpdateExpression = 'SET image_url = :url',
                ExpressionAttributeValues = {
                    ':url': 'https://%s.s3.%s.amazonaws.com/%s' % (BUCKET_NAME, REGION, key),
                },
                ReturnValues = "ALL_NEW"
            )

            info_log(200, 'UPLOADED COURSE IMAGE', '%s uploaded image for %s' % (decoded['username'], id))

        else:
            key = 'cover-images/%s.%s' % (id, ext)
            
            res = db_table.update_item(
                Key = {
                    'course_id': id
                },
                UpdateExpression = 'SET cover_image_url = :url',
                ExpressionAttributeValues = {
                    ':url': 'https://%s.s3.%s.amazonaws.com/%s' % (BUCKET_NAME, REGION, key),
                },
                ReturnValues = "ALL_NEW"
            )

            info_log(200, 'UPLOADED COURSE COVER IMAGE', '%s uploaded cover image for %s' % (decoded['username'], id))
        
        res['Attributes']['price'] = str(res['Attributes']['price'])
        return make_response(jsonify(res = res['Attributes'], key = key, credentials = cred.json()['credentials']['Credentials']), 200)
        
    except KeyError as err:
        error_log(404, 'UPLOAD COURSE IMAGE', err)
        return make_response(jsonify(error = "Course not Found"), 404)
    
    except ExpiredSignatureError as err:
        error_log(401, 'UPLOAD COURSE IMAGE', err)
        return make_response(jsonify(error = "Token expired"), 401)
    
    except Exception as err:
        error_log(500, 'UPLOAD COURSE IMAGE', err)
        return make_response(jsonify(error = err), 500)

@course_blueprint_api.route('/course/check/module/', methods = [ 'GET' ])
def check_module():
    try:
        res = requests.get(MODULE_SERVICE)
        info_log(200, 'COURSE -> MODULE SERVICE', 'PASSED')
        return make_response(res.json(), 200)
    except Exception as err:
        error_log(500, 'COURSE -> MODULE SERVICE', err)