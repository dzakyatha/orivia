import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { spacing, fontFamily, colors, radius, fontSize } from '../../styles/variables.jsx';
import logoPrimary from '../../assets/logo/logoPrimary.png';



const Navbar = ({ variant = 'main' }) => {
  const location = useLocation();

  const navStyle = {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `${spacing.md} ${spacing.lg}`,
    boxSizing: 'border-box',
    fontFamily: fontFamily.base,
  };

  const leftStyle = { display: 'flex', alignItems: 'center', gap: spacing.md };
  const rightStyle = { display: 'flex', alignItems: 'center', gap: spacing.md };

  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleDocClick(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleDocClick);
    return () => document.removeEventListener('mousedown', handleDocClick);
  }, []);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('role');
    }
    setProfileOpen(false);
    navigate('/login');
  };

  const makeBtn = (to, label, outline = false) => {
    const isActive = location.pathname === to;
    if (outline) {
       return (
        <Link to={to} style={{
          padding: '8px 16px',
          borderRadius: radius['3xl'],
          border: `2px solid ${colors.accent5}`,
          color: colors.accent5,
          background: 'transparent',
          fontWeight: 700,
          textDecoration: 'none',
          fontSize: fontSize.base,
        }}>{label}</Link>
      );
    }

    return (
      <Link to={to} style={{
        padding: '8px 16px',
        borderRadius: radius['3xl'],
        background: isActive ? colors.accent3 : colors.accent5,
        color: colors.bg,
        fontWeight: 700,
        textDecoration: 'none',
        fontSize: fontSize.base,
      }}>{label}</Link>
    );
  };

  if (variant === 'landing') {
    return (
      <nav style={navStyle}>
        <div style={leftStyle}>
          <Link to="/login">
            <img src={logoPrimary} alt="ORIVIA" style={{ height: 36 }} />
          </Link>
        </div>
        <div style={rightStyle}>
          {makeBtn('/login', 'Get Started', true)}
        </div>
      </nav>
    );
  }

  return (
    <nav style={navStyle}>
      <div style={leftStyle}>
        <Link to="/home">
          <img src={logoPrimary} alt="ORIVIA" style={{ height: 36 }} />
        </Link>
      </div>
      <div style={rightStyle}>
        {makeBtn('/home', 'Home')}
        {(() => {
          const role = typeof window !== 'undefined' ? localStorage.getItem('role') : null;
          if (role === 'TRAVEL_AGENT') return makeBtn('/trip/agent', 'Trip');
          return makeBtn('/explore/customer', 'Explore');
        })()}
        <div style={{ position: 'relative' }} ref={profileRef}>
          {(() => {
            const role = typeof window !== 'undefined' ? localStorage.getItem('role') : null;
            const to = role === 'TRAVEL_AGENT' ? '/profile/agent' : '/profile/customer';
            const isActive = location.pathname === to;
            const profileBtnStyle = {
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 40,
              height: 40,
              padding: 0,
              borderRadius: '50%',
              border: `2px solid ${isActive ? colors.accent3 : colors.accent5}`,
              background: 'transparent',
              color: isActive ? colors.accent3 : colors.accent5,
              textDecoration: 'none',
              boxSizing: 'border-box',
              cursor: 'pointer',
            };

            const popoverStyle = {
              position: 'absolute',
              top: 48,
              right: 0,
              background: colors.accent2,
              border: '3px solid rgba(0,0,0,0.09)',
              boxShadow: '0 6px 18px)',
              borderRadius: radius.md,
              padding: spacing.sm,
              minWidth: 140,
              zIndex: 40,
            };

            const menuItemStyle = {
              display: 'flex',
              alignItems: 'center',
              gap: spacing.sm,
              width: '100%',
              padding: '8px 12px',
              textAlign: 'left',
              textDecoration: 'none',
              color: colors.accent5 || '#111',
              background: 'transparent',
              border: 'none',
              fontSize: fontSize.base,
              cursor: 'pointer',
            };

            return (
              <>
                <button
                  onClick={() => setProfileOpen(p => !p)}
                  aria-haspopup="true"
                  aria-expanded={profileOpen}
                  style={profileBtnStyle}
                  title="Profile"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
                    <path d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5z" fill="currentColor" />
                    <path d="M4 20c0-3.314 2.686-6 6-6h4c3.314 0 6 2.686 6 6v1H4v-1z" fill="currentColor" />
                  </svg>
                </button>
                {profileOpen && (
                  <div style={popoverStyle} role="menu" aria-label="Profile menu">
                    <Link to={to} onClick={() => setProfileOpen(false)} style={menuItemStyle} role="menuitem">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style={{ display: 'block' }}>
                        <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
                      </svg>
                      <span>Profile</span>
                    </Link>
                    <div style={{ height: 2, background: 'rgba(0,0,0,0.06)', margin: '6px 0' }} />
                    <button onClick={handleLogout} style={{ ...menuItemStyle, color: colors.accent5 }} role="menuitem">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style={{ display: 'block' }}>
                        <path d="M16 13v-2H7V8l-5 4 5 4v-3z" />
                        <path d="M20 3h-8v2h8v14h-8v2h8a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z" />
                      </svg>
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </>
            );
          })()}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
