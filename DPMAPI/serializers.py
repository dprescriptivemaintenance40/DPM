
from rest_framework import serializers

class CentroidsSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        # model = Centroids
        fields = ['url', 'n_clusters', 'iterate', 'tolerance','tolerance']

class PredictedSerialiZer(serializers.HyperlinkedModelSerializer):
    class Meta:
        # model = Group
        fields = ['url', 'n_clusters', 'iterate', 'tolerance','tolerance']