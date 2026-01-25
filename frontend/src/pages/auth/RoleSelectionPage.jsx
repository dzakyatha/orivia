import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { colors, spacing, radius, fontSize, fontFamily, shadows } from '../../styles/variables.jsx';
import backgroundImage from '../../assets/images/authbg.jpg';
import logoPrimary from '../../assets/logo/logoPrimary.png';
import Button from '../../components/ui/Button.jsx';

const RoleSelectionPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedRole, setSelectedRole] = useState('');
  const [loading, setLoading] = useState(false);
  const googleData = location.state?.googleData;

  useEffect(() => {
    if (!googleData) {
      navigate('/login');
    }
  }, [googleData, navigate]);

  const handleRoleSelect = async () => {
    if (!selectedRole) {
      window.alert('Please select a role');
      return;
    }

    setLoading(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      const response = await axios.post(`${apiUrl}/auth/google/complete/`, {
        google_data: googleData,
        role: selectedRole,
      });

      const { access_token, user } = response.data;

      localStorage.setItem('authToken', access_token);
      localStorage.setItem('role', user?.role || selectedRole);
      localStorage.setItem('user', JSON.stringify(user));

      setLoading(false);
      navigate('/home');
    } catch (error) {
      console.error('Role selection error:', error);
      const errorMsg = error.response?.data?.error || 'Failed to complete registration. Please try again.';
      window.alert(errorMsg);
      setLoading(false);
    }
  };

  if (!googleData) {
    return null;
  }

  const styles = {
    container: {
      position: 'relative',
      width: '100%',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      padding: spacing.lg,
    },
    background: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: `linear-gradient(100deg, ${colors.text}66, ${colors.textLight}33), url(${backgroundImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      zIndex: -1,
    },
    card: {
      backgroundColor: colors.bg,
      borderRadius: radius.lg,
      padding: spacing.xl,
      boxShadow: shadows.xl,
      maxWidth: '500px',
      width: '100%',
      textAlign: 'center',
    },
    logo: {
      height: '50px',
      width: 'auto',
      marginBottom: spacing.md,
    },
    title: {
      fontSize: fontSize['4xl'],
      fontWeight: 700,
      color: colors.accent3,
      fontFamily: fontFamily.base,
      marginBottom: spacing.xs,
    },
    subtitle: {
      fontSize: fontSize.base,
      color: colors.textLight,
      fontFamily: fontFamily.base,
      marginBottom: spacing.xl,
    },
    userName: {
      fontSize: fontSize.lg,
      fontWeight: 600,
      color: colors.text,
      marginBottom: spacing.lg,
    },
    roleContainer: {
      display: 'flex',
      gap: spacing.md,
      marginBottom: spacing.xl,
    },
    roleCard: {
      flex: 1,
      padding: spacing.lg,
      border: `2px solid ${colors.textLight}`,
      borderRadius: radius.md,
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      backgroundColor: colors.bg,
    },
    roleCardSelected: {
      borderColor: colors.accent5,
      backgroundColor: `${colors.accent5}15`,
      boxShadow: shadows.md,
    },
    roleTitle: {
      fontSize: fontSize.xl,
      fontWeight: 700,
      color: colors.text,
      marginBottom: spacing.xs,
      fontFamily: fontFamily.base,
    },
    roleDescription: {
      fontSize: fontSize.sm,
      color: colors.textLight,
      fontFamily: fontFamily.base,
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.background}></div>
      <div style={styles.card}>
        <img src={logoPrimary} alt="ORIVIA" style={styles.logo} />
        <h2 style={styles.title}>Choose Your Role</h2>
        <p style={styles.subtitle}>Welcome to ORIVIA!</p>
        <p style={styles.userName}>Hi, {googleData.name}!</p>

        <div style={styles.roleContainer}>
          <div
            style={{
              ...styles.roleCard,
              ...(selectedRole === 'CUSTOMER' ? styles.roleCardSelected : {}),
            }}
            onClick={() => setSelectedRole('CUSTOMER')}
          >
            <h3 style={styles.roleTitle}>Customer</h3>
            <p style={styles.roleDescription}>
              Explore destinations and book trips
            </p>
          </div>

          <div
            style={{
              ...styles.roleCard,
              ...(selectedRole === 'TRAVEL_AGENT' ? styles.roleCardSelected : {}),
            }}
            onClick={() => setSelectedRole('TRAVEL_AGENT')}
          >
            <h3 style={styles.roleTitle}>Travel Agent</h3>
            <p style={styles.roleDescription}>
              Create and manage trips for customers
            </p>
          </div>
        </div>

        <Button
          variant="authPrimary"
          onClick={handleRoleSelect}
          disabled={loading || !selectedRole}
          style={{
            opacity: loading || !selectedRole ? 0.5 : 1,
            cursor: loading || !selectedRole ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Processing...' : 'Continue'}
        </Button>
      </div>
    </div>
  );
};

export default RoleSelectionPage;
