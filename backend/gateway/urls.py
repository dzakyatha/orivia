from django.urls import re_path
from .views import GatewayProxyView

urlpatterns = [
    # Matches: /api/planner/... -> Service: planner
    re_path(r'^planner/(?P<path>.*)$', GatewayProxyView.as_view(), {'service': 'planner'}),

    # Matches: /api/opentrip/... -> Service: opentrip
    re_path(r'^opentrip/(?P<path>.*)$', GatewayProxyView.as_view(), {'service': 'opentrip'}),
]