from rest_framework import serializers
from .models import User, Profile, UserRole
from dj_rest_auth.registration.serializers import RegisterSerializer

class ProfileSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(source='user.first_name', required=False, allow_blank=True)
    
    class Meta:
        model = Profile
        fields = ['avatar_url', 'phone_number', 'full_name']

class CustomUserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = ('id', 'email', 'role', 'profile')

class CustomRegisterSerializer(RegisterSerializer):
    username = None 
    full_name = serializers.CharField(required=True)
    role = serializers.ChoiceField(choices=UserRole.choices, default=UserRole.CUSTOMER)
    
    def get_cleaned_data(self):
        return {
            'email': self.validated_data.get('email', ''),
            'password1': self.validated_data.get('password1', ''),
            'full_name': self.validated_data.get('full_name', ''),
            'role': self.validated_data.get('role', UserRole.CUSTOMER),
        }
    
    def save(self, request):
        user = super().save(request)
        user.role = self.validated_data.get('role', UserRole.CUSTOMER)
        user.first_name = self.validated_data.get('full_name', '')
        user.save()
        return user