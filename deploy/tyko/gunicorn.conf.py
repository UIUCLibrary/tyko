"""gunicorn WSGI server configuration."""
from multiprocessing import cpu_count
from os import environ

def max_workers():
    return cpu_count()


bind = '0.0.0.0:' + environ.get('PORT', '9182')
max_requests = 1000
workers = max_workers()
proc_name = 'tyko'
preload_app = True
