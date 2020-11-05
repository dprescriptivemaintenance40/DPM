from django.shortcuts import render, HttpResponseRedirect
from django.http import HttpResponse, JsonResponse
from django.shortcuts import get_object_or_404, render
from django.views.decorators.csrf import csrf_protect
import numpy as np

np.set_printoptions(suppress=True)
import pandas as pd
from sklearn.cluster import KMeans
import json
import os
from os import path
from collections import Counter
import math
from scipy.stats import linregress
from django.core import serializers
# @csrf_protect
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def centroids(request):
  try:
     if request.method == 'POST':
      n_clusters = request.GET['n_clusters']
      iterate = request.GET['iterate']
      tolerance = request.GET['tolerance']
      random_state = request.GET['random_state']
      file = request.FILES['uploadFile']
      data = pd.read_csv(file).replace(np.nan, 0)
      temp = data;
      dirName = os.path.join(BASE_DIR, 'DPMAPI/static/Files')
      if (path.exists(dirName)):
        isPresent = path.exists(os.path.join(dirName, "U1TrainFile.csv"))
        if (isPresent):
          os.remove(os.path.join(dirName, "U1TrainFile.csv"))
          data.to_csv(os.path.join(dirName, "U1TrainFile.csv"), index=False)
        else:
          data.to_csv(os.path.join(dirName, "U1TrainFile.csv"), index=False)
      else:
        os.mkdir(dirName)
        data.to_csv(os.path.join(dirName, "U1TrainFile.csv"), index=False)
      # isPresent = path.exists(os.path.join(dirName, "U1TrainFile.csv"))

      column = list(data.columns)
      # k-means++
      kmeans = KMeans(n_clusters=int(n_clusters),
                      init='k-means++',
                      max_iter=int(iterate),
                      tol=float(tolerance),
                      random_state=int(random_state),
                      algorithm='auto').fit(data)
      mydata = np.array(data)
      centroids = (kmeans.cluster_centers_)
      df = pd.DataFrame(kmeans.cluster_centers_)
      df.columns = column
      df['Classifications'] = ""
      df['label'] = "";
      count = Counter(kmeans.labels_)
      countList = [list(i) for i in count.most_common()]
      dfCount = pd.DataFrame(countList)
      for col in column:
          for i, row in enumerate(df[col]):
              max = df[col].max()
              min = df[col].min()
              df['label'][i] = dfCount[0][i]
              if max == row:
                  df['Classifications'][i] = 'Abnormal State'
                  dfCount[0][i] = 'Abnormal State'
              elif min == row:
                  df['Classifications'][i] = 'Normal State'
                  dfCount[0][i] = 'Normal state'
              else:
                  df['Classifications'][i] = 'Watch'
                  dfCount[0][i] = 'Watch'
          break

      column = list(df.columns)

      sort = countList.sort()

      resultCount = dfCount.to_json(orient="values")
      parsedCount = json.loads(resultCount)
      result = df.to_json(orient="values")
      parsed = json.loads(result)
      json_data = []
      json_data.append(column)
      data = []
      dataCount = []
      for row in parsed:
        data.append(dict(zip(column, row)))

      for row in parsedCount:
        dataCount.append(dict(zip(['name','value'], row)))
      json_data.append(data)
      json_data.append(dataCount)

      scatterdata = []
      temp.index.name = 'id'
      predicted = kmeans.predict(temp)
      predicteddf = pd.DataFrame(data=predicted.flatten())
      predicteddf.index.name = 'id'
      final = pd.merge(predicteddf, temp, on='id')
      final.rename(columns={0: 'label'}, inplace = True)
      finaldf = pd.DataFrame(final)
      finaldf['Classifications'] = ""
      for i, row in enumerate(df['label']):
          for j, val in enumerate(finaldf['label']):
            if row == val:
               finaldf['Classifications'][j] = df['Classifications'][i]

      finalresult = finaldf.to_json(orient="values")
      finalparsed = json.loads(finalresult)
      for row in finalparsed:
        scatterdata.append(dict(zip(['label', 'x', 'y'], row)))

      scatterClusterData = []
      for row in parsed:
       scatterClusterData.append(dict(zip(['x', 'y'], row)))

      json_data.append(scatterdata)
      json_data.append(scatterClusterData)

      # ThreeDScatterDataDF = pd.DataFrame(temp)
      # ThreeDScatterData = ThreeDScatterDataDF.to_json(orient="values")
      ThreeDScattercolumn = list(finaldf.columns)
      # parsed = json.loads(ThreeDScatterData)
      ThreeDScatterDF = []
      for row in finalparsed:
          ThreeDScatterDF.append(dict(zip(ThreeDScattercolumn, row)))
      json_data.append(ThreeDScatterDF)

      return JsonResponse(json_data , safe=False)
  except Exception as e:
    return JsonResponse(e, safe=False)

def predicted(request):
  try:
      if request.method == 'POST':
       n_clusters = request.GET['n_clusters']
       iterate = request.GET['iterate']
       tolerance = request.GET['tolerance']
       random_state = request.GET['random_state']
       trainFile = os.path.join(BASE_DIR, 'DPMAPI/static/Files/U1TrainFile.csv')
       testFile = request.FILES['testFile']
       trainData = pd.read_csv(trainFile).replace(np.nan, 0)
       kmeans = KMeans(n_clusters=int(n_clusters), init='k-means++', max_iter=int(iterate), tol=float(tolerance),
                       random_state=int(random_state)).fit(trainData)
       testdata = pd.read_csv(testFile).replace(np.nan, 0)

       column = list(testdata.columns)
       df = pd.DataFrame(kmeans.cluster_centers_)
       df.columns = column
       df['Classifications'] = ""
       df['label'] = "";
       count = Counter(kmeans.labels_)
       countList = [list(i) for i in count.most_common()]
       dfCount = pd.DataFrame(countList)
       for col in column:
           for i, row in enumerate(df[col]):
               max = df[col].max()
               min = df[col].min()
               df['label'][i] = dfCount[0][i]
               if max == row:
                   df['Classifications'][i] = 'incipient state'
                   dfCount[0][i] = 'incipient state'
               elif min == row:
                   df['Classifications'][i] = 'normal state'
                   dfCount[0][i] = 'normal state'
               else:
                   df['Classifications'][i] = 'anomaly state'
                   dfCount[0][i] = 'anomaly state'
           break
       column = list(df.columns)
       testdata.index.name = 'id'
       predicted = kmeans.predict(testdata)
       predicteddf = pd.DataFrame(data=predicted.flatten())
       predicteddf.index.name = 'id'
       final = pd.merge(predicteddf, testdata, on='id')
       final.rename(columns={0: 'label'}, inplace=True)
       finaldf = pd.DataFrame(final)
       finaldf['Classifications'] = ""
       for i, row in enumerate(df['label']):
           for j, val in enumerate(finaldf['label']):
               if row == val:
                   finaldf['Classifications'][j] = df['Classifications'][i]

       finalresult = finaldf.to_json(orient="values")
       column = list(finaldf.columns)
       parsed = json.loads(finalresult)
       json_data = []
       json_data.append(column)
       data = []
       for row in parsed:
         data.append(dict(zip(column, row)))
       json_data.append(data)
       return JsonResponse(json_data, safe=False)
  except Exception as e:
    return JsonResponse(e, safe=False)

def ruleEngine(request):
    try:
        if request.method == 'POST':
            ruleEngine = request.FILES['ruleEngine']
            ruleEngineData = pd.read_csv(ruleEngine).replace(np.nan, 0)
            ruleEngineData["Classifications"] = ""
            for row in ruleEngineData.itertuples():
                if ((row[1] > 165 and row[2] < 265) or (row[1] < 165 and row[2] > 265)):
                    ruleEngineData["Classifications"][row[0]] = "Watch"
                    # print("Watch")
                elif (row[1] > 165 and row[2] > 265 and (row[3] >= 205 and row[3] <= 210)):
                    ruleEngineData["Classifications"][row[0]] = "Abnormal State"
                    # print("Abnormal State")
                elif (row[1] > 165 and row[2] > 265 and (row[3] <= 205 or row[3] >= 210)):
                    ruleEngineData["Classifications"][row[0]] = "Watch"
                    # print("Watch")
                else:
                    ruleEngineData["Classifications"][row[0]] = "Normal State"
                    # print("Normal State")

            # column = list(ruleEngineData.columns)
            finaldf = pd.DataFrame(ruleEngineData)
            finalresult = finaldf.to_json(orient="values")
            column = list(finaldf.columns)
            parsed = json.loads(finalresult)
            json_data = []
            json_data.append(column)
            data = []
            for row in parsed:
                data.append(dict(zip(column, row)))
            json_data.append(data)
            return JsonResponse(json_data, safe=False)
    except Exception as e:
        return JsonResponse(e, safe=False)

def weibullAnalysis(request):
    try:
        if request.method == 'POST':
            daysFile = request.FILES['daysFile']
            daysDF = pd.read_csv(daysFile, delimiter=',').replace(np.nan, 0)
            numbers = list(daysDF["Days"])
            sortedNum = sorted(numbers)
            daysDF["Days"] = sortedNum
            rank = list()
            median = list()
            logx = list()
            logxInverse = list()
            logxOflogx = list()
            for i, day in enumerate(daysDF["Days"]):
                rank.append(i + 1)
                median.append(((i + 1) - 0.3) / (19 + 0.4))
                logx.append(math.log(day))
                logxInverse.append(1 / (1 - ((i + 1) - 0.3) / (19 + 0.4)))
                logxOflogx.append(math.log(math.log(1 / (1 - ((i + 1) - 0.3) / (19 + 0.4)))))
            daysDF["Rank"] = rank
            daysDF["Median rank, percentage"] = median
            daysDF["ln (x)"] = logx
            daysDF["1/(1-p)"] = logxInverse
            daysDF["ln(ln(1/(1-p)))"] = logxOflogx
            slope, intercept, r_value, p_value, std_err = linregress(logxOflogx, logx)
            daysDFCol = list(daysDF.columns)
            Beta = 1 / slope
            Alpha = math.exp(intercept)
            weibullFile = os.path.join(BASE_DIR, 'DPMAPI/static/Files/Cycles_T.csv')
            weibullData = pd.read_csv(weibullFile, delimiter=',')
            reliability = list()
            hazardrate = list()
            pdf = list()
            cdf = list()
            weibullLogx = list()
            weibullLogxOfLogx = list()
            for i, day in enumerate(weibullData["Days"]):
                pdfval = (Beta / Alpha) * math.pow((day / Alpha), (Beta - 1)) * math.exp(
                    -(math.pow((day / Alpha), Beta)))
                hazardval = (Beta / Alpha) * math.pow((day / Alpha), (Beta - 1))
                reliabilityval = pdfval / hazardval
                hazardrate.append(hazardval)
                pdf.append(pdfval)
                reliability.append(reliabilityval)
                cdf.append((1 - reliabilityval))
                weibullLogx.append(math.log(day))
                weibullLogxOfLogx.append(math.log(math.log((1 / reliabilityval))))
            weibullData["CDF"] = cdf
            weibullData["Reliability"] = reliability
            weibullData["HazardRate"] = hazardrate
            weibullData["PDF"] = pdf
            weibullData["LN(Days)"] = weibullLogx
            weibullData["LN(LN(1/R(T)))"] = weibullLogxOfLogx
            weibullCol = list(weibullData.columns)
            json_data = []
            json_data.append(daysDFCol)
            daysDFresult = daysDF.to_json(orient="values")
            daysDFparsed = json.loads(daysDFresult)
            daysDFdata = []
            for row in daysDFparsed:
                daysDFdata.append(dict(zip(daysDFCol, row)))
            json_data.append(daysDFdata)
            json_data.append(weibullCol)
            weibullDataresult = weibullData.to_json(orient="values")
            weibullDataparsed = json.loads(weibullDataresult)
            weibull = []
            for row in weibullDataparsed:
                weibull.append(dict(zip(weibullCol, row)))
            json_data.append(weibull)
            quickCalData = [{"Beta": Beta, "Alpha": Alpha}]
            json_data.append(quickCalData)
            return JsonResponse(json_data, safe=False)
            print(weibullData)

    except Exception as e:
        return JsonResponse(e, safe=False)
