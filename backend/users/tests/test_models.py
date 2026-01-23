import pytest
from django.contrib.auth import get_user_model
from users.models import Profile, UserRole, GenderChoices

User = get_user_model()


@pytest.mark.django_db
class TestUserModel:
    """Test User model"""
    
    def test_create_user(self):
        """Test creating a regular user"""
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        assert user.username == 'testuser'
        assert user.email == 'test@example.com'
        assert user.role == UserRole.CUSTOMER
        assert user.check_password('testpass123')
        assert not user.is_staff
        assert not user.is_superuser
    
    def test_create_superuser(self):
        """Test creating a superuser"""
        admin = User.objects.create_superuser(
            username='admin',
            email='admin@example.com',
            password='adminpass123'
        )
        assert admin.is_staff
        assert admin.is_superuser
        assert admin.role == UserRole.CUSTOMER
    
    def test_user_str_representation(self):
        """Test user string representation"""
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        assert str(user) == 'test@example.com'
    
    def test_user_uuid_primary_key(self):
        """Test that user ID is UUID"""
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        assert user.id is not None
        assert len(str(user.id)) == 36  # UUID length with hyphens
    
    def test_email_unique_constraint(self):
        """Test that email must be unique"""
        User.objects.create_user(
            username='user1',
            email='test@example.com',
            password='pass123'
        )
        with pytest.raises(Exception):  # IntegrityError
            User.objects.create_user(
                username='user2',
                email='test@example.com',
                password='pass456'
            )
    
    def test_user_role_choices(self):
        """Test user role options"""
        customer = User.objects.create_user(
            username='customer',
            email='customer@example.com',
            password='pass123',
            role=UserRole.CUSTOMER
        )
        agent = User.objects.create_user(
            username='agent',
            email='agent@example.com',
            password='pass123',
            role=UserRole.TRAVEL_AGENT
        )
        assert customer.role == UserRole.CUSTOMER
        assert agent.role == UserRole.TRAVEL_AGENT


@pytest.mark.django_db
class TestProfileModel:
    """Test Profile model"""
    
    def test_profile_auto_created(self):
        """Test that profile is automatically created when user is created"""
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        assert hasattr(user, 'profile')
        assert user.profile is not None
    
    def test_profile_str_representation(self):
        """Test profile string representation"""
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        assert str(user.profile) == "testuser's Profile"
    
    def test_profile_fields(self):
        """Test profile fields can be set"""
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        profile = user.profile
        profile.phone_number = '+6281234567890'
        profile.gender = GenderChoices.MALE
        profile.city = 'Jakarta'
        profile.province = 'DKI Jakarta'
        profile.nationality = 'Indonesian'
        profile.save()
        
        profile.refresh_from_db()
        assert profile.phone_number == '+6281234567890'
        assert profile.gender == GenderChoices.MALE
        assert profile.city == 'Jakarta'
        assert profile.province == 'DKI Jakarta'
        assert profile.nationality == 'Indonesian'
    
    def test_profile_cascade_delete(self):
        """Test that profile is deleted when user is deleted"""
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        profile_id = user.profile.id
        user.delete()
        assert not Profile.objects.filter(id=profile_id).exists()
    
    def test_profile_metadata_fields(self):
        """Test profile has created_at and updated_at"""
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        profile = user.profile
        assert profile.created_at is not None
        assert profile.updated_at is not None