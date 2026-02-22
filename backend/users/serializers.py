from rest_framework import serializers
from .models import User, Profile, UserRole, GenderChoices
from dj_rest_auth.registration.serializers import RegisterSerializer


class ProfileSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(source='user.first_name', required=False, allow_blank=True)
    
    class Meta:
        model = Profile
        fields = ['avatar_url', 'phone_number', 'full_name']


class ProfileDetailSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(source='user.first_name', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    role = serializers.CharField(source='user.role', read_only=True)
    user_id = serializers.UUIDField(source='user.id', read_only=True)

    class Meta:
        model = Profile
        fields = ['user_id', 'email', 'role', 'full_name', 'avatar_url', 'phone_number', 'date_of_birth', 'gender', 'district', 'city', 'province', 'nationality', 'language_preference', 'created_at', 'updated_at',]
        read_only_fields = fields       


class ProfileUpdateSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(source='user.first_name', required=False, allow_blank=True,)
    # Override gender field to accept frontend values (Male/Female) and normalize to DB values (MALE/FEMALE)
    gender = serializers.CharField(required=False, allow_blank=True, allow_null=True)

    class Meta:
        model = Profile
        fields = ['full_name', 'avatar_url', 'phone_number', 'date_of_birth', 'gender', 'district', 'city', 'province', 'nationality', 'language_preference',]

    def validate_gender(self, value): #validators
        if not value:
            return value

        v = str(value).strip()

        if v in GenderChoices.values:
            return v

        for choice_value, choice_label in GenderChoices.choices:
            try:
                if str(choice_label).lower() == v.lower():
                    return choice_value
            except Exception:
                continue

        if v.upper() in GenderChoices.values:
            return v.upper()

        raise serializers.ValidationError(
            f"Invalid gender. Choose from: {', '.join(GenderChoices.values)}"
        )

    def update(self, instance, validated_data): #save logic
        user_data = validated_data.pop('user', {})
        if 'first_name' in user_data:
            instance.user.first_name = user_data['first_name']
            instance.user.save(update_fields=['first_name'])

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance

class CustomUserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = ('id', 'email', 'role', 'profile')

class CustomRegisterSerializer(RegisterSerializer):
    username = None 
    full_name = serializers.CharField(required=True)
    role = serializers.ChoiceField(choices=UserRole.choices, default=UserRole.CUSTOMER)
    
    def validate_email(self, email):
        from allauth.socialaccount.models import SocialAccount
        existing = User.objects.filter(email=email).first()
        if existing:
            # If the existing account is linked to Google, give specific guidance
            if SocialAccount.objects.filter(user=existing, provider='google').exists():
                raise serializers.ValidationError('This email is registered with Google. Please use Google Sign In.')
            # Otherwise, prevent duplicate registration with a clear error
            raise serializers.ValidationError('A user with this email already exists.')
        return email
    
    def get_cleaned_data(self):
        return {
            'email': self.validated_data.get('email', ''),
            'password1': self.validated_data.get('password1', ''),
            'full_name': self.validated_data.get('full_name', ''),
            'role': self.validated_data.get('role', UserRole.CUSTOMER),
        }
    
    def custom_signup(self, request, user):
        user.role = self.validated_data.get('role', UserRole.CUSTOMER)
        user.first_name = self.validated_data.get('full_name', '')
        email = self.validated_data.get('email', '')
        username_base = email.split('@')[0] if email else 'user'
        username = username_base
        counter = 1
        while User.objects.filter(username=username).exclude(pk=user.pk).exists():
            username = f"{username_base}{counter}"
            counter += 1
        user.username = username
        user.save()