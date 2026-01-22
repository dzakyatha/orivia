import uuid
from django.contrib.auth.models import AbstractUser, UserManager
from django.db import models
from django.utils.translation import gettext_lazy as _

class UserRole(models.TextChoices):
    """
    User roles in Orivia ecosystem
    """
    CUSTOMER = 'CUSTOMER', _('Customer')
    TRAVEL_AGENT = 'TRAVEL_AGENT', _('Travel Agent')

class GenderChoices(models.TextChoices):
    """
    Gender options for user profiles
    """
    MALE = 'MALE', _('Male')
    FEMALE = 'FEMALE', _('Female')

class CustomUserManager(UserManager):
    """
    Custom manager to handle superuser creation with proper role
    """
    def create_superuser(self, username, email=None, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', UserRole.CUSTOMER)  # Default role for superuser

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True')

        return self.create_user(username, email, password, **extra_fields)

class User(AbstractUser):
    """
    Custom User model as the central identity for the Orivia ecosystem
    Replaces the default Django Integer PK with a UUID to be safe for microservices
    """
    # UUID for the primary key to ensure unique IDs across microservices
    id = models.UUIDField(
        primary_key=True, 
        default=uuid.uuid4, 
        editable=False
    )
    
    email = models.EmailField(_('email address'), unique=True)
    
    # Explicit role field for the Role Based Access Control (RBAC) requirement 
    role = models.CharField(
        max_length=12,
        choices=UserRole.choices,
        default=UserRole.CUSTOMER
    )
    
    objects = CustomUserManager()
    
    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email']

    def __str__(self):
        return self.email

class Profile(models.Model):
    """
    User profile for biodata and additional information
    """
    user = models.OneToOneField(
        User, 
        on_delete=models.CASCADE, 
        related_name='profile'
    )
    
    # Storing avatar URL of user's profile picture
    avatar_url = models.URLField(max_length=500, blank=True, null=True)
    
    # Biodata fields
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    date_of_birth = models.DateField(blank=True, null=True)
    gender = models.CharField(
        max_length=6,
        choices=GenderChoices.choices,
        blank=True,
        null=True
    )
    district = models.CharField(max_length=100, blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    province = models.CharField(max_length=100, blank=True, null=True)
    nationality = models.CharField(max_length=100, blank=True, null=True)
    language_preference = models.CharField(max_length=100, blank=True, null=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username}'s Profile"