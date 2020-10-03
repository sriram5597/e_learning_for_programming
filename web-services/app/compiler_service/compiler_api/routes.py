import os, signal
import os
import boto3
import sys
import flaskthreads

from flask import jsonify, make_response, request
from concurrent.futures import ThreadPoolExecutor
from concurrent.futures import as_completed
from concurrent.futures import TimeoutError
from botocore.exceptions import ClientError

from . import compiler_api_blueprint, BUCKET_NAME, UPLOAD_FOLDER
from .logs.logger import info_log, error_log
from app import app

s3_client = boto3.client('s3')

def compile_python(f, key):
    info_log('info', 'compiling python', '')

    if type(f) is str:
        cmd = 'python ' + f + " < inp-%s.txt > out-%s.txt  2> err-%s.txt"%(key, key, key)

    else:
        cmd = 'python ' + f.filename + " < inp-%s.txt > out-%s.txt  2> err-%s.txt"%(key, key, key)

    os.system(cmd)

def compile_cpp(f, temp_dir):
    compile_cmd = 'g++ -lm ' + os.path.join(UPLOAD_FOLDER, f.filename) + ' 2> err.txt'
    os.system(compile_cmd)
    errors = open('err.txt', 'r').read()
    if len(errors) > 0:
        os.system('rm ' + f.filename + ' err.txt')
        return jsonify({'error': errors})
    
    run_cmd = "bash -c './a.out; true' > out.txt 2> err.txt"
    os.system(run_cmd)

    errors = open('err.txt', 'r').read()
    output = open('out.txt', 'r').read()
    os.system('rm ' + f.filename + ' *.out' + ' *.txt')
    
    if len(errors) > 0:
        return jsonify({'error': errors})
    
    return jsonify({'output': output})

def compile_java(f, key):
    info_log('info', 'compiling java', '')

    if type(f) is str:
        cmd = 'javac ' + f + " 2> err-%s.txt" %(key)    
    else:
        cmd = 'javac ' + f.filename + " 2> err-%s.txt" %(key)
    os.system(cmd)
    
    compile_errors = open('err-%s.txt'%(key), 'r').read()
    if len(compile_errors) > 0:
        return

    java_file = f.filename.split('.')[0]
    cmd = 'java ' + java_file + " < inp-%s.txt > out-%s.txt  2> err-%s.txt"%(key, key, key)
    os.system(cmd)

language_handlers = {
    'python': compile_python,
    'java': compile_java,
}

time_limits = {
    'python': 10.0,
    'java': 8.0,
    'cpp': 2.0,
}

'''
-------------------------------------------
Compiling program with testcase validation
------------------------------------------
'''
def main_compiler(lang, sample, args):
        func = language_handlers[lang]
        
        if not sample:
            input_keys = args[1]
            output_keys = args[2]
            res = dict()
            keys = []

            for inp, out in zip(input_keys, output_keys):
                key = inp.split('-')[-1].split('.')[0]

                keys.append(key)

                prgm_input = s3_client.get_object(Bucket = BUCKET_NAME, Key = inp)['Body'].read()
                prgm_output = s3_client.get_object(Bucket = BUCKET_NAME, Key = out)['Body'].read()
                
                res[key] = 'failed'

                open(os.path.join(UPLOAD_FOLDER, 'inp-'+ key + '.txt'), 'wb').write(prgm_input)
                open(os.path.join(UPLOAD_FOLDER, 'actual-out-'+key+'.txt'), 'wb').write(prgm_output)
        
        else:
            input_keys = args[1]
            output_keys = args[2]

            res = dict()
            keys = []

            for inp, out in zip(input_keys, output_keys):
                key = 's-' + str(len(keys))
                keys.append(key)

                open(os.path.join(UPLOAD_FOLDER, 'inp-' + key + '.txt'), 'w').write(inp)
                open(os.path.join(UPLOAD_FOLDER, 'actual-out-' + key + '.txt'), 'w').write(out)

                res[key] = 'failed'

        current = os.getcwd()
        os.chdir(UPLOAD_FOLDER)

        prgm_out = {}
        f = {}
        actual_out = {}
        ex = []

        with app.app_context():
            try:
                executor = ThreadPoolExecutor(max_workers = len(input_keys))
                for i in keys:
                    f[i]  = executor.submit(func, args[0], i)
                
                for r in f.keys():
                    try: 
                        f[r].result(timeout = time_limits[lang])
                        
                    except TimeoutError as err:
                        res[r] = "MLE"
                        info_log('Testcase', lang, "Maximum Time Limit Exceeded")
                        f[r].set_exception(TimeoutError)
                
                executor.shutdown(wait = False)

            except Exception as err:
                error_log('error', lang, err)

        if not sample:
            resp = {}
            for ex_key in keys:
                err = open('err-%s.txt' %(ex_key), 'r').read()
                if len(err) > 0:
                    res[ex_key] = err
                    resp[ex_key] = { 'status': 'error'}
                        
                prgm_out[ex_key] = open('out-%s.txt'%(ex_key), 'r').read()
                actual_out[ex_key] = open('actual-out-%s.txt'%(ex_key), 'r').read()

                if res[ex_key] == 'MLE':
                    resp[ex_key] = {'status': 'MLE'}
                elif actual_out[ex_key] == prgm_out[ex_key]:
                    res[ex_key] = 'passed'
                    resp[ex_key] = {'status': 'passed'}
                
                else:
                    resp[ex_key] = {'status': 'failed'}

        else:
            resp = {}
            for ex_key in keys:
                err = open('err-%s.txt' %(ex_key), 'r').read()
                actual_out[ex_key] = open('actual-out-%s.txt'%(ex_key), 'r').read().rstrip()
                
                if len(err) > 0:
                    resp[ex_key] = {'output': err, 'status': 'error', 'expected': actual_out[ex_key]}
                    continue

                prgm_out[ex_key] = open('out-%s.txt'%(ex_key), 'r').read().rstrip()
                
                if res[ex_key] == 'MLE':
                    resp[ex_key] = {'status': 'MLE', 'expected': actual_out[ex_key]}

                elif actual_out[ex_key] == prgm_out[ex_key]:
                    res[ex_key] = 'passed'
                    resp[ex_key] = {'status': 'passed', 'output': prgm_out[ex_key], 'expected': actual_out[ex_key]}
                
                else:
                    resp[ex_key] = {'status': 'failed', 'output': prgm_out[ex_key], 'expected': actual_out[ex_key]}
        
        os.system('rm -rf *')
        os.chdir(current)

        return jsonify(result = resp)

'''
----------------------------------------
run and execute program
--------------------------------------
'''
def compile_code(lang, f):
    key = "run"
    func = language_handlers[lang]

    current = os.getcwd()
    os.chdir(UPLOAD_FOLDER)

    res = None
    with app.app_context():
        try:
            executor = ThreadPoolExecutor(max_workers = 1)
            prg  = executor.submit(func, f, key)
            
            try: 
                prg.result(timeout = time_limits[lang])
                
            except TimeoutError as err:
                res = "Maximum Timelimit Exceeded"
                prg.set_exception(TimeoutError)
        
            executor.shutdown(wait = False)

        except Exception as err:
            error_log('run code', lang, err)

    error = open('err-%s.txt'%(key), 'r').read()

    if res is not None:
        return jsonify(result = res)
        
    if len(error) > 0:
        res = error

    else:
        out = open('out-%s.txt'%(key), 'r').read()
        res = out

    os.system('rm -rf *')
    os.chdir(current)
    return jsonify(result = res)

'''
-------------------
routes
------------------
'''
'''
#------------health-check
'''
@compiler_api_blueprint.route('/compiler/', methods = [ 'GET' ])
def health_check():
    info_log(200, '/', 'HEALTH CHECK')
    return make_response(jsonify(message = 'Stacle compiler service'))

'''
#-----------compile testcases
'''
@compiler_api_blueprint.route('/compiler/testcases/', methods = ['POST'])
def compile_testcases():
    try:
        language = request.form['language']
        f = request.files['code']
        input_keys = eval(request.form['input_keys'])
        output_keys = eval(request.form['output_keys'])

        temp_dir = os.path.join(UPLOAD_FOLDER, f.filename)
        f.save(temp_dir)
        
        print(language)
        res = 'No File'
        if language == 'python':
            res = main_compiler(language, False, (f, input_keys, output_keys))

        elif language == 'cpp':
            res = main_compiler(language, False, (f, input_keys, output_keys))

        elif language == 'java':
            res = main_compiler(language, False, (f, input_keys, output_keys))
        
        info_log(200, 'Compile Testcases', 'Success')
        return make_response(res, 200)
    
    except Exception as err:
        error_log(500, 'Compile Testcases', err)
        return make_response(jsonify(error = err), 500)

'''
#-------------compile sample testcases
'''
@compiler_api_blueprint.route('/compiler/sampletestcases/', methods = [ 'POST' ])
def compile_sample_testcases():
    try:
        language = request.form['language']
        f = request.files['code']
        input_keys = eval(request.form['input_keys'])
        output_keys = eval(request.form['output_keys'])

        temp_dir = os.path.join(UPLOAD_FOLDER, f.filename)
        f.save(temp_dir)
        
        res = 'No File'
        if language == 'python':
            res = main_compiler(language, True, (f, input_keys, output_keys))

        elif language == 'cpp':
            res = main_compiler(language, True, (f, input_keys, output_keys))

        elif language == 'java':
            res = main_compiler(language, True, (f, input_keys, output_keys))
        
        info_log(200, 'Compile Sample Testcases', 'Success')
        return make_response(res)

    except Exception as err:
        error_log(500, 'Compile Sample Testcases', err)
        return make_response(jsonify(error = err), 500)

'''
#---------compiler run code
'''
@compiler_api_blueprint.route('/compiler/run/', methods = ['POST'])
def run_code():
    try:
        language = request.form['language']
        f = request.files['code']
        inp_file = request.files['input']

        code_file = os.path.join(UPLOAD_FOLDER, f.filename)
        f.save(code_file)
        inp = os.path.join(UPLOAD_FOLDER, 'inp-run.txt')
        inp_file.save(inp)
        
        res = compile_code(language, f)
        
        info_log(200, 'Code Run', 'Code compiled successfully')
        return make_response(res, 200)

    except Exception as err:
        error_log(500, 'Compile Sample Testcases', err)
        return make_response(jsonify(error = "something went wrong"), 500)
