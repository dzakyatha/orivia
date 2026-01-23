import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient, APIRequestFactory

User = get_user_model()

@pytest.fixture
def api_client():
    """Create API client for testing"""
    return APIClient()

@pytest.fixture
def rf():
    """Create request factory for testing"""
    return APIRequestFactory()

@pytest.fixture
def user_data():
    """Sample user data for testing"""
    return {
        'email': 'test@example.com',
        'password': 'TestPass123!',
        'full_name': 'Test User',
        'role': 'customer'
    }

@pytest.fixture
def create_user(db):
    """Factory fixture to create users"""
    def make_user(**kwargs):
        defaults = {
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'testpass123',
            'role': 'customer'
        }
        defaults.update(kwargs)
        password = defaults.pop('password')
        user = User.objects.create_user(**defaults)
        user.set_password(password)
        user.save()
        return user
    return make_user

@pytest.fixture
def authenticated_client(api_client, create_user):
    """Create authenticated API client"""
    user = create_user()
    api_client.force_authenticate(user=user)
    return api_client, user