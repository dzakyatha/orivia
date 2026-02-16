import pytest
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken
from users.models import User

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def user():
    return User.objects.create_user(
        username="testuser",
        email="test@example.com",
        password="password123",
        role="CUSTOMER"
    )

@pytest.fixture
def auth_token(user):
    """Generate JWT token for user"""
    refresh = RefreshToken.for_user(user)
    return str(refresh.access_token)

@pytest.mark.django_db
class TestGatewayCommon:
    
    def test_service_not_found(self, api_client, user, auth_token):
        """Test that invalid service returns 404"""
        api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {auth_token}')
        response = api_client.get('/api/invalidservice/path/')
        # Django returns standard 404 HTML page when URL pattern doesn't match
        assert response.status_code == 404

    def test_headers_filtering(self, api_client, user, auth_token):
        """Test that host and content-length headers are filtered out"""
        from unittest.mock import patch, MagicMock
        
        api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {auth_token}')
        
        with patch('gateway.views.requests.request') as mock_request:
            mock_response = MagicMock()
            mock_response.status_code = 200
            mock_response.content = b'{}'
            mock_response.headers = {'Content-Type': 'application/json'}
            mock_request.return_value = mock_response

            response = api_client.get('/api/opentrip/trips/')
            
            args, kwargs = mock_request.call_args
            headers_lower = {k.lower() for k in kwargs['headers'].keys()}
            assert 'host' not in headers_lower
            assert 'content-length' not in headers_lower
            # Check authorization exists (JWT token forwarded)
            assert 'authorization' in headers_lower
            assert kwargs['headers']['Authorization'].startswith('Bearer ')