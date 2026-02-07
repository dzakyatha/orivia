import pytest
from unittest.mock import patch, MagicMock
from django.conf import settings
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken
from users.models import User, UserRole
import requests

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def user(db):
    return User.objects.create_user(
        username="planneruser",
        email="planner@example.com",
        password="password123",
        role=UserRole.TRAVEL_AGENT
    )

@pytest.fixture
def auth_token(user):
    """Generate JWT token for user"""
    refresh = RefreshToken.for_user(user)
    return str(refresh.access_token)

@pytest.mark.django_db
class TestTravelPlannerGateway:
    
    def test_proxy_forwarding_success(self, api_client, user, auth_token):
        """Test successful POST request forwarding to Travel Planner"""
        api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {auth_token}')
        
        with patch('gateway.views.requests.request') as mock_request:
            mock_response = MagicMock()
            mock_response.status_code = 201
            mock_response.content = b'{"id": "456", "title": "Bali Adventure"}'
            mock_response.headers = {'Content-Type': 'application/json'}
            mock_request.return_value = mock_response

            payload = {"title": "Bali Adventure"}
            response = api_client.post(
                '/api/planner/itineraries/', 
                payload, 
                format='json'
            )

            assert response.status_code == 201
            assert response.json()['title'] == "Bali Adventure"
            
            args, kwargs = mock_request.call_args
            # Verify URL rewriting to perencanaan
            assert kwargs['url'] == f"{settings.TRAVEL_PLANNER_URL}/api/perencanaan/itineraries/"
            assert 'Authorization' in kwargs['headers']
            assert kwargs['headers']['Authorization'].startswith('Bearer ')
            # Verify user identity headers
            assert kwargs['headers']['X-User-ID'] == str(user.id)
            assert kwargs['headers']['X-User-Role'] == user.role

    def test_proxy_get_request(self, api_client, user, auth_token):
        """Test GET request forwarding to Travel Planner"""
        api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {auth_token}')
        
        with patch('gateway.views.requests.request') as mock_request:
            mock_response = MagicMock()
            mock_response.status_code = 200
            mock_response.content = b'{"itineraries": []}'
            mock_response.headers = {'Content-Type': 'application/json'}
            mock_request.return_value = mock_response

            response = api_client.get('/api/planner/itineraries/')
            
            assert response.status_code == 200
            args, kwargs = mock_request.call_args
            assert kwargs['method'] == 'GET'
            # Verify URL rewriting
            assert kwargs['url'] == f"{settings.TRAVEL_PLANNER_URL}/api/perencanaan/itineraries/"
            # Verify user identity headers
            assert kwargs['headers']['X-User-ID'] == str(user.id)
            assert kwargs['headers']['X-User-Role'] == user.role

    def test_proxy_with_query_params(self, api_client, user, auth_token):
        """Test query parameters are forwarded to Travel Planner"""
        api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {auth_token}')
        
        with patch('gateway.views.requests.request') as mock_request:
            mock_response = MagicMock()
            mock_response.status_code = 200
            mock_response.content = b'{"results": []}'
            mock_response.headers = {'Content-Type': 'application/json'}
            mock_request.return_value = mock_response

            response = api_client.get('/api/planner/itineraries/?destination=Bali&page=2')
            
            assert response.status_code == 200
            args, kwargs = mock_request.call_args
            assert 'destination' in kwargs['params']
            assert kwargs['params']['destination'] == 'Bali'
            assert kwargs['params']['page'] == '2'
            # Verify URL rewriting
            assert kwargs['url'] == f"{settings.TRAVEL_PLANNER_URL}/api/perencanaan/itineraries/"

    def test_proxy_put_request(self, api_client, user, auth_token):
        """Test PUT request forwarding to Travel Planner"""
        api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {auth_token}')
        
        with patch('gateway.views.requests.request') as mock_request:
            mock_response = MagicMock()
            mock_response.status_code = 200
            mock_response.content = b'{"id": "456", "title": "Updated Bali Trip"}'
            mock_response.headers = {'Content-Type': 'application/json'}
            mock_request.return_value = mock_response

            response = api_client.put(
                '/api/planner/itineraries/456/', 
                {"title": "Updated Bali Trip"}, 
                format='json'
            )
            
            assert response.status_code == 200
            args, kwargs = mock_request.call_args
            assert kwargs['method'] == 'PUT'
            # Verify URL rewriting with ID
            assert kwargs['url'] == f"{settings.TRAVEL_PLANNER_URL}/api/perencanaan/itineraries/456/"
            # Verify user identity headers
            assert kwargs['headers']['X-User-ID'] == str(user.id)
            assert kwargs['headers']['X-User-Role'] == user.role

    def test_proxy_patch_request(self, api_client, user, auth_token):
        """Test PATCH request forwarding to Travel Planner"""
        api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {auth_token}')
        
        with patch('gateway.views.requests.request') as mock_request:
            mock_response = MagicMock()
            mock_response.status_code = 200
            mock_response.content = b'{"id": "456", "status": "published"}'
            mock_response.headers = {'Content-Type': 'application/json'}
            mock_request.return_value = mock_response

            response = api_client.patch(
                '/api/planner/itineraries/456/', 
                {"status": "published"}, 
                format='json'
            )
            
            assert response.status_code == 200
            args, kwargs = mock_request.call_args
            assert kwargs['method'] == 'PATCH'
            # Verify URL rewriting
            assert kwargs['url'] == f"{settings.TRAVEL_PLANNER_URL}/api/perencanaan/itineraries/456/"

    def test_proxy_delete_request(self, api_client, user, auth_token):
        """Test DELETE request forwarding to Travel Planner"""
        api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {auth_token}')
        
        with patch('gateway.views.requests.request') as mock_request:
            mock_response = MagicMock()
            mock_response.status_code = 204
            mock_response.content = b''
            mock_response.headers = {}
            mock_request.return_value = mock_response

            response = api_client.delete('/api/planner/itineraries/456/')
            
            assert response.status_code == 204
            args, kwargs = mock_request.call_args
            assert kwargs['method'] == 'DELETE'
            # Verify URL rewriting
            assert kwargs['url'] == f"{settings.TRAVEL_PLANNER_URL}/api/perencanaan/itineraries/456/"

    def test_proxy_nested_path(self, api_client, user, auth_token):
        """Test forwarding with nested resource path to Travel Planner"""
        api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {auth_token}')
        
        with patch('gateway.views.requests.request') as mock_request:
            mock_response = MagicMock()
            mock_response.status_code = 200
            mock_response.content = b'{"destinations": []}'
            mock_response.headers = {'Content-Type': 'application/json'}
            mock_request.return_value = mock_response

            response = api_client.get('/api/planner/itineraries/456/destinations/')
            
            assert response.status_code == 200
            args, kwargs = mock_request.call_args
            # Verify URL rewriting with nested path
            assert kwargs['url'] == f"{settings.TRAVEL_PLANNER_URL}/api/perencanaan/itineraries/456/destinations/"
            # Verify user identity headers
            assert kwargs['headers']['X-User-ID'] == str(user.id)
            assert kwargs['headers']['X-User-Role'] == user.role

    def test_proxy_root_path(self, api_client, user, auth_token):
        """Test forwarding to root planner path"""
        api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {auth_token}')
        
        with patch('gateway.views.requests.request') as mock_request:
            mock_response = MagicMock()
            mock_response.status_code = 200
            mock_response.content = b'{"status": "ok"}'
            mock_response.headers = {'Content-Type': 'application/json'}
            mock_request.return_value = mock_response

            response = api_client.get('/api/planner/')
            
            assert response.status_code == 200
            args, kwargs = mock_request.call_args
            # Verify URL rewriting for root path
            assert kwargs['url'] == f"{settings.TRAVEL_PLANNER_URL}/api/perencanaan/"

    def test_user_headers_not_spoofable(self, api_client, user, auth_token):
        """Test that client-provided X-User-ID/X-User-Role headers are ignored"""
        api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {auth_token}')
        
        with patch('gateway.views.requests.request') as mock_request:
            mock_response = MagicMock()
            mock_response.status_code = 200
            mock_response.content = b'{"itineraries": []}'
            mock_response.headers = {'Content-Type': 'application/json'}
            mock_request.return_value = mock_response

            # Try to spoof user identity via headers
            response = api_client.get(
                '/api/planner/itineraries/',
                HTTP_X_USER_ID='999',
                HTTP_X_USER_ROLE='ADMIN'
            )
            
            assert response.status_code == 200
            args, kwargs = mock_request.call_args
            # Verify server-side user context is used, not client headers
            assert kwargs['headers']['X-User-ID'] == str(user.id)
            assert kwargs['headers']['X-User-Role'] == user.role
            # Real user ID should be used, not spoofed '999'
            assert kwargs['headers']['X-User-ID'] != '999'
            assert kwargs['headers']['X-User-Role'] != 'ADMIN'

    def test_proxy_unauthorized(self, api_client):
        """Test that unauthenticated requests are blocked"""
        # Mock the request to prevent actual connection attempt    
        response = api_client.post('/api/planner/itineraries/', {}, format='json')
            
        assert response.status_code == 401
        assert b"Authentication" in response.content or b"credentials" in response.content

    def test_proxy_connection_error(self, api_client, user, auth_token):
        """Test Travel Planner service connection error returns 503"""
        api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {auth_token}')
        
        with patch('gateway.views.requests.request') as mock_request:
            mock_request.side_effect = requests.exceptions.ConnectionError("Service unavailable")

            response = api_client.post('/api/planner/itineraries/', {}, format='json')
            
            assert response.status_code == 503
            assert b"Gateway Error" in response.content

    def test_proxy_timeout_error(self, api_client, user, auth_token):
        """Test Travel Planner service timeout returns 503"""
        api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {auth_token}')
        
        with patch('gateway.views.requests.request') as mock_request:
            mock_request.side_effect = requests.exceptions.Timeout("Request timeout")

            response = api_client.get('/api/planner/itineraries/')
            
            assert response.status_code == 503
            assert b"Gateway Error" in response.content