
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload, faTrash, faPencil, faPlus, faCheck, faXmark, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import Navbar from '../../components/ui/Navbar';
import Modal, { modalStyles } from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import extendAgentBg from '../../assets/images/extendagentbg.jpg';
import { colors, spacing, radius, fontSize, fontFamily } from '../../styles/variables';
import { DESTINATION_TYPES } from '../../mocks/mockData.js';
import { TripCard, ImageUploadCard, InputField, IconButton, AddButton, UploadButton, CardHeader, SectionTitle, ImagePreview, TextLink } from '../../components/ui/Card';
import { saveTrip } from '../../services/tripService.js';

const NewTripPage = () => {
	const navigate = useNavigate();
	const [schedules, setSchedules] = useState([
		// { id: 1, text: '2026-02-01 - 2026-02-02' },
		// { id: 2, text: '2026-02-14 - 2026-02-15' },
		// { id: 3, text: '2026-02-27 - 2026-02-28' }
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

	const [tripDays, setTripDays] = useState('');
	const [tripPrice, setTripPrice] = useState('');
	const [tripNights, setTripNights] = useState('');
	const [description, setDescription] = useState('');
	const [destType, setDestType] = useState('');
	const [destTypeCustom, setDestTypeCustom] = useState('');
	const [tripName, setTripName] = useState('');
	const [tripSlot, setTripSlot] = useState('');
	const [tripProvinsi, setTripProvinsi] = useState('');
	const [tripNegara, setTripNegara] = useState('');
	const [isSaving, setIsSaving] = useState(false);
	const [saveError, setSaveError] = useState('');
	const [saveSuccess, setSaveSuccess] = useState(false);
	const makeEmptyRows = (count = 3) => Array.from({ length: count }, (_, i) => ({ id: i + 1, time: '', duration: '', activity: '', location: '' }));
	const [tripPlanner, setTripPlanner] = useState({
		1: makeEmptyRows(3)
	});
	const [openDay, setOpenDay] = useState(1);
	const [showIncludeModal, setShowIncludeModal] = useState(false);
	const [newIncludeName, setNewIncludeName] = useState('');
	const [showPickupModal, setShowPickupModal] = useState(false);
	const [newPickupPrice, setNewPickupPrice] = useState('');
	const [newPickupLocation, setNewPickupLocation] = useState('');
	const [showEditScheduleModal, setShowEditScheduleModal] = useState(false);
	const [editingSchedule, setEditingSchedule] = useState(null);
	const [editScheduleStartDate, setEditScheduleStartDate] = useState('');
	const [editScheduleEndDate, setEditScheduleEndDate] = useState('');
	const [newScheduleStartDate, setNewScheduleStartDate] = useState('');
	const [newScheduleEndDate, setNewScheduleEndDate] = useState('');
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
		const formatted = formatRupiah(newPickupPrice.trim());
		setPickupPoints([
			...pickupPoints,
			{ id: newId, price: formatted, location: newPickupLocation.trim(), checked: false }
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
			const formatted = formatRupiah(editingPickup.price.trim());
			setPickupPoints(pickupPoints.map(p => 
				p.id === editingPickup.id ? { ...editingPickup, price: formatted, location: editingPickup.location.trim() } : p
			));
			setShowEditPickupModal(false);
			setEditingPickup(null);
			setEditPickupError('');
		} else if (editingPickup) {
			setEditPickupError('Harga dan Lokasi harus diisi.');
		}
	};

	const handleDayInputChange = (value) => {
		const parsed = parseInt(value);
		let days = Number.isNaN(parsed) ? 1 : parsed;
		if (days < 1) days = 1;
		setTripDays(days);
		const newPlanner = { ...tripPlanner };
		for (let i = 1; i <= days; i++) {
			if (!newPlanner[i]) newPlanner[i] = makeEmptyRows(3);
		}
		Object.keys(newPlanner).forEach(k => {
			const n = parseInt(k);
			if (!Number.isNaN(n) && n > days) delete newPlanner[k];
		});
		setTripPlanner(newPlanner);
	};

	const handleNightInputChange = (value) => {
		const parsed = parseInt(value);
		let nights = Number.isNaN(parsed) ? 0 : parsed;
		if (nights < 0) nights = 0;
		setTripNights(nights);
	};

	const handleDescriptionChange = (value) => {
		if (value.length <= 400) setDescription(value);
		else setDescription(value.slice(0, 400));
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

	const formatRupiah = (val) => {
		if (val == null) return '';
		const s = String(val).replace(/\D/g, '');
		if (!s) return '';
		return s.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
	};

	const handleSaveTrip = async () => {
		setSaveError('');
		setSaveSuccess(false);
		const normalizedPrice = Number(String(tripPrice || '').replace(/\D/g, ''));

		// Validation
		if (!tripName.trim()) {
			setSaveError('Nama trip harus diisi');
			return;
		}
		if (!tripPrice || normalizedPrice <= 0) {
			setSaveError('Harga harus diisi dan lebih dari 0');
			return;
		}
		if (!tripSlot || parseInt(tripSlot) <= 0) {
			setSaveError('Slot harus diisi dan lebih dari 0');
			return;
		}
		if (!tripProvinsi.trim()) {
			setSaveError('Provinsi harus diisi');
			return;
		}
		if (!tripNegara.trim()) {
			setSaveError('Negara harus diisi');
			return;
		}
		if (!tripDays || parseInt(tripDays) < 1) {
			setSaveError('Jumlah hari harus minimal 1');
			return;
		}
		if (!schedules || schedules.length === 0) {
			setSaveError('Minimal tambahkan 1 jadwal');
			return;
		}

		// Get destination type
		const destinationType = destType === 'Other' ? destTypeCustom : destType;
		if (!destinationType.trim()) {
			setSaveError('Tipe destinasi harus dipilih');
			return;
		}

		// Get start and end dates from first schedule
		const firstSchedule = schedules[0]?.text;
		if (!firstSchedule) {
			setSaveError('Jadwal tidak valid');
			return;
		}

		const dateMatch = firstSchedule.match(/(\d{4}-\d{2}-\d{2})\s*-\s*(\d{4}-\d{2}-\d{2})/);
		if (!dateMatch) {
			setSaveError('Format tanggal tidak valid');
			return;
		}

		const durasi_mulai = dateMatch[1];
		const durasi_selesai = dateMatch[2];

		// Collect selected includes
		const selectedIncludes = includes
			.filter(inc => inc.checked)
			.map(inc => inc.name);

		// Collect selected pickup points
		const selectedPickupPoints = pickupPoints
			.filter(pnt => pnt.checked)
			.map(pnt => pnt.location);

		// Collect image URLs (from previews)
		const imageUrls = imagePreviews.filter(Boolean);

		// Collect trip planner payload by day
		const plannerPayload = Object.entries(tripPlanner || {}).reduce((acc, [dayKey, rows]) => {
			const normalizedRows = (rows || [])
				.map((row) => {
					const rawTime = (row?.time || '').trim();
					// Support legacy input like 06.00-07.00, keep only start time
					const startOnly = rawTime ? rawTime.split('-')[0].trim() : '';
					return {
						time: startOnly,
						duration: (row?.duration || '').toString().trim(),
						activity: (row?.activity || '').trim(),
						location: (row?.location || '').trim()
					};
				})
				.filter((row) => row.time || row.duration || row.activity || row.location);

			if (normalizedRows.length > 0) {
				acc[String(dayKey)] = normalizedRows;
			}

			return acc;
		}, {});

		setIsSaving(true);

		try {
			const tripData = {
				nama: tripName.trim(),
				deskripsi: description.trim(),
				harga: normalizedPrice,
				slot: parseInt(tripSlot),
				provinsi: tripProvinsi.trim(),
				negara: tripNegara.trim(),
				destination_type: destinationType.trim(),
				jumlah_hari: parseInt(tripDays),
				jumlah_malam: parseInt(tripNights) || 0,
				durasi_mulai,
				durasi_selesai,
				images: imageUrls,
				includes: selectedIncludes,
				pickup_points: selectedPickupPoints,
				trip_planner: plannerPayload
			};

			console.log('[handleSaveTrip] Saving trip:', tripData);

			const result = await saveTrip(tripData);

			console.log('[handleSaveTrip] Trip saved successfully:', result);

			setSaveSuccess(true);
			setTimeout(() => {
				// Redirect to agent page after 2 seconds
				navigate('/trip/agent');
			}, 2000);
		} catch (error) {
			console.error('[handleSaveTrip] Error saving trip:', error);
			const errorMsg = error?.message || error?.detail || 'Gagal menyimpan trip. Silakan coba lagi.';
			setSaveError(errorMsg);
		} finally {
			setIsSaving(false);
		}
	};

	const filledCount = imagePreviews.filter(Boolean).length;
	const page = {
		minHeight: '100vh',
		fontFamily: fontFamily?.base || 'Inter, system-ui, -apple-system',
		backgroundImage: 'url("https://images.unsplash.com/photo-1584715625116-c1dbbfcf19be?q=80&w=2000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D")',
		backgroundColor: colors.bg,
		backgroundSize: 'cover',
		backgroundPosition: 'center top',
		backgroundRepeat: 'no-repeat',
		paddingBottom: spacing.xl
	};
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

	return (<>
		<div style={page}>
			<Navbar style={{ position: 'sticky', top: 0, left: 0, right: 0, zIndex: 60, backgroundColor: `${colors.bg}33`, backdropFilter: 'saturate(120%) blur(6px)', borderBottom: `1px solid ${colors.bg}20` }} />
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
							<TripCard style={{ backgroundColor: 'rgb(255, 255, 255)', borderRadius: '12px', padding: '24px', boxShadow: 'rgba(0, 0, 0, 0.5) 0px 1px 3px', height: '100%' }}>
								<CardHeader>Schedule</CardHeader>
								<div style={{ display: 'flex', flexDirection: 'column', height: '270px' }}>
									<div className="custom-scrollbar" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: spacing.sm, overflowY: 'auto', paddingRight: spacing.sm }}>
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

									{/* Add Schedule (fixed area) */}
									<div style={{ padding: spacing.md, borderTop: `1px solid ${colors.accent5}20`, backgroundColor: colors.bg }}>
										<div style={{ display: 'flex', gap: spacing.sm, alignItems: 'end' }}>
											<div style={{ flex: 1 }}>
												<InputField label="Start Date" type="date" value={newScheduleStartDate} onChange={(e) => { setNewScheduleStartDate(e.target.value); setScheduleError(''); }} />
											</div>
											<div style={{ flex: 1 }}>
												<InputField label="End Date" type="date" value={newScheduleEndDate} onChange={(e) => { setNewScheduleEndDate(e.target.value); setScheduleError(''); }} />
											</div>
											<AddButton onClick={handleAddSchedule} />
										</div>
										<div style={{ height: spacing.sm }} />
										<div style={{ minHeight: fontSize.sm, lineHeight: 1, color: colors.error }}>
											{scheduleError && (
												<div style={{ color: colors.error, fontSize: fontSize.sm }}>{scheduleError}</div>
											)}
										</div>
									</div>
								</div>
							</TripCard>
						</div>

						{/* RIGHT COLUMN */}
						<div style={{ display: 'flex', flexDirection: 'column', gap: spacing.lg }}>
							{/* Trip Detail Form */}
							<TripCard>
								<CardHeader>Trip Detail</CardHeader>

								<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing.md, marginBottom: spacing.md }}>
									<InputField 
										label="Name" 
										type="text"
										value={tripName}
										onChange={(e) => setTripName(e.target.value)}
									/>
									<InputField 
										label="Price" 
										type="text"
										value={tripPrice}
										onChange={(e) => setTripPrice(e.target.value)}
									/>
								</div>

								<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing.md, marginBottom: spacing.md }}>
									<InputField 
										label="Province / State" 
										type="text"
										value={tripProvinsi}
										onChange={(e) => setTripProvinsi(e.target.value)}
									/>
									<InputField 
										label="Country" 
										type="text"
										value={tripNegara}
										onChange={(e) => setTripNegara(e.target.value)}
									/>
								</div>

								<div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 1fr', gap: spacing.md, marginBottom: spacing.md }}>
									<InputField 
										label="Slot" 
										type="number"
										value={tripSlot}
										onChange={(e) => setTripSlot(e.target.value)}
									/>
									<div>
										<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
											<label style={{ fontSize: fontSize.sm, color: colors.text, fontWeight: 500, margin: 0 }}>
												Duration
											</label>
										</div>
										<div style={{ display: 'flex', gap: spacing.sm }}>
											<div style={{ flex: 1 }}>
												<InputField
													placeholder="Day"
													type="number"
													value={tripDays}
													min={1}
													onChange={(e) => handleDayInputChange(e.target.value)}
												/>
											</div>

											<div style={{ flex: 1 }}>
												<InputField
													placeholder="Night"
													type="number"
														value={tripNights}
														min={0}
													onChange={(e) => handleNightInputChange(e.target.value)}
												/>
											</div>
										</div>
									</div>
									<div>
										<label style={{ display: 'block', marginBottom: '6px', fontSize: fontSize.sm, color: '#333', fontWeight: 600 }}>
											Destination Type
										</label>
										<select value={destType} onChange={(e) => setDestType(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: radius.sm, border: '1px solid #D4C5B0', fontSize: fontSize.base, fontFamily: 'inherit', backgroundColor: '#FEFDFB', boxSizing: 'border-box', outline: 'none' }}>
											<option value="">Select Type</option>
											{DESTINATION_TYPES.map(opt => (
												<option key={opt} value={opt}>{opt}</option>
											))}
										</select>
										{destType === 'Other' && (
											<div style={{ marginTop: spacing.sm }}>
												<InputField label="Custom Destination Type" type="text" value={destTypeCustom} onChange={(e) => setDestTypeCustom(e.target.value)} />
											</div>
										)}
									</div>
								</div>

								<div style={{ marginBottom: '0px'}}>
									<InputField 
										label="Description" 
										type="textarea" 
										rows={4} 
										value={description}
										onChange={(e) => handleDescriptionChange(e.target.value)}
										style={{ resize: 'vertical', minHeight: '99.60px', fontSize: fontSize.xs, lineHeight: '1.25', padding: '8px 12px' }} 
									/>
									<div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: spacing.xs, fontSize: fontSize.xs, color: '#6b7280' }}>
										{description.length}/400
									</div>
								</div>
							</TripCard>

							{/* Pick Up Point Section */}
							<TripCard>
								<CardHeader>Pick Up Point</CardHeader>
								<div className="custom-scrollbar" style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm, maxHeight: '90px', overflowY: 'auto', paddingRight: spacing.sm }}>
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
													<span style={{ color: colors.accent3, fontWeight: 600 }}>[Rp {formatRupiah(point.price)}]</span>{' '}
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
								<div className="custom-scrollbar" style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm, maxHeight: '140px', overflowY: 'auto', paddingRight: spacing.sm }}>
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
						<h2 style={{ fontSize: fontSize.xl, fontWeight: 1000, color: colors.accent1, marginBottom: spacing.lg }}>
							Trip Planner
						</h2>
						
						<div style={{ display: 'flex', gap: spacing.md, alignItems: 'center', marginBottom: spacing.md }}>
							<label style={{ fontWeight: 600, color: colors.bg, fontFamily: fontFamily.base }}>Day</label>
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
								border: `1px solid ${colors.accent5}20`,
								overflow: 'hidden'
							}}>
								{/* Table with scrollable body: fixed height for 3 rows; show scrollbar when >=4 rows */}
								<div className="custom-scrollbar" style={{ height: '313.8px', minHeight: '313.8px', overflowY: (tripPlanner[openDay] || []).length >= 4 ? 'scroll' : 'auto', position: 'relative' }}>
									<table style={{ width: '100%', borderCollapse: 'collapse' }}>
										<thead style={{ position: 'sticky', top: 0, zIndex: 1, backgroundColor: colors.accent5 }}>
											<tr>
												<th style={{ padding: spacing.md, textAlign: 'center', fontWeight: 600, fontSize: fontSize.sm, color: colors.bg, borderBottom: `3px solid ${colors.accent4}`, width: '12%' }}>Time</th>
												<th style={{ padding: spacing.md, textAlign: 'center', fontWeight: 600, fontSize: fontSize.sm, color: colors.bg, borderBottom: `3px solid ${colors.accent4}`, width: '8%' }}>Duration (hrs)</th>
												<th style={{ padding: spacing.md, textAlign: 'center', fontWeight: 600, fontSize: fontSize.sm, color: colors.bg, borderBottom: `3px solid ${colors.accent4}`, width: '40%' }}>Activity</th>
												<th style={{ padding: spacing.md, textAlign: 'center', fontWeight: 600, fontSize: fontSize.sm, color: colors.bg, borderBottom: `3px solid ${colors.accent4}`, width: '30%' }}>Location</th>
												<th style={{ padding: spacing.md, textAlign: 'center', fontWeight: 600, fontSize: fontSize.sm, color: colors.bg, borderBottom: `3px solid ${colors.accent4}`, width: '10%' }}>Action</th>
											</tr>
										</thead>
										<tbody>
											{(tripPlanner[openDay] || []).map((activity) => (
												<tr key={activity.id} style={{borderBottom: `1px solid ${colors.accent4}`}}>
													<td style={{ padding: spacing.sm, width: '12%' }}>
														<input
															type="text"
															value={activity.time}
															onChange={(e) => handleActivityChange(openDay, activity.id, 'time', e.target.value)}
															placeholder="06.00"
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
													<td style={{ padding: spacing.sm, width: '8%' }}>
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
													<td style={{ padding: spacing.sm, width: '40%' }}>
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
													<td style={{ padding: spacing.sm, width: '30%' }}>
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
													<td style={{ padding: spacing.sm, width: '10%' }}>
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
								</div>

								{/* Fixed Add New Activity Button */}
								<div style={{ padding: spacing.md, textAlign: 'center', borderTop: '1px solid #E8D4B8', backgroundColor: colors.bg }}>
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
							<div style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm, width: '100%', alignItems: 'flex-end' }}>
								{saveError && (
									<div style={{ 
										padding: `${spacing.md} ${spacing.lg}`,
										backgroundColor: colors.error,
										color: '#fff',
										borderRadius: radius.md,
										fontSize: fontSize.sm,
										width: '100%',
										textAlign: 'center'
									}}>
										{saveError}
									</div>
								)}
								{saveSuccess && (
									<div style={{ 
										padding: `${spacing.md} ${spacing.lg}`,
										backgroundColor: '#4caf50',
										color: '#fff',
										borderRadius: radius.md,
										fontSize: fontSize.sm,
										width: '100%',
										textAlign: 'center'
									}}>
										Trip berhasil disimpan! Redirecting...
									</div>
								)}
								<Button 
									variant="primary" 
									style={{ minWidth: '200px', padding: `${spacing.md} ${spacing.xl}` }}
									onClick={handleSaveTrip}
									disabled={isSaving}
								>
									<FontAwesomeIcon icon={faPlus} style={{ marginRight: spacing.xs }} />
									<span style={{ fontWeight: 700, fontFamily: fontFamily.base}}>
										{isSaving ? 'Saving...' : 'Save Trip'}
									</span>
								</Button>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Modal for Add Custom Include */}
						{showIncludeModal && (
										<Modal open={showIncludeModal} onClose={() => { setShowIncludeModal(false); setNewIncludeName(''); }} title="Add Custom Include">
								<div style={modalStyles.formGroup}>
									<label style={modalStyles.label}>Include Name</label>
									<input
										type="text"
										value={newIncludeName}
										onChange={(e) => { setNewIncludeName(e.target.value); setIncludeError(''); }}
										style={modalStyles.input}
									/>
								</div>
								{includeError && (
									<div style={modalStyles.errorText}>{includeError}</div>
								)}

								<div style={modalStyles.buttonContainer}>
									<Button variant="btn2" onClick={handleAddInclude} style={{ display: 'inline-flex', gap: spacing.xs }}>
										<FontAwesomeIcon icon={faCheck} /> Confirm
									</Button>
									<Button variant="btn3" onClick={() => { setShowIncludeModal(false); setNewIncludeName(''); }} style={{ display: 'inline-flex', gap: spacing.xs }}>
										<FontAwesomeIcon icon={faXmark} /> Cancel
									</Button>
								</div>
							</Modal>
						)}

						{/* Modal for Edit Schedule */}
						{showEditScheduleModal && (
							<Modal open={showEditScheduleModal} onClose={() => { setShowEditScheduleModal(false); setEditingSchedule(null); }} title="Edit Schedule">
								<div style={modalStyles.formGroupMd}>
									<label style={modalStyles.label}>Start Date</label>
									<input
										type="date"
										value={editScheduleStartDate}
										onChange={(e) => { setEditScheduleStartDate(e.target.value); setEditScheduleError(''); }}
										style={modalStyles.input}
									/>
								</div>

								<div style={modalStyles.formGroup}>
									<label style={modalStyles.label}>End Date</label>
									<input
										type="date"
										value={editScheduleEndDate}
										onChange={(e) => { setEditScheduleEndDate(e.target.value); setEditScheduleError(''); }}
										style={modalStyles.input}
									/>
								</div>
								{editScheduleError && (
									<div style={modalStyles.errorText}>{editScheduleError}</div>
								)}

								<div style={modalStyles.buttonContainer}>
									<Button variant="btn2" onClick={handleSaveEditSchedule} style={{ display: 'inline-flex', gap: spacing.xs }}>
										<FontAwesomeIcon icon={faCheck} /> Confirm
									</Button>
									<Button variant="btn3" onClick={() => { setShowEditScheduleModal(false); setEditingSchedule(null); }} style={{ display: 'inline-flex', gap: spacing.xs }}>
										<FontAwesomeIcon icon={faXmark} /> Cancel
									</Button>
								</div>
							</Modal>
						)}

						{/* Modal for Edit Pick Up Point */}
						{showEditPickupModal && editingPickup && (
							<Modal open={showEditPickupModal} onClose={() => { setShowEditPickupModal(false); setEditingPickup(null); }} title="Edit Pick Up Point">
								<div style={modalStyles.formGroupMd}>
									<label style={modalStyles.label}>Pick Up Point Name</label>
									<input
										type="text"
										value={editingPickup.location}
										onChange={(e) => setEditingPickup({ ...editingPickup, location: e.target.value })}
										style={modalStyles.input}
									/>
								</div>

								<div style={modalStyles.formGroup}>
									<label style={modalStyles.label}>Price</label>
									<input
										type="text"
										value={editingPickup.price}
										onChange={(e) => { setEditingPickup({ ...editingPickup, price: e.target.value }); setEditPickupError(''); }}
										style={modalStyles.input}
									/>
								</div>
								{editPickupError && (
									<div style={modalStyles.errorText}>{editPickupError}</div>
								)}

								<div style={modalStyles.buttonContainer}>
									<Button variant="btn2" onClick={handleSaveEditPickupPoint} style={{ display: 'inline-flex', gap: spacing.xs }}>
										<FontAwesomeIcon icon={faCheck} /> Confirm
									</Button>
									<Button variant="btn3" onClick={() => { setShowEditPickupModal(false); setEditingPickup(null); }} style={{ display: 'inline-flex', gap: spacing.xs }}>
										<FontAwesomeIcon icon={faXmark} /> Cancel
									</Button>
								</div>
							</Modal>
						)}

						{/* Modal for Edit Include */}
						{showEditIncludeModal && editingInclude && (
							<Modal open={showEditIncludeModal} onClose={() => { setShowEditIncludeModal(false); setEditingInclude(null); }} title="Edit Include">
								<div style={modalStyles.formGroup}>
									<label style={modalStyles.label}>Include Name</label>
									<input
										type="text"
										value={editingInclude.name}
										onChange={(e) => { setEditingInclude({ ...editingInclude, name: e.target.value }); setEditIncludeError(''); }}
										style={modalStyles.input}
									/>
								</div>
								{editIncludeError && (
									<div style={modalStyles.errorText}>{editIncludeError}</div>
								)}

								<div style={modalStyles.buttonContainer}>
									<Button variant="btn2" onClick={handleSaveEditInclude} style={{ display: 'inline-flex', gap: spacing.xs }}>
										<FontAwesomeIcon icon={faCheck} /> Confirm
									</Button>
									<Button variant="btn3" onClick={() => { setShowEditIncludeModal(false); setEditingInclude(null); }} style={{ display: 'inline-flex', gap: spacing.xs }}>
										<FontAwesomeIcon icon={faXmark} /> Cancel
									</Button>
								</div>
							</Modal>
						)}

						{/* Modal for Add Custom Pick Up Point */}
						{showPickupModal && (
							<Modal open={showPickupModal} onClose={() => { setShowPickupModal(false); setNewPickupPrice(''); setNewPickupLocation(''); }} title="Add Custom Pick Up Point">
								<div style={modalStyles.formGroupMd}>
									<label style={modalStyles.label}>Pick Up Point Name</label>
									<input
										type="text"
										value={newPickupLocation}
										onChange={(e) => { setNewPickupLocation(e.target.value); setPickupError(''); }}
										style={modalStyles.input}
									/>
								</div>

								<div style={modalStyles.formGroup}>
									<label style={modalStyles.label}>Price</label>
									<input
										type="text"
										value={newPickupPrice}
										onChange={(e) => { setNewPickupPrice(e.target.value); setPickupError(''); }}
										style={modalStyles.input}
									/>
								</div>
								{pickupError && (
									<div style={modalStyles.errorText}>{pickupError}</div>
								)}

								<div style={modalStyles.buttonContainer}>
									<Button variant="btn2" onClick={handleAddPickupPoint} style={{ display: 'inline-flex', gap: spacing.xs }}>
										<FontAwesomeIcon icon={faCheck} /> Confirm
									</Button>
									<Button variant="btn3" onClick={() => { setShowPickupModal(false); setNewPickupPrice(''); setNewPickupLocation(''); }} style={{ display: 'inline-flex', gap: spacing.xs }}>
										<FontAwesomeIcon icon={faXmark} /> Cancel
									</Button>
								</div>
							</Modal>
						)}
			</>
	);
};

export default NewTripPage;
