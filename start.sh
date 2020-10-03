cd web-services
source bin/activate
cd app
echo 'Enter Service :'
read SERVICE
cd $SERVICE
export STAGE=dev
export HOST=LOCAL
python app.py

