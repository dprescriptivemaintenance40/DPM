"""
WSGI config for DPMMain project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/3.0/howto/deployment/wsgi/
"""

import os
from whitenoise import WhiteNoise
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'DPMMain.settings')
application = get_wsgi_application()
application = WhiteNoise(application, root='DPMAPI')
application.add_files('DPMAPI', prefix='static/')
