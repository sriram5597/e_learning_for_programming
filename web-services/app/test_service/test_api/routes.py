import uuid
import requests
import boto3
import math

from flask import make_response, jsonify, request
from jwt import ExpiredSignatureError

from . import test_api_blueprint, TABLE_NAME, verify_instructor, verify_user, verify_token
from . import COURSE_FLOW_SERVICE, CURRENT_COURSE_SERVICE, MODULE_SERVICE

from .logs.logger import info_log, error_log

dynamodb = boto3.resource('dynamodb')
test_table = dynamodb.Table(TABLE_NAME)

def has_token(request):
    if 'Authorization' in request.headers.keys():
        return True
    return False

@test_api_blueprint.route('/test/', methods = [ 'GET' ])
def health_check():
    info_log(200, '/', 'HEALTH CHECK')
    return make_response(jsonify(message = 'Stacle Online test service'), 200)

'''
#------------------creating mcq
'''
@test_api_blueprint.route('/test/<course>/create/', methods = ['POST'])
def createMCQ(course):
    try:
        if not has_token(request):
            error_log(401, 'Create Test', 'Token not Found')
            return make_response(jsonify(error = "Token not Found"), 401)

        token = request.headers['Authorization'].split(" ")[-1]
        decoded = verify_instructor(token)

        score = int(request.json['points'])
        id = str(uuid.uuid4())
        coins = request.json['coins']

        test_table.put_item(
            Item = {
                'mcq_id': id,
                'points': score,
                'questions': [],
                'course_id': course,
                'coins': coins
            }
        )

        info_log(200, 'Create Test', '%s created' % (id))
        return make_response(jsonify(id = id), 200)
    
    except ExpiredSignatureError as err:
        error_log(401, 'Create Test', err)
        return make_response(jsonify(error = err), 401)

    except Exception as err:
        error_log(500, 'Create Test', err)
        return make_response(jsonify(error = 'something went wrong'), 500)

'''
#------------------Add Question
'''
@test_api_blueprint.route('/test/<id>/add-question/', methods = [ 'POST' ])
def add_question(id):
    try:
        if not has_token(request):
            error_log(401, 'Add Mcq', 'Token not Found')
            return make_response(jsonify(error = "Token not Found"), 401)

        token = request.headers['Authorization'].split(" ")[-1]
        decoded = verify_instructor(token)

        question = request.json['question'] 
        t = request.json['type']

        data = {
            'question': question,
            'type': t
        }

        if t == 'MCQ':
            options = request.json['options']
            correct_option = str(request.json['answer'])
            
            data['options'] = options
            data['answer'] = correct_option

        else:
            answer = request.json['answer']
            data['answer'] = str(answer)

        explanation = request.json['explanation']
        data['explanation'] = explanation

        mcq = test_table.get_item(
            Key = {
                'mcq_id': id
            }
        )['Item']

        questions = mcq['questions']
        questions.append(data)

        mcq = test_table.update_item(
            Key = {
                'mcq_id': id
            },
            UpdateExpression = 'SET questions = :quest',
            ExpressionAttributeValues = {
                ':quest': questions
            },
            ReturnValues = 'ALL_NEW'
        )
        mcq['Attributes']['points'] = str(mcq['Attributes']['points'])
        mcq['Attributes']['coins'] = str(mcq['Attributes']['coins'])

        info_log(200, 'Add Mcq', 'Mcq added to %s' % (id))
        return make_response(jsonify({'res': mcq['Attributes']}), 200)

    except ExpiredSignatureError as err:
        error_log(401, 'Add Mcq', err)
        return make_response(jsonify(error = err), 401)

    except Exception as err:
        error_log(500, 'Add Mcq', err)
        return make_response(jsonify(error = 'something went wrong'), 500)

'''
#---------------getting all fields in mcq
'''
@test_api_blueprint.route('/test/<id>/', methods = ['GET'])
def view_mcq(id):
    try:
        if not has_token(request):
            error_log(401, 'Get Test', 'Token not Found')
            return make_response(jsonify(error = "Token not Found"), 401)

        token = request.headers['Authorization'].split(" ")[-1]
        decoded = verify_token(token)

        mcq = test_table.get_item(
            Key = {
                'mcq_id': id
            }
        )['Item']

        mcq['points'] = str(mcq['points'])
        mcq['coins'] = str(mcq['coins'])

        info_log(200, 'Get Test', 'Test %s is fetched' %(id))
        return make_response(jsonify({'res': mcq}), 200)

    except ExpiredSignatureError as err:
        error_log(401, 'Get Test', err)
        return make_response(jsonify(error = err), 401)

    except Exception as err:
        error_log(500, 'Get Test', err)
        return make_response(jsonify(error = 'something went wrong'), 500)

'''
#----------------updating mcq
'''
@test_api_blueprint.route('/test/<id>/question/', methods = ['PATCH'])
def update_mcq(id):
    try:
        token = request.headers['Authorization'].split(" ")[-1]
        decoded = verify_instructor(token)

        if 'op' not in request.args.keys():
            return make_response(jsonify(error = 'Invalid Op args'), 400)
        op = request.args.get('op')
        index = request.json['index']
        
        mcq = test_table.get_item(
            Key = {
                'mcq_id': id
            }
        )['Item']
        questions = mcq['questions']

        if op == 'update':
            data = {}
            if 'question' in request.json.keys():
                data['question'] = request.json['question']
            
            if 'options' in request.json.keys():
                options = request.json['options']
                data['options'] = options
            
            if 'answer' in request.json.keys():
                answer = request.json['answer']
                data['answer'] = str(answer)
            
            if 'explanation' in request.json.keys():
                data['explanation'] = request.json['explanation']

            for k in data.keys():
                questions[index][k] = data[k]
        
        else:
            questions.pop(index)

        res = test_table.update_item(
            Key = {
                'mcq_id': id
            },
            UpdateExpression = 'SET questions = :quest',
            ExpressionAttributeValues = {
                ':quest': questions
            },
            ReturnValues = 'ALL_NEW'
        )
        
        res['Attributes']['points'] = str(res['Attributes']['points'])
        res['Attributes']['coins'] = str(res['Attributes']['coins'])
        
        if op == 'update':
            info_log(200, 'Update Question', 'Questions in %s is updated' % (id))
            return make_response(jsonify(res = res['Attributes']), 200)
        
        else:
            info_log(200, 'Delete Question', 'Questions in %s is deleted' % (id))
            return make_response(jsonify(res = res['Attributes']), 200)
    
    except ExpiredSignatureError as err:
        error_log(401, 'Update Mcq', err)
        return make_response(jsonify(error = '%s' % (err)), 401)

    except Exception as err:
        error_log(500, 'Update Mcq', err)
        return make_response(jsonify(error = 'something went wrong'), 500)

'''
#----Checking answers
'''
@test_api_blueprint.route('/test/<id>/validate/', methods = ['POST'])
def check_answers(id):
    try:
        token = request.headers['Authorization'].split(" ")[-1]
        decoded = verify_token(token)

        answers = request.json['answers']
        scope = request.json['scope']

        points = 0
        total = 0
        correct_answers = {}
        explanation = {}

        mcq = test_table.get_item(
            Key = {
                'mcq_id': id
            }
        )['Item']

        questions = mcq['questions']
        num_of_questions = len(questions)
        count = 0
        explanations = []
        correct_answers = []
        
        for ind in range(len(questions)):
            idx = int(ind)
        
            if questions[idx]['answer'] == answers[idx]:
                count += 1
            
            correct_answers.append(questions[idx]['answer'])
            
            explanations.append(questions[idx]['explanation'])
        
        points = math.floor(count / len(questions) * float(mcq['points']))
        print(points)
        
        if 'preview' not in request.args.keys():
            task = {
                'type': 'MCQ',
                'total': str(mcq['points']),
                'xp': points,
                'id': id
            }

            header = { 'Authorization': request.headers['Authorization'], 'content-type': "Application/json"}
            data = dict(task = task, scope = scope)
            res = requests.patch("%s/%s/complete-task/" % (CURRENT_COURSE_SERVICE, mcq['course_id']), json = data, headers = header)

            if res.status_code != 200:
                error_log(500, 'Compute Score -> Add XP', 'Error adding xp to current course')
                return make_response(jsonify(error = "Error adding xp to current course"), 500)
            
            info_log(200, 'Compute Score -> Add Xp', "Xp added to current course")
        
        resp = jsonify(score = points, answers = correct_answers, explanation = explanations)

        info_log(200, 'Compute Score', '%s xp earned' % (points))
        return make_response(resp, 200)
    
    except ExpiredSignatureError as err:
        error_log(401, 'Compute Score', err)
        return make_response(jsonify(error = '%s' % (err)), 401)

    except Exception as err:
        error_log(500, 'Compute Score', err)
        return make_response(jsonify(error = 'something went wrong'), 500)

'''
#---------------delete test
'''
@test_api_blueprint.route('/test/<id>/',methods = [ 'DELETE' ])
def delete_test(id):
    try:
        if not has_token(request):
            error_log(401, 'Get Test', 'Token not Found')
            return make_response(jsonify(error = "Token not Found"), 401)

        token = request.headers['Authorization'].split(" ")[-1]
        decoded = verify_instructor(token)

        mcq = test_table.get_item(
            Key = {
                'mcq_id': id
            }
        )["Item"]

        test_table.delete_item(
            Key = {
                'mcq_id': id
            }
        )
        info_log(200, 'Delte Test', 'Test %s deleted' % (id))
        return make_response(jsonify(points = str(mcq['points'])), 200)
    
    except ExpiredSignatureError as err:
        error_log(401, 'Compute Score', err)
        return make_response(jsonify(error = err), 401)

    except Exception as err:
        error_log(500, 'Compute Score', err)
        return make_response(jsonify(error = 'something went wrong'), 500)
        
'''
#-----------update coins and points
'''
@test_api_blueprint.route('/test/<id>/', methods = [ 'PATCH' ])
def update_points(id):
    try:
        if not has_token(request):
                error_log(401, 'Get Test', 'Token not Found')
                return make_response(jsonify(error = "Token not Found"), 401)

        token = request.headers['Authorization'].split(" ")[-1]
        decoded = verify_instructor(token)

        print(request.json)

        if 'points' in request.json.keys() and 'coins' in request.json.keys():
            points = request.json['points']
            coins = request.json['coins']

            res = test_table.update_item(
                Key = {
                    'mcq_id': id
                },
                UpdateExpression = 'SET points = :points, coins = :coins',
                ExpressionAttributeValues = {
                    ':points': points,
                    ':coins': coins
                },
                ReturnValues = 'ALL_NEW'
            )
       
        elif 'points' in request.json.keys():
            points = request.json['points']

            res = test_table.update_item(
                Key = {
                    'mcq_id': id
                },
                UpdateExpression = 'SET points = :points',
                ExpressionAttributeValues = {
                    ':points': points,
                },
                ReturnValues = 'ALL_NEW'
            )
        else:
            coins = int(request.json['coins'])

            res = test_table.update_item(
                Key = {
                    'mcq_id': id
                },
                UpdateExpression = 'SET coins = :coins',
                ExpressionAttributeValues = {
                    ':coins': coins
                },
                ReturnValues = 'ALL_NEW'
            )
    
        mcq = res['Attributes']
        mcq['points'] = str(mcq['points'])
        mcq['coins'] = str(mcq['coins'])

        info_log(200, 'Update Test', 'Test %s is fetched' %(id))
        return make_response(jsonify({'res': mcq}), 200)

    except ExpiredSignatureError as err:
        error_log(401, 'Update Test', err)
        return make_response(jsonify(error = err), 401)

    except Exception as err:
        error_log(500, 'Update Test', err)
        return make_response(jsonify(error = 'something went wrong'), 500)