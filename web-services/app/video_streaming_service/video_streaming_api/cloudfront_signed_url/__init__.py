import os

from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import padding

stage = os.environ['STAGE']
if stage == 'dev':
    CDN_URL = 'https://d9jns8bzft6qe.cloudfront.net'
else:
    pass

def rsa_signer(message):
    with open('pk-APKAIXKANGL6XMSOEWEQ.pem', 'rb') as key_file:
        private_key = serialization.load_pem_private_key(
            key_file.read(),
            password=None,
            backend = default_backend()
        )

    return private_key.sign(message, padding.PKCS1v15(), hashes.SHA1())