import requests
import os
import boto3
import math
import uuid
import datetime

from decimal import Decimal
from flask import make_response, jsonify, request, render_template
from jwt import ExpiredSignatureError
from boto3.dynamodb.conditions import Key, Attr
from flask_mail import Message

from . import current_course_api_blueprint, verify_user, verify_instructor, TABLE_NAME, COURSE_SERVICE, FEEDBACK_TABLE_NAME, get_greeting, enroll_course_mail, unenroll_course_mail
from .logs.logger import info_log, error_log
from app import mail

credentials = open(os.path.join(os.getcwd(), '.aws/config'), 'r').readlines()
dynamob = boto3.resource('dynamodb')
db_client = boto3.client('dynamodb')
current_course_table = dynamob.Table(TABLE_NAME)
feedback_table = dynamob.Table(FEEDBACK_TABLE_NAME)

def has_token(request):
    if 'Authorization' in request.headers.keys():
        return True
    return False

@current_course_api_blueprint.route('/current-course/', methods = [ 'GET' ])
def health_check():
    info_log(200, '/', 'HEALTH CHECK')
    return make_response(jsonify(message = "Stacle Current Course Service"), 200)

@current_course_api_blueprint.route('/current-course/<course_id>/enroll/', methods = [ 'POST' ])
def enroll_course(course_id):
    try:
        if not has_token(request):
            error_log(401, 'Enroll Course', 'Token not Found')
            return make_response(jsonify(error = "Token not found"), 401)

        token = request.headers['Authorization'].split(" ")[-1]
        decoded = verify_user(token)
        
        email = request.json['email']
        course_title = request.json['course_title']
        name = request.json['name']

        data = {
            'course_id': course_id,
            'username':decoded['username'],
            'xp': 0,
            'score_card': {},
            'pay_status': False,
            'email': email,
            "name": name
        }

        current_course_table.put_item(
            Item = data
        )

        message = enroll_course_mail(name, course_title)
        msg = Message(message['subject'], sender = 'artiklearn@gmail.com', recipients = [email])
        msg.body = message['body']

        print(message)
        mail.send(msg)

        info_log(200, 'Enroll Course', '%s enrolled to course %s' % (decoded['username'], course_id))
        return make_response(jsonify(message = 'course enrolled'), 200)
    
    except ExpiredSignatureError as err:
        error_log(401, 'Enroll Course', err)
        return make_response(jsonify(error = '%s' % (err)), 401)

    except Exception as err:
        error_log(500, 'Enroll Course', err)
        return make_response(jsonify(error = 'something went wrong'), 500)


@current_course_api_blueprint.route('/current-course/<course_id>/', methods = [ 'GET' ])
def get_status(course_id):
    try:
        if not has_token(request):
            error_log(401, 'Get Status', 'Token not Found')
            return make_response(jsonify(error = "Token not found"), 401)

        token = request.headers['Authorization'].split(" ")[-1]
        decoded = verify_user(token)

        res = current_course_table.get_item(
            Key = {
                'course_id': course_id,
                'username': decoded['username']
            }
        )

        res['Item']['xp'] = str(res['Item']['xp'])

        info_log(200, 'Get Status', '%s current status on %s' % (decoded['username'], course_id))
        return make_response(jsonify(res = res['Item']), 200)
    
    except ExpiredSignatureError as err:
        error_log(401, 'Get Status', err)
        return make_response(jsonify(error = err), 401)

    except Exception as err:
        error_log(500, 'Get Status', err)
        return make_response(jsonify(error = 'something went wrong'), 500)

@current_course_api_blueprint.route('/current-course/<course_id>/status/', methods = [ 'PATCH' ])
def update_status(course_id):
    try:
        if not has_token(request):
            error_log(401, 'Enroll Course', 'Token not Found')
            return make_response(jsonify(error = "Token not found"), 401)

        token = request.headers['Authorization'].split(" ")[-1]
        decoded = verify_user(token)

        data = {}
        if 'flow_title' in request.json.keys():
            data['flow_title'] = request.json['flow_title']

        if 'level' in request.json.keys():
            data['flow_level'] = request.json['level']
        
        if 'pay_status' in request.json.keys():
            data['pay_status'] = request.json['pay_status']
        
        values = {}
        attr = []
        for k in data:
            attr.append("%s = :%s" % (k, k))
            values[':%s' % (k)] = data[k]

        expr = 'SET ' + ','.join(attr)        
        res = current_course_table.update_item(
            Key = {
                'course_id': course_id,
                'username': decoded['username']
            },
            UpdateExpression = expr,
            ExpressionAttributeValues = values,
            ReturnValues = 'ALL_NEW'
        )

        res['Attributes']['xp']  = float(res['Attributes']['xp'])
        
        info_log(200, 'Update Current Course Status', 'status updated for %s on %s' % (decoded['username'], course))
        return make_response(jsonify(res = res['Attributes']), 200)

    except ExpiredSignatureError as err:
        error_log(401, 'Enroll Course', err)
        return make_response(jsonify(error = err), 401)

    except Exception as err:
        error_log(500, 'Enroll Course', err)
        return make_response(jsonify(error = 'something went wrong'), 500)

'''
#-----------complete task
'''
@current_course_api_blueprint.route('/current-course/<course_id>/complete-task/', methods = [ 'PATCH' ])
def complete_task(course_id):
    try:
        if not has_token(request):
            error_log(401, 'Complete Task', 'Token not Found')
            return make_response(jsonify(error = "Token not found"), 401)

        token = request.headers['Authorization'].split(" ")[-1]
        decoded = verify_user(token)

        task = request.json['task']
        scope = request.json['scope']

        task['xp'] = str(task['xp'])

        print(decoded['username'])
        current = current_course_table.get_item(
            Key = {
                'course_id': course_id,
                'username': decoded['username']
            }
        )
        
        current = current['Item']
        score_card = current['score_card']

        if task['type'] == 'MCQ':
            if scope not in current['score_card'].keys():
                score_card[scope] = {
                    'xp': str(task['xp']),
                    'total': str(task['total']),
                    'tasks': [task]
                }
            
            else:
                t = list(filter(lambda t : t['id'] == task['id'], score_card[scope]['tasks']))
                if len(t) == 0:
                    score_card[scope]['xp'] = str(float(score_card[scope]['xp']) + float(task['xp']))
                    score_card[scope]['total'] = str(float(score_card[scope]['total']) + float(task['total']))
                    score_card[scope]['tasks'].append(task)

                else:
                    if t[0]['xp'] > task['xp']:
                        ind = score_card[scope]['tasks'].index(t[0])
                        score_card[scope]['tasks'][ind] = task
                        score_card[scope]['xp'] = str(float(score_card[scope]['xp']) + float(task['xp']) - float(t[0]['xp']))

                    else:
                        return make_response(jsonify(message = "Task already completed"), 200)
        else:
            field = ''
            if 'code' in task:
                field = 'code'
            else:
                field = 'flowchart'

            if scope not in current['scope_card'].keys():
                score_card[scope] = {
                    'xp': task[field],
                    'tasks': [task]
                }
            else:
                t = list(filter(lambda t : t['id'] == task['id'], score_card[scope]['tasks']))
                if len(t) == 0:
                    score_card[scope]['xp'] = str(float(score_card[scope]['xp']) + float(task[field]))
                    score_card[scope]['tasks'].append(task)
                else:
                    ind = score_card[scope]['tasks'].index(t[0])

                    if field not in t[0]:
                        score_card[scope]['xp'] = str(float(score_card[scope]['xp']) + float(task[field]))
                    else:
                        if float(t[0][field]) < float(task[field]):
                            score_card[scope]['xp'] = str(float(score_card[scope]['xp']) + float(task[field]) - float(t[0][field]))
                        else:
                            return make_response(jsonify(message = "Task already completed"), 200)
                    
                    score_card[scope][ind] = task

        res = current_course_table.update_item(
            Key = {
                'course_id': course_id,
                'username': decoded['username']
            },
            UpdateExpression = 'SET score_card = :score',
            ExpressionAttributeValues = {
                ':score': score_card
            },
            ReturnValues = 'ALL_NEW'
        )
    
        res['Attributes']['xp'] = str(res['Attributes']['xp'])
        
        info_log(200, 'Complete Task', 'Task updated for %s on %s' % (decoded['username'], course_id))
        return make_response(jsonify(res = res['Attributes']), 200)

    except ExpiredSignatureError as err:
        error_log(401, 'Complete Task', err)
        return make_response(jsonify(error = err), 401)

    except Exception as err:
        error_log(500, 'Complete Task', err)
        return make_response(jsonify(error = 'something went wrong'), 500)

'''
#-----------get user courses
'''

@current_course_api_blueprint.route('/current-course/user-courses/', methods = [ 'GET' ])
def get_user_courses():
    try:
        if not has_token(request):
            error_log(401, 'Enroll Course', 'Token not Found')
            return make_response(jsonify(error = "Token not found"), 401)

        token = request.headers['Authorization'].split(" ")[-1]
        decoded = verify_user(token)
        
        courses = current_course_table.scan(
            FilterExpression = Attr('username').eq(decoded['username'])
        )['Items']

        courses_enrolled = [ c['course_id'] for c in courses]

        data = {
            'courses': courses_enrolled
        }

        header = { 'Authorization': request.headers['Authorization'], 'Content-Type': 'application/json'}
        res = requests.post('%s/user-courses/' % (COURSE_SERVICE), json = data, headers = header)
        
        if res.status_code != 200:
            error_log(500, "Get User Courses -> Course Service", "Error Fetching courses from course service")
            return make_response(jsonify(errror = "something went wrong"), 500)
        
        
        info_log(200, 'User Courses', 'Courses fetched for %s' % (decoded['username']))
        return make_response(jsonify(res.json()), 200)

    except ExpiredSignatureError as err:
        error_log(401, 'User Courses', err)
        return make_response(jsonify(error = '%s' % (err)), 401)

    except Exception as err:
        error_log(500, 'User Courses', err)
        return make_response(jsonify(error = 'something went wrong'), 500)

@current_course_api_blueprint.route('/current-course/post-feedback/', methods = [ 'POST' ])
def post_feedback():
    try:
        if not has_token(request):
            error_log(401, 'Post Feedback', 'Token not Found')
            return make_response(jsonify(error = "Token not found"), 401)

        token = request.headers['Authorization'].split(" ")[-1]
        decoded = verify_user(token)

        category = request.json['category']        
        title = request.json['title']
        comment = request.json['comment']
        email = request.json['email']
        date = request.json['date']
        feedback_id = str(uuid.uuid4())

        feedback_table.put_item(
            Item = {
                "feedback_id": feedback_id,
                "category": category,
                "title": title,
                "comment": comment,
                "email": email,
                "date": date,
                "username": decoded['username']
            }
        )

        greeting = get_greeting(decoded['username'])
        msg = Message(greeting['subject'], sender = 'artiklearn@gmail.com', recipients = [email])
        msg.body = greeting['body']
        mail.send(msg)

        sub = 'Feedback on %s - %s' % (title, category)
        msg = Message(sub, sender = 'artiklearn@gmail.com', recipients = ['sriram.seetharaman55@gmail.com'])
        msg.body = 'Dear Seetha Raman, \n \t %s has provided a feedback on %s. \n The feedback is - %s' % (decoded['username'], category, comment)
        mail.send(msg)

        info_log(200, 'Post Feedback', '%s posted feedback' % (decoded['username']))
        return make_response(jsonify(message = "Thank you for providing feedback"), 200)

    except ExpiredSignatureError as err:
        error_log(401, 'Post Feedback', err)
        return make_response(jsonify(error = '%s' % (err)), 401)

    except Exception as err:
        error_log(500, 'Post Feedback', err)
        return make_response(jsonify(error = 'something went wrong'), 500)

@current_course_api_blueprint.route('/current-course/get-feedbacks/', methods = [ 'GET' ])
def get_feedback():
    try:
        if not has_token(request):
            error_log(401, 'Get Feedback', 'Token not Found')
            return make_response(jsonify(error = "Token not found"), 401)

        token = request.headers['Authorization'].split(" ")[-1]
        decoded = verify_instructor(token)

        res = feedback_table.scan()

        info_log(200, 'Get Feedback', 'fetched feedbacks')
        return make_response(jsonify(res = res['Items']), 200)

    except ExpiredSignatureError as err:
        error_log(401, 'Get Feedback', err)
        return make_response(jsonify(error = '%s' % (err)), 401)

    except Exception as err:
        error_log(500, 'Get Feedback', err)
        return make_response(jsonify(error = 'something went wrong'), 500)

@current_course_api_blueprint.route('/current-course/test-mail/', methods = [ 'GET' ])
def test_mail():
    try:
        print('sending mail')
        template = os.path.join(os.getcwd(), 'current_course_api/templates/greeting_user.html')
        print(template)
        msg = Message('test', sender = 'artiklearn@gmail.com', recipients = ['sriram.sk5519@gmail.com'])
        msg.html = render_template(template, name = "Seetha Raman S", course_title = "Java Course for Beginners")
    
        mail.send(msg)

        return make_response(jsonify(res = 'mail sent'), 200)
    except Exception as err:
        print(err)
        return make_response(jsonify(error = "Something went wrong"), 500)

@current_course_api_blueprint.route('/current-course/<course_id>/unenroll/', methods = ['POST'])
def unenroll_course(course_id):
    try:
        if not has_token(request):
            error_log(401, 'Get Feedback', 'Token not Found')
            return make_response(jsonify(error = "Token not found"), 401)

        token = request.headers['Authorization'].split(" ")[-1]
        decoded = verify_user(token)

        comment = request.json['comment']
        category = 'Course Unenroll'
        title = request.json['course_title']
        feedback_id = str(uuid.uuid4())
        date = datetime.date

        current_course = current_course_table.get_item(
            Key = {
                'course_id': course_id,
                'username': decoded['username']
            }
        )['Item']

        feedback_table.put_item(
            Item = {
                "feedback_id": feedback_id,
                "title": title,
                "comment": comment,
                "category": category,
                "email": current_course['email'],
                "date": str(datetime.datetime.now())
            }
        )

        current_course_table.delete_item(
            Key = {
                "course_id": course_id,
                "username": decoded['username']
            }
        )
        message = unenroll_course_mail(current_course['name'], title)
        msg = Message(message['subject'], sender = 'artiklearn@gmail.com', recipients = [current_course['email']])
        msg.body = message['body']
        mail.send(msg)

        info_log(200, 'Unenroll Course', '%s unenrolled %s' % (decoded['username'], title))
        return make_response(jsonify(message = "Unenrolled course successfully"), 200)

    except ExpiredSignatureError as err:
        error_log(401, 'Get Feedback', err)
        return make_response(jsonify(error = '%s' % (err)), 401)

    except Exception as err:
        error_log(500, 'Get Feedback', err)
        return make_response(jsonify(error = 'something went wrong'), 500)