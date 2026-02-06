import pytest
from django.urls import resolve
from gateway.views import GatewayProxyView

class TestOpenTripUrls:
    """Test URL routing for Open Trip service"""
    
    def test_opentrip_root_path(self):
        """Test opentrip service with root path"""
        resolver = resolve('/api/opentrip/')
        assert resolver.func.view_class == GatewayProxyView
        assert resolver.kwargs['service'] == 'opentrip'
        assert resolver.kwargs['path'] == ''

    def test_opentrip_trips_endpoint(self):
        """Test opentrip trips endpoint"""
        resolver = resolve('/api/opentrip/trips/')
        assert resolver.func.view_class == GatewayProxyView
        assert resolver.kwargs['service'] == 'opentrip'
        assert resolver.kwargs['path'] == 'trips/'

    def test_opentrip_bookings_endpoint(self):
        """Test opentrip bookings endpoint"""
        resolver = resolve('/api/opentrip/bookings/')
        assert resolver.kwargs['service'] == 'opentrip'
        assert resolver.kwargs['path'] == 'bookings/'

    def test_opentrip_nested_path(self):
        """Test opentrip service with nested path"""
        resolver = resolve('/api/opentrip/trips/456/participants/')
        assert resolver.kwargs['service'] == 'opentrip'
        assert resolver.kwargs['path'] == 'trips/456/participants/'

    def test_opentrip_path_without_trailing_slash(self):
        """Test opentrip path without trailing slash"""
        resolver = resolve('/api/opentrip/trips')
        assert resolver.kwargs['path'] == 'trips'

class TestInvalidServiceUrls:
    """Test invalid service routing"""
    
    def test_invalid_service_path_not_found(self):
        """Test that invalid service path raises 404"""
        from django.urls.exceptions import Resolver404
        with pytest.raises(Resolver404):
            resolve('/api/invalidservice/path/')