import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faTag, faUser, faLocationDot, faCalendar, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import Button from './Button';
import { tripSchedules } from '../../mocks/mockData';
import {
  colors,
  spacing,
  radius,
  fontFamily,
  shadows,
  fontSize,
} from '../../styles/variables.jsx';

// Ensure white placeholder styles are available for inputs rendered by InputField
if (typeof document !== 'undefined' && !document.getElementById('placeholder-white-styles')) {
	const styleEl = document.createElement('style');
	styleEl.id = 'placeholder-white-styles';
	styleEl.innerHTML = `
		.placeholder-white::placeholder { color: #ffffff !important; opacity: 1 !important; }
		.placeholder-white::-webkit-input-placeholder { color: #ffffff !important; }
		.placeholder-white::-moz-placeholder { color: #ffffff !important; opacity: 1 !important; }
		.placeholder-white:-ms-input-placeholder { color: #ffffff !important; }
		.placeholder-white:-moz-placeholder { color: #ffffff !important; opacity: 1 !important; }
	`;
	document.head.appendChild(styleEl);
}

const Card = ({ children, style = {}, ...props }) => {
  const cardStyle = {
    background: colors.bg,
    borderRadius: radius.lg,
    padding: spacing.lg,
    boxShadow: shadows.md,
    fontFamily: fontFamily.base,
    ...style,
		willChange: 'transform',
  };

  return (
    <div style={cardStyle} {...props}>
      {children}
    </div>
  );
};

export const FeatureCard = ({ icon, title, description, style = {} }) => {
  const featureCardStyle = {
    flex: 1,
    maxWidth: 480,
    backgroundColor: '#F5F1E8',
    borderRadius: 20,
    padding: 40,
    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    ...style,
  };

  return (
    <div style={featureCardStyle}>
      <div style={{ width: 96, height: 96, borderRadius: 48, backgroundColor: '#FADD9B', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24, boxShadow: '0 4px 12px rgba(250,221,155,0.3)' }}>
        <FontAwesomeIcon icon={icon} style={{ fontSize: 44, color: '#0D2E3F' }} />
      </div>
      <h3 style={{ margin: 0, marginBottom: 16, color: '#0D2E3F', fontFamily: 'Poppins, sans-serif', fontSize: 24, fontWeight: 700 }}>
        {title}
      </h3>
      <p style={{ margin: 0, color: '#0D2E3F', fontFamily: 'Lora, serif', fontSize: 17, lineHeight: 1.6, opacity: 0.85 }}>
        {description}
      </p>
    </div>
  );
};

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
		boxShadow: 'none',
		border: '2px solid #00000043',
		transition: 'border-color 180ms ease, transform 200ms ease',
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
				e.currentTarget.style.zIndex = 20;
				e.currentTarget.style.transform = 'translateY(-6px)';
				e.currentTarget.style.boxShadow = '0 12px 30px rgba(8,15,20,0.18)';
			}}
			onMouseLeave={(e) => {
				if (!hover) return;
				e.currentTarget.style.zIndex = 'auto';
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

// Grid Trip Card used on Customer page (and re-usable)
export const GridTripCard = ({ trip = {}, onClick, style = {} }) => {
	const cardStyle = {
		backgroundColor: colors.bg,
		borderRadius: radius.lg,
		overflow: 'hidden',
		boxShadow: '0 6px 18px rgba(0,0,0,0.1)',
		transition: 'transform 0.3s ease, box-shadow 0.3s ease',
		cursor: 'pointer',
		display: 'flex',
		flexDirection: 'column',
		...style,
	};

	const imageStyle = {
		width: '100%',
		height: 200,
		position: 'relative',
		overflow: 'hidden'
	};

	const img = {
		width: '100%',
		height: '100%',
		objectFit: 'cover'
	};

	const badgeStyle = {
		position: 'absolute',
		top: spacing.sm,
		left: spacing.sm,
		backgroundColor: 'rgba(139, 115, 85, 0.9)',
		color: colors.bg,
		padding: `${spacing.xs} ${spacing.sm}`,
		borderRadius: radius.sm,
		fontSize: fontSize.xs,
		fontWeight: 700
	};

	const formatPrice = (p) => {
		if (p == null) return '';
		if (typeof p === 'number') return `Rp${p.toLocaleString('id-ID')}`;
		// fallback if already a formatted string
		return String(p);
	};

	const formatLocation = (loc) => {
		if (!loc) return '';
		if (typeof loc === 'string') return loc;
		return `${loc.state}${loc.country ? ', ' + loc.country : ''}`;
	};

	const formatPax = (p) => {
		if (p == null) return '';
		if (typeof p === 'number') return `${p} pax`;
		return p.toString().toLowerCase().includes('pax') ? p : `${p} pax`;
	};

	const formatTitle = (t) => {
		if (!t) return '';
		const rawName = t.name || t.title || '';
		const days = t.duration?.days;
		const nights = t.duration?.nights;
		// remove existing duration prefix if present (e.g. "2D1N - ")
		const baseName = rawName.replace(/^\s*\d+D\d+N\s*-\s*/i, '');
		if (days != null && nights != null) return `${days}D${nights}N - ${baseName}`;
		return rawName;
	};

	const contentStyle = { padding: spacing.md };

	const formatDate = (iso) => {
		if (!iso) return '';
		try {
			const d = new Date(iso);
			const opts = { day: 'numeric', month: 'short' };
			return d.toLocaleDateString('en-GB', opts);
		} catch (e) {
			return iso;
		}
	};

	const formatDateRange = (start, end, fallback) => {
		if (start && end) {
			const s = formatDate(start);
			const e = formatDate(end);
			return `${s} - ${e}`;
		}
		return fallback || '';
	};

	const getStartEnd = (trip) => {
		const dateObj = trip.date;
		if (Array.isArray(dateObj) && dateObj.length > 0) {
			return [dateObj[0].startDate || dateObj[0].start_date, dateObj[0].endDate || dateObj[0].end_date];
		}
		const single = dateObj || {};
		const start = single.startDate || single.start_date || trip.startDate || trip.start_date;
		const end = single.endDate || single.end_date || trip.endDate || trip.end_date;
		return [start, end];
	};

	const getDateRanges = (trip) => {
		const dateObj = trip.date;
		if (Array.isArray(dateObj)) {
			return dateObj.map(d => ({ start: d.startDate || d.start_date, end: d.endDate || d.end_date }));
		}
		if (dateObj && typeof dateObj === 'object') {
			return [{ start: dateObj.startDate || dateObj.start_date, end: dateObj.endDate || dateObj.end_date }];
		}
		if (trip.startDate || trip.start_date || trip.endDate || trip.end_date) {
			return [{ start: trip.startDate || trip.start_date, end: trip.endDate || trip.end_date }];
		}
		return [];
	};

	const daysBetweenInclusive = (startIso, endIso) => {
		if (!startIso || !endIso) return 0;
		const s = new Date(startIso);
		const e = new Date(endIso);
		const msPerDay = 24 * 60 * 60 * 1000;
		return Math.round((e - s) / msPerDay) + 1;
	};

	return (
		<div
			onClick={onClick}
			style={cardStyle}
			onMouseOver={(e) => {
				e.currentTarget.style.transform = 'translateY(-6px)';
				e.currentTarget.style.boxShadow = '0 12px 28px rgba(0,0,0,0.2)';
				e.currentTarget.style.zIndex = 60;
			}}
			onMouseOut={(e) => {
				e.currentTarget.style.transform = 'translateY(0)';
				e.currentTarget.style.boxShadow = '0 6px 18px rgba(0,0,0,0.1)';
				e.currentTarget.style.zIndex = 0;
			}}
		>
			<div style={imageStyle}>
				<img src={trip.image} alt={trip.name} style={img} />
				<div style={badgeStyle}>{trip.destinationType || trip.type || ''}</div>
			</div>

			<div style={contentStyle}>
				<h3 style={{ fontSize: fontSize.lg, fontWeight: 700, color: colors.accent4, margin: 0, fontFamily: fontFamily.base }}>{formatTitle(trip)}</h3>

				<p style={{ fontSize: fontSize.sm, color: colors.text, marginBottom: spacing.sm, display: 'flex', alignItems: 'center', gap: spacing.xs }}>
					<FontAwesomeIcon icon={faLocationDot} color={colors.accent3} size="sm" />
					{formatLocation(trip.location)}
				</p>

				<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm, paddingBottom: spacing.sm, borderBottom: `1px solid ${colors.accent5}20` }}>
					<div style={{ fontSize: fontSize.xs, color: colors.text }}>
						<FontAwesomeIcon icon={faCalendar} size="sm" style={{ marginRight: spacing.xs }} />
						{(function(){
							const scheduleCount = tripSchedules ? tripSchedules.filter(s => s.tripId === trip.tripId).length : 0;
							
							if (scheduleCount > 0) {
								return `${scheduleCount} schedule${scheduleCount > 1 ? 's' : ''}`;
							}
							
							const ranges = getDateRanges(trip);
							if (Array.isArray(trip.date)) {
								return `${ranges.length} dates`;
							}
							if (ranges.length > 0) {
								const r = ranges[0];
								return formatDateRange(r.start, r.end, '');
							}
							const [s,e] = getStartEnd(trip);
							return formatDateRange(s,e, trip.date && typeof trip.date === 'string' ? trip.date : '');
						})()}
					</div>
				</div>

				<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
					<div>
						<div style={{ fontSize: fontSize.xs, color: colors.text, marginBottom: 2 }}>Starting from</div>
						<div style={{ fontSize: fontSize.lg, fontWeight: 700, color: colors.accent3 }}>{formatPrice(trip.price)}</div>
					</div>
					<div style={{ display: 'flex', alignItems: 'center', gap: spacing.xs, color: colors.text, fontSize: fontSize.sm }}>
						<FontAwesomeIcon icon={faUser} />
						{formatPax(trip.pax)}
					</div>
				</div>
			</div>
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
				<textarea className="placeholder-white" style={inputStyle} {...props} />
			) : (
				<input className="placeholder-white" type={type} style={inputStyle} {...props} />
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

// ProfileCard: used for profile pages (summary / detail cards)
export const ProfileCard = ({ children, style = {}, cardBg, borderColor, alignCenter = false, ...props }) => {
  const profileStyle = {
    background: cardBg || colors.bg,
    borderRadius: radius.lg,
    boxShadow: '0 14px 40px rgba(2,12,20,0.38)',
    border: borderColor ? `2px solid ${borderColor}` : `2px solid ${colors.text}11`,
    display: 'flex',
    flexDirection: 'column',
    alignItems: alignCenter ? 'center' : 'stretch',
    ...style,
  };

  return (
    <div style={profileStyle} {...props}>
      {children}
    </div>
  );
// Search Filters Card: Start Date / End Date / Location / Pax + Search/Clear
export const SearchFiltersCard = ({
	startDate,
	endDate,
	setStartDate,
	setEndDate,
	location,
	setLocation,
	pax,
	setPax,
	onSearch = () => {},
	onClear = () => {},
	style = {}
}) => {
	return (
		<div style={{
			position: 'sticky',
			top: '100px',
			zIndex: 50,
			backgroundColor: 'transparent',
			borderRadius: radius.lg,
			padding: spacing.lg,
			border: '3px solid #3E5626',
			boxShadow: '0 10px 50px #3E5626',
			...style
		}}>
			<div style={{
				display: 'grid',
				gridTemplateColumns: '1fr 1fr 1fr 120px',
				gap: spacing.md,
				marginBottom: spacing.md
			}}>
				{/* Start Date */}
				<div style={{
					backgroundColor: colors.accent3,
					padding: spacing.md,
					borderRadius: radius.md,
					display: 'flex',
					flexDirection: 'column',
					gap: spacing.xs
				}}>
					<label style={{ fontSize: fontSize.xs, color: colors.bg, fontWeight: 600, fontFamily: fontFamily.base }}>
						Start Date
					</label>
					<div style={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}>
						<FontAwesomeIcon icon={faCalendar} color={colors.bg} />
						<input
							type="date"
							value={startDate}
							onChange={(e) => setStartDate(e.target.value)}
							style={{
								background: 'transparent',
								border: 'none',
								color: colors.bg,
								fontSize: fontSize.sm,
								fontWeight: 700
							}}
						/>
					</div>
				</div>

				{/* End Date */}
				<div style={{
					backgroundColor: colors.accent3,
					padding: spacing.md,
					borderRadius: radius.md,
					display: 'flex',
					flexDirection: 'column',
					gap: spacing.xs
				}}>
					<label style={{ fontSize: fontSize.xs, color: colors.bg, fontWeight: 600, fontFamily: fontFamily.base }}>
						End Date
					</label>
					<div style={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}>
						<FontAwesomeIcon icon={faCalendar} color={colors.bg} />
						<input
							type="date"
							value={endDate}
							onChange={(e) => setEndDate(e.target.value)}
							style={{
								background: 'transparent',
								border: 'none',
								color: colors.bg,
								fontSize: fontSize.sm,
								fontWeight: 700
							}}
						/>
					</div>
				</div>

				{/* Location */}
				<div style={{
					backgroundColor: colors.accent3,
					padding: spacing.md,
					borderRadius: radius.md,
					display: 'flex',
					flexDirection: 'column',
					gap: spacing.xs
				}}>
					<label style={{ fontSize: fontSize.xs, color: colors.bg, fontWeight: 600, fontFamily: fontFamily.base}}>
						Location
					</label>
					<div style={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}>
						<FontAwesomeIcon icon={faLocationDot} color={colors.bg} />
						<input
							className="placeholder-white"
							type="text"
							placeholder="Country or state"
							value={location}
							onChange={(e) => setLocation(e.target.value)}
							style={{
								background: 'transparent',
								border: 'none',
								color: colors.bg,
								fontSize: fontSize.sm,
								fontWeight: 700
							}}
						/>
					</div>
				</div>

				{/* Pax */}
				<div style={{
					backgroundColor: colors.accent3,
					padding: spacing.md,
					borderRadius: radius.md,
					display: 'flex',
					flexDirection: 'column',
					gap: spacing.xs,
					fontFamily: fontFamily.base
				}}>
					<label style={{ fontSize: fontSize.xs, color: colors.bg, fontWeight: 600, fontFamily: fontFamily.base }}>
						Pax
					</label>
					<div style={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}>
						<FontAwesomeIcon icon={faUser} color={colors.bg} />
						<input
							className="placeholder-white"
							type="number"
							min={1}
							step={1}
							placeholder="1"
							value={pax}
							onChange={(e) => setPax(e.target.value)}
							style={{
								background: 'transparent',
								border: 'none',
								color: colors.bg,
								fontSize: fontSize.sm,
								fontWeight: 700,
								width: 48
							}}
						/>
					</div>
				</div>
			</div>

			{/* Search & Clear Buttons */}
			<div style={{ display: 'flex', gap: spacing.sm }}>
				<Button variant="primary" style={{flex: 1, fontSize: fontSize.base, fontWeight: 700}} onClick={onSearch}>
					<FontAwesomeIcon icon={faMagnifyingGlass} />
					Search Trip
				</Button>

				<button
					style={{
						width: 120,
						backgroundColor: colors.error,
						color: colors.bg,
						padding: spacing.md,
						borderRadius: radius.md,
						fontSize: fontSize.base,
						fontWeight: 700,
						cursor: 'pointer',
						transition: 'all 0.3s ease',
						fontFamily: fontFamily.base
					}}
					onClick={onClear}
				>
					Clear
				</button>
			</div>
		</div>
	);
};
