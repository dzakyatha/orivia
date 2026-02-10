import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../../components/ui/Navbar.jsx';
import Button from '../../components/ui/Button.jsx';
import { ProfileCard } from '../../components/ui/Card.jsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faEye, faClock, faCheck, faCalendarDays, faTag, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';
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

  const userEmail = localUser?.email || googleData?.email;
  const displayName = googleData?.name || localUser?.first_name || localUser?.name || extractUsernameFromEmail(userEmail) || 'Customer';

  function formatDateIndo(dateStr) {
    if (!dateStr) return '—';
    try {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
    } catch (e) { return dateStr; }
  }

  const joinedDate = localUser?.date_joined || localUser?.dateJoined || localUser?.created_at || localUser?.createdAt || localUser?.profile?.created_at || profileDetail?.created_at || localUser?.profile?.createdAt || localUser?.DATE_JOINED;

  const infoRows = [
    ['Joined Since', joinedDate ? formatDateIndo(joinedDate) : '—'],
    ['Email', userEmail || 'customer@example.com'],
    ['Phone Number', localUser?.phone_number || localUser?.phone || '0812345678910'],
    ['Date of Birth', formatDateIndo(localUser?.date_of_birth || localUser?.birth_date) || '—'],
    ['Gender', localUser?.gender || '—'],
    ['District / Area', localUser?.district || localUser?.area || '—'],
    ['City / Regency', localUser?.city || localUser?.regency || '—'],
    ['Province / State', localUser?.province || localUser?.state || '—'],
    ['Nationality', localUser?.nationality || '—'],
    ['Language preference', localUser?.language_preference || '—'],
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
              <div style={{ marginTop: spacing.sm, color: colors.textLight, fontFamily: fontFamily.base, fontSize: fontSize.base }}>@customer</div>
            </div>

            <div style={{ marginTop: spacing['2xl'], width: 420, height: 420, borderRadius: 999, overflow: 'hidden', border: `10px solid ${accent}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', background: colors.bg }}>
              <img src={profileImage} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </div>
          </ProfileCard>

          <ProfileCard cardBg={cardBg} borderColor={borderColor} style={{ flex: '1 1 56%', padding: spacing['2xl'] }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md }}>
              <h3 style={{ margin: 0, color: accent, fontFamily: fontFamily.base, fontSize: fontSize['3xl'], fontWeight: 800 }}>Bio & Others Detail</h3>
              <Button variant="btn2" style={{ background: accent, color: '#fff', borderRadius: 999, padding: '10px 16px', fontWeight: 800 }}>
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
            {(
              // sample data; in future replace with real API data
              [
                { id: 1, title: '2D1N - Labuan Bajo', location: 'East Nusa Tenggara, Indonesia', date: '02-05 January 2026', price: 'Rp4.700.000 / 2pax', tag: 'Island Exploration', img: tripThumb1, status: 'Upcoming' },
                { id: 2, title: '3D2N - Rinjani', location: 'West Nusa Tenggara, Indonesia', date: '02-05 January 2026', price: 'Rp4.700.000 / 2pax', tag: 'Mountain Hiking', img: tripThumb2, status: 'Completed' },
                { id: 3, title: '1D - Papandayan', location: 'West Java, Indonesia', date: '02-05 January 2026', price: 'Rp4.700.000 / 2pax', tag: 'Mountain Hiking', img: tripThumb3, status: 'Completed' },
              ]
            ).map(trip => (
              <div key={trip.id} style={{ display: 'flex', alignItems: 'center', gap: 16, background: 'rgba(245,241,232,0.9)', padding: 18, borderRadius: 12, border: `2px solid ${borderColor}` }}>
                <div style={{ width: 120, height: 80, borderRadius: 8, overflow: 'hidden', flex: '0 0 120px' }}>
                  <img src={trip.img} alt="thumb" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, color: colors.accent5, fontSize: 18 }}>{trip.title}</div>
                      <div style={{ color: colors.accent5, marginTop: 6 }}>{trip.location}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <Button variant="btn1" style={{ fontWeight: 500 }}>
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
      </main>
    </div>
  );
}
