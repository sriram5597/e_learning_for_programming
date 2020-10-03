import boto3
import requests
import logging
import sys
import os
import uuid

from flask import make_response, jsonify, request
from datetime import datetime
from jwt import ExpiredSignatureError

from . import module_api_blueprint, verify_token, NotUniqueError, TABLE_NAME
from .logs.logger import info_log, error_log

s3 = boto3.client('s3')
dynamodb = boto3.resource('dynamodb')

if os.environ['STAGE'] == 'dev':
    course_modules_table = dynamodb.Table(TABLE_NAME)

inst_issue = 'https://cognito-idp.ap-south-1.amazonaws.com/ap-south-1_k8PZf6Xlq'
user_issue = 'https://cognito-idp.ap-south-1.amazonaws.com/ap-south-1_mgBXvGfoU'

def verify_instructor(token):
    decoded = verify_token(token, 'instructor')
    return decoded

def verify_user(token):
    decoded = verify_token(token, 'user')
    return decoded

def has_token(request):
    if 'Authorization' in request.headers.keys():
        return True
    return False

def is_unique_module(res, module):
    data = res['Item']

    for k in data.keys():
        if k.startswith('level'):
            for mod in data[k]['modules']:
                if module == mod['title']:
                    return False
    return True

@module_api_blueprint.route('/module/', methods = ['GET'])
def home():
    info_log(200, '/', 'HEALTH CHECK')
    return make_response(jsonify(message = "Welocome to stacle module services"), 200)

'''
#------------------creating module
'''
@module_api_blueprint.route('/module/<course_id>/create/', methods = ['POST'])
def createModule(course_id):
    try:
        if not has_token(request):
            error_log(401, 'Create Module', 'Token Not Found')
            return make_response(jsonify(error = "Token Not Found"), 401)

        token = request.headers['Authorization'].split(" ")[-1]
        decoded = verify_instructor(token)

        title = request.json['title']
        sub_modules = request.json['sub_modules']
        level = request.json['level']

        res = course_modules_table.get_item(
            Key = {
                'course_id': course_id,
            }
        )
        
        if not is_unique_module(res, title):
            raise NotUniqueError(title)
        
        if 'Item' in res.keys():
            data = res['Item']
            id = str(uuid.uuid4())
            temp = {
                'module_id': id,
                'title': title,
                'sub_modules': sub_modules,
            }

            if level not in data.keys():
                res = course_modules_table.update_item(
                    Key = {
                        'course_id': course_id
                    },
                    UpdateExpression = 'SET #level = :modules',
                    ExpressionAttributeNames = {
                        '#level': level
                    },
                    ExpressionAttributeValues = {
                        ':modules': {
                            "modules": [temp, ],
                            "score": '0',
                            "num_of_tasks": '0'
                        }
                    },
                    ReturnValues = 'ALL_NEW'
                )

            else:
                temp = data[level]['modules']
                
                for mod in temp:
                    if mod['title'] == title:
                        raise NotUniqueError(title)
                
                temp.append({
                    'title': title,
                    'sub_modules': sub_modules,
                     'module_id': id
                })
                
                res = course_modules_table.update_item(
                    Key = {
                        'course_id': course_id
                    },
                    UpdateExpression = 'SET %s.modules = :modules' % (level),
                    ExpressionAttributeValues = {
                        ':modules': temp
                    },
                    ReturnValues = 'ALL_NEW'
                )
            
            info_log(200, 'CREATE MODULE', 'Module %s created' % (title))
            
            return make_response(jsonify(res = res['Attributes']), 200)
        else:
            error_log(400, 'CREATE MODULE', 'Module not Initialized for %s' % (course_id))
            return make_response(jsonify(error = "Module not initialized for %s" % (course_id)), 400)

    except NotUniqueError as err:
        error_log(400, 'CREATE MODULE', err)
        return make_response(jsonify(error = "Module %s already exists in this course" % (title)), 400)     

    except ExpiredSignatureError as err:
        error_log(401, 'CREATE MODULE', err)
        return make_response(jsonify(error = str(err)), 401)
     
    except Exception as err:
        error_log(500, 'CREATE MODULE', err)
        return make_response(jsonify(error = "Something went wrong"), 500)          

'''
#--------------- url -> /module/course_id/?level=0 or /module/course_id/ ---------------
'''
@module_api_blueprint.route('/module/<course_id>/', methods = ['GET'])
def view_content(course_id):
    try:
        res = course_modules_table.get_item(
                Key = {
                    'course_id': course_id
                }
            )

        data = {}
    
        for level in res['Item'].keys():
            if level == 'course_id':
                continue
            data[level] = res['Item'][level]
            

        if len(request.args) == 0:
            resp = {
                'modules': data
            }

        elif 'level' in request.args.keys():
            level = request.args.get('level')
            resp = {
                'modules': data[level]
            }
        
        info_log(200, 'Get Module', 'Get %s module' % (course_id))
        return make_response(jsonify(resp), 200)
    
    except KeyError as err:
        error_log(404, 'GET_MODULE', err)
        return make_response(jsonify(error = "Module not Found"), 404)
    
    except Exception as err:
        error_log(500, 'GET MODULE', err)
        return make_response(jsonify(error = "Something went wrong"), 500)

#------------------Updating module
#url frmt : /module/43543545?index=0
@module_api_blueprint.route('/module/<course>/', methods = ['PATCH', 'DELETE'])
def update_conent(course):
    try:
        if not has_token(request):
            error_log(401, 'Create Module', 'Token Not Found')
            return make_response(jsonify(error = "Token Not Found"), 401)

        token = request.headers['Authorization'].split(" ")[-1]
        decoded = verify_instructor(token)

        if 'index' not in request.args.keys() or 'level' not in request.args.keys():
            error_log(400, 'Update Module', 'Invalid Args in request')
            return make_response(jsonify(error = 'Missing module or level in headers'), 400)

        index = int(request.args.get('index'))
        level =  request.args.get('level')

        res = course_modules_table.get_item(
            Key = {
                'course_id': course
            }
        )

        if request.method == 'PATCH':
            module = res['Item'][level]['modules'][index]
            
            if 'title' in request.json.keys():
                module_title = request.json['title']
                module['title'] = module_title
            
            if 'sub_modules' in request.json.keys():
                sub_modules = request.json['sub_modules']

                module['sub_modules'] = sub_modules

            modules = res['Item'][level]['modules']
            modules[index] = module
            
            res = course_modules_table.update_item(
                Key = {
                    'course_id': course
                },
                UpdateExpression = 'SET #level.modules = :values',
                ExpressionAttributeNames = {
                    '#level': level,
                },
                ExpressionAttributeValues = {
                    ':values': modules
                },
                ReturnValues = "ALL_NEW"
            )
            
            info_log(200, 'UPDATE MODULE', 'Module %s updated' % (module['module_id']))
            return make_response(jsonify(res = res['Attributes']), 200)
            
        if request.method == 'DELETE':
            data = res['Item']

            data[level]['modules'].pop(index)

            if len(data[level]['modules']) > 0:
                course_modules_table.update_item(
                    Key = {
                        'course_id': course
                    },
                    UpdateExpression = 'SET #k.modules = :val',
                    ExpressionAttributeNames = {
                        '#k': level
                    },
                    ExpressionAttributeValues = {
                        ':val': data[level]['modules']
                    },
                )
            else:
                del data[level]
                res = course_modules_table.put_item(
                    Item = data
                )
                
            info_log(200, 'DELETE MODULE', "Module %s of level %s deleted" % (index, level))
            return make_response(jsonify(message = "Module %s of level %s deleted" % (index, level)), 200)
                    
    except KeyError as err:
        error_log(404, request.method + " MODULE", "%s not found" % (err))
        return make_response(jsonify(error = "Module not found"), 404)
    
    except NotUniqueError as err:
        error_log(400, request.method + " MODULE", "%s already exists" % (err))
        return make_response(jsonify(error = "Module %s already exists" % (err)), 400)

    except ExpiredSignatureError as err:
        error_log(401, '%s MODULE' % (request.method), err)
        return make_response(jsonify(error = str(err)), 401)
    
    except Exception as err:
        error_log(500, request.method + " MODULE", err)
        return make_response(jsonify(error = "Something went wrong"), 500)

#------------Change level
@module_api_blueprint.route('/module/<course_id>/change-level/', methods = [ 'PATCH' ])
def subtopic_op(course_id):
    try:
        if not has_token(request):
            error_log(401, 'Create Module', 'Token Not Found')
            return make_response(jsonify(error = "Token Not Found"), 401)

        token = request.headers['Authorization'].split(" ")[-1]
        decoded = verify_instructor(token)

        level = request.json['level']
        index = int(request.json['index'])  

        old_key =  request.args.get('level')
        key =  level

        res = course_modules_table.get_item(
            Key = {
                'course_id': course_id
            }
        )
        
        data = res['Item']
        temp = data[old_key]['modules'].pop(index)

        if key in data.keys():
            data[key]['modules'].append(temp)

        else:
            data[key]['modules'] = [temp]
        
        if len(data[old_key]['modules']) == 0:
            del data[old_key]

        course_modules_table.put_item(
            Item = data
        )
        
        info_log(200, 'UPDATE Level', "Updated Level for %s" % (data))
        return make_response(jsonify(message = 'level updated'), 200)

    except ExpiredSignatureError as err:
        error_log(401, 'UPDATE Level', str(err))
        return make_response(jsonify(error = str(err)), 401)

    except Exception as err:
        error_log(500, 'UPDATE Level', err)
        return make_response(jsonify(error = "Something went wrong"), 500)

#--------Add Xp to scope

@module_api_blueprint.route('/module/<course_id>/add-task/', methods = [ 'POST' ])
def add_task(course_id):
    try:
        if not has_token(request):
            error_log(401, 'Add Points', 'Token Not Found')
            return make_response(jsonify(error = "Token Not Found"), 401)

        token = request.headers['Authorization'].split(" ")[-1]
        decoded = verify_instructor(token)

        level = request.json['level']
        score = int(request.json['score'])  

        res = course_modules_table.get_item(
            Key = {
                'course_id': course_id
            }
        )
        
        data = res['Item']
        tot_score = int(data[level]['score']) + score
        count = int(data[level]['num_of_tasks']) + 1

        res = course_modules_table.update_item(
            Key = {
                'course_id': course_id
            },
            UpdateExpression = 'SET #lvl.score = :score, #lvl.num_of_tasks = :count',
            ExpressionAttributeNames = {
                '#lvl': level
            },
            ExpressionAttributeValues = {
                ':score': str(tot_score),
                ':count': str(count)
            },
            ReturnValues = 'ALL_NEW'
        )
        
        info_log(200, 'Add Task', "task added for %s" % (data))
        return make_response(jsonify(modules = res['Attributes']), 200)

    except ExpiredSignatureError as err:
        error_log(401, 'Add Task', str(err))
        return make_response(jsonify(error = str(err)), 401)

    except Exception as err:
        error_log(500, 'Add Task', err)
        return make_response(jsonify(error = "Something went wrong"), 500)

@module_api_blueprint.route('/module/<course_id>/remove-task/', methods = [ 'POST' ])
def remove_task(course_id):
    try:
        if not has_token(request):
            error_log(401, 'Add Points', 'Token Not Found')
            return make_response(jsonify(error = "Token Not Found"), 401)

        token = request.headers['Authorization'].split(" ")[-1]
        decoded = verify_instructor(token)

        level = request.json['level']
        score = int(request.json['score'])  

        res = course_modules_table.get_item(
            Key = {
                'course_id': course_id
            }
        )
        
        data = res['Item']
        tot_score = int(data[level]['score']) - score
        count = int(data[level]['num_of_tasks']) - 1

        res = course_modules_table.update_item(
            Key = {
                'course_id': course_id
            },
            UpdateExpression = 'SET #lvl.score = :score, #lvl.num_of_tasks = :count',
            ExpressionAttributeNames = {
                '#lvl': level
            },
            ExpressionAttributeValues = {
                ':score': str(tot_score),
                ':count': str(count)
            },
            ReturnValues = 'ALL_NEW'
        )
        
        info_log(200, 'Remove Task', "task added for %s" % (data))
        return make_response(jsonify(modules = res['Attributes']), 200)

    except ExpiredSignatureError as err:
        error_log(401, 'Remove Task', str(err))
        return make_response(jsonify(error = str(err)), 401)

    except Exception as err:
        error_log(500, 'Remove Task', err)
        return make_response(jsonify(error = "Something went wrong"), 500)