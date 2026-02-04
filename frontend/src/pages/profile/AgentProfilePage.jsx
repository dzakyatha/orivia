import React from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../../components/ui/Navbar.jsx';
import Button from '../../components/ui/Button.jsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen } from '@fortawesome/free-solid-svg-icons';
import profileImage from '../../assets/images/jeki.jpg';
import bottomImage from '../../assets/images/landingpage2.png';

export default function AgentProfilePage() {
  const accent = '#BF4A24';
  const labelColor = '#5B6B3A';
  const cardBg = 'rgba(245,241,232,0.86)';
  const borderColor = 'rgba(181,110,53,0.45)';

  const location = useLocation();

  // Try to obtain googleData like RoleSelectionPage: first from location.state, then localStorage
  const googleData = location.state?.googleData || (() => {
    try {
      return JSON.parse(localStorage.getItem('googleData') || localStorage.getItem('google_data') || 'null');
    } catch (e) {
      return null;
    }
  })();

  const localUser = (() => {
    try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch (e) { return null; }
  })();

  const displayName = googleData?.name || localUser?.first_name || 'Dzaky Atha';

  const infoRows = [
    ['Joined Since', '18 January 2026'],
    ['Email', 'dzakyatha8@gmail.com'],
    ['Phone Number', '0812345678910'],
    ['Date of Birthday', '07 Maret 2005'],
    ['Gender', 'Male'],
    ['District / Area', 'Jatinangor'],
    ['City / Regency', 'Sumedang'],
    ['Province / State', 'West Java'],
    ['Nationality', 'Indonesia'],
    ['Language preference', 'Bahasa Indonesia'],
  ];

  return (
    <div style={{ position: 'relative', height: '100vh', overflow: 'hidden', backgroundImage: `url(${bottomImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <Navbar style={{ position: 'relative', zIndex: 30 }} />

      <main style={{ position: 'relative', zIndex: 20, display: 'flex', justifyContent: 'center', padding: '100px 24px' }}>
        <div style={{ width: 1440, maxWidth: '100%', display: 'flex', gap: 40 }}>
          {/* Left: Profile Summary */}
          <div style={{ flex: '0 0 44%', borderRadius: 20, background: cardBg, padding: 48, boxShadow: '0 14px 40px rgba(2,12,20,0.38)', border: `2px solid ${borderColor}`, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: '100%', textAlign: 'center' }}>
              <h2 style={{ margin: 0, color: accent, fontFamily: 'Poppins, sans-serif', fontSize: 40, fontWeight: 800 }}>
                {displayName}
              </h2>
              <div style={{ marginTop: 10, color: '#7b7b7b', fontFamily: 'Lora, serif', fontSize: 16 }}>@jekiiiii123</div>
            </div>

            <div style={{ marginTop: 44, width: 420, height: 420, borderRadius: 999, overflow: 'hidden', border: `10px solid ${accent}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff' }}>
              <img src={profileImage} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </div>
          </div>

          {/* Right: Bio & Others Detail */}
          <div style={{ flex: '1 1 56%', borderRadius: 20, background: cardBg, padding: 36, boxShadow: '0 14px 40px rgba(2,12,20,0.38)', border: `2px solid ${borderColor}` }}>
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
          </div>
        </div>
      </main>
    </div>
  );
}
