import logging
import hashlib
from django.db import IntegrityError
from django.contrib.auth import get_user_model
from allauth.socialaccount.models import SocialAccount
from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.providers.oauth2.client import OAuth2Client
from dj_rest_auth.registration.views import SocialLoginView, RegisterView
from dj_rest_auth.views import LoginView, LogoutView
from django.conf import settings
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny  # Add AllowAny
from .models import Profile, UserRole
from .serializers import ProfileDetailSerializer, ProfileUpdateSerializer

User = get_user_model()
logger = logging.getLogger('users')


def mask_email(email):
    """
    Mask email address for logging purposes.
    Example: john.doe@example.com -> j*****e@e*****e.com
    """
    if not email or email == 'unknown':
        return email
    
    try:
        local, domain = email.split('@')
        # Mask local part
        if len(local) > 2:
            masked_local = local[0] + '*' * (len(local) - 2) + local[-1]
        elif len(local) == 2:
            masked_local = local[0] + '*'
        else:
            masked_local = local[0] + '*'
        
        # Mask domain
        domain_parts = domain.split('.')
        if len(domain_parts[0]) > 2:
            masked_domain = domain_parts[0][0] + '*' * (len(domain_parts[0]) - 2) + domain_parts[0][-1]
        elif len(domain_parts[0]) == 2:
            masked_domain = domain_parts[0][0] + '*'
        else:
            masked_domain = domain_parts[0][0] + '*'
        
        return f"{masked_local}@{masked_domain}.{'.'.join(domain_parts[1:])}"
    except Exception:
        return "***@***.***"


def hash_email(email):
    """
    Create a SHA256 hash of email for correlation in logs without exposing PII.
    """
    if not email or email == 'unknown':
        return email
    return hashlib.sha256(email.encode()).hexdigest()[:16]


class CustomLoginView(LoginView):
    """Custom login view with logging and proper HTTP status codes"""
    permission_classes = [AllowAny]  # ✅ Add this line
    
    def post(self, request, *args, **kwargs):
        email = request.data.get('email', 'unknown')
        email_hash = hash_email(email)
        masked_email = mask_email(email)
        
        logger.info(f"Login attempt - User hash: {email_hash}, Masked email: {masked_email}")
        
        try:
            # Call parent's post method to handle authentication
            response = super().post(request, *args, **kwargs)
            
            # Check if authentication failed (dj-rest-auth returns 400 for auth failures)
            if response.status_code == 400:
                response_data = response.data if hasattr(response, 'data') else {}
                
                # Check if this is an authentication error (invalid credentials)
                if 'non_field_errors' in response_data:
                    logger.warning(f"Login failed - User hash: {email_hash}, Reason: Invalid credentials")
                    logger.debug(f"Login validation error details: {response_data}")
                    
                    # Convert to 401 Unauthorized with user-friendly message
                    return Response(
                        {
                            'detail': 'Invalid email or password. Please check your credentials and try again.',
                            'code': 'invalid_credentials'
                        },
                        status=status.HTTP_401_UNAUTHORIZED
                    )
                else:
                    # Other validation errors (e.g., missing fields)
                    logger.warning(f"Login validation failed - User hash: {email_hash}, Reason: {response_data}")
                    return response
            
            # Successful login
            if response.status_code == 200:
                logger.info(f"Login successful - User hash: {email_hash}")
            
            return response
            
        except ValidationError as e:
            # Handle any ValidationError that might be raised
            logger.warning(f"Login validation exception - User hash: {email_hash}")
            logger.debug(f"ValidationError details: {str(e.detail)}")
            raise
            
        except Exception as e:
            logger.error(f"Login exception - User hash: {email_hash}, Error: {str(e)}", exc_info=True)
            raise


class CustomRegisterView(RegisterView):
    """Custom registration view with logging"""
    permission_classes = [AllowAny]  # ✅ Add this line
    
    def post(self, request, *args, **kwargs):
        email = request.data.get('email', 'unknown')
        email_hash = hash_email(email)
        masked_email = mask_email(email)
        
        logger.info(f"Registration attempt - User hash: {email_hash}, Masked email: {masked_email}")
        
        try:
            response = super().post(request, *args, **kwargs)
            
            if response.status_code == 201:
                logger.info(f"Registration successful - User hash: {email_hash}")
            
            return response
            
        except IntegrityError as e:
            logger.warning(f"Registration failed - User hash: {email_hash}, Reason: Duplicate email")
            logger.debug(f"IntegrityError details: {str(e)}")
            
            return Response(
                {
                    'detail': 'An account with this email address already exists. Please login or use a different email.',
                    'code': 'email_already_exists'
                },
                status=status.HTTP_409_CONFLICT
            )
            
        except ValidationError as e:
            logger.warning(f"Registration failed - User hash: {email_hash}, Reason: Validation error")
            logger.debug(f"Registration validation error details: {str(e.detail)}")
            raise
            
        except Exception as e:
            logger.error(f"Registration exception - User hash: {email_hash}, Error: {str(e)}", exc_info=True)
            raise


class GoogleAuth(SocialLoginView):
    """Step 1: Google OAuth authentication"""
    permission_classes = [AllowAny]  # ✅ Add this line
    adapter_class = GoogleOAuth2Adapter
    callback_url = settings.GOOGLE_CALLBACK_URL  # e.g., "http://localhost:5173"
    client_class = OAuth2Client


class GoogleRegisterComplete(APIView):
    """Step 2: Complete Google registration with role"""
    permission_classes = [AllowAny]  # ✅ Change from [] to [AllowAny]
    authentication_classes = []
    
    def post(self, request):
        google_data = request.data.get('google_data')
        role = request.data.get('role')
        
        if not google_data or not role:
            return Response({'error': 'Google data and role are required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            email = google_data.get('email')
            name = google_data.get('name', '')
            google_id = google_data.get('google_id')
            
            if role not in [UserRole.CUSTOMER, UserRole.TRAVEL_AGENT]:
                return Response({'error': 'Invalid role'}, status=status.HTTP_400_BAD_REQUEST)
            
            if User.objects.filter(email=email).exists():
                return Response({'error': 'User already exists'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Generate unique username
            username_base = email.split('@')[0] if email else google_id
            username = username_base
            counter = 1
            while User.objects.filter(username=username).exists():
                username = f"{username_base}{counter}"
                counter += 1
            
            # Create user
            user = User.objects.create(username=username, email=email, first_name=name, role=role)
            
            # Create social account
            if google_id:
                SocialAccount.objects.create(user=user, provider='google', uid=google_id, extra_data=google_data)
            
            # Generate JWT token
            from rest_framework_simplejwt.tokens import RefreshToken
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'access_token': str(refresh.access_token),
                'refresh_token': str(refresh),
                'user': {'id': str(user.id), 'email': user.email, 'role': user.role, 'full_name': user.first_name}
            }, status=status.HTTP_201_CREATED)
            
        except ValidationError as e:
            logger.warning(f"Google registration failed - Reason: Validation error")
            logger.debug(f"Google OAuth validation error details: {str(e.detail)}")
            raise
            
        except Exception as e:
            logger.exception('Exception during Google registration: %s', e)
            return Response({'error': f'Registration failed: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)


class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def _get_profile(self, user):
        profile, _created = Profile.objects.get_or_create(user=user)
        return profile

    def get(self, request):
        profile = self._get_profile(request.user)
        serializer = ProfileDetailSerializer(profile)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        profile = self._get_profile(request.user)
        serializer = ProfileUpdateSerializer(
            profile, data=request.data, partial=True,
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            ProfileDetailSerializer(profile).data,
            status=status.HTTP_200_OK,
        )

    def put(self, request):
        profile = self._get_profile(request.user)
        serializer = ProfileUpdateSerializer(profile, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            ProfileDetailSerializer(profile).data,
            status=status.HTTP_200_OK,
        )
