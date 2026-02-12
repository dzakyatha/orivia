import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../../components/ui/Navbar.jsx';
import Button from '../../components/ui/Button.jsx';
import { ProfileCard } from '../../components/ui/Card.jsx';
import Modal, { modalStyles } from '../../components/ui/Modal.jsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faEye, faClock, faCheck, faCalendarDays, faTag, faMapMarkerAlt, faXmark, faDownload } from '@fortawesome/free-solid-svg-icons';
import { dummyCustomerProfile, customerLatestTrips, tripBookingDetails } from '../../mocks/mockData.js';
import countryList from 'react-select-country-list';
import profileImage from '../../assets/images/jeki.jpg';
import tripThumb1 from '../../assets/images/landingpage2.png';
import tripThumb2 from '../../assets/images/landingpage2.png';
import tripThumb3 from '../../assets/images/landingpage2.png';
import { colors, spacing, radius, fontSize, lineHeight, fontFamily, shadows, transitions } from '../../styles/variables.jsx';


export default function CustomerProfilePage() {
  const accent = colors.primary;
  const labelColor = colors.accent5;
  const cardBg = 'rgba(245,241,232,0.9)';
  const borderColor = colors.accent3;

  const location = useLocation();

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

  // Trip Detail Modal States
  const [showTripDetail, setShowTripDetail] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [passengerIndex, setPassengerIndex] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (localUser) return;
    if (!token) return;

    setLoading(true);
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

    async function fetchUser() {
      try {
        const response = await axios.get(`${apiUrl}/auth/user/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const userData = response.data.user || response.data;
        if (userData) {
          localStorage.setItem('user', JSON.stringify(userData));
          setLocalUser(userData);
        }
      } catch (error) {
        // ignore
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, [localUser]);

  useEffect(() => {
    if (!localUser) return;
    const hasDate = Object.keys(localUser).some(k => /date|joined|created/i.test(k)) || !!localUser.profile;
    if (hasDate) return;
    const token = localStorage.getItem('authToken');
    if (!token) return;

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
    const id = localUser.id || localUser.user_id || localUser.pk;
    if (!id) return;

    async function fetchProfileDetail() {
      const endpoints = [`/users/${id}/`, `/profiles/${id}/`, `/users/profile/${id}/`];
      for (const ep of endpoints) {
        try {
          const res = await axios.get(`${apiUrl}${ep}`, { headers: { Authorization: `Bearer ${token}` } });
          const detail = res.data.user || res.data.profile || res.data || null;
          if (detail) {
            setProfileDetail(detail);
            const merged = { ...localUser, ...detail };
            localStorage.setItem('user', JSON.stringify(merged));
            setLocalUser(merged);
            return;
          }
        } catch (e) {
          // try next
        }
      }
    }

    fetchProfileDetail();
  }, [localUser]);

  function extractUsernameFromEmail(email) {
    if (!email) return null;
    try { return email.split('@')[0]; } catch (e) { return null; }
  }

  const userEmail = localUser?.email || googleData?.email || dummyCustomerProfile.email;
  const displayName = googleData?.name || localUser?.first_name || localUser?.name || extractUsernameFromEmail(userEmail) || dummyCustomerProfile.name;
  const username = localUser?.username || extractUsernameFromEmail(userEmail) || dummyCustomerProfile.username;

  // Country list for nationality dropdown
  const countryOptions = (typeof countryList === 'function') ? (countryList().getData ? countryList().getData() : []) : [];
  const countryNames = countryOptions.map((c) => c.label || c.value || '');

  // Open Edit Profile Modal
  const openEditModal = () => {
    setEditableProfile({
      name: displayName,
      phone: localUser?.phone_number || localUser?.phone || dummyCustomerProfile.phone,
      dateOfBirth: localUser?.date_of_birth || localUser?.birth_date || dummyCustomerProfile.dateOfBirth,
      gender: localUser?.gender || dummyCustomerProfile.gender,
      district: localUser?.district || localUser?.area || dummyCustomerProfile.district,
      city: localUser?.city || localUser?.regency || dummyCustomerProfile.city,
      province: localUser?.province || localUser?.state || dummyCustomerProfile.province,
      nationality: localUser?.nationality || dummyCustomerProfile.nationality,
      language: localUser?.language_preference || dummyCustomerProfile.language
    });
    setShowEditModal(true);
  };

  // Save Profile Changes
  const saveProfile = () => {
    // Validate before saving
    const validation = validateEditableProfile(editableProfile);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    // Here you can add API call to save the profile
    // For now, we'll just update localStorage
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
  };

  function validateEditableProfile(profile) {
    const e = {};
    const name = (profile.name || '').trim();
    const phone = (profile.phone || '').trim();
    const dob = profile.dateOfBirth;

    if (!name) e.name = 'Full name is required.';
    // basic phone pattern: allow +, digits, spaces, dashes, parentheses; length check
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

  // Open Trip Detail Modal
  const openTripDetail = (trip) => {
    setSelectedTrip(trip);
    setShowTripDetail(true);
  };

  useEffect(() => {
    setPassengerIndex(0);
  }, [selectedTrip]);

  // Download Invoice Handler
  const downloadInvoice = (trip) => {
    // Warn user about personal data and allow excluding sensitive fields
    const message = 'This invoice may include sensitive personal information (phone number, date of birth, nationality).\n\nClick OK to include all details in the downloaded invoice.\nClick Cancel to download an invoice with sensitive fields omitted.';
    const includeSensitive = window.confirm(message);

    const booking = tripBookingDetails[trip.id] || {};

    const safeField = (value) => (value == null || value === '') ? '—' : String(value);

    const lines = [];
    lines.push('ORIVIA TRAVEL INVOICE');
    lines.push('========================');
    lines.push('');
    lines.push(`Booking ID: ${safeField(booking.bookingId || '')}`);
    lines.push(`Trip: ${safeField(trip.title)}`);
    lines.push(`Location: ${safeField(trip.location)}`);
    lines.push(`Date: ${safeField(trip.date)}`);
    lines.push(`Price: ${safeField(trip.price)}`);
    lines.push(`Status: ${safeField(trip.status)}`);
    lines.push('');
    lines.push('Customer Details:');
    lines.push(`Name: ${safeField(booking.customerName || booking.customer || '')}`);
    if (includeSensitive) {
      lines.push(`Phone: ${safeField(booking.phoneNumber || booking.phone || '')}`);
      lines.push(`Gender: ${safeField(booking.gender || '')}`);
      lines.push(`Nationality: ${safeField(booking.nationality || '')}`);
      lines.push(`Date of Birth: ${safeField(booking.dateOfBirth || booking.dob || '')}`);
    } else {
      lines.push('Phone: [redacted]');
      lines.push('Gender: [redacted]');
      lines.push('Nationality: [redacted]');
      lines.push('Date of Birth: [redacted]');
    }
    lines.push('');
    lines.push(`Pickup Point: ${includeSensitive ? safeField(booking.pickupPoint || booking.pickup || '') : '[redacted]'}`);
    lines.push('');
    lines.push(`Notes: ${includeSensitive ? safeField(booking.notes || '') : '[redacted]'}`);
    lines.push('');
    lines.push('Thank you for traveling with Orivia!');

    const invoiceContent = lines.join('\n');

    // Create and download the file
    const blob = new Blob([invoiceContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const safeTitle = String(trip.title || 'invoice').replace(/[^a-z0-9-_]/gi, '-');
    a.download = `Orivia-Invoice-${safeTitle}-${trip.id}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  function formatDateIndo(dateStr) {
    if (!dateStr) return '—';
    try {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
    } catch (e) { return dateStr; }
  }

  const joinedDate = localUser?.date_joined || localUser?.dateJoined || localUser?.created_at || localUser?.createdAt || localUser?.profile?.created_at || profileDetail?.created_at || localUser?.profile?.createdAt || localUser?.DATE_JOINED || dummyCustomerProfile.joinedDate;
  const birthDate = localUser?.date_of_birth || localUser?.birth_date || dummyCustomerProfile.dateOfBirth;

  const infoRows = [
    ['Joined Since', joinedDate ? formatDateIndo(joinedDate) : formatDateIndo(dummyCustomerProfile.joinedDate)],
    ['Email', userEmail],
    ['Phone Number', localUser?.phone_number || localUser?.phone || dummyCustomerProfile.phone],
    ['Date of Birth', birthDate ? formatDateIndo(birthDate) : formatDateIndo(dummyCustomerProfile.dateOfBirth)],
    ['Gender', localUser?.gender || dummyCustomerProfile.gender],
    ['District / Area', localUser?.district || localUser?.area || dummyCustomerProfile.district],
    ['City / Regency', localUser?.city || localUser?.regency || dummyCustomerProfile.city],
    ['Province / State', localUser?.province || localUser?.state || dummyCustomerProfile.province],
    ['Nationality', localUser?.nationality || dummyCustomerProfile.nationality],
    ['Language preference', localUser?.language_preference || dummyCustomerProfile.language],
  ];

  return (
    <div style={{ backgroundImage: "url('https://images.unsplash.com/photo-1517079810336-d39e72287591?q=80&w=1920&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')", backgroundSize: '100% auto', backgroundPosition: 'top center', backgroundRepeat: 'no-repeat' }}>
      <Navbar style={{ position: 'relative', zIndex: 30 }} />
      {loading && (
        <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 40, background: 'rgba(0,0,0,0.2)' }}>
          <div style={{ padding: spacing.sm, background: colors.bg, borderRadius: radius.md, boxShadow: shadows.md, fontWeight: 700 }}>Loading...</div>
        </div>
      )}

      <main style={{ position: 'relative', zIndex: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', padding: `${spacing['3xl']} ${spacing.lg} ${spacing.lg}`, height: '100%', overflow: 'hidden' }}>
        <div style={{ width: 1440, maxWidth: '100%', display: 'flex', gap: spacing['2xl'] }}>
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
                            <div style={{ marginTop: spacing.xs, color: colors.accent5, fontFamily: fontFamily.base, fontSize: fontSize.base }}>{value}</div>
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

        {/* Latest Trip Section */}
        <div style={{ width: 1440, maxWidth: '100%', marginTop: 32 }}>
          <h2 style={{ color: '#fff', fontFamily: 'Poppins, sans-serif', fontSize: 28, margin: '8px 12px' }}>Latest Trip</h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {customerLatestTrips.map(trip => (
              <div key={trip.id} style={{ display: 'flex', alignItems: 'center', gap: 16, background: 'rgba(245,241,232,0.9)', padding: 18, borderRadius: 12, border: `2px solid ${borderColor}` }}>
                <div style={{ width: 120, height: 80, borderRadius: 8, overflow: 'hidden', flex: '0 0 120px' }}>
                  <img src={trip.id === 1 ? tripThumb1 : trip.id === 2 ? tripThumb2 : tripThumb3} alt="thumb" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, color: colors.accent5, fontSize: 18 }}>{trip.title}</div>
                      <div style={{ color: colors.accent5, marginTop: 6 }}>{trip.location}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <Button variant="btn1" onClick={() => openTripDetail(trip)} style={{ fontWeight: 500 }}>
                        <FontAwesomeIcon icon={faEye} style={{ marginRight: 5 }} />
                        See Details
                      </Button>
                      {trip.status === 'Upcoming' ? (
                        <Button variant="btn3" style={{ fontWeight: 500 }}>
                          <FontAwesomeIcon icon={faClock} style={{ marginRight: 5 }} />
                          {trip.status}
                        </Button>
                      ) : (
                        <Button variant="btn2" style={{fontWeight: 500 }}>
                          <FontAwesomeIcon icon={faCheck} style={{ marginRight: 5 }} />
                          {trip.status}
                        </Button>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 18, marginTop: 12, alignItems: 'center' }}>
                    <div style={{ color: colors.accent5, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <FontAwesomeIcon icon={faCalendarDays} style={{ color: colors.accent5 }} />
                      <span>{trip.date}</span>
                    </div>

                    <div style={{ color: colors.accent5, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <FontAwesomeIcon icon={faTag} style={{ color: colors.accent5 }} />
                      <span>{trip.price}</span>
                    </div>

                    <div style={{ color: colors.accent5, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <FontAwesomeIcon icon={faMapMarkerAlt} style={{ color: colors.accent5 }} />
                      <span>{trip.tag}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
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

        {/* Trip Detail Modal */}
        {showTripDetail && selectedTrip && (
          <Modal open={showTripDetail} onClose={() => setShowTripDetail(false)} title={`Booking Details (${selectedTrip.title})`}>

            <div style={{ position: 'relative' }}>
              {/* top-left close button removed per request */}

              {/* Passenger Information Grid - support multiple passengers with navigation */}
              <div style={{ marginBottom: spacing.xl }}>
              {
                (() => {
                  const booking = tripBookingDetails[selectedTrip.id] || {};
                  const passengers = (booking.passengers && booking.passengers.length)
                    ? booking.passengers
                    : [{
                        customerName: booking.customerName || booking.customer || booking.customer_name || dummyCustomerProfile.name,
                        phoneNumber: booking.phoneNumber || booking.phone || dummyCustomerProfile.phone,
                        gender: booking.gender || dummyCustomerProfile.gender,
                        nationality: booking.nationality || dummyCustomerProfile.nationality,
                        dateOfBirth: booking.dateOfBirth || booking.dob || dummyCustomerProfile.dateOfBirth,
                        pickupPoint: booking.pickupPoint || booking.pickup || '—',
                        notes: booking.notes || ''
                      }];

                  const p = passengers[passengerIndex] || passengers[0];

                  return (
                    <>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: spacing.lg, marginBottom: spacing.lg }}>
                        <div>
                          <div style={{ fontWeight: 700, color: colors.accent5, marginBottom: spacing.sm }}>Name</div>
                          <div style={{ fontWeight: 600, color: colors.accent5, fontSize: fontSize.base }}>{p.customerName}</div>
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: colors.accent5, marginBottom: spacing.sm }}>Phone Number</div>
                          <div style={{ fontWeight: 600, color: colors.accent5, fontSize: fontSize.base }}>{p.phoneNumber}</div>
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: colors.accent5, marginBottom: spacing.sm }}>Gender</div>
                          <div style={{ fontWeight: 600, color: colors.accent5, fontSize: fontSize.base }}>{p.gender}</div>
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: colors.accent5, marginBottom: spacing.sm }}>Nationality</div>
                          <div style={{ fontWeight: 600, color: colors.accent5, fontSize: fontSize.base }}>{p.nationality}</div>
                        </div>
                      </div>
                  
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: spacing.lg, marginBottom: spacing.lg }}>
                        <div>
                          <div style={{ fontWeight: 700, color: colors.accent5, marginBottom: spacing.sm }}>Date of Birth</div>
                          <div style={{ fontWeight: 600, color: colors.accent5, fontSize: fontSize.base }}>{p.dateOfBirth}</div>
                        </div>
                        <div style={{ gridColumn: '2 / 5' }}>
                          <div style={{ fontWeight: 700, color: colors.accent5, marginBottom: spacing.sm }}>Pick Up Point</div>
                          <div style={{ fontWeight: 600, color: colors.accent5, fontSize: fontSize.base }}>{p.pickupPoint}</div>
                        </div>
                      </div>
                    </>
                  );
                })()
              }
            </div>

            {/* Notes Section (per passenger) */}
            <div style={{ marginBottom: 0 }}>
              <div style={{ fontWeight: 700, color: colors.accent5, marginBottom: spacing.sm, fontSize: fontSize.base }}>Notes</div>
              <div style={{ 
                color: colors.accent5,
                lineHeight: lineHeight.relaxed,
                fontSize: fontSize.base,
                minHeight: '70px'
              }}>
                {
                  (() => {
                    const booking = tripBookingDetails[selectedTrip.id] || {};
                    const passengers = (booking.passengers && booking.passengers.length) ? booking.passengers : [{ notes: booking.notes || '' }];
                    return passengers[passengerIndex]?.notes || passengers[0]?.notes || '';
                  })()
                }
              </div>
            </div>

            {/* Passenger navigation (after notes) */}
            {
              (() => {
                const booking = tripBookingDetails[selectedTrip.id] || {};
                const passengers = (booking.passengers && booking.passengers.length)
                  ? booking.passengers
                  : [{ notes: booking.notes || '' }];
                if (!passengers || passengers.length <= 1) return null;

                const atStart = passengerIndex <= 0;
                const atEnd = passengerIndex >= passengers.length - 1;

                return (
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: spacing.sm}}>
                    <button
                      onClick={() => setPassengerIndex((i) => Math.max(0, i - 1))}
                      disabled={atStart}
                      style={{ width: 36, height: 36, borderRadius: 8, border: `1px solid ${colors.accent3}`, background: 'transparent', cursor: atStart ? 'not-allowed' : 'pointer' }}
                    >◀</button>

                    <div style={{ padding: '6px 10px', borderRadius: 8, border: `1px solid ${colors.accent3}`, display: 'flex', alignItems: 'center' }}>{passengerIndex + 1} / {passengers.length}</div>

                    <button
                      onClick={() => setPassengerIndex((i) => Math.min(passengers.length - 1, i + 1))}
                      disabled={atEnd}
                      style={{ width: 36, height: 36, borderRadius: 8, border: `1px solid ${colors.accent3}`, background: 'transparent', cursor: atEnd ? 'not-allowed' : 'pointer' }}
                    >▶</button>
                  </div>
                );
              })()
            }

            <div style={{ 
              display: 'flex', 
              gap: spacing.sm, 
              justifyContent: 'space-between',
              paddingTop: spacing.xl,
              width: '100%'
            }}>
              <Button 
                variant="primary" 
                onClick={() => downloadInvoice(selectedTrip)} 
                style={{ 
                  flex: 4,
                  display: 'inline-flex', 
                  alignItems: 'center',
                  gap: spacing.xs, 
                  justifyContent: 'center',
                  padding: `${spacing.md} ${spacing.lg}`,
                  fontSize: fontSize.base,
                  fontWeight: 700,
                  minWidth: 0
                }}
              >
                <FontAwesomeIcon icon={faDownload} /> Download Invoice
              </Button>
              <Button 
                variant="primary" 
                onClick={() => setShowTripDetail(false)} 
                style={{ 
                  flex: 1,
                  display: 'inline-flex', 
                  alignItems: 'center',
                  gap: spacing.xs,
                  justifyContent: 'center',
                  padding: `${spacing.sm} ${spacing.md}`,
                  fontSize: fontSize.base,
                  fontWeight: 700,
                  minWidth: 0
                }}
              >
                <FontAwesomeIcon icon={faXmark} /> Back
              </Button>
            </div>
            </div>
          </Modal>
        )}
      </main>
    </div>
  );
}
