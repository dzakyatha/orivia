import pytest
from django.urls import resolve
from gateway.views import GatewayProxyView

class TestTravelPlannerUrls:
    """Test URL routing for Travel Planner service"""
    
    def test_planner_root_path(self):
        """Test planner service with root path"""
        resolver = resolve('/api/planner/')
        assert resolver.func.view_class == GatewayProxyView
        assert resolver.kwargs['service'] == 'planner'
        assert resolver.kwargs['path'] == ''

    def test_planner_itineraries_endpoint(self):
        """Test planner itineraries endpoint"""
        resolver = resolve('/api/planner/itineraries/')
        assert resolver.func.view_class == GatewayProxyView
        assert resolver.kwargs['service'] == 'planner'
        assert resolver.kwargs['path'] == 'itineraries/'

    def test_planner_deeply_nested_path(self):
        """Test planner service with deeply nested path"""
        resolver = resolve('/api/planner/v1/itineraries/123/destinations/')
        assert resolver.kwargs['service'] == 'planner'
        assert resolver.kwargs['path'] == 'v1/itineraries/123/destinations/'

    def test_planner_path_preserves_trailing_slash(self):
        """Test that trailing slash is preserved in path"""
        resolver = resolve('/api/planner/itineraries/')
        assert resolver.kwargs['path'] == 'itineraries/'


class TestInvalidServiceUrls:
    """Test invalid service routing"""
    
    def test_invalid_service_path_not_found(self):
        """Test that invalid service path raises 404"""
        from django.urls.exceptions import Resolver404
        with pytest.raises(Resolver404):
            resolve('/api/invalidservice/path/')