import logging
import sys

err_logger = logging.getLogger('err_logger')
err_handler = logging.StreamHandler(sys.stderr)
err_handler.setLevel('ERROR')
format = logging.Formatter("[%(asctime)s] [%(process)d] [%(levelname)s] : %(msg)s")
err_handler.setFormatter(format)
err_logger.addHandler(err_handler)

info_logger = logging.getLogger('info_logger')
handler = logging.StreamHandler(sys.stdout)
handler.setLevel('DEBUG')
format = logging.Formatter("[%(asctime)s] [%(process)d] [INFO] : %(msg)s")
handler.setFormatter(format)
info_logger.addHandler(handler)