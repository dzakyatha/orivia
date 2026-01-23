import pytest
from django.contrib.auth import get_user_model
from django.contrib.sessions.middleware import SessionMiddleware
from users.serializers import (
    ProfileSerializer,
    CustomUserSerializer,
    CustomRegisterSerializer
)
from users.models import UserRole

User = get_user_model()

@pytest.mark.django_db
class TestProfileSerializer:
    def test_profile_serializer_fields(self):
        """Test ProfileSerializer contains correct fields"""
        serializer = ProfileSerializer()
        assert set(serializer.fields.keys()) == {'avatar_url', 'phone_number', 'full_name'}
    
    def test_profile_serialization(self):
        """Test profile data serialization"""
        user = User.objects.create_user(username='testuser', email='test@example.com', password='testpass123')
        user.first_name = 'Test User'
        user.save()
        profile = user.profile
        profile.phone_number = '1234567890'
        profile.save()
        
        serializer = ProfileSerializer(profile)
        assert serializer.data['full_name'] == 'Test User'
        assert serializer.data['phone_number'] == '1234567890'


@pytest.mark.django_db
class TestCustomUserSerializer:
    def test_user_serializer_fields(self):
        """Test CustomUserSerializer contains correct fields"""
        serializer = CustomUserSerializer()
        assert set(serializer.fields.keys()) == {'id', 'email', 'role', 'profile'}
    
    def test_user_serialization(self):
        """Test user data serialization with profile"""
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123',
            role=UserRole.CUSTOMER
        )
        user.first_name = 'Test User'
        user.save()
        
        serializer = CustomUserSerializer(user)
        assert serializer.data['email'] == 'test@example.com'
        assert serializer.data['role'] == UserRole.CUSTOMER
        assert serializer.data['profile']['full_name'] == 'Test User'
    
    def test_profile_read_only(self):
        """Test that profile field is read-only"""
        serializer = CustomUserSerializer()
        assert serializer.fields['profile'].read_only is True


@pytest.mark.django_db
class TestCustomRegisterSerializer:
    def test_register_serializer_has_no_username(self):
        """Test that username field is removed"""
        serializer = CustomRegisterSerializer()
        assert 'username' not in serializer.fields
    
    def test_register_serializer_fields(self):
        """Test CustomRegisterSerializer has required fields"""
        serializer = CustomRegisterSerializer()
        assert 'email' in serializer.fields
        assert 'password1' in serializer.fields
        assert 'password2' in serializer.fields
        assert 'full_name' in serializer.fields
        assert 'role' in serializer.fields
    
    def test_full_name_required(self):
        """Test full_name field is required"""
        serializer = CustomRegisterSerializer()
        assert serializer.fields['full_name'].required is True
    
    def test_role_choices(self):
        """Test role field has correct choices"""
        serializer = CustomRegisterSerializer()
        assert list(serializer.fields['role'].choices.keys()) == [choice[0] for choice in UserRole.choices]
    
    def test_role_default_value(self):
        """Test role field defaults to customer"""
        serializer = CustomRegisterSerializer()
        assert serializer.fields['role'].default == UserRole.CUSTOMER
    
    def test_get_cleaned_data(self):
        """Test get_cleaned_data returns correct data"""
        data = {
            'email': 'test@example.com',
            'password1': 'testpass123',
            'password2': 'testpass123',
            'full_name': 'Test User',
            'role': UserRole.CUSTOMER
        }
        serializer = CustomRegisterSerializer(data=data)
        assert serializer.is_valid()
        
        cleaned_data = serializer.get_cleaned_data()
        assert cleaned_data['email'] == 'test@example.com'
        assert cleaned_data['password1'] == 'testpass123'
        assert cleaned_data['full_name'] == 'Test User'
        assert cleaned_data['role'] == UserRole.CUSTOMER
    
    def test_save_creates_user_with_role_and_profile(self, rf):
        """Test save method creates user with role and profile"""
        # Use request with session support
        request = rf.post('/api/auth/registration/')
        middleware = SessionMiddleware(lambda x: None)
        middleware.process_request(request)
        request.session.save()
        
        data = {
            'email': 'test@example.com',
            'password1': 'TestPass123!',
            'password2': 'TestPass123!',
            'full_name': 'Test User',
            'role': UserRole.TRAVEL_AGENT
        }
        serializer = CustomRegisterSerializer(data=data)
        assert serializer.is_valid()
        
        user = serializer.save(request)
        assert user.email == 'test@example.com'
        assert user.role == UserRole.TRAVEL_AGENT
        assert user.first_name == 'Test User'
    
    def test_invalid_email(self):
        """Test validation fails with invalid email"""
        data = {
            'email': 'invalid-email',
            'password1': 'testpass123',
            'password2': 'testpass123',
            'full_name': 'Test User',
            'role': UserRole.CUSTOMER
        }
        serializer = CustomRegisterSerializer(data=data)
        assert not serializer.is_valid()
        assert 'email' in serializer.errors
    
    def test_password_mismatch(self):
        """Test validation fails when passwords don't match"""
        data = {
            'email': 'test@example.com',
            'password1': 'testpass123',
            'password2': 'differentpass',
            'full_name': 'Test User',
            'role': UserRole.CUSTOMER
        }
        serializer = CustomRegisterSerializer(data=data)
        assert not serializer.is_valid()
    
    def test_missing_full_name(self):
        """Test validation fails when full_name is missing"""
        data = {
            'email': 'test@example.com',
            'password1': 'testpass123',
            'password2': 'testpass123',
            'role': UserRole.CUSTOMER
        }
        serializer = CustomRegisterSerializer(data=data)
        assert not serializer.is_valid()
        assert 'full_name' in serializer.errors