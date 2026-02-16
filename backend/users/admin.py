from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _
from .models import User, Profile

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """
    Custom admin interface for User model
    """
    list_display = ('email', 'username', 'role', 'is_staff', 'is_active', 'date_joined')
    list_filter = ('role', 'is_staff', 'is_active', 'date_joined')
    search_fields = ('email', 'username', 'first_name', 'last_name')
    ordering = ('-date_joined',)
    
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        (_('Personal info'), {'fields': ('email', 'first_name', 'last_name')}),
        (_('Permissions'), {
            'fields': ('role', 'is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions'),
        }),
        (_('Important dates'), {'fields': ('last_login', 'date_joined')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'password1', 'password2', 'role'),
        }),
    )
    
    readonly_fields = ('id', 'date_joined', 'last_login')

@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    """
    Admin interface for Profile model
    """
    list_display = ('get_username', 'get_email', 'get_full_name', 'avatar_url', 'phone_number', 'date_of_birth', 'gender', 'district', 'city', 'province', 'nationality', 'language_preference', 'created_at')
    search_fields = ('user__email', 'user__username', 'user__first_name', 'phone_number', 'district', 'city', 'province', 'nationality')
    list_filter = ('gender', 'district', 'city', 'province', 'nationality', 'language_preference', 'created_at')
    readonly_fields = ('created_at', 'updated_at')
    list_select_related = ('user',)
    
    fieldsets = (
        (_('User'), {'fields': ('user',)}),
        (_('Profile Picture'), {'fields': ('avatar_url',)}),
        (_('Contact Information'), {'fields': ('phone_number',)}),
        (_('Personal Information'), {
            'fields': ('date_of_birth', 'gender', 'nationality', 'language_preference')
        }),
        (_('Address'), {
            'fields': ('district', 'city', 'province')
        }),
        (_('Metadata'), {'fields': ('created_at', 'updated_at')}),
    )
    
    def get_username(self, obj):
        return obj.user.username
    get_username.short_description = 'Username'
    get_username.admin_order_field = 'user__username'
    
    def get_email(self, obj):
        return obj.user.email
    get_email.short_description = 'Email'
    get_email.admin_order_field = 'user__email'
    
    def get_full_name(self, obj):
        return obj.user.first_name or '-'
    get_full_name.short_description = 'Full Name'
    get_full_name.admin_order_field = 'user__first_name'
