import pytest
from users.models import User, Profile


@pytest.mark.django_db
class TestSignals:
    """Test signals for automatic profile creation"""
    
    def test_profile_created_on_user_creation(self):
        """Test that creating a user automatically creates a profile"""
        user = User.objects.create_user(
            username='newuser',
            email='newuser@example.com',
            password='pass123'
        )
        assert Profile.objects.filter(user=user).exists()
        assert user.profile is not None
    
    def test_profile_saved_when_user_saved(self):
        """Test that profile is saved when user is saved"""
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='pass123'
        )
        
        # Update user
        user.first_name = 'Test'
        user.save()
        
        # Profile should still exist
        user.refresh_from_db()
        assert user.profile is not None