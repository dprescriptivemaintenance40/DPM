from django.conf.urls import url
from DPMAPI import views

urlpatterns = [
    url('', views.forecast),
    url('Forecast/', views.forecast)
]
