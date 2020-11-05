from django.conf.urls import url
from DPMAPI import views

urlpatterns = [
    url('', views.ruleEngine),
    url('RuleEngine/', views.ruleEngine)
]
