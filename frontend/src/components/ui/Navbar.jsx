import React from 'react';
import { Link, useLocation } from 'react-router-dom';
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
          if (role === 'Agent') return makeBtn('/agent', 'Trip');
          return makeBtn('/customer', 'Explore');
        })()}
        {(() => {
          const to = '/profile';
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
          };

          return (
            <Link to={to} style={profileBtnStyle} aria-label="profile">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
                <path d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5z" fill="currentColor" />
                <path d="M4 20c0-3.314 2.686-6 6-6h4c3.314 0 6 2.686 6 6v1H4v-1z" fill="currentColor" />
              </svg>
            </Link>
          );
        })()}
      </div>
    </nav>
  );
};

export default Navbar;
