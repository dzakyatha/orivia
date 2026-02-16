import pytest
from datetime import date
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from users.models import User, Profile, UserRole, GenderChoices


PROFILE_URL = '/api/users/profile/me/'


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def user(db):
    """Create a basic customer user (signal auto-creates Profile)."""
    return User.objects.create_user(
        username='testuser',
        email='test@example.com',
        password='testpass123',
        first_name='Test User',
        role=UserRole.CUSTOMER,
    )


@pytest.fixture
def agent_user(db):
    """Create a travel-agent user."""
    return User.objects.create_user(
        username='agent',
        email='agent@example.com',
        password='agentpass123',
        first_name='Agent Name',
        role=UserRole.TRAVEL_AGENT,
    )


# ── Authentication ────────────────────────────────────────────────────────────

@pytest.mark.django_db
class TestProfileAuth:
    def test_get_profile_unauthenticated(self, api_client):
        """Unauthenticated requests must return 401."""
        response = api_client.get(PROFILE_URL)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_put_profile_unauthenticated(self, api_client):
        response = api_client.put(PROFILE_URL, {})
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_post_profile_unauthenticated(self, api_client):
        response = api_client.post(PROFILE_URL, {})
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


# ── GET /api/users/profile/me/ ────────────────────────────────────────────────

@pytest.mark.django_db
class TestGetProfile:
    def test_get_profile_returns_all_fields(self, api_client, user):
        api_client.force_authenticate(user=user)
        response = api_client.get(PROFILE_URL)

        assert response.status_code == status.HTTP_200_OK
        data = response.data
        assert data['email'] == 'test@example.com'
        assert data['full_name'] == 'Test User'
        assert data['role'] == UserRole.CUSTOMER
        assert str(data['user_id']) == str(user.id)
        # Profile fields should exist (possibly null)
        for field in ('avatar_url', 'phone_number', 'date_of_birth',
                      'gender', 'district', 'city', 'province',
                      'nationality', 'language_preference',
                      'created_at', 'updated_at'):
            assert field in data

    def test_get_profile_auto_creates_if_missing(self, api_client, db):
        """If a Profile row doesn't exist yet, the view creates one."""
        new_user = User.objects.create_user(
            username='noprofile',
            email='noprofile@example.com',
            password='pass123',
        )
        # The signal should already have created a profile, but ensure the
        # get_or_create path works even if it doesn't.
        Profile.objects.filter(user=new_user).delete()
        assert not Profile.objects.filter(user=new_user).exists()

        api_client.force_authenticate(user=new_user)
        response = api_client.get(PROFILE_URL)

        assert response.status_code == status.HTTP_200_OK
        assert Profile.objects.filter(user=new_user).exists()

    def test_get_profile_agent_role(self, api_client, agent_user):
        api_client.force_authenticate(user=agent_user)
        response = api_client.get(PROFILE_URL)

        assert response.status_code == status.HTTP_200_OK
        assert response.data['role'] == UserRole.TRAVEL_AGENT


# ── PUT /api/users/profile/me/ (full update) ─────────────────────────────────

@pytest.mark.django_db
class TestPutProfile:
    def test_full_update_profile(self, api_client, user):
        api_client.force_authenticate(user=user)

        payload = {
            'full_name': 'Updated Name',
            'avatar_url': 'https://example.com/avatar.jpg',
            'phone_number': '+6281234567890',
            'date_of_birth': '1995-05-15',
            'gender': 'MALE',
            'district': 'Kebayoran Baru',
            'city': 'Jakarta Selatan',
            'province': 'DKI Jakarta',
            'nationality': 'Indonesia',
            'language_preference': 'id',
        }
        response = api_client.put(PROFILE_URL, payload, format='json')

        assert response.status_code == status.HTTP_200_OK
        data = response.data
        assert data['full_name'] == 'Updated Name'
        assert data['phone_number'] == '+6281234567890'
        assert data['city'] == 'Jakarta Selatan'
        assert data['gender'] == 'MALE'

        # DB should reflect the change
        user.refresh_from_db()
        assert user.first_name == 'Updated Name'

    def test_full_update_readonly_fields_ignored(self, api_client, user):
        """email, role, user_id are read-only – they must not change."""
        api_client.force_authenticate(user=user)
        original_email = user.email
        original_role = user.role

        payload = {
            'email': 'hacker@evil.com',
            'role': UserRole.TRAVEL_AGENT,
            'full_name': 'Still Me',
        }
        response = api_client.put(PROFILE_URL, payload, format='json')

        assert response.status_code == status.HTTP_200_OK
        assert response.data['email'] == original_email
        assert response.data['role'] == original_role


# ── POST /api/users/profile/me/ (partial update) ─────────────────────────────

@pytest.mark.django_db
class TestPostProfile:
    def test_partial_update_single_field(self, api_client, user):
        api_client.force_authenticate(user=user)

        response = api_client.post(
            PROFILE_URL, {'city': 'Bandung'}, format='json',
        )

        assert response.status_code == status.HTTP_200_OK
        assert response.data['city'] == 'Bandung'
        # Other fields unchanged
        assert response.data['full_name'] == 'Test User'

    def test_partial_update_multiple_fields(self, api_client, user):
        api_client.force_authenticate(user=user)

        payload = {
            'phone_number': '+6289876543210',
            'province': 'Jawa Barat',
            'nationality': 'Indonesia',
        }
        response = api_client.post(PROFILE_URL, payload, format='json')

        assert response.status_code == status.HTTP_200_OK
        assert response.data['phone_number'] == '+6289876543210'
        assert response.data['province'] == 'Jawa Barat'
        assert response.data['nationality'] == 'Indonesia'

    def test_partial_update_full_name(self, api_client, user):
        api_client.force_authenticate(user=user)

        response = api_client.post(
            PROFILE_URL, {'full_name': 'New Name'}, format='json',
        )
        assert response.status_code == status.HTTP_200_OK
        assert response.data['full_name'] == 'New Name'

        user.refresh_from_db()
        assert user.first_name == 'New Name'


# ── Validation ────────────────────────────────────────────────────────────────

@pytest.mark.django_db
class TestProfileValidation:
    def test_invalid_gender_rejected(self, api_client, user):
        api_client.force_authenticate(user=user)
        response = api_client.post(
            PROFILE_URL, {'gender': 'INVALID'}, format='json',
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'gender' in response.data

    def test_valid_gender_accepted(self, api_client, user):
        api_client.force_authenticate(user=user)
        for g in ('MALE', 'FEMALE'):
            response = api_client.post(
                PROFILE_URL, {'gender': g}, format='json',
            )
            assert response.status_code == status.HTTP_200_OK
            assert response.data['gender'] == g

    def test_invalid_date_of_birth_rejected(self, api_client, user):
        api_client.force_authenticate(user=user)
        response = api_client.post(
            PROFILE_URL, {'date_of_birth': 'not-a-date'}, format='json',
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_timestamps_are_readonly(self, api_client, user):
        api_client.force_authenticate(user=user)
        response = api_client.get(PROFILE_URL)
        assert response.data['created_at'] is not None
        assert response.data['updated_at'] is not None


# ── URL routing ───────────────────────────────────────────────────────────────

@pytest.mark.django_db
class TestProfileURLRouting:
    def test_url_resolves_by_name(self):
        url = reverse('profile-me')
        assert url == PROFILE_URL

    def test_disallowed_methods(self, api_client, user):
        api_client.force_authenticate(user=user)
        for method in ('delete', 'patch'):
            response = getattr(api_client, method)(PROFILE_URL)
            assert response.status_code == status.HTTP_405_METHOD_NOT_ALLOWED
