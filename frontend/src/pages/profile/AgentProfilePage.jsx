import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../../components/ui/Navbar.jsx';
import Button from '../../components/ui/Button.jsx';
import { ProfileCard } from '../../components/ui/Card.jsx';
import Modal, { modalStyles } from '../../components/ui/Modal.jsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faCheck, faXmark } from '@fortawesome/free-solid-svg-icons';
import { fetchProfile, updateProfile } from '../../services/profileService';
import countryList from 'react-select-country-list';
import profileImage from '../../assets/images/jeki.jpg';
import bottomImage from '../../assets/images/landingpage2.png';
import { colors, spacing, radius, fontSize, lineHeight, fontFamily, shadows, transitions } from '../../styles/variables.jsx';


export default function AgentProfilePage() {
  const accent = colors.primary;
  const labelColor = colors.accent5;
  const cardBg = 'rgba(245,241,232,0.9)';
  const borderColor = colors.accent3;

  const location = useLocation();

  // Try to obtain googleData like RoleSelectionPage: first from location.state, then localStorage
  const googleData = location.state?.googleData || (() => {
    try {
      return JSON.parse(localStorage.getItem('googleData') || localStorage.getItem('google_data') || 'null');
    } catch (e) {
      return null;
    }
  })();

  const [localUser, setLocalUser] = useState(() => {
    try { 
      const user = JSON.parse(localStorage.getItem('user') || 'null');
      return user;
    } catch (e) { return null; }
  });
  const [loading, setLoading] = useState(false);
  const [profileDetail, setProfileDetail] = useState(null);

  // Edit Profile Modal States
  const [showEditModal, setShowEditModal] = useState(false);
  const [editableProfile, setEditableProfile] = useState({
    name: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    district: '',
    city: '',
    province: '',
    nationality: '',
    language: ''
  });
  const [errors, setErrors] = useState({});

  // Fetch profile from Django API
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    setLoading(true);
    async function loadProfile() {
      try {
        const profile = await fetchProfile();
        setProfileDetail(profile);
        const merged = { ...localUser, ...profile };
        localStorage.setItem('user', JSON.stringify(merged));
        setLocalUser(merged);
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  function extractUsernameFromEmail(email) {
    if (!email) return null;
    try {
      return email.split('@')[0];
    } catch (e) {
      return null;
    }
  }

  const userEmail = localUser?.email || googleData?.email || '';
  const displayName = googleData?.name || 
                     localUser?.first_name || 
                     localUser?.name || 
                     localUser?.fullName ||
                     profileDetail?.name ||
                     extractUsernameFromEmail(userEmail) || 
                     '';
  const username = localUser?.username || extractUsernameFromEmail(userEmail) || '';

  // Country list for nationality dropdown
  const countryOptions = (typeof countryList === 'function') ? (countryList().getData ? countryList().getData() : []) : [];
  const countryNames = countryOptions.map((c) => c.label || c.value || '');

  // Open Edit Profile Modal
  const openEditModal = () => {
    setEditableProfile({
      name: displayName,
      phone: localUser?.phone_number || localUser?.phone || profileDetail?.phone || '',
      dateOfBirth: localUser?.date_of_birth || localUser?.birth_date || profileDetail?.dateOfBirth || '',
      gender: localUser?.gender || profileDetail?.gender || '',
      district: localUser?.district || localUser?.area || profileDetail?.district || '',
      city: localUser?.city || localUser?.regency || profileDetail?.city || '',
      province: localUser?.province || localUser?.state || profileDetail?.province || '',
      nationality: localUser?.nationality || profileDetail?.nationality || '',
      language: localUser?.language_preference || profileDetail?.language || ''
    });
    setShowEditModal(true);
  };

  // Save Profile Changes
  const saveProfile = async () => {
    // Validate before saving
    const validation = validateEditableProfile(editableProfile);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    try {
      const updated = await updateProfile(editableProfile);
      const mergedUser = { ...localUser, ...updated };
      localStorage.setItem('user', JSON.stringify(mergedUser));
      setLocalUser(mergedUser);
      setProfileDetail(updated);
      setShowEditModal(false);
      setErrors({});
    } catch (err) {
      console.error('Failed to update profile:', err);
      // Fallback: save to localStorage
      const updatedUser = {
        ...localUser,
        first_name: editableProfile.name,
        phone_number: editableProfile.phone,
        date_of_birth: editableProfile.dateOfBirth,
        gender: editableProfile.gender,
        district: editableProfile.district,
        city: editableProfile.city,
        province: editableProfile.province,
        nationality: editableProfile.nationality,
        language_preference: editableProfile.language
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setLocalUser(updatedUser);
      setShowEditModal(false);
      setErrors({});
    }
  };

  function validateEditableProfile(profile) {
    const e = {};
    const name = (profile.name || '').trim();
    const phone = (profile.phone || '').trim();
    const dob = profile.dateOfBirth;

    if (!name) e.name = 'Full name is required.';
    const phonePattern = /^\+?[0-9\s\-().]{6,20}$/;
    if (!phone) e.phone = 'Phone number is required.';
    else if (!phonePattern.test(phone)) e.phone = 'Enter a valid phone number.';

    if (dob) {
      const d = new Date(dob);
      const now = new Date();
      if (isNaN(d.getTime())) e.dateOfBirth = 'Invalid date format.';
      else if (d > now) e.dateOfBirth = 'Date of birth cannot be in the future.';
    }

    return { valid: Object.keys(e).length === 0, errors: e };
  }
  const isFormValid = validateEditableProfile(editableProfile).valid;

  function formatDateIndo(dateStr) {
    if (!dateStr) return '—';
    try {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat('id-ID', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      }).format(date);
    } catch (e) {
      return dateStr;
    }
  }

  const joinedDate = localUser?.date_joined ||
                    localUser?.dateJoined ||
                    localUser?.created_at ||
                    localUser?.createdAt ||
                    localUser?.profile?.created_at ||
                    profileDetail?.created_at ||
                    profileDetail?.joinedDate ||
                    localUser?.profile?.createdAt ||
                    localUser?.DATE_JOINED ||
                    '';
  const birthDate = localUser?.date_of_birth || localUser?.birth_date || profileDetail?.dateOfBirth || '';

  const infoRows = [
    ['Joined Since', joinedDate ? formatDateIndo(joinedDate) : '—'],
    ['Email', userEmail || '—'],
    ['Phone Number', localUser?.phone_number || localUser?.phone || profileDetail?.phone || '—'],
    ['Date of Birth', birthDate ? formatDateIndo(birthDate) : '—'],
    ['Gender', localUser?.gender || profileDetail?.gender || '—'],
    ['District / Area', localUser?.district || localUser?.area || profileDetail?.district || '—'],
    ['City / Regency', localUser?.city || localUser?.regency || profileDetail?.city || '—'],
    ['Province / State', localUser?.province || localUser?.state || profileDetail?.province || '—'],
    ['Nationality', localUser?.nationality || profileDetail?.nationality || '—'],
    ['Language preference', localUser?.language_preference || profileDetail?.language || '—'],
  ];

  return (
    <div style={{ height: '100vh', overflow: 'hidden', backgroundImage: "url('https://images.unsplash.com/photo-1517079810336-d39e72287591?q=80&w=1920&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')", backgroundSize: '100% auto', backgroundPosition: 'top center', backgroundRepeat: 'no-repeat' }}>
      <Navbar style={{ position: 'relative', zIndex: 30 }} />
      {loading && (
        <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 40, background: 'rgba(0,0,0,0.2)' }}>
          <div style={{ padding: spacing.sm, background: colors.bg, borderRadius: radius.md, boxShadow: shadows.md, fontWeight: 700 }}>Loading...</div>
        </div>
      )}

      <main style={{ position: 'relative', zIndex: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', padding: `${spacing['3xl']} ${spacing.lg} ${spacing.lg}`, height: '100%', overflow: 'hidden' }}>
        <div style={{ width: 1440, maxWidth: '100%', display: 'flex', gap: spacing['2xl'] }}>
          {/* Left: Profile Summary */}
          <ProfileCard cardBg={cardBg} borderColor={borderColor} alignCenter style={{ flex: '0 0 44%', padding: spacing['3xl'] }}>
            <div style={{ width: '100%', textAlign: 'center' }}>
              <h2 style={{ margin: 0, color: accent, fontFamily: fontFamily.base, fontSize: fontSize['3xl'], fontWeight: 800 }}>
                {displayName}
              </h2>
              <div style={{ marginTop: spacing.sm, color: colors.textLight, fontFamily: fontFamily.base, fontSize: fontSize.base }}>@{username}</div>
            </div>

            <div style={{ marginTop: spacing['2xl'], width: 420, height: 420, borderRadius: 999, overflow: 'hidden', border: `10px solid ${accent}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', background: colors.bg }}>
              <img src={profileImage} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </div>
          </ProfileCard>

          {/* Right: Bio & Others Detail */}
          <ProfileCard cardBg={cardBg} borderColor={borderColor} style={{ flex: '1 1 56%', padding: spacing['2xl'] }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md }}>
              <h3 style={{ margin: 0, color: accent, fontFamily: fontFamily.base, fontSize: fontSize['3xl'], fontWeight: 800 }}>Bio & Others Detail</h3>
              <Button variant="btn2" onClick={openEditModal} style={{ background: accent, color: '#fff', borderRadius: 999, padding: '10px 16px', fontWeight: 800 }}>
                <FontAwesomeIcon icon={faPen} style={{ marginRight: 10 }} /> Edit
              </Button>
            </div>

            <div style={{ marginTop: spacing.sm, borderTop: '1px solid rgba(0,0,0,0.06)', display: 'flex', gap: spacing.xl }}>
              {
                (() => {
                  const mid = Math.ceil(infoRows.length / 2);
                  const left = infoRows.slice(0, mid);
                  const right = infoRows.slice(mid);
                  return (
                    <>
                      <div style={{ flex: 1 }}>
                        {left.map(([label, value], idx) => (
                          <div key={label} style={{ padding: `${spacing.md} ${spacing.sm}`, borderBottom: idx < left.length - 1 ? '1px solid rgba(0,0,0,0.06)' : 'none' }}>
                            <div style={{ color: labelColor, fontFamily: fontFamily.base, fontSize: fontSize.lg, fontWeight: 800 }}>{label}</div>
                            <div style={{ marginTop: spacing.xs, color: colors.accent5, fontFamily: fontFamily.base, fontSize: fontSize.base }}>{value}</div>
                          </div>
                        ))}
                      </div>

                      <div style={{ flex: 1 }}>
                        {right.map(([label, value], idx) => (
                          <div key={label} style={{ padding: `${spacing.md} ${spacing.sm}`, borderBottom: idx < right.length - 1 ? '1px solid rgba(0,0,0,0.06)' : 'none' }}>
                            <div style={{ color: labelColor, fontFamily: fontFamily.base, fontSize: fontSize.lg, fontWeight: 800 }}>{label}</div>
                            <div style={{ marginTop: spacing.xs, color: '#123032', fontFamily: fontFamily.base, fontSize: fontSize.base }}>{value}</div>
                          </div>
                        ))}
                      </div>
                    </>
                  );
                })()
              }
            </div>
          </ProfileCard>
        </div>

        {/* Edit Profile Modal */}
        {showEditModal && (
          <Modal open={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Profile">
            <div style={{...modalStyles.gridTwoColumns, marginBottom: spacing.lg}}>
              <div>
                <label style={modalStyles.label}>Full Name</label>
                <input 
                  type="text" 
                  value={editableProfile.name} 
                  onChange={(e) => setEditableProfile({...editableProfile, name: e.target.value})} 
                  style={modalStyles.input} 
                />
                {errors.name && <div style={{ color: 'red', fontSize: 12, marginTop: 6 }}>{errors.name}</div>}
              </div>
              <div>
                <label style={modalStyles.label}>Phone Number</label>
                  <input
                    type="tel"
                    inputMode="tel"
                    pattern="^[0-9+()\\s-]{7,20}$"
                    value={editableProfile.phone}
                    onChange={(e) => {
                      const rawValue = e.target.value;
                      const sanitizedValue = rawValue.replace(/[^0-9+()\\s-]/g, '');
                      setEditableProfile({ ...editableProfile, phone: sanitizedValue });
                    }}
                    style={modalStyles.input}
                  />
                {errors.phone && <div style={{ color: 'red', fontSize: 12, marginTop: 6 }}>{errors.phone}</div>}
              </div>
            </div>

            <div style={{...modalStyles.gridTwoColumns, marginBottom: spacing.lg}}>
              <div>
                <label style={modalStyles.label}>Date of Birth</label>
                <input 
                  type="date" 
                  value={editableProfile.dateOfBirth} 
                  onChange={(e) => setEditableProfile({...editableProfile, dateOfBirth: e.target.value})} 
                  style={modalStyles.input} 
                />
                {errors.dateOfBirth && <div style={{ color: 'red', fontSize: 12, marginTop: 6 }}>{errors.dateOfBirth}</div>}
              </div>
              <div>
                <label style={modalStyles.label}>Gender</label>
                <select 
                  value={editableProfile.gender} 
                  onChange={(e) => setEditableProfile({...editableProfile, gender: e.target.value})} 
                  style={modalStyles.input}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
            </div>

            <div style={{...modalStyles.gridTwoColumns, marginBottom: spacing.lg}}>
              <div>
                <label style={modalStyles.label}>District / Area</label>
                <input 
                  type="text" 
                  value={editableProfile.district} 
                  onChange={(e) => setEditableProfile({...editableProfile, district: e.target.value})} 
                  style={modalStyles.input} 
                />
              </div>
              <div>
                <label style={modalStyles.label}>City / Regency</label>
                <input 
                  type="text" 
                  value={editableProfile.city} 
                  onChange={(e) => setEditableProfile({...editableProfile, city: e.target.value})} 
                  style={modalStyles.input} 
                />
              </div>
            </div>

            <div style={{...modalStyles.gridTwoColumns, marginBottom: spacing.lg}}>
              <div>
                <label style={modalStyles.label}>Province / State</label>
                <input 
                  type="text" 
                  value={editableProfile.province} 
                  onChange={(e) => setEditableProfile({...editableProfile, province: e.target.value})} 
                  style={modalStyles.input} 
                />
              </div>
              <div>
                <label style={modalStyles.label}>Nationality</label>
                <select 
                  value={editableProfile.nationality} 
                  onChange={(e) => setEditableProfile({...editableProfile, nationality: e.target.value})} 
                  style={modalStyles.input}
                >
                  <option value="">Select nationality</option>
                  {countryNames.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{marginBottom: spacing.lg}}>
              <label style={modalStyles.label}>Language Preference</label>
              <input 
                type="text" 
                value={editableProfile.language} 
                onChange={(e) => setEditableProfile({...editableProfile, language: e.target.value})} 
                style={modalStyles.input} 
                placeholder="e.g., Bahasa Indonesia, English"
              />
            </div>

            <div style={modalStyles.buttonContainer}>
              <Button variant="btn2" onClick={saveProfile} disabled={!isFormValid} style={{ display: 'inline-flex', gap: spacing.xs, width: '155px', opacity: isFormValid ? 1 : 0.5 }}>
                <FontAwesomeIcon icon={faCheck} /> Save Changes
              </Button>
              <Button variant="btn3" onClick={() => setShowEditModal(false)} style={{ display: 'inline-flex', gap: spacing.xs }}>
                <FontAwesomeIcon icon={faXmark} /> Cancel
              </Button>
            </div>
          </Modal>
        )}
      </main>
    </div>
  );
}
