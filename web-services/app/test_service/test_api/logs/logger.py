from . import info_logger, err_logger

def info_log(status, route, msg):
    fmt = "%s - (%s)-[%s]" % (status, route, msg)
    info_logger.warning(fmt)

def error_log(status, route, msg):
    fmt = "%s - (%s)-[%s]" % (status, route, msg)
    err_logger.error(fmt)