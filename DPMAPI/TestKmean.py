


from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_protect
import numpy as np
np.set_printoptions(suppress=True)
import pandas as pd
from sklearn.cluster import KMeans
import json

@csrf_protect
def predicted(request):
	if request.method == 'POST':
		n_clusters = request.GET['n_clusters']
		iterate = request.GET['iterate']
		tolerance = request.GET['tolerance']
		random_state = request.GET['random_state']
		trainFile = request.FILES['trainFile']
		testFile = request.FILES['testFile']
		trainData = pd.read_csv(trainFile).replace(np.nan, 0)
		kmeans = KMeans(n_clusters=int(n_clusters), init='random', max_iter=int(iterate), tol=float(tolerance),
						random_state=int(random_state)).fit(trainData)
		testdata = pd.read_csv(testFile).replace(np.nan, 0)
		testdata.index.name = 'id'
		predicted = kmeans.predict(testdata)
		predicteddf = pd.DataFrame(data=predicted.flatten())
		predicteddf.index.name = 'id'
		final = pd.merge(predicteddf, testdata, on='id')
		column = list(final.columns)
		# final.to_csv("E:\\ShivSirProject\\Files\\Predicted.csv")
		df = pd.DataFrame(final)
		result = df.to_json(orient="values")
		parsed = json.loads(result)
		json_data = []
		json_data.append(column)
		data = []
		for row in parsed:
			data.append(dict(zip(column, row)))
		json_data.append(data)
		return JsonResponse(json_data, safe=False)
