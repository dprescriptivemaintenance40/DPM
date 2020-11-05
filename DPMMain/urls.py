
from django.contrib import admin
from django.conf.urls import url
from django.views.generic.base import TemplateView
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
urlpatterns = [
    url('admin/', admin.site.urls),
    path('Centroids',include('DPMAPI.urls')),
    path('Predicted',include('DPMAPI.predictedUrl')),
    path('RuleEngine', include('DPMAPI.ruleEngineUrl')),
    path('WeibullAnalysis', include('DPMAPI.weibullAnalysisUrl')),
    url('', TemplateView.as_view(template_name="index.html"), name="index")
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
