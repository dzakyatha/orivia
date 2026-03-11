import React, { useState, useEffect } from 'react'
import tripexplore from '../../assets/images/tripexplorebg.png'
import Navbar from '../../components/ui/Navbar.jsx'
import Button from '../../components/ui/Button'
import Card, { TripCard, IconButton } from '../../components/ui/Card.jsx'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronLeft, faChevronRight, faDownload, faCreditCard, faShoppingCart } from '@fortawesome/free-solid-svg-icons';
import { colors, spacing, radius, fontSize, shadows, fontFamily } from '../../styles/variables.jsx'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { fetchPlannerTrips, fetchPlannerTripDetail } from '../../services/tripService'
import { createMultiPassengerBooking } from '../../services/bookingService'
import countryList from 'react-select-country-list'
import ovoLogo from '../../assets/logo/ovo.png'
import gopayLogo from '../../assets/logo/gopay.png'
import qrisLogo from '../../assets/logo/qris.png'

const styles = {
	page: {
		minHeight: '100vh',
		backgroundImage: 'url("https://images.unsplash.com/photo-1584715625116-c1dbbfcf19be?q=80&w=2000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D")',
		fontFamily: fontFamily.base
	},
	container: {
		display: 'grid',
		gridTemplateColumns: '1fr 360px',
		gap: spacing.lg,
		maxWidth: 1200,
		margin: '0 auto',
		padding: spacing.xl
	},
	leftCard: {
		background: 'transparent',
		width: '100%',
		display: 'flex',
		flexDirection: 'column',
	},
	thumbnail: {
		width: 200,
		height: 80,
		borderRadius: radius.sm,
		backgroundSize: 'cover',
		backgroundPosition: 'center'
	},
	h3: { margin: 0, fontSize: fontSize.lg, color: '#253129' },
	meta: { color: colors.textLight, fontSize: fontSize.sm, marginTop: 6 },
	grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: spacing.sm },
	input: { width: '100%', padding: '10px 12px', borderRadius: radius.sm, border: `1px solid #E6E0D6` },
	textarea: { width: '100%', minHeight: 84, padding: 12, borderRadius: radius.sm, border: `1px solid #E6E0D6` },
	arrowBtn: { width: 36, height: 36, borderRadius: radius.sm, border: `1px solid #E6E0D6`, background: colors.bg, cursor: 'pointer' },
	summary: { position: 'sticky', top: 32, alignSelf: 'start', background: colors.bg, padding: spacing.lg, borderRadius: radius.md, boxShadow: shadows.lg },
	summaryTitle: { fontWeight: 700, color: colors.accent5, marginBottom: spacing.xs, fontSize: fontSize.lg },
	priceTotal: { color: colors.accent5, fontWeight: 800, fontSize: fontSize.lg }
}

const CheckoutPage = () => {
	const navigate = useNavigate()
	const location = useLocation()
	
	// Checkout state
	const [activeStep, setActiveStep] = useState(0)
	const [paymentMethod, setPaymentMethod] = useState('')
	
	// Passenger management
	const [passengers, setPassengers] = useState(1)
	const [current, setCurrent] = useState(0)
	const [data, setData] = useState([])
	
	// Trip data from database
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(null)
	const [selectedTrip, setSelectedTrip] = useState(null)
	const [selectedSchedule, setSelectedSchedule] = useState(null)
	
	// Booking submission state
	const [bookingSubmitting, setBookingSubmitting] = useState(false)
	const [bookingResult, setBookingResult] = useState(null)

	// Country list for nationality dropdown
	const countryOptions = (typeof countryList === 'function') ? (countryList().getData ? countryList().getData() : []) : []
	const countryNames = countryOptions.map((c) => c.label || c.value || '')

	// Load trip data from database on mount
	useEffect(() => {
		let mounted = true
		
		async function loadTripData() {
			setLoading(true)
			setError(null)
			
			try {
				// Get tripId and scheduleId from location state or query params
				let tripId = null
				let scheduleId = null
				
				if (location && location.state) {
					scheduleId = location.state.scheduleId || location.state.schedule || null
					tripId = location.state.tripId || null
				}
				
				const qp = new URLSearchParams(location.search)
				if (!tripId && qp.get('tripId')) tripId = qp.get('tripId')
				if (!scheduleId && qp.get('scheduleId')) scheduleId = Number(qp.get('scheduleId'))
				
				// If we only have scheduleId, fetch all trips to find the tripId
				if (scheduleId && !tripId) {
					console.log('[CheckoutPage] Fetching trips to find schedule:', scheduleId)
					const allTripsData = await fetchPlannerTrips()
					if (!mounted) return
					
					const foundSchedule = (allTripsData.tripSchedules || []).find(
						s => Number(s.scheduleId) === Number(scheduleId)
					)
					
					if (foundSchedule) {
						tripId = foundSchedule.tripId || foundSchedule.trip_id || foundSchedule.id_rencana
						setSelectedSchedule(foundSchedule)
						console.log('[CheckoutPage] Found schedule and tripId:', tripId)
					}
				}
				
				if (!tripId) {
					setError('No trip ID provided')
					setLoading(false)
					return
				}
				
				// Fetch detailed trip data
				console.log('[CheckoutPage] Fetching trip detail for:', tripId)
				const tripDetail = await fetchPlannerTripDetail(tripId)
				
				if (!mounted) return
				
				console.log('[CheckoutPage] Loaded trip:', tripDetail)
				setSelectedTrip(tripDetail)

				// If selectedSchedule is missing start_date, try to populate it from tripDetail raw planner fields
				try {
					const raw = tripDetail._raw || tripDetail._plannerRaw || {}
					const start = tripDetail.startDate || raw.durasi_mulai || raw.departure_date || raw.start_date || null
					const end = tripDetail.endDate || raw.durasi_selesai || raw.end_date || null
					setSelectedSchedule((prev) => {
						if (prev && prev.start_date) return prev
						return {
							scheduleId: prev?.scheduleId || 1,
							tripId: tripDetail.tripId,
							start_date: start,
							end_date: end,
							status: prev?.status || 'ACTIVE',
							slotAvailable: tripDetail.slot || 0,
							location: prev?.location || tripDetail.location?.state || raw.provinsi || ''
						}
					})
				} catch (e) {
					// silently ignore
				}
				
				// If we don't have a schedule yet, build one from trip detail or planner raw fields
				if (!scheduleId && tripDetail) {
					// Prefer explicit startDate/endDate, then planner raw fields (durasi_mulai/durasi_selesai),
					// then fallback to other common field names.
					const raw = tripDetail._raw || tripDetail._plannerRaw || {}
					const start = tripDetail.startDate || raw.durasi_mulai || raw.departure_date || raw.start_date || null
					const end = tripDetail.endDate || raw.durasi_selesai || raw.end_date || null
					setSelectedSchedule({
						scheduleId: 1,
						tripId: tripDetail.tripId,
						start_date: start,
						end_date: end,
						status: 'ACTIVE',
						slotAvailable: tripDetail.slot || 0,
						location: tripDetail.location?.state || raw.provinsi || ''
					})
				}
				
			} catch (err) {
				console.error('[CheckoutPage] Error loading trip:', err)
				if (mounted) {
					setError(err.message || 'Failed to load trip data')
				}
			} finally {
				if (mounted) {
					setLoading(false)
				}
			}
		}
		
		loadTripData()
		
		return () => {
			mounted = false
		}
	}, [location])

	// Ensure data array matches passengers count
	useEffect(() => {
		setData((prev) => {
			const defaults = { firstName: '', lastName: '', phone: '', nationality: '', dob: '', gender: '', pickup: '', notes: '' }
			const next = prev.map((p) => ({ ...defaults, ...p }))
			while (next.length < passengers) next.push({ ...defaults })
			while (next.length > passengers) next.pop()
			return next
		})
		if (current > passengers - 1) setCurrent(passengers - 1)
	}, [passengers, current])

	// Update a field for a specific passenger
	function updateField(idx, field, value) {
		setData((prev) => {
			const copy = [...prev]
			copy[idx] = { ...copy[idx], [field]: value }
			return copy
		})
	}

	function prevPassenger() { setCurrent((c) => (c === 0 ? passengers - 1 : c - 1)) }
	function nextPassenger() { setCurrent((c) => (c === passengers - 1 ? 0 : c + 1)) }

	// Submit booking to backend
	async function submitBooking() {
		// Check authentication first
		const token = localStorage.getItem('authToken')
		console.log('[CheckoutPage] submitBooking - checking token...', token ? 'Token exists' : 'NO TOKEN')
		
		if (!token) {
			alert('You must be logged in to create a booking. Please login first.')
			setBookingSubmitting(false)
			return false
		}
		
		// Validate all passengers have required fields
		const missingFields = []
		data.forEach((passenger, index) => {
			if (!passenger.firstName || !passenger.lastName || !passenger.phone || 
			    !passenger.nationality || !passenger.dob || !passenger.gender || !passenger.pickup) {
				missingFields.push(index + 1)
			}
		})
		
		if (missingFields.length > 0) {
			alert(`Please complete all required fields for passenger(s): ${missingFields.join(', ')}`)
			return false
		}
		
		if (!paymentMethod) {
			alert('Please select a payment method')
			return false
		}
		
		try {
			setBookingSubmitting(true)
			
			// Prepare participants data with trip_pickup_id
			const participants = data.map(passenger => {
				// Find the pickup point object to get its UUID
				const pickupPoint = selectedTrip?.pickup_points?.find(
					pp => pp.location === passenger.pickup
				)
				
				return {
					first_name: passenger.firstName,
					last_name: passenger.lastName,
					phone_number: passenger.phone,
					gender: passenger.gender,
					nationality: passenger.nationality,
					date_of_birth: passenger.dob,
					pickup_location: passenger.pickup,
					trip_pickup_id: pickupPoint?.id || null,
					notes: passenger.notes || ''
				}
			})
			
			// Submit booking
			const bookingData = {
				id_rencana: selectedTrip?.tripId || selectedTrip?.id,
				participants: participants,
				payment_method: paymentMethod
			}
			
			console.log('[CheckoutPage] Submitting booking data:', bookingData)
			console.log('[CheckoutPage] Token being used:', token.substring(0, 50) + '...')
			
			const result = await createMultiPassengerBooking(bookingData)
			console.log('[CheckoutPage] Booking created successfully:', result)
			
			setBookingResult(result)
			setBookingSubmitting(false)
			return true
			
		} catch (err) {
			console.error('[CheckoutPage] Error submitting booking:', err)
			console.error('[CheckoutPage] Error detail:', err.detail || err.message)
			if (err.response) {
				console.error('[CheckoutPage] Response status:', err.response.status)
				console.error('[CheckoutPage] Response data:', err.response.data)
			}
			
			setBookingSubmitting(false)
			
			// Show specific error messages
			if (err.response?.status === 401) {
				alert('Authentication failed. Please login again.')
			} else if (err.response?.status === 400) {
				alert(`Invalid booking data: ${err.response.data?.detail || err.message}`)
			} else {
				alert(`Failed to create booking: ${err.detail || err.message || 'Unknown error'}. Check console for details.`)
			}
			
			return false
		}
	}

	const tripPrice = selectedTrip?.price || 0

	// Calculate pickup total
	const pickupTotal = (data || []).reduce((sum, p) => sum + getPickupPrice(p.pickup, selectedTrip), 0)
	
	// Get unique pickup points selected
	const pickupUnique = (() => {
		try {
			const picks = (data || []).map((p) => p.pickup).filter(Boolean)
			if (picks.length === 0) return []
			return Array.from(new Set(picks))
		} catch (e) {
			return []
		}
	})()

	// Download invoice function
	function downloadInvoice() {
		const lines = ['=== BOOKING INVOICE ===', '']
		if (bookingResult) {
			lines.push(`Booking ID: ${bookingResult.booking_id}`)
			lines.push(`Status: ${bookingResult.booking_status}`)
			lines.push('')
		}
		lines.push(`Trip: ${selectedTrip?.name || 'N/A'}`)
		lines.push(`Duration: ${selectedTrip?.duration?.days || 0}D${selectedTrip?.duration?.nights || 0}N`)
		lines.push(`Location: ${selectedTrip?.location?.state || ''}${selectedTrip?.location?.country ? ', ' + selectedTrip?.location?.country : ''}`)
		lines.push(`Dates: ${selectedSchedule ? formatDateRange(selectedSchedule.start_date, selectedSchedule.end_date) : 'N/A'}`)
		lines.push(`Price per person: Rp${tripPrice.toLocaleString('id-ID')}`)
		lines.push(`Passengers: ${passengers}`)
		lines.push(`Subtotal: Rp${(tripPrice * passengers).toLocaleString('id-ID')}`)
		lines.push(`Pickup Fee: Rp${pickupTotal.toLocaleString('id-ID')}`)
		lines.push(`TOTAL: Rp${((tripPrice * passengers) + pickupTotal).toLocaleString('id-ID')}`)
		lines.push('')
		lines.push('=== PASSENGER DETAILS ===')
		data.forEach((p, i) => {
			const pickupText = p.pickup || 'Not selected'
			const pp = selectedTrip?.pickup_points ? selectedTrip.pickup_points.find((x) => x.location === p.pickup) : null
			const pickupPrice = pp && pp.price ? Number(pp.price) : 0
			const pickupSuffix = pickupPrice ? ` (Rp${pickupPrice.toLocaleString('id-ID')})` : ''
			lines.push(`${i + 1}. ${(p.firstName || '') + (p.lastName ? ` ${p.lastName}` : '')} — ${p.phone || ''} — ${p.nationality || ''} — Pickup: ${pickupText}${pickupSuffix}`)
		})
		const blob = new Blob([lines.join('\n')], { type: 'text/plain' })
		const url = URL.createObjectURL(blob)
		const a = document.createElement('a') 
		a.href = url
		a.download = `invoice_${bookingResult?.booking_id || 'booking'}.txt`
		document.body.appendChild(a)
		a.click()
		a.remove()
		URL.revokeObjectURL(url)
	}

	// Loading state
	if (loading) {
		return (
			<div style={styles.page}>
				<Navbar/>
				<div style={{ maxWidth: 1200, margin: '0 auto', padding: spacing.xl, textAlign: 'center', color: colors.bg }}>
					<div style={{ fontSize: fontSize.lg }}>Loading trip data...</div>
				</div>
			</div>
		)
	}

	// Error state
	if (error) {
		return (
			<div style={styles.page}>
				<Navbar/>
				<div style={{ maxWidth: 1200, margin: '0 auto', padding: spacing.xl, textAlign: 'center', color: colors.bg }}>
					<div style={{ fontSize: fontSize.lg, marginBottom: spacing.md }}>Error: {error}</div>
					<Button variant="primary" onClick={() => navigate('/explore')}>Back to Explore</Button>
				</div>
			</div>
		)
	}

	// Step Header (render function, not a React component)
	function renderStepHeader() {
		const circle = (n, label, isActive) => (
			<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, cursor: 'pointer' }} onClick={() => setActiveStep(n - 1)}>
				<div style={{width: 36, height: 36, borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', background: isActive ? colors.accent1 : 'transparent', color: isActive ? colors.accent5 : colors.accent1, border: `2px solid ${colors.accent1}`}}>{n}</div>
				<div style={{ fontWeight: 900, fontSize: fontSize.sm, color: isActive ? colors.bg : colors.accent1 }}>{label}</div>
			</div>
		)

		return (
			<div style={{ display: 'flex', alignItems: 'center', gap: spacing.md, marginBottom: spacing.md }}>
				{circle(1, 'Trip Details', activeStep === 0)}
				<div style={{ height: 2, flex: 1, background: colors.accent1 }} />
				{circle(2, 'Payment', activeStep === 1)}
				<div style={{ height: 2, flex: 1, background: colors.accent1 }} />
				{circle(3, 'Confirmation', activeStep === 2)}
			</div>
		)
	}

	// Trip Details Step (render function)
	function renderTripDetailsStep() {
		const local = data[current] || { firstName: '', lastName: '', phone: '', nationality: '', dob: '', gender: '', pickup: '', notes: '' }
		
		function setField(field, value) {
			updateField(current, field, value)
		}

		// Get trip image - use first image from images array or fallback
		const tripImage = selectedTrip?.images?.[0] || selectedTrip?.image || tripexplore

		return (
			<div style={{ ...styles.leftCard }}>
				<TripCard style={{ width: '100%', padding: spacing.lg, display: 'flex', gap: 16, alignItems: 'center', marginBottom: spacing.md, border: '0px solid #00000043', borderRadius: radius.lg, boxShadow: shadows.sm}}>
					<div style={{ ...styles.thumbnail, backgroundImage: `url(${tripImage})` }} />
					<div style={{ flex: 1 }}>
						<h3 style={styles.h3}>{selectedTrip?.name || 'Loading...'}</h3>
						<div style={styles.meta}>
							{selectedTrip ? `${selectedTrip.duration?.days || 0}D${selectedTrip.duration?.nights || 0}N • ${selectedTrip.destinationType || selectedTrip.type || ''}` : ''}
						</div>
						<div style={styles.meta}>
							{selectedSchedule ? formatDateRange(selectedSchedule.start_date, selectedSchedule.end_date) : ''}
							{selectedTrip?.location ? ` • ${selectedTrip.location.state || ''}${selectedTrip.location.country ? ', ' + selectedTrip.location.country : ''}` : ''}
						</div>
					</div>
					<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
						<button onClick={() => setPassengers((p) => Math.max(1, p - 1))} style={{ ...styles.arrowBtn }}>−</button>
						<div style={{ padding: '6px 10px', borderRadius: 8, border: `1px solid #E6E0D6` }}>{passengers}</div>
						<button onClick={() => setPassengers((p) => Math.min(6, p + 1))} style={{ ...styles.arrowBtn }}>+</button>
					</div>
				</TripCard>

				<Card style={{ width: '100%' }}>
					<div>
						<h4 style={{ margin: 0, marginBottom: spacing.lg, color: colors.accent5, fontSize: fontSize.lg }}>Passenger {current + 1}</h4>
						<div style={styles.grid2}>
							<div>
								<label style={{ display: 'block', marginBottom: 6 }}>First Name *</label>
								<input placeholder="First Name" value={local.firstName} onChange={(e) => setField('firstName', e.target.value)} style={styles.input} required />
							</div>
							<div>
								<label style={{ display: 'block', marginBottom: 6 }}>Last Name *</label>
								<input placeholder="Last Name" value={local.lastName} onChange={(e) => setField('lastName', e.target.value)} style={styles.input} required />
							</div>
							<div>
								<label style={{ display: 'block', marginBottom: 6 }}>Phone Number *</label>
								<input placeholder="08xxxxxx" value={local.phone} onChange={(e) => setField('phone', e.target.value)} style={styles.input} required />
							</div>
						</div>
						<div style={{ ...styles.grid2, marginTop: 12 }}>
							<div>
								<label style={{ display: 'block', marginBottom: 6 }}>Nationality *</label>
								<select value={local.nationality} onChange={(e) => setField('nationality', e.target.value)} style={styles.input} required>
									<option value="">Select nationality</option>
									{countryNames.map((c) => (<option key={c} value={c}>{c}</option>))}
								</select>
							</div>
							<div>
								<label style={{ display: 'block', marginBottom: 6 }}>Date of Birth *</label>
								<input type="date" value={local.dob} onChange={(e) => setField('dob', e.target.value)} style={styles.input} required />
							</div>
							<div>
								<label style={{ display: 'block', marginBottom: 6 }}>Gender *</label>
								<select value={local.gender} onChange={(e) => setField('gender', e.target.value)} style={styles.input} required>
									<option value="">Select gender</option>
									<option value="Male">Male</option>
									<option value="Female">Female</option>
								</select>
							</div>
						</div>
						<div style={{ marginTop: 12 }}>
							<div>
								<label style={{ display: 'block', marginBottom: 6 }}>Pick Up Point *</label>
								<select value={local.pickup} onChange={(e) => setField('pickup', e.target.value)} style={styles.input} required>
									<option value="">Select pick up point</option>
									{selectedTrip && selectedTrip.pickup_points && selectedTrip.pickup_points.length > 0 ? (
										selectedTrip.pickup_points.map((pp, i) => (
											<option key={i} value={pp.location}>{pp.location}{pp.price ? ` (+Rp${Number(pp.price).toLocaleString('id-ID')})` : ''}</option>
										))
									) : (
										<option value="Meeting Point">Meeting Point (No additional fee)</option>
									)}
								</select>
							</div>
							<div style={{ marginTop: 10 }}>
								<label style={{ display: 'block', marginBottom: 6 }}>Notes (Optional)</label>
								<textarea placeholder="Notes" value={local.notes} onChange={(e) => setField('notes', e.target.value)} style={styles.textarea} />
							</div>
						</div>
						{passengers > 1 && (
							<div style={{ display: 'flex', justifyContent: 'center', gap: spacing.sm, marginTop: spacing.md }}>
								<button onClick={() => { prevPassenger(); }} style={styles.arrowBtn}>◀</button>
								<div style={{ padding: '6px 10px', borderRadius: 8, border: `1px solid #E6E0D6`, display: 'flex', alignItems: 'center' }}>{current + 1} / {passengers}</div>
								<button onClick={() => { nextPassenger(); }} style={styles.arrowBtn}>▶</button>
							</div>
						)}
					</div>
				</Card>
			</div>
		)
	}

	// Payment Step (render function)
	function renderPaymentStep() {
		const LogoButton = ({ src, label, value }) => (
			<button
				onClick={async () => {
					setPaymentMethod(value)
					// Just set payment method when clicked, don't auto-submit
					// User needs to click "Pay Now" button to submit
				}}
				style={{
					border: paymentMethod === value ? `2px solid ${colors.accent5}` : `1px solid #E6E0D6`,
					borderRadius: radius.sm,
					padding: 12,
					background: colors.bg,
					cursor: 'pointer',
					display: 'flex',
					alignItems: 'center',
					gap: 10
				}}
			>
				<img src={src} alt={label} style={{ height: 28 }} />
				<div style={{ fontSize: fontSize.sm }}>{label}</div>
			</button>
		)

		return (
			<div>
				<div style={{ ...styles.leftCard }}>
					<Card style={{ width: '100%', padding: spacing.lg, marginBottom: spacing.md }}>
						<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
							<div style={{ fontSize: fontSize.lg, fontWeight: 800, color: colors.accent5, marginBottom: spacing.md }}>Payment Methods</div>
						</div>
						<div style={{ marginTop: spacing.md, display: 'flex', gap: spacing.sm }}>
							<LogoButton src={ovoLogo} label="OVO" value="ovo" />
							<LogoButton src={gopayLogo} label="GoPay" value="gopay" />
							<LogoButton src={qrisLogo} label="QRIS" value="qris" />
						</div>
					</Card>

					{paymentMethod && (
						<Card style={{ width: '100%', padding: spacing.md }}>
							<div style={{ fontSize: fontSize.md, fontWeight: 700 }}>Payment Details</div>
							<div style={{ marginTop: spacing.md }}>
								<div style={{ padding: spacing.sm, border: `1px dashed #E6E0D6`, borderRadius: radius.sm }}>
									<div style={{ fontWeight: 700, marginBottom: spacing.xs }}>{paymentMethod === 'ovo' ? 'OVO' : paymentMethod === 'gopay' ? 'GoPay' : 'QRIS'}</div>
									<div style={{ color: colors.textLight, fontSize: fontSize.sm }}>You will be redirected to complete payment using the selected provider.</div>
								</div>
							</div>
						</Card>
					)}
				</div>
			</div>
		)
	}

	// Confirmation Step (render function)
	function renderConfirmationStep() {
		const p = data[current] || {}
		
		return (
			<div>
				<div style={{ ...styles.leftCard }}>
					{bookingResult && (
						<Card style={{ width: '100%', padding: spacing.lg, marginBottom: spacing.md, background: '#e8f5e9', border: '2px solid #4caf50' }}>
							<div style={{ fontSize: fontSize.lg, fontWeight: 800, color: '#2e7d32', marginBottom: spacing.xs }}>✓ Booking Successful!</div>
							<div style={{ fontSize: fontSize.sm, color: '#1b5e20' }}>
								<div><strong>Booking ID:</strong> {bookingResult.booking_id}</div>
								<div><strong>Status:</strong> {bookingResult.booking_status}</div>
								<div style={{ marginTop: spacing.xs }}>{bookingResult.message}</div>
							</div>
						</Card>
					)}
					<Card style={{ width: '100%', padding: spacing.lg, borderRadius: radius.lg }}>
						<div style={{ fontSize: fontSize.lg, fontWeight: 800, color: colors.accent5, marginBottom: spacing.md }}>Booking Details</div>
						<div style={{ marginBottom: spacing.md }}>
							<div style={{ fontWeight: 700, color: colors.accent5, marginBottom: spacing.xs }}>Passenger {current + 1} of {passengers}</div>
							<div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: spacing.md }}>
								<div>
									<div style={{ fontWeight: 700 }}>Name</div>
									<div>{(p.firstName || '') + (p.lastName ? ` ${p.lastName}` : '')}</div>
								</div>
								<div>
									<div style={{ fontWeight: 700 }}>Phone Number</div>
									<div>{p.phone || ''}</div>
								</div>
								<div>
									<div style={{ fontWeight: 700 }}>Gender</div>
									<div>{p.gender || ''}</div>
								</div>
								<div>
									<div style={{ fontWeight: 700 }}>Nationality</div>
									<div>{p.nationality || ''}</div>
								</div>
							</div>

							<div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: spacing.md, marginTop: spacing.md }}>
								<div>
									<div style={{ fontWeight: 700 }}>Date of Birth</div>
									<div>{p.dob || ''}</div>
								</div>
								<div style={{ gridColumn: '2 / 5' }}>
									<div style={{ fontWeight: 700 }}>Pick Up Point</div>
									<div>{p.pickup || ''}</div>
								</div>
							</div>

							<div style={{ marginTop: spacing.sm }}>
								<div style={{ fontWeight: 700 }}>Notes</div>
								<div>{p.notes && p.notes.length ? p.notes : '-'}</div>
							</div>
						</div>
						{passengers > 1 && (
							<div style={{ display: 'flex', justifyContent: 'center', gap: spacing.sm, marginTop: spacing.md }}>
								<button onClick={() => { prevPassenger(); }} style={styles.arrowBtn}>◀</button>
								<div style={{ padding: '6px 10px', borderRadius: 8, border: `1px solid #E6E0D6`, display: 'flex', alignItems: 'center' }}>{current + 1} / {passengers}</div>
								<button onClick={() => { nextPassenger(); }} style={styles.arrowBtn}>▶</button>
							</div>
						)}
					</Card>
				</div>
			</div>
		)
	}

	// Main render
	return (
		<div style={styles.page}>
			<Navbar/>
			<div style={styles.container}>
				<div style={{ gridColumn: '1 / -1' }}>
					{renderStepHeader()}
				</div>
				<div>
					{activeStep === 0 && renderTripDetailsStep()}
					{activeStep === 1 && renderPaymentStep()}
					{activeStep === 2 && renderConfirmationStep()}
				</div>
				<aside style={styles.summary}>
					<div style={styles.summaryTitle}>Trip Summary</div>
					<div style={{ marginBottom: spacing.md }}>
						<div>
							<div style={{ fontWeight: 700 }}>Trip Name:</div>
							<div>{selectedTrip?.name || 'Loading...'}</div>
						</div>
						<div style={{ marginTop: spacing.xs }}>
							<div style={{ fontWeight: 700 }}>Trip Duration:</div>
							<div>{selectedTrip ? `${selectedTrip.duration?.days || 0} Day / ${selectedTrip.duration?.nights || 0} Night` : 'N/A'}</div>
						</div>
						<div style={{ marginTop: spacing.xs }}>
							<div style={{ fontWeight: 700 }}>Schedule:</div>
							<div>{selectedSchedule ? formatDateRange(selectedSchedule.start_date, selectedSchedule.end_date) : 'N/A'}</div>
						</div>
						<div style={{ marginTop: spacing.xs }}>
							<div style={{ fontWeight: 700 }}>Pick Up Point:</div>
							<div>
								{pickupUnique && pickupUnique.length ? (
									<>
										<div>{pickupUnique[0]}</div>
										{pickupUnique.slice(1).map((p, i) => (
											<div key={i} style={{ fontSize: fontSize.sm, color: colors.textLight }}>{p}</div>
										))}
									</>
								) : (
									<div>—</div>
								)}
							</div>
						</div>
					</div>

					<div style={{ ...styles.summaryTitle, marginTop: spacing.md }}>Your Price Summary</div>
					<div style={{ marginTop: 12 }}>
						<div style={{ display: 'flex', justifyContent: 'space-between' }}>
							<div style={{ color: colors.accent5, fontSize: fontSize.sm }}>Trip Price (per person)</div>
							<div style={{ color: colors.accent5, fontSize: fontSize.sm }}>Rp{tripPrice.toLocaleString('id-ID')}</div>
						</div>
						<div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
							<div style={{ color: colors.accent5, fontSize: fontSize.sm }}>Passengers</div>
							<div style={{ color: colors.accent5, fontSize: fontSize.sm }}>x {passengers}</div>
						</div>
						<div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
							<div style={{ color: colors.accent5, fontSize: fontSize.sm }}>Subtotal</div>
							<div style={{ color: colors.accent5, fontSize: fontSize.sm }}>Rp{(tripPrice * passengers).toLocaleString('id-ID')}</div>
						</div>
						<div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
							<div style={{ color: colors.accent5, fontSize: fontSize.sm }}>Pick Up Fee</div>
							<div style={{ color: colors.accent5, fontSize: fontSize.sm }}>Rp{pickupTotal.toLocaleString('id-ID')}</div>
						</div>
					</div>

					<div style={{ marginTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
						<div style={{ fontSize: fontSize.md, color: colors.accent5, fontWeight: 700 }}><strong>Total Price</strong></div>
						<div style={styles.priceTotal}>Rp{((tripPrice * passengers) + pickupTotal).toLocaleString('id-ID')}</div>
					</div>
                                
					<Button 
						variant="primary" 
						style={{ marginTop: spacing.md, width: '100%', padding: '10px 12px', fontWeight: 700 }} 
						disabled={bookingSubmitting}
						onClick={async () => {
							if (activeStep === 0) {
								// Validate all passenger fields before proceeding to payment
								const missingFields = []
								data.forEach((passenger, index) => {
									if (!passenger.firstName || !passenger.lastName || !passenger.phone || 
									    !passenger.nationality || !passenger.dob || !passenger.gender || !passenger.pickup) {
										missingFields.push(index + 1)
									}
								})
								
								if (missingFields.length > 0) {
									alert(`Please complete all required fields for passenger(s): ${missingFields.join(', ')}`)
									return
								}
								
								// All fields valid, proceed to payment step
								setActiveStep(1)
							}
							else if (activeStep === 1) {
								const success = await submitBooking()
								if (success) setActiveStep(2)
							}
							else {
								downloadInvoice()
							}
						}}
					>
						{bookingSubmitting ? 
							'Processing...' : 
							(activeStep === 0 ? 
								<><IconButton icon={<FontAwesomeIcon icon={faShoppingCart} style={{ color: colors.bg }} />} /> Request to Book</> : 
								activeStep === 1 ? 
								<><IconButton icon={<FontAwesomeIcon icon={faCreditCard} style={{ color: colors.bg }} />} /> Pay Now</> : 
								<><IconButton icon={<FontAwesomeIcon icon={faDownload} style={{ color: colors.bg }} />} /> Download Invoice</>
							)
						}
					</Button>
					{activeStep === 2 && (
						<div style={{ marginTop: spacing.sm, fontSize: fontSize.sm, textAlign: 'center' }}>
							<span style={{ color: colors.textLight, marginRight: 6 }}>See your bookings?</span>
							<Link to="/profile/customer" style={{ color: colors.accent5, fontWeight: 700, textDecoration: 'none' }}>View My Bookings</Link>
						</div>
					)}
				</aside>
			</div>
		</div>
	)
}

// Helper: get pickup price (0 when not found or not selected)
function getPickupPrice(location, trip) {
	if (!location || !trip || !trip.pickup_points) return 0
	const pp = trip.pickup_points.find((x) => x.location === location)
	return pp && pp.price ? Number(pp.price) : 0
}

// Format date in Indonesian locale
function formatDate(dateStr) {
	try {
		const d = new Date(dateStr)
		return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(d)
	} catch (e) {
		return dateStr || ''
	}
}

// Format date range showing start and end dates
function formatDateRange(start, end) {
	if (!start) return 'N/A'
	if (!end || start === end) return formatDate(start)
	try {
		const s = new Date(start)
		const e = new Date(end)
		const sameMonth = s.getFullYear() === e.getFullYear() && s.getMonth() === e.getMonth()
		if (sameMonth) {
			const dayStart = s.getDate()
			const dayEnd = e.getDate()
			const monthYear = new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(s)
			return `${dayStart}–${dayEnd} ${monthYear}`
		}
		return `${formatDate(start)} – ${formatDate(end)}`
	} catch (e) {
		return `${start} – ${end}`
	}
}

export default CheckoutPage
