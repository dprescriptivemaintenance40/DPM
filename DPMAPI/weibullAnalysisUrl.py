from django.conf.urls import url
from DPMAPI import views

urlpatterns = [
    url('', views.weibullAnalysis),
    url('WeibullAnalysis/', views.weibullAnalysis)
]
