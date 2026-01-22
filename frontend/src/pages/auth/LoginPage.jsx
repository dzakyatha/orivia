import React, { useState, useEffect } from 'react';
import { colors, spacing, radius, fontSize, lineHeight, fontFamily, shadows, transitions } from '../../styles/variables.jsx';
import backgroundImage from '../../assets/images/authbg.jpg';
import cardImage from '../../assets/images/authcard.jpg';
import { Link } from 'react-router-dom';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.currentTarget;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      console.log('Login:', formData);
      setLoading(false);
      alert('Login successful! (Demo)');
    }, 1000);
  };

  const handleGoogleAuth = () => {
    console.log('Google auth clicked');
    alert('Google authentication not yet configured');
  };





  // Styles using variables.jsx
  const styles = {
    container: {
      position: 'relative',
      width: '100%',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      boxSizing: 'border-box',
      padding: spacing.lg,
    },
    background: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: `linear-gradient(100deg, ${colors.text}66, ${colors.textLight}33), url(${backgroundImage}`,
      backgroundSize: 'cover',      // ⬅️ ini kuncinya
      backgroundPosition: 'center', // ⬅️ biar fokus di tengah
      backgroundRepeat: 'no-repeat',// ⬅️ cegah pengulangan
      zIndex: -1,
    },
    wrapper: {
      width: '100%',
      maxWidth: '900px',
      margin: '0 auto',
    },
    card: {
      position: 'relative',
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      background: colors.bg,
      borderRadius: radius.xl,
      overflow: 'hidden',
      boxShadow: shadows.xl,
      border: `10px solid ${colors.bg}`,
      minHeight: isMobile ? 'auto' : '750px',
    },
    imageWrapper: {
      position: isMobile ? 'relative' : 'absolute',
      top: 0,
      left: '55%',
      width: isMobile ? '100%' : '45%',
      height: isMobile ? '150px' : '100%',
      zIndex: 10,
      transition: 'left 0.6s cubic-bezier(0.68, -0.15, 0.32, 1.15)',
    },
    imageSection: {
      width: '100%',
      height: '100%',
      background: `linear-gradient(100deg, ${colors.text}66, ${colors.textLight}33), url(${cardImage}`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      borderRadius: isMobile ? 0 : radius.lg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: spacing.sm,
      padding: spacing.xl,
      boxSizing: 'border-box',
    },
    imageTextWrapper: {
      // No animation
    },
    imageText: {
      color: colors.bg,
      fontSize: isMobile ? fontSize.lg : fontSize['2xl'],
      fontWeight: 700,
      fontFamily: fontFamily.base,
      textAlign: 'center',
      textShadow: '0 2px 10px rgba(0,0,0,0.3)',
      margin: 0,
    },
    imageSubtext: {
      color: 'rgba(255,255,255,0.9)',
      fontSize: fontSize.sm,
      fontFamily: fontFamily.base,
      textAlign: 'center',
      margin: 0,
      marginTop: spacing.sm,
    },
    contentWrapper: {
      display: 'flex',
      width: isMobile ? '100%' : '100%',
      height: '100%',
      position: 'relative',
      alignItems: 'center',
    },
    content: {
      position: 'absolute',
      top: 0,
      width: '55%',
      height: '100%',
      padding: isMobile ? spacing.lg : spacing.xl,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      gap: spacing.sm,
      boxSizing: 'border-box',
      minHeight: isMobile ? 'auto' : '750px',
      transition: 'opacity 0.4s ease, visibility 0.4s ease',
      left: 0,
      paddingRight: isMobile ? spacing.lg : spacing.lg,
      opacity: 1,
      visibility: 'visible',
    },
    header: {
      marginBottom: spacing.xs,
    },
    logo: {
      height: '40px',
      width: 'auto',
      marginBottom: spacing.xs,
    },
    title: {
      fontSize: isMobile ? fontSize['5xl'] : fontSize['5xl'],
      fontWeight: 700,
      color: colors.accent3,
      lineHeight: lineHeight.tight,
      fontFamily: fontFamily.base,
      margin: 0,
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: spacing.sm,
    },
    formGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: spacing.xs,
    },
    label: {
      fontSize: fontSize.sm,
      fontWeight: 600,
      color: colors.accent5,
      fontFamily: fontFamily.base,
    },
    input: {
      padding: `${spacing.sm} ${spacing.md}`,
      border: `2px solid ${colors.textLight}`,
      borderRadius: radius.md,
      backgroundColor: colors.bg,
      color: colors.text,
      fontSize: fontSize.base,
      fontFamily: fontFamily.base,
      transition: `all ${transitions.base}`,
      outline: 'none',
      width: '100%',
      boxSizing: 'border-box',
    },
    error: {
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      color: colors.error,
      padding: `${spacing.sm} ${spacing.md}`,
      borderRadius: radius.md,
      fontSize: fontSize.sm,
      fontFamily: fontFamily.base,
    },
    button: {
      padding: `${spacing.sm} ${spacing.lg}`,
      border: 'none',
      borderRadius: radius.md,
      fontSize: fontSize.base,
      fontWeight: 600,
      cursor: 'pointer',
      transition: `all ${transitions.base}`,
      fontFamily: fontFamily.base,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      width: '100%',
      boxSizing: 'border-box',
      marginTop: spacing.md,
    },
    buttonPrimary: {
      backgroundColor: colors.accent5,
      color: colors.bg,
    },
    buttonGoogle: {
      backgroundColor: colors.secondary,
      color: colors.bg,
    },
    divider: {
      display: 'flex',
      alignItems: 'center',
      gap: spacing.md,
      margin: `${spacing.xs} 0`,
    },
    dividerLine: {
      flex: 1,
      height: '1px',
      backgroundColor: colors.textLight,
    },
    dividerText: {
      color: colors.textLight,
      fontWeight: 500,
      fontFamily: fontFamily.base,
      fontSize: fontSize.sm,
    },
    footer: {
      textAlign: 'center',
      marginTop: spacing.xs,
    },
    footerText: {
      fontSize: fontSize.sm,
      color: colors.text,
      fontFamily: fontFamily.base,
      margin: 0,
    },
    link: {
      color: colors.primary,
      fontWeight: 700,
      textDecoration: 'none',
      transition: `all ${transitions.fast}`,
      cursor: 'pointer',
      background: 'none',
      border: 'none',
      padding: 0,
      fontSize: fontSize.sm,
      fontFamily: fontFamily.base,
    },
  };

  const renderForm = () => (
    <div style={{
      ...styles.content,
      ...(isMobile ? { position: 'relative', width: '100%', opacity: 1, visibility: 'visible' } : {}),
    }}>
      <div style={styles.header}>
        <img src="/src/assets/logo/logoPrimary.png" alt="ORIVIA" style={styles.logo} />
        <h2 style={styles.title}>Continue your journey</h2>
      </div>

      <form style={styles.form} onSubmit={handleSubmit}>
        <div style={styles.formGroup}>
          <label style={styles.label} htmlFor="email-log">
            Email
          </label>
          <input
            style={styles.input}
            type="email"
            id="email-log"
            name="email"
            placeholder="your@email.com"
            value={formData.email}
            onChange={handleChange}
            onFocus={(e) => {
              e.target.style.borderColor = colors.accent5;
              e.target.style.boxShadow = shadows.md;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = colors.textLight;
              e.target.style.boxShadow = 'none';
            }}
            required
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label} htmlFor="password-log">
            Password
          </label>
          <input
            style={styles.input}
            type="password"
            id="password-log"
            name="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            onFocus={(e) => {
              e.target.style.borderColor = colors.accent5;
              e.target.style.boxShadow = shadows.md;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = colors.textLight;
              e.target.style.boxShadow = 'none';
            }}
            required
          />
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <div>
          <button
            type="submit"
            style={{
              ...styles.button,
              ...styles.buttonPrimary,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
            disabled={loading}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.backgroundColor = colors.accent4;
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = shadows.lg;
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.target.style.backgroundColor = colors.accent5;
                e.target.style.transform = '';
                e.target.style.boxShadow = '';
              }
            }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </div>
      </form>

      <div style={styles.divider}>
        <div style={styles.dividerLine}></div>
        <span style={styles.dividerText}>or</span>
        <div style={styles.dividerLine}></div>
      </div>

      <div>
        <button
          type="button"
          style={{
            ...styles.button,
            ...styles.buttonGoogle,
            // No marginTop here
          }}
          onClick={handleGoogleAuth}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = colors.primary;
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = shadows.lg;
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = colors.secondary;
            e.target.style.transform = '';
            e.target.style.boxShadow = '';
          }}
        >
          <span style={{ fontWeight: 700, fontSize: fontSize.lg }}>G</span>
          Login with Google
        </button>
      </div>

      <div style={styles.footer}>
        <p style={styles.footerText}>
          Don't have an account? <Link to="/register" style={styles.link}>Register here</Link>
        </p>
      </div>
    </div>
  );

  return (
    <div style={styles.container}>
      <div style={styles.background}></div>
      <div style={styles.wrapper}>
        <div style={styles.card}>
          {/* Sliding Image */}
          <div style={styles.imageWrapper}>
            <div style={styles.imageSection}>
              <div style={styles.imageTextWrapper}></div>
            </div>
          </div>
          {/* Forms Container */}
          <div style={styles.contentWrapper}>
            {renderForm()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
