import pytest
from django.contrib.admin.sites import AdminSite
from users.models import User, Profile
from users.admin import UserAdmin, ProfileAdmin


@pytest.mark.django_db
class TestUserAdmin:
    """Test UserAdmin configuration"""
    
    def setup_method(self):
        """Setup for each test"""
        self.site = AdminSite()
        self.user_admin = UserAdmin(User, self.site)
    
    def test_list_display(self):
        """Test list display fields"""
        assert 'email' in self.user_admin.list_display
        assert 'username' in self.user_admin.list_display
        assert 'role' in self.user_admin.list_display
        assert 'is_staff' in self.user_admin.list_display
        assert 'is_active' in self.user_admin.list_display
        assert 'date_joined' in self.user_admin.list_display
    
    def test_list_filter(self):
        """Test list filter fields"""
        assert 'role' in self.user_admin.list_filter
        assert 'is_staff' in self.user_admin.list_filter
        assert 'is_active' in self.user_admin.list_filter
    
    def test_search_fields(self):
        """Test search fields"""
        assert 'email' in self.user_admin.search_fields
        assert 'username' in self.user_admin.search_fields
    
    def test_readonly_fields(self):
        """Test readonly fields"""
        assert 'id' in self.user_admin.readonly_fields
        assert 'date_joined' in self.user_admin.readonly_fields
        assert 'last_login' in self.user_admin.readonly_fields


@pytest.mark.django_db
class TestProfileAdmin:
    """Test ProfileAdmin configuration"""
    
    def setup_method(self):
        """Setup for each test"""
        self.site = AdminSite()
        self.profile_admin = ProfileAdmin(Profile, self.site)
    
    def test_list_display(self):
        """Test list display fields"""
        assert 'user' in self.profile_admin.list_display
        assert 'phone_number' in self.profile_admin.list_display
        assert 'gender' in self.profile_admin.list_display
        assert 'city' in self.profile_admin.list_display
        assert 'province' in self.profile_admin.list_display
    
    def test_search_fields(self):
        """Test search fields"""
        assert 'user__email' in self.profile_admin.search_fields
        assert 'user__username' in self.profile_admin.search_fields
        assert 'phone_number' in self.profile_admin.search_fields
    
    def test_readonly_fields(self):
        """Test readonly fields"""
        assert 'created_at' in self.profile_admin.readonly_fields
        assert 'updated_at' in self.profile_admin.readonly_fields