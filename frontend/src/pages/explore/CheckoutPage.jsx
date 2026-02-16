import React, { useState, useEffect } from 'react'
import tripexplore from '../../assets/images/tripexplorebg.png'
import Navbar from '../../components/ui/Navbar.jsx'
import Button from '../../components/ui/Button'
import Card, { TripCard, IconButton } from '../../components/ui/Card.jsx'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronLeft, faChevronRight, faDownload, faCreditCard, faShoppingCart } from '@fortawesome/free-solid-svg-icons';
import { colors, spacing, radius, fontSize, shadows, fontFamily } from '../../styles/variables.jsx'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { trips, tripSchedules } from '../../mocks/mockData'
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
			margin: '0 auto'
		},
		steps: {
			display: 'flex',
			gap: spacing.md,
			alignItems: 'center',
			marginBottom: spacing.md
		},
		step: (active) => ({
			display: 'flex',
			alignItems: 'center',
			gap: 12,
			color: active ? colors.bg : colors.accent5,
			background: active ? colors.accent5 : 'transparent',
			padding: '8px 12px',
			borderRadius: radius['3xl'] || 999,
			boxShadow: active ? shadows.md : 'none'
		}),

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
		radioGroup: { display: 'flex', flexDirection: 'column', gap: spacing.xs, marginTop: spacing.xs },
		arrows: { display: 'flex', justifyContent: 'flex-end', gap: spacing.sm, marginTop: spacing.md },
		arrowBtn: { width: 36, height: 36, borderRadius: radius.sm, border: `1px solid #E6E0D6`, background: colors.bg, cursor: 'pointer' },
		summary: { position: 'sticky', top: 32, alignSelf: 'start', background: colors.bg, padding: spacing.lg, borderRadius: radius.md, boxShadow: shadows.lg },
		summaryTitle: { fontWeight: 700, color: colors.accent5, marginBottom: spacing.xs, fontSize: fontSize.lg },
		priceTotal: { color: colors.accent5, fontWeight: 800, fontSize: fontSize.lg }
	}

	const CheckoutPage = () => {



		const dummyData = [
			{
				firstName: 'Nakeisha',
				lastName: 'Valya',
				phone: '0812345678910',
				nationality: 'Indonesia',
				dob: '2006-06-29',
				gender: 'Female',
				pickup: '',
				notes: 'I prefer a window seat during transportation if available, prefer a lower bunk for sleeping arrangements, and have food allergies to peanuts and shrimp.'
			},
			{
				firstName: 'Jeki',
				lastName: 'Keren',
				phone: '081298765432',
				nationality: 'Indonesia',
				dob: '2005-03-07',
				gender: 'Male',
				pickup: '',
				notes: ''
			}
		]

		const [passengers, setPassengers] = useState(dummyData.length)
		const [current, setCurrent] = useState(0)
		const [data, setData] = useState(dummyData)
		const navigate = useNavigate()

		useEffect(() => {
		// Ensure data array matches passengers count
		setData((prev) => {
			const defaults = { firstName: '', lastName: '', phone: '', nationality: '', dob: '', gender: '', pickup: '', notes: '' }
			const next = prev.map((p) => ({ ...defaults, ...p }))
			while (next.length < passengers) next.push({ ...defaults })
			while (next.length > passengers) next.pop()
			return next
		})
		if (current > passengers - 1) setCurrent(passengers - 1)
	}, [passengers])

	function updateField(idx, field, value) {
		setData((prev) => {
			const copy = [...prev]
			copy[idx] = { ...copy[idx], [field]: value }
			return copy
		})
	}

	function prevPassenger() { setCurrent((c) => (c === 0 ? passengers - 1 : c - 1)) }
	function nextPassenger() { setCurrent((c) => (c === passengers - 1 ? 0 : c + 1)) }

	const tripPrice = 4575000
	const extra = 350000

	const countryOptions = (typeof countryList === 'function') ? (countryList().getData ? countryList().getData() : []) : []
	const countryNames = countryOptions.map((c) => c.label || c.value || '')

	const [activeStep, setActiveStep] = useState(0)
	const [paymentMethod, setPaymentMethod] = useState('')

	const location = useLocation()
	const [selectedTrip, setSelectedTrip] = useState(null)
	const [selectedSchedule, setSelectedSchedule] = useState(null)

	useEffect(() => {
		// Prefer location.state values, then query params
		let tripId = null
		let scheduleId = null
		if (location && location.state) {
			scheduleId = location.state.scheduleId || location.state.schedule || null
			tripId = location.state.tripId || null
		}
		const qp = new URLSearchParams(location.search)
		if (!tripId && qp.get('tripId')) tripId = Number(qp.get('tripId'))
		if (!scheduleId && qp.get('scheduleId')) scheduleId = Number(qp.get('scheduleId'))

		if (scheduleId && !tripId) {
			const sched = tripSchedules.find((s) => Number(s.scheduleId) === Number(scheduleId))
			if (sched) tripId = Number(sched.tripId)
		}

		if (tripId) {
			const t = trips.find((x) => Number(x.tripId) === Number(tripId))
			if (t) setSelectedTrip(t)
		}

		// if we have a scheduleId, set the selected schedule too
		if (scheduleId) {
			const s = tripSchedules.find((x) => Number(x.scheduleId) === Number(scheduleId))
			if (s) setSelectedSchedule(s)
		}
	}, [location])

		function downloadInvoice() {
			const lines = []
			lines.push('Invoice - Orivia')
			lines.push(`Trip: ${selectedTrip ? selectedTrip.name : 'Labuan Bajo'}`)
			lines.push(`Passengers: ${passengers}`)
			lines.push(`Schedule: ${selectedSchedule ? formatDateRange(selectedSchedule.start_date, selectedSchedule.end_date) : 'N/A'}`)
			// include pickup total in invoice
			const invoicePickupTotal = (data || []).reduce((s, p) => {
				if (!p.pickup) return s
				const pp = selectedTrip && selectedTrip.pickup_points ? selectedTrip.pickup_points.find((x) => x.location === p.pickup) : null
				return s + (pp && pp.price ? Number(pp.price) : 0)
			}, 0)
			lines.push(`Total: Rp${((tripPrice * passengers) + extra + invoicePickupTotal).toLocaleString('id-ID')}`)
			lines.push('\nPassenger details:')
			data.forEach((p, i) => {
				const pickupText = p.pickup || ''
				const pp = selectedTrip && selectedTrip.pickup_points ? selectedTrip.pickup_points.find((x) => x.location === p.pickup) : null
				const pickupPrice = pp && pp.price ? Number(pp.price) : 0
				const pickupSuffix = pickupPrice ? ` (Rp${pickupPrice.toLocaleString('id-ID')})` : ''
				lines.push(`${i + 1}. ${(p.firstName || '') + (p.lastName ? ` ${p.lastName}` : '')} — ${p.phone || ''} — ${p.nationality || ''} — Pickup: ${pickupText}${pickupSuffix}`)
			})
			const blob = new Blob([lines.join('\n')], { type: 'text/plain' })
			const url = URL.createObjectURL(blob)
			const a = document.createElement('a')
			a.href = url
			a.download = 'invoice.txt'
			document.body.appendChild(a)
			a.click()
			a.remove()
			URL.revokeObjectURL(url)
		}

	const StepHeader = () => {
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


	const TripDetailsStep = () => {
		const defaults = { firstName: '', lastName: '', phone: '', nationality: '', dob: '', gender: '', pickup: '', notes: '' }
		const [local, setLocal] = useState(defaults)

		useEffect(() => {
			const cur = data[current] || {}
			const merged = { ...defaults, ...cur }
			setLocal(merged)
		}, [current, data])

		// Debounced sync of local -> parent `data` to avoid frequent parent updates
		useEffect(() => {
			const timer = setTimeout(() => {
				const cur = data[current] || {}
				// Only update fields that actually changed
				Object.keys(local).forEach((k) => {
					if ((cur[k] || '') !== (local[k] || '')) updateField(current, k, local[k])
				})
			}, 350)
			return () => clearTimeout(timer)
		}, [local])

		function setField(field, value) {
			setLocal((l) => ({ ...l, [field]: value }))
			// persist pickup immediately so the aside summary updates without waiting for debounce
			if (field === 'pickup') updateField(current, field, value)
		}

		function persistField(field) {
			updateField(current, field, local[field])
		}

		return (
			<div style={{ ...styles.leftCard }}>
			<TripCard style={{ width: '100%', padding: spacing.lg, display: 'flex', gap: 16, alignItems: 'center', marginBottom: spacing.md, border: '0px solid #00000043', borderRadius: radius.lg,boxShadow: shadows.sm}}>
				<div style={{ ...styles.thumbnail, backgroundImage: selectedTrip && selectedTrip.images && selectedTrip.images[1] ? `url(${selectedTrip.images[1]})` : `url(${tripexplore})` }} />
				<div style={{ flex: 1 }}>
					<h3 style={styles.h3}>{selectedTrip ? selectedTrip.name : 'Trip'}</h3>
					<div style={styles.meta}>{selectedTrip ? `${selectedTrip.duration?.days}D${selectedTrip.duration?.nights}N • ${selectedTrip.destinationType || selectedTrip.type}` : '2D8N • Island Exploration'}</div>
					<div style={styles.meta}>{selectedSchedule ? formatDateRange(selectedSchedule.start_date, selectedSchedule.end_date) : (selectedTrip ? '' : '1-2 February 2026 • East Nusa Tenggara, Indonesia')}</div>
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
								<label style={{ display: 'block', marginBottom: 6 }}>First Name</label>
								<input placeholder="First Name" value={local.firstName} onChange={(e) => setField('firstName', e.target.value)} style={styles.input} />
							</div>
							<div>
								<label style={{ display: 'block', marginBottom: 6 }}>Last Name</label>
								<input placeholder="Last Name" value={local.lastName} onChange={(e) => setField('lastName', e.target.value)} style={styles.input} />
							</div>
							<div>
								<label style={{ display: 'block', marginBottom: 6 }}>Phone Number</label>
								<input placeholder="08xxxxxx" value={local.phone} onChange={(e) => setField('phone', e.target.value)} style={styles.input} />
							</div>
						</div>
						<div style={{ ...styles.grid2, marginTop: 12 }}>
							<div>
								<label style={{ display: 'block', marginBottom: 6 }}>Nationality</label>
								<select value={local.nationality} onChange={(e) => setField('nationality', e.target.value)} style={styles.input}>
									<option value="">Select nationality</option>
									{countryNames.map((c) => (<option key={c} value={c}>{c}</option>))}
								</select>
							</div>
							<div>
								<label style={{ display: 'block', marginBottom: 6 }}>Date of Birth</label>
								<input type="date" value={local.dob} onChange={(e) => setField('dob', e.target.value)} style={styles.input} />
							</div>
							<div>
								<label style={{ display: 'block', marginBottom: 6 }}>Gender</label>
								<select value={local.gender} onChange={(e) => setField('gender', e.target.value)} style={styles.input}>
									<option value="">Select gender</option>
									<option value="male">Male</option>
									<option value="female">Female</option>
								</select>
							</div>
						</div>
						<div style={{ marginTop: 12 }}>
							<div>
								<label style={{ display: 'block', marginBottom: 6 }}>Pick Up Point</label>
									<select value={local.pickup} onChange={(e) => setField('pickup', e.target.value)} style={styles.input}>
										<option value="" disabled hidden>Select pick up point</option>
										{selectedTrip && selectedTrip.pickup_points && selectedTrip.pickup_points.map((pp, i) => (
											<option key={i} value={pp.location}>{pp.location}{pp.price ? ` (Rp${pp.price.toLocaleString('id-ID')})` : ''}</option>
										))}
									</select>
							</div>
							<div style={{ marginTop: 10 }}>
								<label style={{ display: 'block', marginBottom: 6 }}>Notes (Optional)</label>
								<textarea placeholder="Notes" value={local.notes} onChange={(e) => setField('notes', e.target.value)} style={styles.textarea} />
							</div>
						</div>
						{passengers > 1 ? (
							<div style={{ display: 'flex', justifyContent: 'center', gap: spacing.sm, marginTop: spacing.md }}>
								<button onClick={() => { prevPassenger(); }} style={styles.arrowBtn}>◀</button>
								<div style={{ padding: '6px 10px', borderRadius: 8, border: `1px solid #E6E0D6`, display: 'flex', alignItems: 'center' }}>{current + 1} / {passengers}</div>
								<button onClick={() => { nextPassenger(); }} style={styles.arrowBtn}>▶</button>
							</div>
						) : (
							<div style={styles.arrows}>
								<button onClick={() => { prevPassenger(); }} style={styles.arrowBtn}>◀</button>
								<button onClick={() => { nextPassenger(); }} style={styles.arrowBtn}>▶</button>
							</div>
						)}
                
				</div>
			</Card>
		</div>
	)
	}

	const PaymentStep = () => {
		const LogoButton = ({ src, label, value }) => (
			<button
				onClick={() => setPaymentMethod(value)}
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
								{paymentMethod === 'card' ? (
									<>
										<label style={{ display: 'block', marginBottom: 6 }}>Card Number</label>
										<input placeholder="xxxx xxxx xxxx xxxx" style={styles.input} />
										<div style={{ display: 'flex', gap: spacing.sm, marginTop: spacing.md }}>
											<input placeholder="MM/YY" style={{ ...styles.input, flex: 1 }} />
											<input placeholder="CVC" style={{ ...styles.input, width: 120 }} />
										</div>
									</>
								) : (
									<div style={{ padding: spacing.sm, border: `1px dashed #E6E0D6`, borderRadius: radius.sm }}>
										<div style={{ fontWeight: 700, marginBottom: spacing.xs }}>{paymentMethod === 'ovo' ? 'OVO' : paymentMethod === 'gopay' ? 'GoPay' : 'QRIS'}</div>
										<div style={{ color: colors.textLight, fontSize: fontSize.sm }}>You will be redirected to complete payment using the selected provider.</div>
									</div>
								)}
							</div>
						</Card>
					)}
				</div>
			</div>
		)
	}

	const ConfirmationStep = () => (
		<div>
			<div style={{ ...styles.leftCard }}>
				<Card style={{ width: '100%', padding: spacing.lg, borderRadius: radius.lg }}>
						<div style={{ fontSize: fontSize.lg, fontWeight: 800, color: colors.accent5, marginBottom: spacing.md }}>Booking Details</div>
						{(() => {
							const p = data[current] || {}
							return (
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
							)
						})()}
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

	// derive pickup names array for the aside: show all selected pickup names, each on its own row
	const pickupUnique = (() => {
		try {
			const picks = (data || []).map((p) => p.pickup).filter(Boolean)
			if (picks.length === 0) return []
			const unique = Array.from(new Set(picks))
			return unique
		} catch (e) {
			return []
		}
	})()

	// total pickup fees (sum over selected pickups)
	const pickupTotal = (data || []).reduce((sum, p) => sum + getPickupPrice(p.pickup, selectedTrip), 0)

	return (
		<div style={styles.page}>
			<Navbar/>
			<div style={styles.container}>
				<div style={{ gridColumn: '1 / -1' }}>
					<StepHeader />
				</div>
				<div>
					{activeStep === 0 && <TripDetailsStep />}
					{activeStep === 1 && <PaymentStep />}
					{activeStep === 2 && <ConfirmationStep />}
				</div>

				<aside style={styles.summary}>
					<div style={styles.summaryTitle}>Reservation Summary</div>
					<div style={{ fontSize: fontSize.sm, color: colors.textLight, border: `1.5px solid ${colors.textLight}`, padding: spacing.sm, borderRadius: radius.sm }}>
						<div style={{ marginBottom: spacing.sm }}>
							<div style={{ fontWeight: 700 }}>Trip Name:</div>
							<div>{selectedTrip ? selectedTrip.name : 'Labuan Bajo boongan'}</div>
						</div>
						<div style={{ marginBottom: spacing.sm }}>
							<div style={{ fontWeight: 700 }}>Trip Duration:</div>
							<div>{selectedTrip ? `${selectedTrip.duration?.days} Day / ${selectedTrip.duration?.nights} Night` : '8 Day / 1 Night'}</div>
						</div>
						<div>
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
							<div style={{ color: colors.accent5, fontSize: fontSize.sm }}>Trip Price</div>
							<div style={{ color: colors.accent5, fontSize: fontSize.sm }}>Rp{tripPrice.toLocaleString('id-ID')}</div>
						</div>
						<div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
							<div style={{ color: colors.accent5, fontSize: fontSize.sm }}>Passengers</div>
							<div style={{ color: colors.accent5, fontSize: fontSize.sm }}>{passengers}</div>
						</div>
						<div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
							<div style={{ color: colors.accent5, fontSize: fontSize.sm }}>Pick Up Fee</div>
							<div style={{ color: colors.accent5, fontSize: fontSize.sm }}>Rp{pickupTotal.toLocaleString('id-ID')}</div>
						</div>
					</div>

					<div style={{ marginTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
						<div style={{ fontSize: fontSize.md, color: colors.accent5,fontWeight: 700 }}><stong>Total Price</stong></div>
						<div style={styles.priceTotal}>Rp{((tripPrice * passengers) + extra + pickupTotal).toLocaleString('id-ID')}</div>
					</div>
                                
					<Button variant="primary" style={{ marginTop: spacing.md, width: '100%', padding: '10px 12px', fontWeight: 700 }} onClick={() => {
							if (activeStep === 0) setActiveStep(1)
							else if (activeStep === 1) setActiveStep(2)
							else downloadInvoice()
						}}>
						{activeStep === 0 ? <><IconButton icon={<FontAwesomeIcon icon={faShoppingCart} style={{ color: colors.bg }} />} /> Request to Book</> : activeStep === 1 ? <><IconButton icon={<FontAwesomeIcon icon={faCreditCard} style={{ color: colors.bg }} />} /> Pay Now</> : <><IconButton icon={<FontAwesomeIcon icon={faDownload} style={{ color: colors.bg }} />} /> Download Invoice</>}
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

// helper: get pickup price (0 when not found or not selected)
function getPickupPrice(location, trip) {
	if (!location || !trip || !trip.pickup_points) return 0
	const pp = trip.pickup_points.find((x) => x.location === location)
	return pp && pp.price ? Number(pp.price) : 0
}

// Format tanggal agar mudah dibaca (Bahasa Indonesia)
function formatDate(dateStr) {
	try {
		const d = new Date(dateStr)
		return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(d)
	} catch (e) {
		return dateStr || ''
	}
}

function formatDateRange(start, end) {
	if (!start) return 'N/A'
	if (!end || start === end) return formatDate(start)
	try {
		const s = new Date(start)
		const e = new Date(end)
		const sameMonth = s.getFullYear() === e.getFullYear() && s.getMonth() === e.getMonth()
		if (sameMonth) {
			// tampilkan: 1–3 Februari 2026
			const dayStart = s.getDate()
			const dayEnd = e.getDate()
			const monthYear = new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(s)
			return `${dayStart}–${dayEnd} ${monthYear}`
		}
		// beda bulan/tahun: tampilkan dua tanggal lengkap
		return `${formatDate(start)} – ${formatDate(end)}`
	} catch (e) {
		return `${start} – ${end}`
	}
}

export default CheckoutPage