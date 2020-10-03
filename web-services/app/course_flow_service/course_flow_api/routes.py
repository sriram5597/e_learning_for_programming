import boto3
import requests

from flask import request, jsonify, make_response
from jwt import ExpiredSignatureError
from boto3.dynamodb.conditions import Attr, Key

from . import course_flow_api_blueprint, NotUniqueError,NotFoundError, verify_instructor, verify_token
from . import  TABLE_NAME, VIDEO_STREAMING_SERVICE, CONTENT_SERVICE, TEST_SERVICE, ONLINE_CODE_SERVICE, MODULE_SERVICE
from .logs.logger import info_log, error_log

dynamodb = boto3.resource('dynamodb')
course_flow_table = dynamodb.Table(TABLE_NAME)

@course_flow_api_blueprint.route('/course-flow/', methods = [ 'GET' ])
def health_check():
    info_log(200, '/', 'HEALTH CHECK')
    return make_response(jsonify(message = "Stacle Course flow service"), 200)

def get_item(course, title):
    res = course_flow_table.get_item(
                Key = {
                    'course_id': course,
                    'title': title
                }
            )
    return res

@course_flow_api_blueprint.route('/course-flow/<course_id>/add-title/', methods = [ 'POST' ])
def add_title(course_id):
    try:
        if 'Authorization' not in request.headers.keys():
            error_log(401, 'Add Title', 'Token not found')
            return make_response(jsonify(error = "Token not found"), 401)
        
        token = request.headers['Authorization'].split(" ")[-1]
        decoded = verify_instructor(token)

        title = request.json['title']
        scope = request.json['scope']
        scope_value = request.json['scope_value']

        flows = course_flow_table.scan(
            FilterExpression = Attr('course_id').eq(course_id)
        )

        if 'Items' in flows.keys():
            index = str(len(flows['Items']))
        else:
            index = '0'

        course_flow_table.put_item(
            Item = {
                'course_id': course_id,
                'title': title,
                'scope': scope,
                'scope_value': str(scope_value),
                'index': index,
                'published': False,
                'isTrial': False,
                'flows': [],
            }
        )

        info_log(200, "Add Title", '%s added to flow' % (title))
        return make_response(jsonify(res =  'title added'), 200)

    except ExpiredSignatureError as err:
        error_log(401, 'Add Title', err)
        return make_response(jsonify(error = '%s' % (err)), 401)

    except Exception as err:
        error_log(500, 'Add Title', err)
        return make_response(jsonify(error = "something went wrong"), 500)


@course_flow_api_blueprint.route('/course-flow/<course_id>/add-source/', methods = [ 'POST' ])
def add_source(course_id):
    try:
        if 'Authorization' not in request.headers.keys():
            error_log(401, 'Add Title', 'Token not found')
            return make_response(jsonify(error = "Token not found"), 401)
        
        token = request.headers['Authorization'].split(" ")[-1]
        decoded = verify_instructor(token)

        t = request.json['type']
        title = request.json['title']
        source_title = request.json['source_title']

        cur_flow = get_item(course_id, title)['Item']
        flows = cur_flow['flows']

        header = { 'Authorization': request.headers['Authorization'], 'Content-Type': 'application/json'}
        source_res = {}

        if t == 'VIDEO':
            source_res = requests.get('%s/%s/upload/gen-credentials/' % (VIDEO_STREAMING_SERVICE, course_id), headers = header) 
            source = source_res.json()['key']
        
        elif t == 'TEXT':
            data = {
                'content_title': source_title
            }
            source_res = requests.post('%s/%s/create/' % (CONTENT_SERVICE, course_id), json = data, headers = header) 
            source = source_res.json()['content']

        else:
            score = 0
            if t == 'MCQ':
                coins = int(request.json['coins'])
                points = int(request.json['points'])
                score = points
                data = {
                    'coins': coins,
                    'points': points
                }
                source_res = requests.post('%s/%s/create/' % (TEST_SERVICE, course_id), json = data, headers = header) 
                source = source_res.json()['id']
                soure_res = None
            
            elif t == 'CODE':
                data = {}
                data['max_score'] = int(request.json['max_score'])
                score = data['max_score']
                data['problem_description'] = request.json['problem_description']
                data['constraints'] = request.json['constraints']
                data['input_format'] = request.json['input_format']
                data['output_format'] = request.json['output_format']
                data['need_flowchart'] = request.json['need_flowchart']

                source_res = requests.post('%s/%s/create/' % (ONLINE_CODE_SERVICE, course_id), json = data, headers = header) 
                source = source_res.json()['id']
                soure_res = None

            task = {
                'score': score,
                'level': cur_flow['scope']
            }
            task_add_res = requests.post('%s/%s/add-task/' % (MODULE_SERVICE, course_id), json = task, headers = header)

            if task_add_res.status_code != 200:
                error_log(500, 'Add Task -> Module Service', 'Error adding task to module')
                return make_response(jsonify(error = 'Error adding task to module'), 500)    
        
        if source_res.status_code != 200:
            error_log(500, 'Add Source -> %s Service' % (t), 'Error Getting credentials for video upload')
            return make_response(jsonify(error = 'Error getting credentials for video upload'), 500)

        data = {
            'type': t,
            'source': source,
            'source_title': source_title
        }

        flows.append(data)

        res = course_flow_table.update_item(
            Key = {
                'course_id': course_id,
                'title': title
            },
            UpdateExpression = 'SET flows = :value',
            ExpressionAttributeValues = {
                ':value': flows,
            },
            ReturnValues = 'ALL_NEW'
        )

        info_log(200, 'Add Source', '%s added to Flow in title %s' % (source, title))

        if t == 'VIDEO':
            return make_response(jsonify(res = res['Attributes'], cred = source_res.json()['credentials'], key = source_res.json()['key']), 200)
        else:
            return make_response(jsonify(res = res['Attributes']), 200)

    except NotUniqueError as err:
        error_log(400, "Add Source", err)
        return make_response(jsonify(error = "source %s" % (err)), 400)
    
    except ExpiredSignatureError as err:
        error_log(401, 'Add Source', err)
        return make_response(jsonify(error = '%s' % (err)), 401)

    except Exception as err:
        error_log(500, "Add Source", err)
        return make_response(jsonify(error = "something went wrong"), 500)

'''
#-------------remove source
'''
@course_flow_api_blueprint.route('/course-flow/<course_id>/remove-source/', methods = [ 'POST' ])
def remove_source(course_id):
    try:
        if 'Authorization' not in request.headers.keys():
            error_log(401, 'Add Title', 'Token not found')
            return make_response(jsonify(error = "Token not found"), 401)
        
        token = request.headers['Authorization'].split(" ")[-1]
        decoded = verify_instructor(token)

        source = request.json['source']
        title = request.json['title']
        scope = request.json['scope']

        flow = get_item(course_id, title)['Item']

        src = [src for src in flow['flows'] if src['source_title'] == source][0]
        flow['flows'] = [src for src in flow['flows'] if src['source_title'] != source]

        header = { 'Authorization': request.headers['Authorization'], 'Content-Type': 'application/json'}
        del_res ={}
        if src['type'] == 'VIDEO':
            data = {
                'video': src['source']
            }
            del_res = requests.post('%s/%s/delete/' % (VIDEO_STREAMING_SERVICE, course_id), json = data, headers = header)

        elif src['type'] == 'TEXT':
            del_res = requests.delete('%s/%s/' % (CONTENT_SERVICE, src['source']), headers = header)
        
        else:
            if src['type'] == 'MCQ':
                del_res = requests.delete('%s/%s/' % (TEST_SERVICE, src['source']), headers = header)
            
            if src['type'] == 'CODE':
                del_res = requests.delete('%s/%s/' % (ONLINE_CODE_SERVICE, src['source']), headers = header)
            
            if del_res.status_code != 200:
                error_log(500, 'Remove Source', 'Error Deleting Task')
                return make_response(jsonify(error = 'Error Deleting Task'), 500)

            remove_task_res = requests.post('%s/%s/remove-task/' % (MODULE_SERVICE, course_id), json = { 
                'score': del_res.json()['points'],
                'level': scope
            }, headers = header)

            if remove_task_res.status_code != 200:
                error_log(500, 'Remove Task -> Module Service', 'Error Removing Task')
                return make_response(jsonify(error = 'Error Removing Task'), 500)    

        if del_res.status_code != 200:
            error_log(500, 'Remove Source -> Video Streaming Service', 'Error Deleting video')
            return make_response(jsonify(error = 'Error Deleting video'), 500)

        res = course_flow_table.update_item(
            Key = {
                'course_id': course_id,
                'title':title
            },
            UpdateExpression = 'SET flows = :value',
            ExpressionAttributeValues = {
                ':value': flow['flows']
            },
            ReturnValues = 'ALL_NEW'
        )
        
        info_log(200, 'Remove Source', '%s removed from flow' % (source))
        return make_response(jsonify(res = res['Attributes']), 200)

    except NotFoundError as err:
        error_log(404, "Remove Source", '%s not found' % (err))
        return make_response(jsonify(error = "%s not found" % (source)), 404)

    except ExpiredSignatureError as err:
        error_log(401, 'Add Title', err)
        return make_response(jsonify(error = '%s' % (err)), 401)

    except Exception as err:
        error_log(500, "Remove Source", err)
        return make_response(jsonify(error = "something went wrong"), 500)

'''
#--------get flow
'''
@course_flow_api_blueprint.route('/course-flow/<course_id>/<title>/', methods = [ 'GET' ])
def get_flow(course_id, title):
    try:
        if 'Authorization' not in request.headers.keys():
            error_log(401, 'Add Title', 'Token not found')
            return make_response(jsonify(error = "Token not found"), 401)
        
        token = request.headers['Authorization'].split(" ")[-1]
        decoded = verify_token(token)

        role = request.args.get('role')
        
        if role is None:
            if request.args.get('pay_status') is None:
                error_log(400, "Get Flow", "pay status is missing in args")
                return make_response(jsonify(error = "Pay status missing in args"), 400)

        item = get_item(course_id, title)['Item']

        if role is None and item['isTrial'] == False and request.args.get('pay_status') is False:
            return make_response(jsonify(error = "Buy the course to access this flow"), 400)    

        elif role is None:
            info_log(200, 'Get Flow', 'Get %s flow' % (title))
            return make_response(jsonify(res = item), 200)
            
        else:
            info_log(200, 'Get Flow', 'Get %s flow' % (title))
            return make_response(jsonify(res = item), 200)

    except NotFoundError as err:
        error_log(404, "Get Flow", '%s not found' % (err))
        return make_response(jsonify(error = "%s not found" % (err)), 404)
    
    except ExpiredSignatureError as err:
        error_log(401, 'Get Flow', err)
        return make_response(jsonify(error = '%s' % (err)), 401)

    except Exception as err:
        error_log(500, "Get Flow", err)
        return make_response(jsonify(error = "something went wrong"), 500)

@course_flow_api_blueprint.route('/course-flow/<course_id>/', methods = [ 'GET' ])
def get_flow_level(course_id):
    try:
        if 'Authorization' not in request.headers.keys():
            error_log(401, 'Add Title', 'Token not found')
            return make_response(jsonify(error = "Token not found"), 401)
        
        token = request.headers['Authorization'].split(" ")[-1]
        decoded = verify_token(token)

        role = request.args.get('role')

        if role is None:
            item = course_flow_table.scan(
                FilterExpression = 'course_id = :course_id AND published = :published',
                ExpressionAttributeValues = {
                    ':course_id': course_id,
                    ':published': True
                }
            )['Items']
        else:
            item = course_flow_table.scan(
                FilterExpression = Attr('course_id').eq(course_id)
            )['Items']
            
        res = sorted(item, key = lambda flow: int(flow['index']))
        
        info_log(200, 'Get Flows', 'Get %s flow' % (course_id))
        return make_response(jsonify(res = item), 200)

    except NotFoundError as err:
        error_log(404, "Get Flow By Level", '%s not found' % (err))
        return make_response(jsonify(error = "%s not found" % (err)), 404)
    
    except ExpiredSignatureError as err:
        error_log(401, 'Add Title', err)
        return make_response(jsonify(error = '%s' % (err)), 401)

    except Exception as err:
        error_log(500, "Get Flow By Level", err)
        return make_response(jsonify(error = "something went wrong"), 500)

'''
#-----------update flow
'''
@course_flow_api_blueprint.route('/course-flow/<course_id>/<title>/', methods = [ 'PATCH' ])
def update_title(course_id, title):
    try:
        if 'Authorization' not in request.headers.keys():
            error_log(401, 'Add Title', 'Token not found')
            return make_response(jsonify(error = "Token not found"), 401)
        
        token = request.headers['Authorization'].split(" ")[-1]
        decoded = verify_instructor(token)
        new_title = request.json['title']
        item = get_item(course_id, title)['Item']

        course_flow_table.delete_item(
            Key = {
                'course_id': course_id,
                'title': title
            }
        )

        item['title'] = new_title

        course_flow_table.put_item(
            Item = item
        )

        info_log(200, "Update Title", 'Title %s updated to %s' % (title, new_title))
        return make_response(jsonify(res =  "Title Updated"), 200)

    except KeyError as err:
        error_log(400, 'Update Title', err)
        return make_response(jsonify(error = 'Missing Title Args in request'), 400)
    
    except NotFoundError as err:
        error_log(404, 'Update Title', '%s not found' % (err))
        return make_response(jsonify(error = "%s not found" % (err)), 404)
    
    except ExpiredSignatureError as err:
        error_log(401, 'Add Title', err)
        return make_response(jsonify(error = '%s' % (err)), 401)
    
    except Exception as err:
        error_log(500, 'Update Title', err)
        return make_response(jsonify(error = "something went wrong"), 500)

'''
#-----------change scope
'''
@course_flow_api_blueprint.route('/course-flow/<course_id>/<title>/change-scope/', methods = [ 'POST' ])
def move_source(course_id, title):
    try:
        if 'Authorization' not in request.headers.keys():
            error_log(401, 'Add Title', 'Token not found')
            return make_response(jsonify(error = "Token not found"), 401)

        token = request.headers['Authorization'].split(" ")[-1]
        decoded = verify_instructor(token)
        new_scope = request.json['scope']
        scope_val = request.json['scope_value']

        res = course_flow_table.update_item(
            Key = {
                'course_id': course_id,
                'title': title
            },
            UpdateExpression = 'SET scope = :scope, scope_value = :val',
            ExpressionAttributeValues = {
                ':scope': new_scope,
                ':val': scope_val
            },
            ReturnValues = 'ALL_NEW'
        )

        info_log(200, 'Change Scope', 'Scope for %s is updated to %s' % (title, scope_val))
        return make_response(jsonify(res = res['Attributes']), 200)

    except NotFoundError as err:
        error_log(404, 'Change Scope', '%s not found' % (err))
        return make_response(jsonify(error = "%s not found" % (err)), 404)
    
    except ExpiredSignatureError as err:
        error_log(401, 'Add Title', err)
        return make_response(jsonify(error = '%s' % (err)), 401)
    
    except Exception as err:
        error_log(500, 'Change Scope', err)
        return make_response(jsonify(error = "something went wrong"), 500)

'''
#---------delete flow for course
'''
@course_flow_api_blueprint.route('/course-flow/<course_id>/', methods = [ 'DELETE' ])
def delete_flow(course_id):
    try:
        if 'Authorization' not in request.headers.keys():
            error_log(401, 'Add Title', 'Token not found')
            return make_response(jsonify(error = "Token not found"), 401)
        
        token = request.headers['Authorization'].split(" ")[-1]
        decoded = verify_instructor(token)

        res = course_flow_table.scan(
            FilterExpression = Attr('course_id').eq(course_id)
        )['Items']

        for r in res:
            course_flow_table.delete_item(
                Key = {
                    'course_id': r['course_id'],
                    'title': r['title']
                }
            )

        info_log(200, 'Delete Flow', 'Deleted all flow with course %s' % (course_id))
        return make_response(jsonify(res = 'deleted all flow with course %s' % (course_id)), 200)
    
    except NotFoundError as err:
        error_log(404, 'Change Scope', '%s not found' % (err))
        return make_response(jsonify(error = "%s not found" % (err)), 404)
    
    except ExpiredSignatureError as err:
        error_log(401, 'Add Title', err)
        return make_response(jsonify(error = '%s' % (err)), 401)
    
    except Exception as err:
        error_log(500, 'Change Scope', err)
        return make_response(jsonify(error = "something went wrong"), 500)

'''
#---------delete flow by title
'''
@course_flow_api_blueprint.route('/course-flow/<course_id>/<title>/', methods = [ 'DELETE' ])
def delete_flow_by_title(course_id, title):
    try:
        if 'Authorization' not in request.headers.keys():
            error_log(401, 'Add Title', 'Token not found')
            return make_response(jsonify(error = "Token not found"), 401)
        
        token = request.headers['Authorization'].split(" ")[-1]
        decoded = verify_instructor(token)
                
        course_flow_table.delete_item(
            Key = {
                'course_id': course_id,
                'title': title
            }
        )

        info_log(200, 'Delete Flow', 'Deleted flow %s' % (title))
        return make_response(jsonify(res = 'deleted flow %s' % (title)), 200)
    
    except NotFoundError as err:
        error_log(404, 'Delete Flow', '%s not found' % (err))
        return make_response(jsonify(error = "%s not found" % (err)), 404)
    
    except ExpiredSignatureError as err:
        error_log(401, 'Delete Flow', err)
        return make_response(jsonify(error = '%s' % (err)), 401)
    
    except Exception as err:
        error_log(500, 'Delete Flow', err)
        return make_response(jsonify(error = "something went wrong"), 500)

'''
#---------delete flow by scope
'''
@course_flow_api_blueprint.route('/course-flow/<course_id>/delete-scope/', methods = [ 'DELETE' ])
def delete_flow_by_scope(course_id):
    try:
        if 'Authorization' not in request.headers.keys():
            error_log(401, 'Add Title', 'Token not found')
            return make_response(jsonify(error = "Token not found"), 401)
        
        token = request.headers['Authorization'].split(" ")[-1]
        decoded = verify_instructor(token)

        scope = request.args.get('scope')        
        scope_value = request.args.get('scope_value')
        
        res = course_flow_table.scan(
            FilterExpression = Attr('course_id').eq(course_id)
        )['Items']

        for k in res:
            course_flow_table.delete_item(
                Key = {
                    'course_id': course_id,
                    'title': k['title']
                },
                ConditionExpression = 'scope_value = :val',
                ExpressionAttributeValues = {
                    ':val': scope_value
                }
            )

        info_log(200, 'Delete Flow', 'Deleted flow %s' % (scope_value))
        return make_response(jsonify(res = 'deleted flow %s' % (scope_value)), 200)
    
    except NotFoundError as err:
        error_log(404, 'Delete Flow', '%s not found' % (err))
        return make_response(jsonify(error = "%s not found" % (err)), 404)
    
    except ExpiredSignatureError as err:
        error_log(401, 'Delete Flow', err)
        return make_response(jsonify(error = '%s' % (err)), 401)
    
    except Exception as err:
        error_log(500, 'Delete Flow', err)
        return make_response(jsonify(error = "something went wrong"), 500)

@course_flow_api_blueprint.route('/course-flow/<course_id>/change-order/', methods = [ 'PATCH' ])
def change_order(course_id):
    try:
        if 'Authorization' not in request.headers.keys():
            error_log(401, 'Add Title', 'Token not found')
            return make_response(jsonify(error = "Token not found"), 401)
        
        token = request.headers['Authorization'].split(" ")[-1]
        decoded = verify_instructor(token)

        title = request.json['title']
        index = request.json['index'] - 1
        old_index = request.json['old_index']
        
        item = get_item(course_id, title)['Item']

        temp = item['flows'][old_index]
        item['flows'].pop(old_index)    
        item['flows'].insert(index, temp)

        res = course_flow_table.update_item(
            Key = {
                'course_id': course_id,
                'title': title
            },
            UpdateExpression = 'SET flows = :value',
            ExpressionAttributeValues = {
                ':value': item['flows']
            },
            ReturnValues = 'ALL_NEW'
        )

        info_log(200, 'Change Order', 'Changed Order %s' % (title))
        return make_response(jsonify(res = res['Attributes']), 200)
    
    except NotFoundError as err:
        error_log(404, 'Change Order', '%s not found' % (err))
        return make_response(jsonify(error = "%s not found" % (err)), 404)
    
    except ExpiredSignatureError as err:
        error_log(401, 'Change Order', err)
        return make_response(jsonify(error = '%s' % (err)), 401)
    
    except Exception as err:
        error_log(500, 'Change Order', err)
        return make_response(jsonify(error = "something went wrong"), 500)

@course_flow_api_blueprint.route('/course-flow/<course_id>/publish-flow/', methods = [ 'POST' ])
def publish_flow(course_id):
    try:
        if 'Authorization' not in request.headers.keys():
            error_log(401, 'Add Title', 'Token not found')
            return make_response(jsonify(error = "Token not found"), 401)
        
        token = request.headers['Authorization'].split(" ")[-1]
        decoded = verify_instructor(token)

        if 'title' not in request.args.keys():
            return make_response(jsonify(error = "Missing title in args"), 400)

        title = request.args.get('title')
        publish = request.json['publish']

        res = course_flow_table.update_item(
            Key = {
                'course_id': course_id,
                'title': title
            },
            UpdateExpression = 'SET published = :value',
            ExpressionAttributeValues = {
                ':value': publish
            },
            ReturnValues = 'ALL_NEW'
        )

        info_log(200, 'Publish Flow', 'Published flow -  %s' % (title))
        return make_response(jsonify(res = res['Attributes']), 200)
    
    except NotFoundError as err:
        error_log(404, 'Publish Flow', '%s not found' % (err))
        return make_response(jsonify(error = "%s not found" % (err)), 404)
    
    except ExpiredSignatureError as err:
        error_log(401, 'Publish Flow', err)
        return make_response(jsonify(error = '%s' % (err)), 401)
    
    except Exception as err:
        error_log(500, 'Publish Flow', err)
        return make_response(jsonify(error = "something went wrong"), 500)

@course_flow_api_blueprint.route('/course-flow/<course_id>/make-trial/', methods = [ 'POST' ])
def make_trial(course_id):
    try:
        if 'Authorization' not in request.headers.keys():
            error_log(401, 'Add Title', 'Token not found')
            return make_response(jsonify(error = "Token not found"), 401)
        
        token = request.headers['Authorization'].split(" ")[-1]
        decoded = verify_instructor(token)

        if 'title' not in request.args.keys():
            return make_response(jsonify(error = "Missing title in args"), 400)

        title = request.args.get('title')
        
        trial = request.json['trial']
        print(trial)

        res = course_flow_table.update_item(
            Key = {
                'course_id': course_id,
                'title': title
            },
            UpdateExpression = 'SET isTrial = :value',
            ExpressionAttributeValues = {
                ':value': trial
            },
            ReturnValues = 'ALL_NEW'
        )

        info_log(200, 'Make Trial', 'flow -  %s made as trial' % (title))
        return make_response(jsonify(res = res['Attributes']), 200)
    
    except NotFoundError as err:
        error_log(404, 'Make Trial', '%s not found' % (err))
        return make_response(jsonify(error = "%s not found" % (err)), 404)
    
    except ExpiredSignatureError as err:
        error_log(401, 'Make Trial', err)
        return make_response(jsonify(error = '%s' % (err)), 401)
    
    except Exception as err:
        error_log(500, 'Make Trial', err)
        return make_response(jsonify(error = "something went wrong"), 500)