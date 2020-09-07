from django.conf.urls import url
from DPMAPI import views

urlpatterns = [
    url('', views.centroids),
    url('Centroids/', views.centroids)
]
