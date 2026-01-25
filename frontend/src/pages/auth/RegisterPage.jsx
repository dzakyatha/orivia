import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { colors, spacing, radius, fontSize, lineHeight, fontFamily, shadows, transitions } from '../../styles/variables.jsx';
import backgroundImage from '../../assets/images/authbg.jpg';
import cardImage from '../../assets/images/authcard.jpg';
import logoPrimary from '../../assets/logo/logoPrimary.png';
import { Link } from 'react-router-dom';
import Button from '../../components/ui/Button.jsx';
import { AuthCard } from '../../components/ui/Card.jsx';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'customer',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});


  const handleChange = (e) => {
    const { name, value } = e.currentTarget;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this specific field
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setFieldErrors({ confirmPassword: 'Passwords do not match' });
      return;
    }

    setLoading(true);
    setFieldErrors({});

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      const response = await axios.post(`${apiUrl}/auth/registration/`, {
        full_name: formData.name,
        email: formData.email,
        password1: formData.password,
        password2: formData.confirmPassword,
        role: formData.role.toUpperCase() === 'AGENT' ? 'TRAVEL_AGENT' : 'CUSTOMER',
      });

      const { access_token, user } = response.data;

      localStorage.setItem('authToken', access_token);
      localStorage.setItem('role', user?.role || (formData.role.toUpperCase() === 'AGENT' ? 'TRAVEL_AGENT' : 'CUSTOMER'));
      localStorage.setItem('user', JSON.stringify(user));

      setLoading(false);
      navigate('/home');
    } catch (error) {
      console.error('Registration error:', error);
      const errorMsg = (error.response?.data?.message || 'Registration failed. Please try again.').toString();
      const lower = errorMsg.toLowerCase();
      if (lower.includes('email')) {
        setFieldErrors({ email: errorMsg });
      } else if (lower.includes('password')) {
        setFieldErrors({ password: errorMsg });
      } else {
        // Non-specific server error — show alert instead of field message
        window.alert(errorMsg);
      }
      setLoading(false);
    }
  };

  const handleGoogleAuth = useGoogleLogin({
    flow: 'auth-code',
    onSuccess: async (codeResponse) => {
      console.log('Google auth success:', codeResponse);
      setLoading(true);
      
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
        
        const backendResponse = await axios.post(`${apiUrl}/auth/google/`, {
          code: codeResponse.code,
        });

        const { action } = backendResponse.data;
        
        if (action === 'login') {
          const { access_token, user } = backendResponse.data;
          localStorage.setItem('authToken', access_token);
          localStorage.setItem('role', user?.role || 'CUSTOMER');
          localStorage.setItem('user', JSON.stringify(user));
          setFormData({ name: '', email: '', password: '', role: 'customer', confirmPassword: '' });
          setFieldErrors({});
          setLoading(false);
          navigate('/home');
        } else if (action === 'register') {
          setLoading(false);
          navigate('/role-selection', { state: { googleData: backendResponse.data.google_data } });
        }
      } catch (error) {
        console.error('Google auth error:', error);
        const errorMsg = error.response?.data?.error || error.response?.data?.message || 'Google authentication failed. Please try again.';
        window.alert(errorMsg);
        setLoading(false);
      }
    },
    onError: (error) => {
      console.error('Google login error:', error);
      window.alert('Google authentication failed. Please try again.');
      setLoading(false);
    },
  });

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
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      zIndex: -1,
    },
    wrapper: {
      width: '100%',
      maxWidth: '900px',
      margin: '0 auto',
    },
    contentWrapper: {
      display: 'flex',
      width: '100%',
      height: '100%',
      position: 'relative',
      alignItems: 'center',
    },
    content: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      width: '55%',
      height: '100%',
      padding: spacing.xl,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      gap: spacing.sm,
      boxSizing: 'border-box',
      minHeight: '750px',
      transition: 'opacity 0.4s ease, visibility 0.4s ease',
      zIndex: 20, 
      paddingTop: spacing.xl, 
    },
    contentLogin: {
      left: 0,
      paddingRight: spacing.lg,
      opacity: 1,
      visibility: 'visible',
    },
    contentRegister: {
      right: 0,
      paddingLeft: spacing.lg,
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
      fontSize: fontSize['5xl'],
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
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    errorText: {
      fontSize: fontSize.xs,
      fontWeight: 400,
      color: '#ef4444',
      fontStyle: 'italic',
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
    inputError: {
      borderColor: '#ef4444',
      backgroundColor: '#fef2f2',
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
    },
    buttonWithMargin: {
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
      ...styles.contentRegister,
    }}>
      <div style={styles.header}>
        <img src={logoPrimary} alt="ORIVIA" style={styles.logo} />
        <h2 style={styles.title}>Start your trip</h2>
      </div>

      <form style={styles.form} onSubmit={handleSubmit}>
        <div style={styles.formGroup}>
          <label style={styles.label} htmlFor="role-reg">
            Role
          </label>
          <select
            style={{...styles.input, cursor: 'pointer'}} 
            id="role-reg"
            name="role"
            value={formData.role}
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
          >
            <option value="customer">Customer</option>
            <option value="agent">Travel Agent</option>
          </select>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label} htmlFor="name-reg">
            <span>Full Name</span>
            {fieldErrors.name && <span style={styles.errorText}>{fieldErrors.name}</span>}
          </label>
          <input
            style={fieldErrors.name ? {...styles.input, ...styles.inputError} : styles.input}
            type="text"
            id="name-reg"
            name="name"
            placeholder="John Doe"
            value={formData.name}
            onChange={handleChange}
            onFocus={(e) => {
              e.target.style.borderColor = colors.accent5;
              e.target.style.boxShadow = shadows.md;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = fieldErrors.name ? '#ef4444' : colors.textLight;
              e.target.style.boxShadow = 'none';
            }}
            required
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label} htmlFor="email-reg">
            <span>Email</span>
            {fieldErrors.email && <span style={styles.errorText}>{fieldErrors.email}</span>}
          </label>
          <input
            style={fieldErrors.email ? {...styles.input, ...styles.inputError} : styles.input}
            type="email"
            id="email-reg"
            name="email"
            placeholder="your@email.com"
            value={formData.email}
            onChange={handleChange}
            onFocus={(e) => {
              e.target.style.borderColor = colors.accent5;
              e.target.style.boxShadow = shadows.md;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = fieldErrors.email ? '#ef4444' : colors.textLight;
              e.target.style.boxShadow = 'none';
            }}
            required
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label} htmlFor="password-reg">
            <span>Password</span>
            {fieldErrors.password && <span style={styles.errorText}>{fieldErrors.password}</span>}
          </label>
          <input
            style={fieldErrors.password ? {...styles.input, ...styles.inputError} : styles.input}
            type="password"
            id="password-reg"
            name="password"
            placeholder="Create a strong password"
            value={formData.password}
            onChange={handleChange}
            onFocus={(e) => {
              e.target.style.borderColor = colors.accent5;
              e.target.style.boxShadow = shadows.md;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = fieldErrors.password ? '#ef4444' : colors.textLight;
              e.target.style.boxShadow = 'none';
            }}
            required
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label} htmlFor="confirmPassword-reg">
            <span>Confirm Password</span>
            {fieldErrors.confirmPassword && <span style={styles.errorText}>{fieldErrors.confirmPassword}</span>}
          </label>
          <input
            style={fieldErrors.confirmPassword ? {...styles.input, ...styles.inputError} : styles.input}
            type="password"
            id="confirmPassword-reg"
            name="confirmPassword"
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={handleChange}
            onFocus={(e) => {
              e.target.style.borderColor = colors.accent5;
              e.target.style.boxShadow = shadows.md;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = fieldErrors.confirmPassword ? '#ef4444' : colors.textLight;
              e.target.style.boxShadow = 'none';
            }}
            required
          />
        </div>

        <div>
          <Button
            type="submit"
            variant="authPrimary"
            style={{ marginTop: styles.buttonWithMargin.marginTop, opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </Button>
        </div>
      </form>

      <div style={styles.divider}>
        <div style={styles.dividerLine}></div>
        <span style={styles.dividerText}>or</span>
        <div style={styles.dividerLine}></div>
      </div>

      <div>
        <Button
          type="button"
          variant="authGoogle"
          onClick={handleGoogleAuth}
          disabled={loading}
        >
          <span style={{ fontWeight: 700, fontSize: fontSize.lg }}>G</span>
          Sign up with Google
        </Button>
      </div>

      <div style={styles.footer}>
        <p style={styles.footerText}>
          Already have an account? <Link to="/login" style={styles.link}>Login here</Link>
        </p>
      </div>
    </div>
  );

  return (
    <div style={styles.container}>
      <div style={styles.background}></div>
      <div style={styles.wrapper}>
        <AuthCard image={cardImage} imageWrapperStyle={{ left: '0' }}>
          <div style={styles.contentWrapper}>
            {renderForm()}
          </div>
        </AuthCard>
      </div>
    </div>
  );
};

export default RegisterPage;
