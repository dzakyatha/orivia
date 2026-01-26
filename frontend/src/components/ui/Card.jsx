import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faTag, faUser } from '@fortawesome/free-solid-svg-icons';
import {
  colors,
  spacing,
  radius,
  fontFamily,
  shadows,
  fontSize,
} from '../../styles/variables.jsx';

const Card = ({ children, style = {}, ...props }) => {
  const cardStyle = {
    background: colors.bg,
    borderRadius: radius.lg,
    padding: spacing.lg,
    boxShadow: shadows.md,
    fontFamily: fontFamily.base,
    ...style,
  };

  return (
    <div style={cardStyle} {...props}>
      {children}
    </div>
  );
};

// AuthCard: reusable card component for auth pages (Login / Register)
export const AuthCard = ({ children, style = {}, image, imageWrapperStyle = {}, imageSectionStyle = {}, ...props }) => {
  const authStyle = {
    position: 'relative',
    display: 'flex',
    flexDirection: 'row',
    background: colors.bg,
    borderRadius: radius.xl,
    overflow: 'hidden',
    boxShadow: shadows.xl,
    border: `10px solid ${colors.bg}`,
    minHeight: '750px',
    ...style,
  };

  return (
    <div style={authStyle} {...props}>
      {/* Optional left image section inside the card for auth pages */}
      {image && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: '0',
          width: '45%',
          height: '100%',
          zIndex: 10,
          transition: 'left 0.6s cubic-bezier(0.68, -0.15, 0.32, 1.15)',
          ...imageWrapperStyle,
        }}>
          <div style={{
            width: '100%',
            height: '100%',
            background: `linear-gradient(100deg, ${colors.text}66, ${colors.textLight}33), url(${image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            borderRadius: radius.lg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: spacing.sm,
            padding: spacing.xl,
            boxSizing: 'border-box',
            ...imageSectionStyle,
          }} />
        </div>
      )}
      {children}
    </div>
  );
};

// Trip Management Card Components
export const TripCard = ({ children, style = {}, ...props }) => {
	// legacy simple card; keep for backward compatibility
	const cardStyle = {
		backgroundColor: '#fff',
		borderRadius: radius.md,
		padding: spacing.lg,
		boxShadow: '0 1px 3px rgba(0,0,0,0.5)',
		...style,
	};

	return (
		<div style={cardStyle} {...props}>
			{children}
		</div>
	);
};

// Styled Trip Card used on Agent page
export const StyledTripCard = ({ image, title, location, price, pax, children, onClick, style = {}, hover = true }) => {
	const cardBase = {
		position: 'relative',
		overflow: 'hidden',
		borderRadius: radius.lg,
		width: '306px',
		height: '305px',
		boxShadow: '0 6px 18px rgba(8,15,20,0.12)',
		transition: `transform 200ms ease, box-shadow 200ms ease`,
		cursor: 'pointer',
		...style,
	};

	const cardImage = {
		position: 'absolute',
		inset: 0,
		backgroundSize: 'cover',
		backgroundPosition: 'center',
		filter: 'brightness(0.9) contrast(0.95)',
	};

	const overlay = {
		position: 'absolute',
		left: 0,
		right: 0,
		bottom: 0,
		height: '55%',
		background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.55) 100%)',
	};

	const content = {
		position: 'absolute',
		left: 16,
		bottom: 16,
		right: 16,
		color: '#fff',
		zIndex: 2,
		display: 'grid',
		gridTemplateRows: 'auto auto auto',
		gap: 6,
	};

	const titleStyle = {
		margin: 0,
		color: '#FFF',
		fontFamily: 'Poppins, sans-serif',
		fontSize: 20,
		fontStyle: 'normal',
		fontWeight: 700,
		lineHeight: 'normal',
	};

	const locationStyle = {
		margin: 0,
		color: '#F3D275',
		fontFamily: 'Lora, serif',
		fontSize: 13,
		fontStyle: 'normal',
		fontWeight: 700,
		lineHeight: 'normal',
	};

	const metaTextStyle = {
		color: '#FFF',
		fontFamily: 'Lora, serif',
		fontSize: 10,
		fontStyle: 'normal',
		fontWeight: 700,
		lineHeight: 'normal',
	};

	return (
		<article
			onClick={onClick}
			style={cardBase}
			onMouseEnter={(e) => {
				if (!hover) return;
				e.currentTarget.style.transform = 'translateY(-6px)';
				e.currentTarget.style.boxShadow = '0 12px 30px rgba(8,15,20,0.18)';
			}}
			onMouseLeave={(e) => {
				if (!hover) return;
				e.currentTarget.style.transform = 'none';
				e.currentTarget.style.boxShadow = cardBase.boxShadow;
			}}
		>
			<div style={{ ...cardImage, backgroundImage: image ? `url(${image})` : 'none' }} />
			<div style={overlay} />
			<div style={content}>
				{/* If structured props provided render them, otherwise render children for backward compatibility */}
				{title || location || price || pax ? (
					<>
						<h3 style={titleStyle}>{title}</h3>
						<p style={locationStyle}>{location}</p>
						<div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
							<span style={{ display: 'inline-flex', gap: 8, alignItems: 'center', background: 'transpaarent', padding: '6px 10px', borderRadius: 6 }}>
								<FontAwesomeIcon icon={faTag} />
								<span style={metaTextStyle}>{price}</span>
							</span>
							<span style={{ display: 'inline-flex', gap: 8, alignItems: 'center', background: 'transpaarent', padding: '6px 10px', borderRadius: 6 }}>
								<FontAwesomeIcon icon={faUser} />
								<span style={metaTextStyle}>{pax}</span>
							</span>
						</div>
					</>
				) : (
					children
				)}
			</div>
		</article>
	);
};

// Image Upload Card
export const ImageUploadCard = ({ onUpload, children, style = {} }) => {
	const uploadStyle = {
		backgroundColor: '#fff',
		borderRadius: radius.md,
		padding: spacing.lg,
		boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
		border: '3px dashed #D4C5B0',
		minHeight: '500px',
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'center',
		gap: spacing.md,
		cursor: 'pointer',
		transition: 'border-color 0.2s',
		...style,
	};

	return (
		<div style={uploadStyle} onClick={onUpload}>
			{children}
		</div>
	);
};

// Input Field Component
export const InputField = ({ label, type = 'text', style = {}, ...props }) => {
	const labelStyle = {
		display: 'block',
		fontSize: fontSize.sm,
		fontWeight: 600,
		marginBottom: '6px',
		color: '#333',
	};

	const inputStyle = {
		width: '100%',
		padding: '10px 14px',
		borderRadius: radius.sm,
		border: '1px solid #D4C5B0',
		fontSize: fontSize.base,
		fontFamily: 'inherit',
		backgroundColor: '#FEFDFB',
		boxSizing: 'border-box',
		outline: 'none',
		...style,
	};

	return (
		<div>
			{label && <label style={labelStyle}>{label}</label>}
			{type === 'textarea' ? (
				<textarea style={inputStyle} {...props} />
			) : (
				<input type={type} style={inputStyle} {...props} />
			)}
		</div>
	);
};

// Icon Button Component
export const IconButton = ({ icon, onClick, style = {} }) => {
	const buttonStyle = {
		background: 'none',
		border: 'none',
		cursor: 'pointer',
		padding: '4px 8px',
		color: '#8B7355',
		fontSize: fontSize.sm,
		...style,
	};

	return (
		<button style={buttonStyle} onClick={onClick}>
			{icon}
		</button>
	);
};

// Add Button (Plus button)
export const AddButton = ({ onClick, style = {}, children = '+' }) => {
	const buttonStyle = {
		width: 40,
		height: 40,
		borderRadius: radius.md,
		border: '2px solid ' + colors.accent5,
		backgroundColor: '#fff',
		color: colors.accent5,
		fontSize: '18px',
		cursor: 'pointer',
		flexShrink: 0,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		...style,
	};

	return (
		<button style={buttonStyle} onClick={onClick}>
			{children}
		</button>
	);
};

// Upload Button Component
export const UploadButton = ({ onClick, children, style = {} }) => {
	const buttonStyle = {
		padding: '10px 24px',
		borderRadius: radius.md,
		backgroundColor: colors.accent5,
		color: '#fff',
		border: 'none',
		fontWeight: 600,
		cursor: 'pointer',
		fontSize: fontSize.base,
		...style,
	};

	return (
		<button style={buttonStyle} onClick={onClick}>
			{children}
		</button>
	);
};

// Card Header Component
export const CardHeader = ({ children, style = {} }) => {
	const headerStyle = {
    color: colors.accent5,
		margin: 0,
		marginBottom: spacing.md,
		fontSize: fontSize.lg,
		fontWeight: 1000,
		...style,
	};

	return <h3 style={headerStyle}>{children}</h3>;
};

// Section Title Component
export const SectionTitle = ({ children, style = {} }) => {
	const titleStyle = {
		margin: 0,
		marginBottom: spacing.lg,
		fontSize: fontSize.xl,
		fontWeight: 600,
		...style,
	};

	return <h2 style={titleStyle}>{children}</h2>;
};

// Image Preview Grid Item
export const ImagePreview = ({ onDelete, showDelete = false, children, style = {} }) => {
	const previewStyle = {
		aspectRatio: '1/1',
		borderRadius: radius.sm,
		backgroundColor: '#F8F4EF',
		border: '1px solid #E5DDD0',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		position: 'relative',
		overflow: 'hidden',
		...style,
	};

	const deleteButtonStyle = {
		position: 'absolute',
		top: 6,
		right: 6,
		background: 'rgba(255,255,255,0.95)',
		border: 'none',
		borderRadius: '50%',
		width: 32,
		height: 32,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		cursor: 'pointer',
		boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
	};

	return (
		<div style={previewStyle}>
			{children}
			{showDelete && onDelete && (
				<button style={deleteButtonStyle} onClick={onDelete}>
					<FontAwesomeIcon icon={faTrash} color="#ef4444" />
				</button>
			)}
		</div>
	);
};

// Text Link Component (for "+ Others")
export const TextLink = ({ children, onClick, style = {} }) => {
	const linkStyle = {
		marginTop: spacing.sm,
		background: 'none',
		border: 'none',
		color: colors.accent5,
		fontSize: fontSize.sm,
		fontWeight: 600,
		cursor: 'pointer',
		padding: '4px 0',
		...style,
	};

	return (
		<button style={linkStyle} onClick={onClick}>
			{children}
		</button>
	);
};

export default Card;
