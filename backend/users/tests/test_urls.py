import pytest
from django.urls import reverse, resolve
from users.views import GoogleAuth

class TestAuthenticationURLs:
    def test_google_auth_url_resolves(self):
        """Test Google auth URL resolves to correct view"""
        url = reverse('google_auth')
        assert resolve(url).func.view_class == GoogleAuth
    
    def test_google_auth_url_path(self):
        """Test Google auth URL path is correct"""
        url = reverse('google_auth')
        assert url == '/api/auth/google/'
    
    def test_dj_rest_auth_urls_included(self):
        """Test dj-rest-auth URLs are included"""
        # Login
        login_url = reverse('rest_login')
        assert login_url == '/api/auth/login/'
        
        # Logout
        logout_url = reverse('rest_logout')
        assert logout_url == '/api/auth/logout/'
        
        # User details
        user_url = reverse('rest_user_details')
        assert user_url == '/api/auth/user/'
    
    def test_registration_urls_included(self):
        """Test registration URLs are included"""
        register_url = reverse('rest_register')
        assert register_url == '/api/auth/registration/'
    
    def test_admin_url_exists(self):
        """Test admin URL exists"""
        admin_url = reverse('admin:index')
        assert admin_url == '/admin/'


@pytest.mark.django_db
class TestAuthenticationEndpoints:
    def test_login_endpoint_accessible(self, client):
        """Test login endpoint is accessible"""
        url = reverse('rest_login')
        response = client.post(url, {})
        assert response.status_code in [400, 401]  # Bad request or unauthorized
    
    def test_registration_endpoint_accessible(self, client):
        """Test registration endpoint is accessible"""
        url = reverse('rest_register')
        response = client.post(url, {})
        assert response.status_code == 400  # Bad request (missing data)
    
    def test_user_details_requires_authentication(self, client):
        """Test user details endpoint requires authentication"""
        url = reverse('rest_user_details')
        response = client.get(url)
        assert response.status_code == 401  # Unauthorized