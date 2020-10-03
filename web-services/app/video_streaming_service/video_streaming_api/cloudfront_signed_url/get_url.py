import time
from datetime import datetime, timedelta

from botocore.signers import CloudFrontSigner

from . import rsa_signer, CDN_URL

def get_signed_url(course, video):
    key_id = 'APKAIXKANGL6XMSOEWEQ'
    '''
    course_url = course
    if ' ' in course:
        course_url = course.replace(" ", '-')
    '''
    print(video)
    print(course)
    url = '%s/%s/video/%s' % (CDN_URL, course, video)

    cur = datetime.utcnow()
    expire_date = cur + timedelta(minutes = 45)

    cloudfront_signer = CloudFrontSigner(key_id, rsa_signer)

    signed_url = cloudfront_signer.generate_presigned_url(
        url, date_less_than = expire_date
    )
    
    return signed_url
    
if __name__ == '__main__':
    get_signed_url('test')