import React, { useState } from 'react';
import {
  colors,
  spacing,
  radius,
  fontSize,
  transitions,
  fontFamily,
} from '../../styles/variables.jsx';

const baseStyle = {
  fontFamily: fontFamily.base,
  color: '#ffffff',
  cursor: 'pointer',
  border: 'none',
  outline: 'none',
  transition: transitions.base,
};

/* ========================= */
/* VARIANT STYLES */
/* ========================= */

// VARIANTS: include auth-specific buttons for login/register
const variants = {
  authPrimary: {
    ...baseStyle,
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
    backgroundColor: colors.accent5,
    color: colors.bg,
  },
  
  authGoogle: {
    ...baseStyle,
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
    backgroundColor: colors.secondary,
    color: colors.bg,
  },

  primary: {
    ...baseStyle,
    display: 'inline-flex',
    gap: '8px',
    width: 'auto',
    height: 'auto',
    padding: '10px 20px',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: '10px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    background: `linear-gradient(
      94deg,
      ${colors.accent5} 28.08%,
      ${colors.accent4} 97.67%
    )`,
    fontSize: fontSize.sm,
    boxSizing: 'border-box',
  },

  btn1: {
    ...baseStyle,
    display: 'flex',
    width: '132px',
    padding: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
    gap: '5px',
    flexShrink: 0,
    borderRadius: radius.md,
    border: `1px solid ${colors.accent5}`,
    background: colors.accent4,
    boxShadow: `
      0 0 1.4px 0 ${colors.accent5},
      0 1px 8.6px 0 ${colors.accent5} inset
    `,
    fontSize: fontSize.sm,
  },

  btn2: {
    ...baseStyle,
    display: 'flex',
    width: '132px',
    padding: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
    gap: '5px',
    flexShrink: 0,
    borderRadius: radius.md,
    border: `1px solid ${colors.accent4}`,
    background: colors.accent5,
    boxShadow: `
      0 0 1.4px 0 ${colors.accent4},
      0 1px 8.6px 0 ${colors.accent4} inset
    `,
    fontSize: fontSize.sm,
  },

  btn3: {
    ...baseStyle,
    display: 'flex',
    width: '132px',
    padding: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
    gap: '5px',
    flexShrink: 0,
    borderRadius: radius.md,
    border: `1px solid ${colors.secondary}`,
    background: colors.primary,
    boxShadow: `
      0 0 1.4px 0 ${colors.accent5},
      0 1px 8.6px 0 ${colors.accent5} inset
    `,
    fontSize: fontSize.sm,
  },
};

/* ========================= */
/* COMPONENT */
/* ========================= */

const Button = ({ variant = 'primary', style = {}, children, onMouseOver, onMouseOut, onMouseEnter, onMouseLeave, ...props }) => {
  const [hover, setHover] = useState(false);

  const baseStyle = {
    ...variants[variant],
    ...style,
  };

  const hoverStyle = (variant === 'primary' && hover) ? {
    background: colors.accent5,
    backgroundImage: 'none',
    color: colors.bg,
    transition: 'none',
  } : {};

  const handleMouseEnter = (e) => {
    setHover(true);
    if (typeof onMouseEnter === 'function') onMouseEnter(e);
    if (typeof onMouseOver === 'function') onMouseOver(e);
  };

  const handleMouseLeave = (e) => {
    setHover(false);
    if (typeof onMouseLeave === 'function') onMouseLeave(e);
    if (typeof onMouseOut === 'function') onMouseOut(e);
  };

  return (
    <button
      style={{
        ...baseStyle,
        ...hoverStyle,
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
