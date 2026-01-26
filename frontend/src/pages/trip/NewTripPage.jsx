
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload, faTrash, faPencil, faPlus, faCheck, faXmark, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import Navbar from '../../components/ui/Navbar';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import { 
	TripCard, 
	ImageUploadCard, 
	InputField, 
	IconButton, 
	AddButton, 
	UploadButton, 
	CardHeader, 
	SectionTitle, 
	ImagePreview, 
	TextLink 
} from '../../components/ui/Card';
import { colors, spacing, radius, fontSize } from '../../styles/variables';

const DEST_OPTIONS = [
	'Island Exploration',
	'Mount Hiking',
	'Camping Ground',
	'City Tour',
	'Wildlife Exploration'
];

const NewTripPage = () => {
	const navigate = useNavigate();
	const [schedules, setSchedules] = useState([
		{ id: 1, text: '2026-02-01 - 2026-02-02' },
		{ id: 2, text: '2026-02-14 - 2026-02-15' },
		{ id: 3, text: '2026-02-27 - 2026-02-28' }
	]);
	
	const [pickupPoints, setPickupPoints] = useState([
		{ id: 1, price: 'Rp 1.000.000', location: 'Orivia Agent Gambir, Jakarta', checked: false },
		{ id: 2, price: 'Rp 850.000', location: 'Orivia Agent Pasteur, Bandung', checked: false },
		{ id: 3, price: 'Rp 1.050.000', location: 'Soekarno Hatta Airport, Jakarta', checked: false }
	]);

	const [includes, setIncludes] = useState([
		{ id: 1, name: 'Guide', checked: false },
		{ id: 2, name: 'Porter', checked: false },
		{ id: 3, name: 'Meals', checked: false },
		{ id: 4, name: 'First Aid', checked: false },
		{ id: 5, name: 'Insurance', checked: false },
		{ id: 6, name: 'Entrance Ticket', checked: false },
		{ id: 7, name: 'Transportation', checked: false },
		{ id: 8, name: 'Documentation', checked: false },
		{ id: 9, name: 'Accomodation', checked: false }
	]);

	const [imagePreviews, setImagePreviews] = useState([null, null, null, null]);
	const fileInputRef = useRef(null);

	const MAX_IMAGES = 4;

	const handleUploadClick = () => {
		if (fileInputRef.current) fileInputRef.current.click();
	};

	const handleFileChange = (e) => {
		const files = Array.from(e.target.files || []);
		if (!files.length) return;

		const imageFiles = files.filter(f => /image\/(png|jpeg|jpg)/i.test(f.type));
		if (!imageFiles.length) return;

		setImagePreviews(prev => {
			const newPrev = [...prev];
			let slotIndex = newPrev.findIndex(p => p === null);
			if (slotIndex === -1) return newPrev;
			for (let f of imageFiles) {
				if (slotIndex === -1) break;
				newPrev[slotIndex] = URL.createObjectURL(f);
				slotIndex = newPrev.findIndex((p, i) => p === null && i > slotIndex);
			}
			return newPrev;
		});

		e.target.value = '';
	};

	const handleDeleteImage = (index) => {
		setImagePreviews(prev => {
			const newPrev = [...prev];
			if (newPrev[index]) {
				URL.revokeObjectURL(newPrev[index]);
				newPrev[index] = null;
			}
			return newPrev;
		});
	};

	const [tripDays, setTripDays] = useState(1);
	const [destType, setDestType] = useState('');
	const [destTypeCustom, setDestTypeCustom] = useState('');

	const [tripPlanner, setTripPlanner] = useState({
		1: [
			{ id: 1, time: '', duration: '', activity: '', location: '' }
		]
	});
	const [openDay, setOpenDay] = useState(1);

	// Modal states
	const [showIncludeModal, setShowIncludeModal] = useState(false);
	const [newIncludeName, setNewIncludeName] = useState('');
	const [showPickupModal, setShowPickupModal] = useState(false);
	const [newPickupPrice, setNewPickupPrice] = useState('');
	const [newPickupLocation, setNewPickupLocation] = useState('');

	// Edit modal states
	const [showEditScheduleModal, setShowEditScheduleModal] = useState(false);
	const [editingSchedule, setEditingSchedule] = useState(null);
	const [editScheduleStartDate, setEditScheduleStartDate] = useState('');
	const [editScheduleEndDate, setEditScheduleEndDate] = useState('');

	// New schedule inputs
	const [newScheduleStartDate, setNewScheduleStartDate] = useState('');
	const [newScheduleEndDate, setNewScheduleEndDate] = useState('');

	// Inline error messages (shown in UI instead of window.alert)
	const [scheduleError, setScheduleError] = useState('');
	const [editScheduleError, setEditScheduleError] = useState('');

	const [showEditPickupModal, setShowEditPickupModal] = useState(false);
	const [editingPickup, setEditingPickup] = useState(null);
	const [pickupError, setPickupError] = useState('');
	const [editPickupError, setEditPickupError] = useState('');
	const [showEditIncludeModal, setShowEditIncludeModal] = useState(false);
	const [editingInclude, setEditingInclude] = useState(null);
	const [includeError, setIncludeError] = useState('');
	const [editIncludeError, setEditIncludeError] = useState('');

	const handleDeleteSchedule = (id) => {
		setSchedules(schedules.filter(s => s.id !== id));
	};

	const handleEditSchedule = (schedule) => {
		setEditingSchedule(schedule);
		setEditScheduleStartDate('');
		setEditScheduleEndDate('');
		setEditScheduleError('');
		setShowEditScheduleModal(true);
	};

	const handleSaveEditSchedule = () => {
		if (editingSchedule && (editScheduleStartDate || editScheduleEndDate)) {
			setEditScheduleError('');
			if (editScheduleStartDate && editScheduleEndDate) {
				const s = new Date(editScheduleStartDate);
				const e = new Date(editScheduleEndDate);
				if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime()) || e < s) {
					setEditScheduleError('End date tidak boleh lebih kecil dari start date.');
					return;
				}
			}

			const newText = `${editScheduleStartDate || 'TBD'} - ${editScheduleEndDate || 'TBD'}`;

			if (schedules.some(s => s.id !== editingSchedule.id && s.text === newText)) {
				setEditScheduleError('Input sudah ada');
				return;
			}

			setSchedules(schedules.map(s => 
				s.id === editingSchedule.id ? { ...s, text: newText } : s
			));
			setShowEditScheduleModal(false);
			setEditingSchedule(null);
			setEditScheduleStartDate('');
			setEditScheduleEndDate('');
		} else if (editingSchedule) {
			setEditScheduleError('Start date atau End date harus diisi.');
		}
	};

	const handleAddSchedule = () => {
		setScheduleError('');
		if (!newScheduleStartDate && !newScheduleEndDate) {
			setScheduleError('Start date atau End date harus diisi.');
			return;
		}

		if (newScheduleStartDate && newScheduleEndDate) {
			const s = new Date(newScheduleStartDate);
			const e = new Date(newScheduleEndDate);
			if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime()) || e < s) {
				setScheduleError('End date tidak boleh lebih kecil dari start date.');
				return;
			}
		}

		const newId = schedules.length > 0 ? Math.max(...schedules.map(s => s.id)) + 1 : 1;
		const newText = `${newScheduleStartDate || 'TBD'} - ${newScheduleEndDate || 'TBD'}`;

		if (schedules.some(s => s.text === newText)) {
			setScheduleError('Input sudah ada');
			return;
		}

		const newSchedule = { id: newId, text: newText };
		setSchedules([newSchedule, ...schedules]);
		setNewScheduleStartDate('');
		setNewScheduleEndDate('');
		setScheduleError('');
	};

	const handleAddInclude = () => {
		setIncludeError('');
		if (!newIncludeName.trim()) {
			setIncludeError('Nama harus diisi.');
			return;
		}
		if (includes.some(i => i.name.toLowerCase() === newIncludeName.trim().toLowerCase())) {
			setIncludeError('Input sudah ada');
			return;
		}
		const newId = includes.length > 0 ? Math.max(...includes.map(i => i.id)) + 1 : 1;
		setIncludes([
			...includes,
			{ id: newId, name: newIncludeName.trim(), checked: false }
		]);
		setNewIncludeName('');
		setShowIncludeModal(false);
		setIncludeError('');
	};

	const handleDeleteInclude = (id) => {
		setIncludes(includes.filter(i => i.id !== id));
	};

	const handleEditInclude = (item) => {
		setEditingInclude(item);
		setEditIncludeError('');
		setShowEditIncludeModal(true);
	};

	const handleSaveEditInclude = () => {
		setEditIncludeError('');
		if (editingInclude) {
			if (!editingInclude.name.trim()) {
				setEditIncludeError('Nama harus diisi.');
				return;
			}
			if (includes.some(i => i.id !== editingInclude.id && i.name.toLowerCase() === editingInclude.name.trim().toLowerCase())) {
				setEditIncludeError('Input sudah ada');
				return;
			}
			setIncludes(includes.map(i => 
				i.id === editingInclude.id ? { ...editingInclude, name: editingInclude.name.trim() } : i
			));
			setShowEditIncludeModal(false);
			setEditingInclude(null);
			setEditIncludeError('');
		}
	};

	const handleAddPickupPoint = () => {
		setPickupError('');
		if (!(newPickupPrice.trim() && newPickupLocation.trim())) {
			setPickupError('Harga dan Lokasi harus diisi.');
			return;
		}
		if (!/^\d+$/.test(newPickupPrice.trim())) {
			setPickupError('Harga harus berupa integer (hanya angka).');
			return;
		}
		const newId = Math.max(...pickupPoints.map(p => p.id)) + 1;
		setPickupPoints([
			...pickupPoints,
			{ id: newId, price: newPickupPrice.trim(), location: newPickupLocation.trim(), checked: false }
		]);
		setNewPickupPrice('');
		setNewPickupLocation('');
		setShowPickupModal(false);
		setPickupError('');
	};

	const handleDeletePickupPoint = (id) => {
		setPickupPoints(pickupPoints.filter(p => p.id !== id));
	};

	const handleEditPickupPoint = (point) => {
		setEditingPickup(point);
		setEditPickupError('');
		setShowEditPickupModal(true);
	};

	const handleSaveEditPickupPoint = () => {
		if (editingPickup && editingPickup.price.trim() && editingPickup.location.trim()) {
			setEditPickupError('');
			if (!/^\d+$/.test(editingPickup.price.trim())) {
				setEditPickupError('Harga harus berupa integer (hanya angka).');
				return;
			}
			setPickupPoints(pickupPoints.map(p => 
				p.id === editingPickup.id ? { ...editingPickup, price: editingPickup.price.trim(), location: editingPickup.location.trim() } : p
			));
			setShowEditPickupModal(false);
			setEditingPickup(null);
			setEditPickupError('');
		} else if (editingPickup) {
			setEditPickupError('Harga dan Lokasi harus diisi.');
		}
	};

	const handleDayInputChange = (value) => {
		const days = parseInt(value) || 1;
		setTripDays(days);
		
		const newPlanner = { ...tripPlanner };
		for (let i = 1; i <= days; i++) {
			if (!newPlanner[i]) {
				newPlanner[i] = [{ id: 1, time: '', duration: '', activity: '', location: '' }];
			}
		}
		setTripPlanner(newPlanner);
	};

	const handleAddActivity = (day) => {
		const dayActivities = tripPlanner[day] || [];
		const newId = dayActivities.length > 0 ? Math.max(...dayActivities.map(a => a.id)) + 1 : 1;
		setTripPlanner({
			...tripPlanner,
			[day]: [...dayActivities, { id: newId, time: '', duration: '', activity: '', location: '' }]
		});
	};

	const handleDeleteActivity = (day, activityId) => {
		setTripPlanner({
			...tripPlanner,
			[day]: tripPlanner[day].filter(a => a.id !== activityId)
		});
	};

	const handleActivityChange = (day, activityId, field, value) => {
		setTripPlanner({
			...tripPlanner,
			[day]: tripPlanner[day].map(a =>
				a.id === activityId ? { ...a, [field]: value } : a
			)
		});
	};

	const monthNames = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

	const formatISODate = (iso) => {
		if (!iso) return iso;
		const d = new Date(iso);
		if (Number.isNaN(d.getTime())) return iso;
		const day = d.getDate();
		const month = monthNames[d.getMonth()];
		const year = d.getFullYear();
		return `${day} ${month} ${year}`;
	};

	const formatDateRange = (text) => {
		if (!text || typeof text !== 'string') return text;
		const m = text.match(/(\d{4}-\d{2}-\d{2})\s*-\s*(\d{4}-\d{2}-\d{2})/);
		if (m) return `${formatISODate(m[1])} - ${formatISODate(m[2])}`;
		return text;
	};

	const filledCount = imagePreviews.filter(Boolean).length;

	const pageStyle = {
		minHeight: '100vh',
		backgroundColor: colors.accent1,
		fontFamily: 'Inter, system-ui, -apple-system',
	};

	const containerStyle = {
		maxWidth: '1400px',
		margin: '0 auto',
		padding: spacing.lg,
	};

	const gridStyle = {
		display: 'grid',
		gridTemplateColumns: '500px 1fr',
		gap: spacing.lg,
		marginTop: spacing.lg,
	};

	return (
		<>
			<Navbar style={{ background: 'transparent' }} />
			<div style={pageStyle}>
				<div style={containerStyle}>
					<div style={gridStyle}>
						{/* LEFT COLUMN */}
						<div style={{ display: 'flex', flexDirection: 'column', gap: spacing.lg }}>
							{/* Image Upload Card */}
							<ImageUploadCard>
							<FontAwesomeIcon icon={faUpload} size="3x" color={colors.accent4} />
								<UploadButton onClick={handleUploadClick} disabled={filledCount >= MAX_IMAGES}>Upload Image</UploadButton>
								<input
									type="file"
									ref={fileInputRef}
									onChange={handleFileChange}
									accept="image/png, image/jpeg"
									multiple
									style={{ display: 'none' }}
								/>
							</ImageUploadCard>

							{/* Image Preview Grid */}
							<div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: spacing.sm }}>
								{imagePreviews.map((img, idx) => (
									<ImagePreview key={idx}>
										{img ? (
											<div style={{ position: 'relative' }}>
												<img src={img} alt={`preview-${idx}`} style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: radius.sm }} />
												{filledCount >= 0 && (
													<button
														onClick={() => handleDeleteImage(idx)}
														style={{
														position: 'absolute',
														top: 8,
														right: 8,
														background: 'transparent',
														border: 'none',
														borderRadius: '100%',
														padding: 6,
														cursor: 'pointer'
													}}
													>
														<FontAwesomeIcon icon={faTrash} color={colors.error} />
													</button>
												)}
											</div>
										) : (
											<div style={{ width: '100%', height: 100, borderRadius: radius.sm }} />
										)}
									</ImagePreview>
								))}
							</div>

							{/* Schedule Section */}
							<TripCard>
								<CardHeader>Schedule</CardHeader>
								<div style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
									{schedules.map((schedule) => (
										<div
											key={schedule.id}
											style={{
												display: 'flex',
												justifyContent: 'space-between',
												alignItems: 'center',
												padding: '8px 0',
											}}
										>
													<span style={{ fontSize: fontSize.base }}>{formatDateRange(schedule.text)}</span>
											<div style={{ display: 'flex', gap: spacing.xs }}>
											<IconButton icon={<FontAwesomeIcon icon={faPencil} />} onClick={() => handleEditSchedule(schedule)} />
											<IconButton icon={<FontAwesomeIcon icon={faTrash} />} onClick={() => handleDeleteSchedule(schedule.id)} />
											</div>
										</div>
									))}
								</div>

								{/* Add Schedule */}
								<div style={{ marginTop: spacing.md }}>
									<div style={{ display: 'flex', gap: spacing.sm, alignItems: 'end' }}>
										<div style={{ flex: 1 }}>
											<InputField label="Start Date" type="date" value={newScheduleStartDate} onChange={(e) => { setNewScheduleStartDate(e.target.value); setScheduleError(''); }} />
										</div>
										<div style={{ flex: 1 }}>
											<InputField label="End Date" type="date" value={newScheduleEndDate} onChange={(e) => { setNewScheduleEndDate(e.target.value); setScheduleError(''); }} />
										</div>
										<AddButton onClick={handleAddSchedule} />
									</div>
									{scheduleError && (
										<div style={{ color: colors.error, marginTop: spacing.sm, fontSize: fontSize.sm }}>{scheduleError}</div>
									)}
								</div>
							</TripCard>
						</div>

						{/* RIGHT COLUMN */}
						<div style={{ display: 'flex', flexDirection: 'column', gap: spacing.lg }}>
							{/* Trip Detail Form */}
							<TripCard>
								<SectionTitle>Trip Detail</SectionTitle>

								<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing.md, marginBottom: spacing.md }}>
									<InputField label="Name" type="text" />
									<InputField label="Price" type="text" />
								</div>

								<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing.md, marginBottom: spacing.md }}>
									<InputField label="Province / State" type="text" />
									<InputField label="Country" type="text" />
								</div>

								<div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 1fr', gap: spacing.md, marginBottom: spacing.md }}>
									<InputField label="Slot" type="number" />
									<div>
										<label style={{ display: 'block', marginBottom: '6px', fontSize: fontSize.sm, color: colors.text, fontWeight: 500 }}>
											Duration
										</label>
										<div style={{ display: 'flex', gap: spacing.sm }}>
											<InputField 
												placeholder="Day" 
												type="number" 
												value={tripDays}
												onChange={(e) => handleDayInputChange(e.target.value)}
											/>
											<InputField placeholder="Night" type="number" />
										</div>
									</div>
									<div>
										<label style={{ display: 'block', marginBottom: '6px', fontSize: fontSize.sm, color: '#333', fontWeight: 600 }}>
											Destination Type
										</label>
										<select value={destType} onChange={(e) => setDestType(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: radius.sm, border: '1px solid #D4C5B0', fontSize: fontSize.base, fontFamily: 'inherit', backgroundColor: '#FEFDFB', boxSizing: 'border-box', outline: 'none' }}>
											<option value="">Select Type</option>
											{DEST_OPTIONS.map(opt => (
												<option key={opt} value={opt}>{opt}</option>
											))}
											<option value="Other">Other</option>
										</select>
										{destType === 'Other' && (
											<div style={{ marginTop: spacing.sm }}>
												<InputField label="Custom Destination Type" type="text" value={destTypeCustom} onChange={(e) => setDestTypeCustom(e.target.value)} />
											</div>
										)}
									</div>
								</div>

								<div style={{ marginBottom: spacing.md }}>
									<InputField 
										label="Description" 
										type="textarea" 
										rows={4} 
										style={{ resize: 'vertical', minHeight: '80px' }} 
									/>
								</div>
							</TripCard>

							{/* Pick Up Point Section */}
							<TripCard>
								<CardHeader>Pick Up Point</CardHeader>
								<div style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
									{pickupPoints.map((point) => (
										<div
											key={point.id}
											style={{
												display: 'flex',
												justifyContent: 'space-between',
												alignItems: 'center',
												padding: '6px 0',
											}}
										>
											<label style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, cursor: 'pointer', flex: 1 }}>
												<input
													type="checkbox"
													checked={point.checked}
													onChange={() => {
														setPickupPoints(
															pickupPoints.map((p) =>
																p.id === point.id ? { ...p, checked: !p.checked } : p
															)
														);
													}}
													style={{ width: 16, height: 16, cursor: 'pointer' }}
												/>
												<span style={{ fontSize: fontSize.sm }}>
														<span style={{ color: colors.accent3, fontWeight: 600 }}>[{point.price}]</span>{' '}
													{point.location}
												</span>
											</label>
											<div style={{ display: 'flex', gap: spacing.xs }}>
											<IconButton icon={<FontAwesomeIcon icon={faPencil} />} onClick={() => handleEditPickupPoint(point)} />
											<IconButton icon={<FontAwesomeIcon icon={faTrash} />} onClick={() => handleDeletePickupPoint(point.id)} />
											</div>
										</div>
									))}
								</div>
								<TextLink onClick={() => { setPickupError(''); setShowPickupModal(true); }}>+ Others</TextLink>
							</TripCard>

							{/* Include Section */}
							<TripCard>
								<CardHeader>Include</CardHeader>
								<div style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
									{includes.map((item) => (
										<div
											key={item.id}
											style={{
												display: 'flex',
												justifyContent: 'space-between',
												alignItems: 'center',
												padding: '6px 0',
											}}
										>
											<label style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, cursor: 'pointer', flex: 1 }}>
												<input
													type="checkbox"
													checked={item.checked}
													onChange={() => {
														setIncludes(
															includes.map((i) =>
																i.id === item.id ? { ...i, checked: !i.checked } : i
															)
														);
													}}
													style={{ width: 16, height: 16, cursor: 'pointer' }}
												/>
												<span style={{ fontSize: fontSize.sm }}>{item.name}</span>
											</label>
											<div style={{ display: 'flex', gap: spacing.xs }}>
												<IconButton icon={<FontAwesomeIcon icon={faPencil} />} onClick={() => handleEditInclude(item)} />
												<IconButton icon={<FontAwesomeIcon icon={faTrash} />} onClick={() => handleDeleteInclude(item.id)} />
											</div>
										</div>
									))}
								</div>
								<TextLink onClick={() => { setIncludeError(''); setShowIncludeModal(true); }}>+ Others</TextLink>
							</TripCard>
						</div>
					</div>

					{/* Trip Planner Section */}
					<div style={{ marginTop: spacing.xl }}>
						<h2 style={{ fontSize: fontSize.xl, fontWeight: 1000, color: colors.accent5, marginBottom: spacing.lg }}>
							Trip Planner
						</h2>
						
						<div style={{ display: 'flex', gap: spacing.md, alignItems: 'center', marginBottom: spacing.md }}>
							<label style={{ fontWeight: 600, color: colors.text }}>Day</label>
							<select
								value={openDay}
								onChange={(e) => setOpenDay(parseInt(e.target.value))}
								style={{ padding: `${spacing.sm} ${spacing.md}`, borderRadius: radius.md, border: `1px solid ${colors.accent5}20`, backgroundColor: colors.bg }}
							>
								{Array.from({ length: tripDays }, (_, i) => i + 1).map(d => (
									<option key={d} value={d}>{d}</option>
								))}
							</select>
						</div>

						{/* Day Activities Table (single selected day) */}
						{tripPlanner[openDay] && (
							<div style={{
								backgroundColor: colors.bg,
								borderRadius: radius.md,
								overflow: 'hidden',
								border: `1px solid ${colors.accent5}20`
							}}>
								<table style={{ width: '100%', borderCollapse: 'collapse' }}>
									<thead>
										<tr style={{ backgroundColor: colors.accent5 }}>
											<th style={{ padding: spacing.md, textAlign: 'center', fontWeight: 600, fontSize: fontSize.sm, color: colors.bg, borderBottom: `3px solid ${colors.accent4}`}}>Time</th>
											<th style={{ padding: spacing.md, textAlign: 'center', fontWeight: 600, fontSize: fontSize.sm, color: colors.bg, borderBottom: `3px solid ${colors.accent4}` }}>Duration (hrs)</th>
											<th style={{ padding: spacing.md, textAlign: 'center', fontWeight: 600, fontSize: fontSize.sm, color: colors.bg, borderBottom: `3px solid ${colors.accent4}` }}>Activity</th>
											<th style={{ padding: spacing.md, textAlign: 'center', fontWeight: 600, fontSize: fontSize.sm, color: colors.bg, borderBottom: `3px solid ${colors.accent4}` }}>Location</th>
											<th style={{ padding: spacing.md, textAlign: 'center', fontWeight: 600, fontSize: fontSize.sm, color: colors.bg, borderBottom: `3px solid ${colors.accent4}` }}>Action</th>
										</tr>
									</thead>
									<tbody>
										{(tripPlanner[openDay] || []).map((activity) => (
											<tr key={activity.id} style={{borderBottom: `1px solid ${colors.accent4}`}}>
												<td style={{ padding: spacing.sm }}>
													<input
														type="text"
														value={activity.time}
														onChange={(e) => handleActivityChange(openDay, activity.id, 'time', e.target.value)}
														placeholder="06.00 - 07.00"
														style={{
															width: '100%',
															padding: spacing.sm,
															border: '1px solid #D4C4A8',
															borderRadius: radius.sm,
															backgroundColor: '#F9F5EE',
															fontSize: fontSize.sm,
															outline: 'none'
														}}
													/>
												</td>
												<td style={{ padding: spacing.sm }}>
													<input
														type="number"
														value={activity.duration}
														onChange={(e) => handleActivityChange(openDay, activity.id, 'duration', e.target.value)}
														placeholder="1"
														style={{
															width: '100%',
															padding: spacing.sm,
															border: '1px solid #D4C4A8',
															borderRadius: radius.sm,
															backgroundColor: '#F9F5EE',
															fontSize: fontSize.sm,
															outline: 'none'
															}}
													/>
												</td>
												<td style={{ padding: spacing.sm }}>
													<input
														type="text"
														value={activity.activity}
														onChange={(e) => handleActivityChange(openDay, activity.id, 'activity', e.target.value)}
														placeholder="Meeting point & briefing"
														style={{
															width: '100%',
															padding: spacing.sm,
															border: '1px solid #D4C4A8',
															borderRadius: radius.sm,
															backgroundColor: '#F9F5EE',
															fontSize: fontSize.sm,
															outline: 'none'
															}}
													/>
												</td>
												<td style={{ padding: spacing.sm }}>
													<input
														type="text"
														value={activity.location}
														onChange={(e) => handleActivityChange(openDay, activity.id, 'location', e.target.value)}
														placeholder="Bandar Udara Komodo"
														style={{
															width: '100%',
															padding: spacing.sm,
															border: '1px solid #D4C4A8',
															borderRadius: radius.sm,
															backgroundColor: '#F9F5EE',
															fontSize: fontSize.sm,
															outline: 'none'
															}}
													/>
												</td>
												<td style={{ padding: spacing.sm }}>
													<div style={{ display: 'flex', gap: spacing.xs, justifyContent: 'center', alignItems: 'center' }}>
														<IconButton 
															icon={<FontAwesomeIcon icon={faTrash} />}
															onClick={() => handleDeleteActivity(openDay, activity.id)}
															style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, padding: 0 }}
														/>
													</div>
												</td>
											</tr>
										))}
									</tbody>
								</table>

								{/* Add New Activity Button */}
								<div style={{ padding: spacing.md, textAlign: 'center', borderTop: '1px solid #E8D4B8' }}>
									<button
										onClick={() => handleAddActivity(openDay)}
										style={{
											width: '40px',
											height: '40px',
											borderRadius: '50%',
											border: `2px solid ${colors.accent5}`,
											backgroundColor: 'transparent',
											color: colors.accent5,
											cursor: 'pointer',
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'center',
											fontSize: fontSize.lg,
											margin: '0 auto'
											}}
									>
										<FontAwesomeIcon icon={faPlus} />
									</button>
								</div>
							</div>
						)}

						{/* Create Trip Button */}
						<div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: spacing.lg }}>
							<Button variant="primary" style={{ minWidth: '200px', padding: `${spacing.md} ${spacing.xl}` }}>
								<FontAwesomeIcon icon={faPlus} /> Create Trip
							</Button>
						</div>
					</div>
				</div>
			</div>

						{/* Modal for Add Custom Include */}
						{showIncludeModal && (
							<Modal open={showIncludeModal} onClose={() => { setShowIncludeModal(false); setNewIncludeName(''); }} title="Add Custom Include">
								<div style={{ marginBottom: spacing.lg }}>
									<label style={{ display: 'block', marginBottom: spacing.sm, fontWeight: 500 }}>Include Name</label>
									<input
										type="text"
										value={newIncludeName}
										onChange={(e) => { setNewIncludeName(e.target.value); setIncludeError(''); }}
										style={{
											width: '100%',
											padding: spacing.md,
											border: 'none',
											borderRadius: radius.md,
											fontSize: fontSize.base,
											outline: 'none'
										}}
									/>
								</div>
								{includeError && (
									<div style={{ color: colors.error, marginBottom: spacing.md }}>{includeError}</div>
								)}

								<div style={{ display: 'flex', gap: spacing.md }}>
									<Button variant="primary" onClick={handleAddInclude} style={{ display: 'inline-flex' }}>
										<FontAwesomeIcon icon={faCheck} /> Confirm
									</Button>
									<Button variant="primary" onClick={() => { setShowIncludeModal(false); setNewIncludeName(''); }} style={{ display: 'inline-flex' }}>
										<FontAwesomeIcon icon={faXmark} /> Cancel
									</Button>
								</div>
							</Modal>
						)}

						{/* Modal for Edit Schedule */}
						{showEditScheduleModal && (
							<Modal open={showEditScheduleModal} onClose={() => { setShowEditScheduleModal(false); setEditingSchedule(null); }} title="Edit Schedule">
								<div style={{ marginBottom: spacing.md }}>
									<label style={{ display: 'block', marginBottom: spacing.sm, fontWeight: 500 }}>Start Date</label>
									<input
										type="date"
										value={editScheduleStartDate}
										onChange={(e) => { setEditScheduleStartDate(e.target.value); setEditScheduleError(''); }}
										style={{
											width: '100%',
											padding: spacing.md,
											border: 'none',
											borderRadius: radius.md,
											fontSize: fontSize.base,
											outline: 'none'
										}}
									/>
								</div>

								<div style={{ marginBottom: spacing.lg }}>
									<label style={{ display: 'block', marginBottom: spacing.sm, fontWeight: 500 }}>End Date</label>
									<input
										type="date"
										value={editScheduleEndDate}
										onChange={(e) => { setEditScheduleEndDate(e.target.value); setEditScheduleError(''); }}
										style={{
											width: '100%',
											padding: spacing.md,
											border: 'none',
											borderRadius: radius.md,
											fontSize: fontSize.base,
											outline: 'none'
										}}
									/>
								</div>
								{editScheduleError && (
									<div style={{ color: colors.error, marginBottom: spacing.md }}>{editScheduleError}</div>
								)}

								<div style={{ display: 'flex', gap: spacing.md }}>
									<Button variant="primary" onClick={handleSaveEditSchedule} style={{ display: 'inline-flex' }}>
										<FontAwesomeIcon icon={faCheck} /> Confirm
									</Button>
									<Button variant="primary" onClick={() => { setShowEditScheduleModal(false); setEditingSchedule(null); }} style={{ display: 'inline-flex' }}>
										<FontAwesomeIcon icon={faXmark} /> Cancel
									</Button>
								</div>
							</Modal>
						)}

						{/* Modal for Edit Pick Up Point */}
						{showEditPickupModal && editingPickup && (
							<Modal open={showEditPickupModal} onClose={() => { setShowEditPickupModal(false); setEditingPickup(null); }} title="Edit Pick Up Point">
								<div style={{ marginBottom: spacing.md }}>
									<label style={{ display: 'block', marginBottom: spacing.sm, fontWeight: 500 }}>Pick Up Point Name</label>
									<input
										type="text"
										value={editingPickup.location}
										onChange={(e) => setEditingPickup({ ...editingPickup, location: e.target.value })}
										style={{
											width: '100%',
											padding: spacing.md,
											border: 'none',
											borderRadius: radius.md,
											fontSize: fontSize.base,
											outline: 'none'
										}}
									/>
								</div>

								<div style={{ marginBottom: spacing.lg }}>
									<label style={{ display: 'block', marginBottom: spacing.sm, fontWeight: 500 }}>Price</label>
									<input
										type="text"
										value={editingPickup.price}
										onChange={(e) => { setEditingPickup({ ...editingPickup, price: e.target.value }); setEditPickupError(''); }}
										style={{
											width: '100%',
											padding: spacing.md,
											border: 'none',
											borderRadius: radius.md,
											fontSize: fontSize.base,
											outline: 'none'
										}}
									/>
								</div>
								{editPickupError && (
									<div style={{ color: colors.error, marginBottom: spacing.md }}>{editPickupError}</div>
								)}

								<div style={{ display: 'flex', gap: spacing.md }}>
									<Button variant="primary" onClick={handleSaveEditPickupPoint} style={{ display: 'inline-flex' }}>
										<FontAwesomeIcon icon={faCheck} /> Confirm
									</Button>
									<Button variant="primary" onClick={() => { setShowEditPickupModal(false); setEditingPickup(null); }} style={{ display: 'inline-flex' }}>
										<FontAwesomeIcon icon={faXmark} /> Cancel
									</Button>
								</div>
							</Modal>
						)}

						{/* Modal for Edit Include */}
						{showEditIncludeModal && editingInclude && (
							<Modal open={showEditIncludeModal} onClose={() => { setShowEditIncludeModal(false); setEditingInclude(null); }} title="Edit Include">
								<div style={{ marginBottom: spacing.lg }}>
									<label style={{ display: 'block', marginBottom: spacing.sm, fontWeight: 500 }}>Include Name</label>
									<input
										type="text"
										value={editingInclude.name}
										onChange={(e) => { setEditingInclude({ ...editingInclude, name: e.target.value }); setEditIncludeError(''); }}
										style={{
											width: '100%',
											padding: spacing.md,
											border: 'none',
											borderRadius: radius.md,
											fontSize: fontSize.base,
											outline: 'none'
										}}
									/>
								</div>
								{editIncludeError && (
									<div style={{ color: colors.error, marginBottom: spacing.md }}>{editIncludeError}</div>
								)}

								<div style={{ display: 'flex', gap: spacing.md }}>
									<Button variant="primary" onClick={handleSaveEditInclude} style={{ display: 'inline-flex' }}>
										<FontAwesomeIcon icon={faCheck} /> Confirm
									</Button>
									<Button variant="primary" onClick={() => { setShowEditIncludeModal(false); setEditingInclude(null); }} style={{ display: 'inline-flex' }}>
										<FontAwesomeIcon icon={faXmark} /> Cancel
									</Button>
								</div>
							</Modal>
						)}

						{/* Modal for Add Custom Pick Up Point */}
						{showPickupModal && (
							<Modal open={showPickupModal} onClose={() => { setShowPickupModal(false); setNewPickupPrice(''); setNewPickupLocation(''); }} title="Add Custom Pick Up Point">
								<div style={{ marginBottom: spacing.md }}>
									<label style={{ display: 'block', marginBottom: spacing.sm, fontWeight: 500 }}>Pick Up Point Name</label>
									<input
										type="text"
										value={newPickupLocation}
										onChange={(e) => { setNewPickupLocation(e.target.value); setPickupError(''); }}
										style={{
											width: '100%',
											padding: spacing.md,
											border: 'none',
											borderRadius: radius.md,
											fontSize: fontSize.base,
											outline: 'none'
										}}
									/>
								</div>

								<div style={{ marginBottom: spacing.lg }}>
									<label style={{ display: 'block', marginBottom: spacing.sm, fontWeight: 500 }}>Price</label>
									<input
										type="text"
										value={newPickupPrice}
										onChange={(e) => { setNewPickupPrice(e.target.value); setPickupError(''); }}
										style={{
											width: '100%',
											padding: spacing.md,
											border: 'none',
											borderRadius: radius.md,
											fontSize: fontSize.base,
											outline: 'none'
										}}
									/>
								</div>
								{pickupError && (
									<div style={{ color: colors.error, marginBottom: spacing.md }}>{pickupError}</div>
								)}

								<div style={{ display: 'flex', gap: spacing.md }}>
									<Button variant="primary" onClick={handleAddPickupPoint} style={{ display: 'inline-flex' }}>
										<FontAwesomeIcon icon={faCheck} /> Confirm
									</Button>
									<Button variant="primary" onClick={() => { setShowPickupModal(false); setNewPickupPrice(''); setNewPickupLocation(''); }} style={{ display: 'inline-flex' }}>
										<FontAwesomeIcon icon={faXmark} /> Cancel
									</Button>
								</div>
							</Modal>
						)}
		</>
	);
};

export default NewTripPage;
