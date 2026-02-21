/**
 * Profile Service - handles user profile API calls (Django users app).
 * Endpoint: /api/users/profile/me/
 */
import api from './api';

/**
 * Transform API profile response to match frontend profile shape.
 */
function mapProfile(raw) {
  return {
    id: raw.user_id,
    email: raw.email,
    role: raw.role,
    name: raw.full_name || '',
    fullName: raw.full_name || '',
    avatar: raw.avatar_url || '',
    avatar_url: raw.avatar_url || '',
    phone: raw.phone_number || '',
    phone_number: raw.phone_number || '',
    dateOfBirth: raw.date_of_birth || '',
    date_of_birth: raw.date_of_birth || '',
    gender: raw.gender || '',
    district: raw.district || '',
    city: raw.city || '',
    province: raw.province || '',
    nationality: raw.nationality || '',
    language: raw.language_preference || '',
    language_preference: raw.language_preference || '',
    joinedDate: raw.created_at || '',
    created_at: raw.created_at || '',
    updated_at: raw.updated_at || '',
  };
}

/** Fetch current user profile */
export async function fetchProfile() {
  const res = await api.get('/users/profile/me/');
  return mapProfile(res.data);
}

/** Update current user profile */
export async function updateProfile(data) {
  // Map frontend field names back to backend names
  const payload = {};
  if (data.name !== undefined || data.fullName !== undefined)
    payload.full_name = data.name || data.fullName;
  if (data.avatar !== undefined || data.avatar_url !== undefined)
    payload.avatar_url = data.avatar || data.avatar_url;
  if (data.phone !== undefined || data.phone_number !== undefined)
    payload.phone_number = data.phone || data.phone_number;
  if (data.dateOfBirth !== undefined || data.date_of_birth !== undefined)
    payload.date_of_birth = data.dateOfBirth || data.date_of_birth;
  if (data.gender !== undefined)
    payload.gender = data.gender;
  if (data.district !== undefined)
    payload.district = data.district;
  if (data.city !== undefined)
    payload.city = data.city;
  if (data.province !== undefined)
    payload.province = data.province;
  if (data.nationality !== undefined)
    payload.nationality = data.nationality;
  if (data.language !== undefined || data.language_preference !== undefined)
    payload.language_preference = data.language || data.language_preference;

  const res = await api.put('/users/profile/me/', payload);
  return mapProfile(res.data);
}

export default { fetchProfile, updateProfile };
