import React from 'react';
import { colors, spacing, radius, fontSize } from '../../styles/variables';

const Modal = ({ open = false, onClose = () => {}, title = '', children }) => {
  if (!open) return null;

  const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  };

  const dialogStyle = {
    backgroundColor: colors.accent1,
    padding: spacing.xl,
    borderRadius: radius.lg,
    width: '90%',
    maxWidth: '600px',
    color: colors.accent5,
    boxSizing: 'border-box',
  };

  const headerStyle = { margin: 0, marginBottom: spacing.lg, fontSize: fontSize.xl };

  return (
    <div style={overlayStyle} onClick={onClose} role="dialog" aria-modal="true">
      <div style={dialogStyle} onClick={(e) => e.stopPropagation()}>
        {title && <h2 style={headerStyle}>{title}</h2>}
        <div>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
