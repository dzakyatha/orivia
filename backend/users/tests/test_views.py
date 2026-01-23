import pytest
from django.urls import reverse
from users.views import GoogleLogin
from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.providers.oauth2.client import OAuth2Client

@pytest.mark.django_db
class TestGoogleLogin:
    def test_google_login_view_attributes(self):
        """Test GoogleLogin view has correct attributes"""
        view = GoogleLogin()
        assert view.adapter_class == GoogleOAuth2Adapter
        assert view.callback_url == "http://localhost:5173"
        assert view.client_class == OAuth2Client
    
    def test_google_login_url_resolves(self):
        """Test Google login URL resolves correctly"""
        url = reverse('google_login')
        assert url == '/api/auth/google/'
    
    def test_google_login_post_without_token(self, client):
        """Test Google login POST without token returns error"""
        url = reverse('google_login')
        response = client.post(url, {})
        assert response.status_code in [400, 401]
    
    def test_google_login_get_method_not_allowed(self, client):
        """Test Google login GET method is not allowed"""
        url = reverse('google_login')
        response = client.get(url)
        assert response.status_code == 405