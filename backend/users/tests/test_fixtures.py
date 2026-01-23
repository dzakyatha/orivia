import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from django.urls import reverse

User = get_user_model()

@pytest.mark.django_db
class TestFixtures:
    """Test conftest fixtures to increase coverage"""
    
    def test_rf_fixture(self, rf):
        """Test request factory fixture"""
        request = rf.post('/test/')
        assert request.method == 'POST'
        assert request.path == '/test/'
    
    def test_user_data_fixture(self, user_data):
        """Test user_data fixture returns correct data"""
        assert user_data['email'] == 'test@example.com'
        assert user_data['password'] == 'TestPass123!'
        assert user_data['full_name'] == 'Test User'
        assert user_data['role'] == 'customer'
    
    def test_create_user_fixture_default(self, create_user):
        """Test create_user fixture with default values"""
        user = create_user()
        assert user.email == 'test@example.com'
        assert user.check_password('testpass123')
        assert user.role == 'customer'
    
    def test_create_user_fixture_custom(self, create_user):
        """Test create_user fixture with custom values"""
        user = create_user(
            email='custom@example.com',
            password='custompass',
            role='travel_agent',
            username='customuser'
        )
        assert user.email == 'custom@example.com'
        assert user.check_password('custompass')
        assert user.role == 'travel_agent'
        assert user.username == 'customuser'
    
    def test_authenticated_client_fixture(self, authenticated_client):
        """Test authenticated_client fixture"""
        client, user = authenticated_client
        
        # Verify client is authenticated
        assert isinstance(client, APIClient)
        assert user.email == 'test@example.com'
        
        # Test authenticated request
        url = reverse('rest_user_details')
        response = client.get(url)
        assert response.status_code == 200
        assert response.data['email'] == user.email
    
    def test_authenticated_client_can_access_protected_endpoints(self, authenticated_client):
        """Test authenticated client can access protected endpoints"""
        client, user = authenticated_client
        
        # Access user details
        url = reverse('rest_user_details')
        response = client.get(url)
        assert response.status_code == 200
        
        # Access logout
        logout_url = reverse('rest_logout')
        response = client.post(logout_url)
        assert response.status_code == 200