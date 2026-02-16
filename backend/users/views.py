import logging
import hashlib
from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.providers.oauth2.client import OAuth2Client
from dj_rest_auth.registration.views import SocialLoginView, RegisterView
from dj_rest_auth.views import LoginView, LogoutView
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
import requests as http_requests
import logging
from .models import User, UserRole, Profile
from .serializers import ProfileDetailSerializer, ProfileUpdateSerializer
from allauth.socialaccount.models import SocialAccount, SocialApp
from django.contrib.sites.models import Site

class GoogleAuth(APIView):
    """Step 1: Exchange Google code for user info, determine login/register"""
    permission_classes = []
    authentication_classes = []
    logger = logging.getLogger(__name__)
    
    def post(self, request):
        code = request.data.get('code')
        
        if not code:
            return Response(
                {'error': 'Authorization code is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Exchange authorization code for access token
            token_url = 'https://oauth2.googleapis.com/token'
            token_data = {
                'code': code,
                'client_id': settings.SOCIALACCOUNT_PROVIDERS['google']['APP']['client_id'],
                'client_secret': settings.SOCIALACCOUNT_PROVIDERS['google']['APP']['secret'],
                'redirect_uri': settings.GOOGLE_CALLBACK_URL,
                'grant_type': 'authorization_code',
            }
            
            token_response = http_requests.post(token_url, data=token_data)
            try:
                token_json = token_response.json()
            except ValueError:
                self.logger.error('Token endpoint returned non-JSON: %s', token_response.text)
                return Response({'error': 'Failed to parse token response'}, status=status.HTTP_400_BAD_REQUEST)

            if 'error' in token_json:
                self.logger.warning('Token exchange error: %s', token_json)
                return Response(
                    {'error': token_json.get('error_description', 'Failed to exchange code for token')},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Get user info from Google
            access_token = token_json.get('access_token')
            userinfo_url = 'https://www.googleapis.com/oauth2/v2/userinfo'
            headers = {'Authorization': f'Bearer {access_token}'}
            userinfo_response = http_requests.get(userinfo_url, headers=headers)
            try:
                userinfo = userinfo_response.json()
            except ValueError:
                self.logger.error('Userinfo endpoint returned non-JSON: %s', userinfo_response.text)
                return Response({'error': 'Failed to parse userinfo response'}, status=status.HTTP_400_BAD_REQUEST)
            
            email = userinfo.get('email')
            given_name = userinfo.get('given_name', '')
            family_name = userinfo.get('family_name', '')
            name = userinfo.get('name', f"{given_name} {family_name}".strip())
            google_id = userinfo.get('id', '')
            
            if not email:
                return Response({'error': 'Email not provided by Google'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Check if user exists
            try:
                user = User.objects.get(email=email)
                has_social = SocialAccount.objects.filter(user=user, provider='google').exists()
                
                if not has_social:
                    return Response({'error': 'Email already registered. Please use manual login.'}, status=status.HTTP_400_BAD_REQUEST)
                
                # Existing Google user - log them in
                from rest_framework_simplejwt.tokens import RefreshToken
                refresh = RefreshToken.for_user(user)
                
                return Response({
                    'action': 'login',
                    'access_token': str(refresh.access_token),
                    'refresh_token': str(refresh),
                    'user': {'id': str(user.id), 'email': user.email, 'role': user.role, 'full_name': user.first_name}
                }, status=status.HTTP_200_OK)
                
            except User.DoesNotExist:
                # New user - return Google data for role selection
                return Response({
                    'action': 'register',
                    'google_data': {'email': email, 'name': name, 'given_name': given_name, 'family_name': family_name, 'google_id': google_id, 'picture': userinfo.get('picture', '')}
                }, status=status.HTTP_200_OK)
            
        except Exception as e:
            self.logger.exception('Exception during Google auth: %s', e)
            return Response({'error': f'Authentication failed: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)


class GoogleRegisterComplete(APIView):
    """Step 2: Complete Google registration with role"""
    permission_classes = []
    authentication_classes = []
    logger = logging.getLogger(__name__)
    
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
            
        except Exception as e:
            self.logger.exception('Exception during Google registration: %s', e)
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
