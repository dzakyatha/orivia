import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../../components/ui/Navbar.jsx';
import Button from '../../components/ui/Button.jsx';
import { ProfileCard } from '../../components/ui/Card.jsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen } from '@fortawesome/free-solid-svg-icons';
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

  // Fetch user data from API if not in localStorage
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
        // ignore fetch errors silently; UI will show defaults
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, [localUser]);

  // If localUser exists but no obvious date fields, try fetching detailed profile by id
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
    try {
      return email.split('@')[0];
    } catch (e) {
      return null;
    }
  }

  const userEmail = localUser?.email || googleData?.email;
  const displayName = googleData?.name || 
                     localUser?.first_name || 
                     localUser?.name || 
                     extractUsernameFromEmail(userEmail) || 
                     'Dzaky Atha';

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
                    localUser?.profile?.createdAt ||
                    localUser?.DATE_JOINED;

  const infoRows = [
    ['Joined Since', joinedDate ? formatDateIndo(joinedDate) : '—'],
    ['Email', localUser?.email || 'dzakyatha8@gmail.com'],
    ['Phone Number', localUser?.phone_number || localUser?.phone || '0812345678910'],
    ['Date of Birthday', formatDateIndo(localUser?.date_of_birth || localUser?.birth_date) || '07 Maret 2005'],
    ['Gender', localUser?.gender || 'Male'],
    ['District / Area', localUser?.district || localUser?.area || 'Jatinangor'],
    ['City / Regency', localUser?.city || localUser?.regency || 'Sumedang'],
    ['Province / State', localUser?.province || localUser?.state || 'West Java'],
    ['Nationality', localUser?.nationality || 'Indonesia'],
    ['Language preference', localUser?.language_preference || 'Bahasa Indonesia'],
  ];

  return (
    <div style={{ height: '100vh', overflow: 'hidden', backgroundImage: "url('https://images.unsplash.com/photo-1517079810336-d39e72287591?q=80&w=1920&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')", backgroundSize: '100% auto', backgroundPosition: 'top center', backgroundRepeat: 'no-repeat' }}>
      <Navbar style={{ position: 'relative', zIndex: 30 }} />

      <main style={{ position: 'relative', zIndex: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', padding: '50px 24px 24px', height: '100%', overflow: 'hidden' }}>
        <div style={{ width: 1440, maxWidth: '100%', display: 'flex', gap: 40 }}>
          {/* Left: Profile Summary */}
          <ProfileCard cardBg={cardBg} borderColor={borderColor} alignCenter style={{ flex: '0 0 44%', padding: 48 }}>
            <div style={{ width: '100%', textAlign: 'center' }}>
              <h2 style={{ margin: 0, color: accent, fontFamily: 'Poppins, sans-serif', fontSize: 40, fontWeight: 800 }}>
                {displayName}
              </h2>
              <div style={{ marginTop: 10, color: '#7b7b7b', fontFamily: 'Lora, serif', fontSize: 16 }}>@jekiiiii123</div>
            </div>

            <div style={{ marginTop: 44, width: 420, height: 420, borderRadius: 999, overflow: 'hidden', border: `10px solid ${accent}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff' }}>
              <img src={profileImage} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </div>
          </ProfileCard>

          {/* Right: Bio & Others Detail */}
          <ProfileCard cardBg={cardBg} borderColor={borderColor} style={{ flex: '1 1 56%', padding: 36 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ margin: 0, color: accent, fontFamily: 'Poppins, sans-serif', fontSize: 32, fontWeight: 800 }}>Bio & Others Detail</h3>
              <Button variant="btn2" style={{ background: accent, color: '#fff', borderRadius: 999, padding: '10px 16px', fontWeight: 800 }}>
                <FontAwesomeIcon icon={faPen} style={{ marginRight: 10 }} /> Edit
              </Button>
            </div>

            <div style={{ marginTop: 8, borderTop: '1px solid rgba(0,0,0,0.06)', display: 'flex', gap: 28 }}>
              {
                (() => {
                  const mid = Math.ceil(infoRows.length / 2);
                  const left = infoRows.slice(0, mid);
                  const right = infoRows.slice(mid);
                  return (
                    <>
                      <div style={{ flex: 1 }}>
                        {left.map(([label, value], idx) => (
                          <div key={label} style={{ padding: '18px 8px', borderBottom: idx < left.length - 1 ? '1px solid rgba(0,0,0,0.06)' : 'none' }}>
                            <div style={{ color: labelColor, fontFamily: 'Poppins, sans-serif', fontSize: 16, fontWeight: 800 }}>{label}</div>
                            <div style={{ marginTop: 8, color: '#123032', fontFamily: 'Lora, serif', fontSize: 18 }}>{value}</div>
                          </div>
                        ))}
                      </div>

                      <div style={{ flex: 1 }}>
                        {right.map(([label, value], idx) => (
                          <div key={label} style={{ padding: '18px 8px', borderBottom: idx < right.length - 1 ? '1px solid rgba(0,0,0,0.06)' : 'none' }}>
                            <div style={{ color: labelColor, fontFamily: 'Poppins, sans-serif', fontSize: 16, fontWeight: 800 }}>{label}</div>
                            <div style={{ marginTop: 8, color: '#123032', fontFamily: 'Lora, serif', fontSize: 18 }}>{value}</div>
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
      </main>
    </div>
  );
}
