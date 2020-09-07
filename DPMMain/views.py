from django.shortcuts import render

# Create your views here.
from django.shortcuts import render, HttpResponseRedirect
from django.http import HttpResponse, JsonResponse

# from new_app.models import ExampleModel
# from new_app.serializers import ExampleModelSerializer
from django.db import  models
from django.views.decorators.csrf import csrf_exempt
import numpy as np
np.set_printoptions(suppress=True)
import pandas as pd
from sklearn.cluster import KMeans

# def get_data(request):
# 	# data = ExampleModel.objects.all()
# 	if request.method == 'GET':
# 		# serializer =   ExampleModelSerializer(data, many=True)
# 		return JsonResponse("Hi Rajesh Here", safe=False)


def get_centroids(request,response):
	data = pd.read_csv("E:\\ShivSirProject\\Files\\U1Train.csv")
	kmeans = KMeans(n_clusters=4, init='random', max_iter=10, tol=1e-04, random_state=0).fit(data)
	mydata = np.array(data)
	centroids = (kmeans.cluster_centers_)
	return JsonResponse("TEST", safe=False)