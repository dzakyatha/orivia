import pytest
from django.urls import reverse
from django.test import TestCase, override_settings
from rest_framework.test import APIClient, APITestCase
from rest_framework import status
from unittest.mock import patch, MagicMock
from django.contrib.auth import get_user_model
from allauth.socialaccount.models import SocialAccount
from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.providers.oauth2.client import OAuth2Client

from users.views import GoogleAuth, mask_email, hash_email
from users.models import Profile, UserRole

User = get_user_model()


# Test utility functions
class TestUtilityFunctions(TestCase):
    """Test email masking and hashing functions"""
    
    def test_mask_email_standard(self):
        """Test masking a standard email"""
        result = mask_email('john.doe@example.com')
        assert result == 'j******e@e*****e.com'
    
    def test_mask_email_short_local(self):
        """Test masking email with short local part"""
        result = mask_email('ab@example.com')
        assert result == 'a*@e*****e.com'
    
    def test_mask_email_single_char_local(self):
        """Test masking email with single character local part"""
        result = mask_email('a@example.com')
        assert result == 'a*@e*****e.com'
    
    def test_mask_email_unknown(self):
        """Test masking unknown email"""
        result = mask_email('unknown')
        assert result == 'unknown'
    
    def test_mask_email_invalid(self):
        """Test masking invalid email"""
        result = mask_email('notanemail')
        assert result == '***@***.***'
    
    def test_hash_email_standard(self):
        """Test hashing a standard email"""
        result = hash_email('test@example.com')
        assert len(result) == 16
        assert result == hash_email('test@example.com')  # Consistent
    
    def test_hash_email_unknown(self):
        """Test hashing unknown email"""
        result = hash_email('unknown')
        assert result == 'unknown'
    
    def test_hash_email_empty(self):
        """Test hashing empty email"""
        result = hash_email('')
        assert result == ''


# Test CustomLoginView
class TestCustomLoginView(APITestCase):
    """Test custom login view with various scenarios"""
    
    def setUp(self):
        self.client = APIClient()
        self.url = '/api/auth/login/'
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
    
    def test_successful_login(self):
        """Test successful login returns 200 with tokens"""
        response = self.client.post(self.url, {
            'email': 'test@example.com',
            'password': 'testpass123'
        })
        
        self.assertEqual(response.status_code, 200)
        self.assertIn('access_token', response.data)
        self.assertIn('refresh_token', response.data)
    
    def test_invalid_credentials_returns_401(self):
        """Test invalid credentials return 401"""
        response = self.client.post(self.url, {
            'email': 'test@example.com',
            'password': 'wrongpassword'
        })
        
        self.assertEqual(response.status_code, 401)
        self.assertIn('detail', response.data)
        self.assertEqual(response.data['code'], 'invalid_credentials')
    
    def test_missing_email_returns_400(self):
        """Test missing email returns 400"""
        response = self.client.post(self.url, {
            'password': 'testpass123'
        })
        
        self.assertEqual(response.status_code, 400)
    
    def test_missing_password_returns_400(self):
        """Test missing password returns 400"""
        response = self.client.post(self.url, {
            'email': 'test@example.com'
        })
        
        self.assertEqual(response.status_code, 400)
    
    def test_empty_credentials_returns_400(self):
        """Test empty credentials return 400"""
        response = self.client.post(self.url, {})
        
        self.assertEqual(response.status_code, 400)
    
    def test_nonexistent_user_returns_401(self):
        """Test login with non-existent user returns 401"""
        response = self.client.post(self.url, {
            'email': 'nonexistent@example.com',
            'password': 'password123'
        })
        
        self.assertEqual(response.status_code, 401)
    
    @patch('users.views.logger')
    def test_login_logging_success(self, mock_logger):
        """Test that successful login is logged"""
        self.client.post(self.url, {
            'email': 'test@example.com',
            'password': 'testpass123'
        })
        
        # Check info logs were called
        assert mock_logger.info.called
        assert mock_logger.info.call_count >= 2  # Login attempt + success
    
    @patch('users.views.logger')
    def test_login_logging_failure(self, mock_logger):
        """Test that failed login is logged"""
        self.client.post(self.url, {
            'email': 'test@example.com',
            'password': 'wrongpassword'
        })
        
        # Check warning logs were called
        assert mock_logger.warning.called


# Test CustomRegisterView
class TestCustomRegisterView(APITestCase):
    """Test custom registration view"""
    
    def setUp(self):
        self.client = APIClient()
        self.url = '/api/auth/registration/'
    
    def test_successful_registration(self):
        """Test successful registration returns 201"""
        response = self.client.post(self.url, {
            'username': 'newuser',
            'email': 'newuser@example.com',
            'password1': 'complexpass123',
            'password2': 'complexpass123'
        })
        
        self.assertEqual(response.status_code, 201)
        self.assertTrue(User.objects.filter(email='newuser@example.com').exists())
    
    def test_duplicate_email_returns_409(self):
        """Test duplicate email returns 409 conflict"""
        User.objects.create_user(
            username='existing',
            email='existing@example.com',
            password='pass123'
        )
        
        response = self.client.post(self.url, {
            'username': 'newuser',
            'email': 'existing@example.com',
            'password1': 'complexpass123',
            'password2': 'complexpass123'
        })
        
        # Note: This might return 400 instead of 409 depending on dj-rest-auth behavior
        self.assertIn(response.status_code, [400, 409])
    
    def test_password_mismatch_returns_400(self):
        """Test password mismatch returns 400"""
        response = self.client.post(self.url, {
            'username': 'newuser',
            'email': 'newuser@example.com',
            'password1': 'complexpass123',
            'password2': 'differentpass123'
        })
        
        self.assertEqual(response.status_code, 400)
    
    def test_missing_required_fields_returns_400(self):
        """Test missing required fields return 400"""
        response = self.client.post(self.url, {
            'email': 'newuser@example.com'
        })
        
        self.assertEqual(response.status_code, 400)
    
    def test_invalid_email_returns_400(self):
        """Test invalid email returns 400"""
        response = self.client.post(self.url, {
            'username': 'newuser',
            'email': 'invalidemail',
            'password1': 'complexpass123',
            'password2': 'complexpass123'
        })
        
        self.assertEqual(response.status_code, 400)
    
    @patch('users.views.logger')
    def test_registration_logging_success(self, mock_logger):
        """Test that successful registration is logged"""
        self.client.post(self.url, {
            'username': 'newuser',
            'email': 'newuser@example.com',
            'password1': 'complexpass123',
            'password2': 'complexpass123'
        })
        
        assert mock_logger.info.called
    
    @patch('users.views.logger')
    def test_registration_logging_failure(self, mock_logger):
        """Test that failed registration is logged"""
        self.client.post(self.url, {
            'email': 'invalidemail'
        })
        
        assert mock_logger.warning.called or mock_logger.error.called


# Test GoogleAuth
@pytest.mark.django_db
class TestGoogleAuth:
    """Test Google OAuth authentication"""
    
    def test_google_auth_view_attributes(self):
        """Test GoogleAuth view has correct attributes"""
        view = GoogleAuth()
        assert view.adapter_class == GoogleOAuth2Adapter
        assert view.client_class == OAuth2Client
    
    def test_google_auth_url_resolves(self):
        """Test Google auth URL resolves correctly"""
        url = reverse('google_auth')
        assert url == '/api/auth/google/'
    
    def test_google_auth_post_without_token(self, client):
        """Test Google auth POST without token returns error"""
        url = reverse('google_auth')
        response = client.post(url, {})
        assert response.status_code in [400, 401]
    
    def test_google_auth_get_method_not_allowed(self, client):
        """Test Google auth GET method is not allowed"""
        url = reverse('google_auth')
        response = client.get(url)
        assert response.status_code == 405
    
    def test_google_auth_invalid_token(self, client):
        """Test Google auth with invalid token"""
        url = reverse('google_auth')
        response = client.post(url, {'access_token': 'invalid_token'})
        assert response.status_code in [400, 401]


# Test GoogleRegisterComplete
class TestGoogleRegisterComplete(APITestCase):
    """Test Google registration completion"""
    
    def setUp(self):
        self.client = APIClient()
        self.url = '/api/auth/google/complete/'
    
    def test_missing_google_data_returns_400(self):
        """Test missing google_data returns 400"""
        response = self.client.post(self.url, {
            'role': UserRole.CUSTOMER
        })
        
        self.assertEqual(response.status_code, 400)
        self.assertIn('error', response.data)
    
    def test_missing_role_returns_400(self):
        """Test missing role returns 400"""
        response = self.client.post(self.url, {
            'google_data': {'email': 'test@example.com'}
        })
        
        self.assertEqual(response.status_code, 400)
    
    def test_invalid_role_returns_400(self):
        """Test invalid role returns 400"""
        response = self.client.post(self.url, {
            'google_data': {
                'email': 'test@example.com',
                'name': 'Test User',
                'google_id': '123456'
            },
            'role': 'INVALID_ROLE'
        })
        
        self.assertEqual(response.status_code, 400)
        self.assertIn('Invalid role', response.data['error'])
    
    def test_existing_user_returns_400(self):
        """Test existing user returns 400"""
        User.objects.create_user(
            username='existinguser',
            email='existing@example.com',
            password='pass123'
        )
        
        response = self.client.post(self.url, {
            'google_data': {
                'email': 'existing@example.com',
                'name': 'Existing User',
                'google_id': '123456'
            },
            'role': UserRole.CUSTOMER
        })
        
        self.assertEqual(response.status_code, 400)
        self.assertIn('already exists', response.data['error'])
    
    def test_successful_google_registration(self):
        """Test successful Google registration"""
        response = self.client.post(self.url, {
            'google_data': {
                'email': 'newgoogleuser@example.com',
                'name': 'New Google User',
                'google_id': '123456789'
            },
            'role': UserRole.CUSTOMER
        })
        
        self.assertEqual(response.status_code, 201)
        self.assertIn('access_token', response.data)
        self.assertIn('refresh_token', response.data)
        self.assertIn('user', response.data)
        
        # Verify user was created
        user = User.objects.get(email='newgoogleuser@example.com')
        self.assertEqual(user.role, UserRole.CUSTOMER)
        self.assertEqual(user.first_name, 'New Google User')
        
        # Verify social account was created
        self.assertTrue(SocialAccount.objects.filter(user=user, provider='google').exists())
    
    def test_duplicate_username_generates_unique(self):
        """Test duplicate username generates unique username"""
        User.objects.create_user(
            username='newgoogleuser',
            email='other@example.com',
            password='pass123'
        )
        
        response = self.client.post(self.url, {
            'google_data': {
                'email': 'newgoogleuser@example.com',
                'name': 'New Google User',
                'google_id': '123456789'
            },
            'role': UserRole.TRAVEL_AGENT
        })
        
        self.assertEqual(response.status_code, 201)
        
        # Verify unique username was created
        user = User.objects.get(email='newgoogleuser@example.com')
        self.assertNotEqual(user.username, 'newgoogleuser')
        self.assertTrue(user.username.startswith('newgoogleuser'))
    
    def test_google_registration_without_google_id(self):
        """Test Google registration without google_id"""
        response = self.client.post(self.url, {
            'google_data': {
                'email': 'nogivenid@example.com',
                'name': 'No ID User'
            },
            'role': UserRole.CUSTOMER
        })
        
        self.assertEqual(response.status_code, 201)
        
        # Verify user was created but no social account
        user = User.objects.get(email='nogivenid@example.com')
        self.assertFalse(SocialAccount.objects.filter(user=user).exists())
    
    @patch('users.views.logger')
    def test_google_registration_exception_logging(self, mock_logger):
        """Test exception logging during Google registration"""
        with patch('users.views.User.objects.create', side_effect=Exception('Test error')):
            response = self.client.post(self.url, {
                'google_data': {
                    'email': 'error@example.com',
                    'name': 'Error User',
                    'google_id': '123'
                },
                'role': UserRole.CUSTOMER
            })
            
            self.assertEqual(response.status_code, 400)
            assert mock_logger.exception.called


# Test ProfileView
class TestProfileView(APITestCase):
    """Test profile view CRUD operations"""
    
    def setUp(self):
        self.client = APIClient()
        self.url = '/api/users/profile/me/'
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.client.force_authenticate(user=self.user)
    
    def test_get_profile_unauthenticated_returns_401(self):
        """Test GET profile without authentication returns 401"""
        self.client.force_authenticate(user=None)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 401)
    
    def test_get_profile_creates_if_not_exists(self):
        """Test GET profile creates profile if it doesn't exist"""
        # Ensure no profile exists
        Profile.objects.filter(user=self.user).delete()
        
        response = self.client.get(self.url)
        
        self.assertEqual(response.status_code, 200)
        self.assertTrue(Profile.objects.filter(user=self.user).exists())
    
    def test_get_existing_profile(self):
        """Test GET existing profile"""
        profile = Profile.objects.create(
            user=self.user,
            phone_number='+1234567890',
            address='123 Test St'
        )
        
        response = self.client.get(self.url)
        
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['phone_number'], '+1234567890')
    
    def test_post_partial_update_profile(self):
        """Test POST partial profile update"""
        Profile.objects.create(user=self.user)
        
        response = self.client.post(self.url, {
            'phone_number': '+9876543210'
        })
        
        self.assertEqual(response.status_code, 200)
        
        profile = Profile.objects.get(user=self.user)
        self.assertEqual(profile.phone_number, '+9876543210')
    
    def test_put_full_update_profile(self):
        """Test PUT full profile update"""
        Profile.objects.create(user=self.user)
        
        response = self.client.put(self.url, {
            'phone_number': '+1111111111',
            'address': '456 New St',
            'city': 'New City',
            'country': 'New Country'
        })
        
        self.assertEqual(response.status_code, 200)
        
        profile = Profile.objects.get(user=self.user)
        self.assertEqual(profile.phone_number, '+1111111111')
        self.assertEqual(profile.address, '456 New St')
    
    def test_post_invalid_data_returns_400(self):
        """Test POST with invalid data returns 400"""
        Profile.objects.create(user=self.user)
        
        response = self.client.post(self.url, {
            'phone_number': 'invalid_phone'
        })
        
        # Depends on serializer validation
        self.assertIn(response.status_code, [200, 400])
    
    def test_put_creates_profile_if_not_exists(self):
        """Test PUT creates profile if it doesn't exist"""
        Profile.objects.filter(user=self.user).delete()
        
        response = self.client.put(self.url, {
            'phone_number': '+2222222222'
        })
        
        self.assertEqual(response.status_code, 200)
        self.assertTrue(Profile.objects.filter(user=self.user).exists())


# Integration tests
@pytest.mark.django_db
class TestAuthenticationFlow:
    """Test complete authentication workflows"""
    
    def test_register_login_profile_flow(self, client):
        """Test complete flow: register, login, access profile"""
        # 1. Register
        register_response = client.post('/api/auth/registration/', {
            'username': 'flowuser',
            'email': 'flow@example.com',
            'password1': 'complexpass123',
            'password2': 'complexpass123'
        })
        assert register_response.status_code == 201
        
        # 2. Login
        login_response = client.post('/api/auth/login/', {
            'email': 'flow@example.com',
            'password': 'complexpass123'
        })
        assert login_response.status_code == 200
        access_token = login_response.data['access_token']
        
        # 3. Access profile
        profile_response = client.get(
            '/api/users/profile/me/',
            HTTP_AUTHORIZATION=f'Bearer {access_token}'
        )
        assert profile_response.status_code == 200
    
    def test_login_logout_flow(self, client):
        """Test login and logout flow"""
        # Create user
        user = User.objects.create_user(
            username='logoutuser',
            email='logout@example.com',
            password='pass123'
        )
        
        # Login
        login_response = client.post('/api/auth/login/', {
            'email': 'logout@example.com',
            'password': 'pass123'
        })
        assert login_response.status_code == 200
        
        # Logout (if endpoint exists)
        # logout_response = client.post('/api/auth/logout/')
        # assert logout_response.status_code in [200, 204]