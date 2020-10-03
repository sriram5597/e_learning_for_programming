import logging
import os
import boto3
import requests
import base64
import hmac
import hashlib
import uuid

from flask import make_response, jsonify, request
from jwt import ExpiredSignatureError

from . import video_streaming_api_blueprint, verify_token, verify_instructor, COURSE_FLOW_SERVICE, get_credentials
from . import BUCKET_NAME, UPLOAD_FOLDER, OUTPUT_BUCKET
from .cloudfront_signed_url.get_url import get_signed_url 
from .logs.logger import error_log, info_log

s3_client = boto3.client('s3')
s3 = boto3.resource('s3')
cloudfront_client = boto3.client('cloudfront')

def has_token(request):
    if 'Authorization' not in request.headers.keys():
        return False
    return True

'''
#--------health check
'''
@video_streaming_api_blueprint.route('/stream/', methods = [ 'GET' ])
def health_check():
    info_log(200, '/stream/', 'HEALTH CHECK')
    return make_response(jsonify(message = 'Stacle video streaming service'), 200)

'''
#---------stream video
'''
@video_streaming_api_blueprint.route('/stream/video/<video_dir>/<video>/', methods = [ 'GET' ])
def stream_video(video_dir, video):
    try:
        if not has_token(request):
            error_log(401, 'stream video', 'Token not found')
            return make_response(jsonify(error = "token not found"), 401)

        token = request.headers['Authorization'].split(" ")[-1]
        decoded = verify_token(token)

        url = s3_client.generate_presigned_url(
            ClientMethod = 'get_object',
            Params = {
                'Bucket': OUTPUT_BUCKET,
                'Key': '%s/%s' % (video_dir, video)
            }
        )

        info_log(200, 'Stream Video', 'generated signed url for %s' % (video))
        return make_response(jsonify(url = url), 200)
    
    except ExpiredSignatureError as err:
        error_log(401, 'Generate Signed Url', err)
        return make_response(jsonify(error = '%s' % (err)), 401)
    
    except Exception as err:
        error_log(500, 'Generate Signed Url', err)
        return make_response(jsonify(error = "something went wrong"), 500)

'''
#----------upload video
'''
@video_streaming_api_blueprint.route('/stream/<course>/upload/gen-credentials/', methods = [ 'GET' ])
def gen_url(course):
    try:
        if not has_token(request):
            error_log(401, 'Generate Credentials', 'Token not found')
            return make_response(jsonify(error = "token not found"), 401)

        token = request.headers['Authorization'].split(" ")[-1]
        decoded = verify_token(token)
        
        video_id = str(uuid.uuid4())
        key = '%s/%s.m3u8' % (video_id, video_id)

        cred = get_credentials(course)
       
        info_log(200, 'Generate Credentials', 'Generated  Temporary Credentials')
        return make_response(jsonify(credentials = cred['Credentials'], key = key), 200)
    
    except ExpiredSignatureError as err:
        error_log(401, 'Generate Signed Url', err)
        return make_response(jsonify(error = '%s' % (err)), 401)
    
    except Exception as err:
        error_log(500, 'Generate Signed Url', err)
        return make_response(jsonify(error = "something went wrong"), 500)

'''
#-----------delete video
'''
@video_streaming_api_blueprint.route('/stream/<course>/delete/', methods = [ 'POST' ])
def delete_video(course):
    try:
        if not has_token(request):
            error_log(401, 'Delete Video', 'Token not found')
            return make_response(jsonify(error = "token not found"), 401)

        token = request.headers['Authorization'].split(" ")[-1]
        decoded = verify_token(token)

        video = request.json['video']
    
        s3_client.delete_object(Bucket = BUCKET_NAME, Key = video)

        info_log(200, 'Delete Video', 'video %s deleted' % (video))
        return make_response(jsonify(message = 'video deleted'), 200)
    
    except ExpiredSignatureError as err:
        error_log(401, 'Delete Video', err)
        return make_response(jsonify(error = err), 401)
    
    except Exception as err:
        error_log(500, 'Delete Video', err)
        return make_response(jsonify(error = "something went wrong"), 500)

'''
#--------------add subtitle
'''
@video_streaming_api_blueprint.route('/stream/<course>/add-subtitle/', methods = [ 'POST' ])
def update_subtitle(course):
    try:
        if not has_token(request):
            error_log(401, 'Update Subtitle', 'Token not found')
            return make_response(jsonify(error = "token not found"), 401)

        token = request.headers['Authorization'].split(" ")[-1]
        decoded = verify_token(token)

        subtitle = request.files['sub-title']
        filename = request.form.get('filename')
        
        ext = subtitle.filename.split('.')[-1]
        file_path = os.path.join(UPLOAD_FOLDER, filename + '.%s' % (ext))
        subtitle.save(file_path)

        key = '%s/sub-titles/%s' % (course.replace(' ', '-'), filename + '.%s' % (ext))
        s3_client.upload_fileobj(open(file_path, 'rb'), BUCKET_NAME, key)

        os.system('rm %s' % (file_path))

        info_log(200, 'Update Subtitle', 'subtitle added to video')
        return make_response(jsonify(message = 'subtitle added'), 200)
    
    except ExpiredSignatureError as err:
        error_log(401, 'Update Subtitle', err)
        return make_response(jsonify(error = err), 401)
    
    except Exception as err:
        error_log(500, 'Update Subtitle', err)
        return make_response(jsonify(error = "something went wrong"), 500)

'''
#--------------add thumbnail
'''
@video_streaming_api_blueprint.route('/stream/<course>/add-thumbnail/', methods = [ 'POST' ])
def update_thumbnail(course):
    try:
        if not has_token(request):
            error_log(401, 'Update Thumbnail', 'Token not found')
            return make_response(jsonify(error = "token not found"), 401)

        token = request.headers['Authorization'].split(" ")[-1]
        decoded = verify_token(token)

        thumbnail = request.files['thumbnail']
        filename = request.form.get('filename')

        ext = thumbnail.filename.split('.')[-1]
        file_path = os.path.join(UPLOAD_FOLDER, thumbnail.filename)
        thumbnail.save(file_path)

        key = '%s/thumbnail/%s' % (course.replace(' ', '-'), filename + '.%s' % (ext))
        s3_client.upload_fileobj(open(file_path, 'rb'), BUCKET_NAME, key)

        os.system('rm %s' % (file_path))

        info_log(200, 'Update Thumbnail', 'Thumbnail added to video')
        return make_response(jsonify(message = 'Thumbnail added'), 200)
    
    except ExpiredSignatureError as err:
        error_log(401, 'Update Thumbnail', err)
        return make_response(jsonify(error = err), 401)
    
    except Exception as err:
        error_log(500, 'Update Thumbnail', err)
        return make_response(jsonify(error = "something went wrong"), 500)