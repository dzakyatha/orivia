import logging
from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.providers.oauth2.client import OAuth2Client
from dj_rest_auth.registration.views import SocialLoginView, RegisterView
from dj_rest_auth.views import LoginView, LogoutView
from django.conf import settings

logger = logging.getLogger('users')

class CustomLoginView(LoginView):
    """Custom login view with logging"""
    
    def post(self, request, *args, **kwargs):
        logger.info(f"Login attempt for email: {request.data.get('email', 'unknown')}")
        response = super().post(request, *args, **kwargs)
        
        if response.status_code == 200:
            logger.info(f"Login successful for user: {request.user.email}")
        else:
            logger.warning(f"Login failed for email: {request.data.get('email', 'unknown')}")
        
        return response


class CustomRegisterView(RegisterView):
    """Custom registration view with logging"""
    
    def post(self, request, *args, **kwargs):
        email = request.data.get('email', 'unknown')
        logger.info(f"Registration attempt for email: {email}")
        
        response = super().post(request, *args, **kwargs)
        
        if response.status_code == 201:
            logger.info(f"Registration successful for email: {email}")
        else:
            logger.warning(f"Registration failed for email: {email}")
        
        return response


class CustomLogoutView(LogoutView):
    """Custom logout view with logging"""
    
    def post(self, request, *args, **kwargs):
        user_email = request.user.email if request.user.is_authenticated else 'unknown'
        logger.info(f"Logout attempt for user: {user_email}")
        
        response = super().post(request, *args, **kwargs)
        
        if response.status_code == 200:
            logger.info(f"Logout successful for user: {user_email}")
        
        return response


class GoogleLogin(SocialLoginView):
    """Google OAuth login with logging"""
    adapter_class = GoogleOAuth2Adapter
    callback_url = settings.GOOGLE_CALLBACK_URL
    client_class = OAuth2Client
    
    def post(self, request, *args, **kwargs):
        logger.info("Google OAuth login attempt")
        response = super().post(request, *args, **kwargs)
        
        if response.status_code == 200:
            logger.info(f"Google OAuth login successful for user: {request.user.email}")
        else:
            logger.warning("Google OAuth login failed")
        
        return response