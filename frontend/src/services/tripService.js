/**
 * Trip Service - handles all trip-related API calls through the Django gateway.
 * Gateway routes:
 *   /api/opentrip/trips/         → open-trip-system trips
 *   /api/opentrip/bookings/      → open-trip-system bookings
 *   /api/opentrip/transactions/  → open-trip-system transactions
 */
import api, { opentripAPI, plannerAPI } from './api';

// ─── Helpers ────────────────────────────────────────────────

/**
 * Transform Travel Planner API response to the shape frontend expects
 */
function mapTripFromPlanner(raw) {
  console.log('[mapTripFromPlanner] Mapping planner data:', raw);

  const addDaysIso = (iso, days) => {
    try {
      const d = new Date(iso);
      d.setDate(d.getDate() + days);
      return d.toISOString().slice(0, 10);
    } catch (e) {
      return null;
    }
  };

  const start = raw.departure_date || raw.durasi_mulai || raw.start_date || raw.startDate || null;
  let end = raw.durasi_selesai || raw.end_date || raw.endDate || null;
  if (!end && start && (raw.jumlah_hari || raw.jumlah_hari === 0)) {
    const days = Number(raw.jumlah_hari) || 0;
    if (days > 0) {
      end = addDaysIso(start, days - 1);
    }
  }

  return {
    trip_id: raw.id_rencana,
    trip_name: raw.nama,
    description: raw.deskripsi || '',
    location: raw.provinsi || '',
    destination_type: raw.destination_type || '',
    price: raw.harga || 0,
    pax: raw.slot || 0,
    startDate: start,
    endDate: end,
    duration: {
      days: raw.jumlah_hari || 0,
      nights: raw.jumlah_malam || 0
    },
    status: raw.slot_tersedia ? 'Available' : 'Full',
    created_at: raw.createdAt || null,
    image: raw.image_url || null,
    _plannerRaw: raw,
  };
}

/**
 * Transform a raw API trip response into the shape the frontend expects.
 * Fields that don't exist in the backend are given sensible defaults.
 */
function mapTrip(raw) {
  const schedules = raw.schedules || [];
  const firstSchedule = schedules[0] || {};

  // Try to derive location from schedule location or itinerary destinations
  const locationStr = firstSchedule.location || '';
  const itinerary = raw.itinerary || {};

  // Calculate duration from the first schedule
  let days = 0;
  let nights = 0;
  if (firstSchedule.start_date && firstSchedule.end_date) {
    const s = new Date(firstSchedule.start_date);
    const e = new Date(firstSchedule.end_date);
    days = Math.max(1, Math.round((e - s) / (1000 * 60 * 60 * 24)) + 1);
    nights = Math.max(0, days - 1);
  }

  return {
    tripId: raw.trip_id,
    name: raw.trip_name,
    description: itinerary.description || '',
    location: { state: locationStr, country: '' },
    price: 0, // not available from backend
    pax: raw.capacity,
    duration: { days, nights },
    image: '', // no images from backend
    type: '',
    destinationType: '',
    includes: [],
    pickup_points: [],
    rundowns: {},
    images: [],
    is_available: raw.is_available,
    guide_name: raw.guide_name || null,
    // keep original schedules for schedule-level views
    _rawSchedules: schedules,
  };
}

/**
 * Build "tripSchedules" array from the list of mapped trips.
 * Each schedule entry gets a unique scheduleId, tripId, dates, and slot info.
 * Handles both OpenTrip (nested schedules) and Planner (top-level dates) data.
 */
function buildSchedules(mappedTrips) {
  const schedules = [];
  let scheduleIdCounter = 1;

  mappedTrips.forEach((trip) => {
    // Case 1: OpenTrip data with nested schedules
    if (trip._rawSchedules && trip._rawSchedules.length > 0) {
      trip._rawSchedules.forEach((s) => {
        schedules.push({
          scheduleId: scheduleIdCounter++,
          tripId: trip.tripId,
          start_date: s.start_date,
          end_date: s.end_date,
          status: 'ACTIVE',
          slotAvailable: trip.pax,
          location: s.location,
        });
      });
    }
    // Case 2: Planner data with top-level startDate/endDate
    else if (trip.startDate || trip.endDate) {
      schedules.push({
        scheduleId: scheduleIdCounter++,
        tripId: trip.tripId,
        start_date: trip.startDate,
        end_date: trip.endDate,
        status: 'ACTIVE',
        slotAvailable: trip.pax,
        location: trip.location?.state || '',
      });
    }
    // Case 3: Fallback - create a placeholder schedule
    else {
      schedules.push({
        scheduleId: scheduleIdCounter++,
        tripId: trip.tripId,
        start_date: null,
        end_date: null,
        status: 'ACTIVE',
        slotAvailable: trip.pax,
        location: trip.location?.state || '',
      });
    }
  });

  return schedules;
}

// ─── API calls ──────────────────────────────────────────────

/** Fetch all trips (public, via gateway) */
export async function fetchTrips() {
  const res = await api.get('/opentrip/trips/');
  const raw = Array.isArray(res.data) ? res.data : [];
  const mapped = raw.map(mapTrip);
  return { trips: mapped, tripSchedules: buildSchedules(mapped) };
}

/** Fetch all trips from Travel Planner (ignore id_user filter) via authenticated gateway */
export async function fetchPlannerTrips() {
  // Use authenticated 'api' instance to go through gateway with JWT token
  const res = await api.get('/planner/trips/all');
  const raw = Array.isArray(res.data) ? res.data : [];

  // Map planner records into frontend trip shape
  const mapped = raw.map((r) => {
    const p = mapTripFromPlanner(r);
    const days = p.duration?.days ?? (r.jumlah_hari ?? 0);
    const nights = p.duration?.nights ?? (r.jumlah_malam ?? 0);
    const startDate = r.departure_date || r.durasi_mulai || p.startDate || null;
    const endDate = r.durasi_selesai || p.endDate || null;

    return {
      tripId: p.trip_id || p.id_rencana || r.id_rencana,
      name: p.trip_name || p.nama || r.nama,
      description: p.deskripsi || r.deskripsi || '',
      location: { state: r.provinsi || p.provinsi || '', country: r.negara || p.negara || '' },
      price: p.harga || r.harga || p.price || 0,
      pax: p.slot || r.slot || 0,
      duration: { days, nights },
      image: r.image_url || p.image || r.image || null,
      destinationType: p.destination_type || p.destinationType || r.destination_type || '',
      // Expose explicit start/end and also populate `date` for components expecting it
      date: { start_date: startDate, end_date: endDate },
      startDate: startDate,
      endDate: endDate,
      jumlah_hari: days,
      jumlah_malam: nights,
      _plannerRaw: r,
    };
  });

  return { trips: mapped, tripSchedules: buildSchedules(mapped) };
}

/**
 * Fetch a single trip detail by ID from Travel Planner service
 * Returns comprehensive trip data including images, pickup points, includes, and rundowns
 * @param {string} tripId - The trip UUID
 * @returns {Object} Trip detail with all related data
 */
export async function fetchPlannerTripDetail(tripId) {
  try {
    console.log('[fetchPlannerTripDetail] Fetching trip ID:', tripId);
    const res = await api.get(`/planner/trips/${tripId}`);
    const raw = res.data;
    
    console.log('[fetchPlannerTripDetail] Received data:', raw);
    
    // Return the trip data with all nested relationships
    return {
      tripId: raw.tripId || raw.trip_id,
      name: raw.name || raw.trip_name,
      description: raw.description || raw.deskripsi || '',
      price: raw.price || raw.harga || 0,
      location: {
        state: raw.location?.state || raw.provinsi || '',
        country: raw.location?.country || raw.negara || ''
      },
      provinsi: raw.provinsi,
      negara: raw.negara,
      duration: raw.duration || {
        days: raw.jumlah_hari || 0,
        nights: raw.jumlah_malam || 0
      },
      jumlah_hari: raw.jumlah_hari,
      jumlah_malam: raw.jumlah_malam,
      startDate: raw.startDate,
      endDate: raw.endDate,
      slot: raw.slot,
      slot_tersedia: raw.slot_tersedia,
      destinationType: raw.destinationType || raw.destination_type || '',
      images: raw.images || [],
      pickup_points: raw.pickup_points || [],
      includes: raw.includes || [],
      rundowns: raw.rundowns || {},
      _raw: raw
    };
  } catch (error) {
    console.error('[fetchPlannerTripDetail] Error fetching trip:', error);
    throw error;
  }
}

/** Fetch a single trip by ID (public, via gateway) */
export async function fetchTrip(tripId) {
  const res = await api.get(`/opentrip/trips/${tripId}`);
  return mapTrip(res.data);
}

/**
 * Fetch latest trip for a specific user by email from open-trip-system microservice
 * This function includes role validation and only returns data for Customer role
 * 
 * @param {string} email - User email to filter trips
 * @param {string} role - User role (Customer or Travel Agent)
 * @returns {Object|null} Latest trip or null if role is not Customer or no trips found
 * @throws {Error} If service is unavailable or other errors occur
 */
export async function fetchLatestTripByEmail(email, role) {
  try {
    console.log('[fetchLatestTripByEmail] Starting with email:', email, 'role:', role);
    
    // Validate role - only fetch for Customer role
    if (!role || role.toUpperCase() !== 'CUSTOMER') {
      console.log('[fetchLatestTripByEmail] Role validation failed, returning null');
      return null;
    }

    if (!email) {
      throw new Error('Email is required to fetch latest trip');
    }

    // NOTE: Trip data is now in Travel Planner service, not open-trip-system
    // Try fetching from Travel Planner first
    let openTripData = null;
    try {
      console.log('[fetchLatestTripByEmail] Attempting to fetch from opentripAPI /trips/latest');
      const r = await opentripAPI.get('/trips/latest', { params: { email } });
      openTripData = r.data || null;
      console.log('[fetchLatestTripByEmail] Got data from opentripAPI:', openTripData);
    } catch (e) {
      console.log('[fetchLatestTripByEmail] opentripAPI failed:', e.response?.status, e.message);
      // Fallback to gateway route if direct microservice call fails
      try {
        console.log('[fetchLatestTripByEmail] Attempting fallback to gateway /opentrip/trips/latest');
        const r2 = await api.get('/opentrip/trips/latest', { params: { email } });
        openTripData = r2.data || null;
        console.log('[fetchLatestTripByEmail] Got data from gateway:', openTripData);
      } catch (e2) {
        console.log('[fetchLatestTripByEmail] Gateway also failed:', e2.response?.status, e2.message);
        // both attempts failed — surface a network/unavailable error
        if (e.response?.status === 404 || e2?.response?.status === 404) {
          console.log('[fetchLatestTripByEmail] 404 errors, returning null');
          return null;
        }
        // Don't throw error, just continue to try planner
        console.log('[fetchLatestTripByEmail] Open-trip-system unavailable, will try planner only');
      }
    }

    // Try to fetch from Travel Planner data (this is the primary source now)
    let plannerData = null;
    try {
      console.log('[fetchLatestTripByEmail] Attempting to fetch from plannerAPI /trips/latest');
      const pLatest = await plannerAPI.get('/trips/latest', { params: { email } });
      plannerData = pLatest.data || null;
      console.log('[fetchLatestTripByEmail] Got data from plannerAPI:', plannerData);
    } catch (e) {
      console.log('[fetchLatestTripByEmail] plannerAPI /trips/latest failed:', e.response?.status, e.message);
      // If not available, try fetching trip by id from planner
      try {
        if (openTripData?.trip_id) {
          console.log('[fetchLatestTripByEmail] Trying plannerAPI by trip_id:', openTripData.trip_id);
          const pById = await plannerAPI.get(`/${openTripData.trip_id}`);
          plannerData = pById.data || null;
          console.log('[fetchLatestTripByEmail] Got data from plannerAPI by ID:', plannerData);
        }
      } catch (e2) {
        console.log('[fetchLatestTripByEmail] plannerAPI by ID also failed:', e2.response?.status, e2.message);
        // planner service not available or endpoint missing — ignore
        plannerData = null;
      }
    }

    // If we have planner data but no opentrip data, use planner as primary
    if (plannerData && !openTripData) {
      console.log('[fetchLatestTripByEmail] Using plannerData as primary source');
      return mapTripFromPlanner(plannerData);
    }

    if (!openTripData && !plannerData) {
      console.log('[fetchLatestTripByEmail] No data from either service, returning null');
      return null;
    }

    // Check if openTripData is actually planner-formatted (has id_rencana instead of trip_id)
    // This happens when gateway returns planner data
    if (openTripData && openTripData.id_rencana) {
      console.log('[fetchLatestTripByEmail] openTripData is planner-formatted, using mapTripFromPlanner');
      // Use plannerData if available, otherwise use openTripData (which is planner format from gateway)
      const dataToMap = plannerData || openTripData;
      return mapTripFromPlanner(dataToMap);
    }

    // Merge results: prefer plannerData fields when present (price, schedules, location)
    const merged = {
      trip_id: openTripData.trip_id,
      trip_name: openTripData.trip_name,
      departure_date: plannerData?.departure_date || openTripData.departure_date || null,
      price: plannerData?.price ?? openTripData.price ?? null,
      created_at: plannerData?.created_at || openTripData.created_at || null,
      location: plannerData?.location || openTripData.location || '',
      destination_type: plannerData?.destination_type || openTripData.destination_type || '',
      status: plannerData?.status || openTripData.status || 'Upcoming',
      image: plannerData?.image_url || plannerData?.image || openTripData.image || null,
      _openTripRaw: openTripData,
      _plannerRaw: plannerData,
    };

    console.log('[fetchLatestTripByEmail] Returning merged data:', merged);
    return merged;
  } catch (error) {
    console.error('[fetchLatestTripByEmail] Error caught:', error);
    // Handle different error scenarios
    if (error.response?.status === 404) {
      console.log('[fetchLatestTripByEmail] 404 error, returning null');
      // No trips found for this user
      return null;
    } else if (error.response?.status === 503) {
      console.error('[fetchLatestTripByEmail] 503 service unavailable');
      // Service responded but is unavailable
      throw new Error('Open-trip-system service is currently unavailable');
    } else if (!error.response && error.code === 'ECONNREFUSED') {
      console.error('[fetchLatestTripByEmail] Connection refused');
      // Network error: service cannot be reached
      throw new Error('Open-trip-system service is currently unavailable');
    } else if (error.message) {
      console.error('[fetchLatestTripByEmail] Throwing error:', error.message);
      throw error;
    } else {
      console.error('[fetchLatestTripByEmail] Unknown error, throwing generic');
      throw new Error('Failed to fetch latest trip');
    }
  }
}

/**
 * Fetch latest booked trip for the current user
 * Uses the new /bookings/user/me endpoint and fetches trip details from planner
 * 
 * @returns {Object|null} Latest booked trip with details or null if no bookings found
 */
export async function fetchLatestBookedTrip() {
  try {
    console.log('[fetchLatestBookedTrip] Fetching user bookings...');
    
    // Import bookingService to get bookings
    const { getMyBookings } = await import('./bookingService');
    const bookings = await getMyBookings();
    
    if (!bookings || bookings.length === 0) {
      console.log('[fetchLatestBookedTrip] No bookings found');
      return null;
    }
    
    // Sort by booking_id (UUID) descending to get most recent (UUIDs are time-ordered)
    const sortedBookings = bookings.sort((a, b) => {
      return b.booking_id.localeCompare(a.booking_id);
    });
    
    const latestBooking = sortedBookings[0];
    console.log('[fetchLatestBookedTrip] Latest booking:', latestBooking);
    
    // Fetch trip details from travel planner using id_rencana
    try {
      console.log('[fetchLatestBookedTrip] Fetching trip details for:', latestBooking.id_rencana);
      const tripData = await fetchPlannerTripDetail(latestBooking.id_rencana);
      
      if (tripData) {
        // Merge booking and trip data
        return {
          ...tripData,
          booking_id: latestBooking.booking_id,
          booking_status: latestBooking.booking_status,
          participants: latestBooking.participants,
          participant_count: latestBooking.participant_count
        };
      }
    } catch (error) {
      console.error('[fetchLatestBookedTrip] Error fetching trip details:', error);
    }
    
    return null;
  } catch (error) {
    console.error('[fetchLatestBookedTrip] Error:', error);
    return null;
  }
}

/** Fetch latest upcoming trip (via gateway) */
export async function fetchLatestTrip() {
  const res = await api.get('/opentrip/trips/latest');
  return mapTrip(res.data);
}

/** Create a new trip (agent only) */
export async function createTrip(tripName, capacity) {
  const res = await api.post('/opentrip/trips/', { trip_name: tripName, capacity });
  return mapTrip(res.data);
}

/** Add a schedule to a trip */
export async function addSchedule(tripId, startDate, endDate, location) {
  return api.post(`/opentrip/trips/${tripId}/schedule`, {
    start_date: startDate,
    end_date: endDate,
    location,
  });
}

/** Assign a guide to a trip */
export async function assignGuide(tripId, guideName, contact, language) {
  return api.post(`/opentrip/trips/${tripId}/guide`, {
    guide_name: guideName,
    contact,
    language,
  });
}

/** Update trip capacity */
export async function updateCapacity(tripId, newCapacity) {
  return api.put(`/opentrip/trips/${tripId}/capacity`, { new_capacity: newCapacity });
}

/** Update trip itinerary */
export async function updateItinerary(tripId, destinations, description) {
  return api.put(`/opentrip/trips/${tripId}/itinerary`, { destinations, description });
}

// ─── Bookings ───────────────────────────────────────────────

/** Fetch all bookings for the current user */
export async function fetchBookings(tripId = null) {
  try {
    // If tripId provided, call the backend route that returns bookings for that trip
    if (tripId) {
      try {
        const res = await opentripAPI.get(`/bookings/by_trip/${tripId}`);
        console.debug('[DEBUG] fetchBookings(by_trip): returned from opentripAPI', res?.data);
        return Array.isArray(res.data) ? res.data : [];
      } catch (e) {
        console.warn('[DEBUG] fetchBookings(by_trip): opentripAPI failed, falling back to gateway', e?.message || e);
        const res2 = await api.get(`/opentrip/bookings/by_trip/${tripId}`);
        console.debug('[DEBUG] fetchBookings(by_trip): returned from gateway', res2?.data);
        return Array.isArray(res2.data) ? res2.data : [];
      }
    }

    // Prefer direct call to Open Trip microservice (reads open_trip_db)
    try {
      const res = await opentripAPI.get('/bookings/');
      console.debug('[DEBUG] fetchBookings: returned from opentripAPI', res?.data);
      return Array.isArray(res.data) ? res.data : [];
    } catch (e) {
      console.warn('[DEBUG] fetchBookings: opentripAPI failed, falling back to gateway', e?.message || e);
      // Fallback to gateway
      const res2 = await api.get('/opentrip/bookings/');
      console.debug('[DEBUG] fetchBookings: returned from gateway', res2?.data);
      return Array.isArray(res2.data) ? res2.data : [];
    }
  } catch (err) {
    // Enhanced debug logging to surface gateway/backend errors in browser console
    console.error('[DEBUG] fetchBookings: request failed', err);
    if (err.response) {
      console.error('[DEBUG] fetchBookings: response status', err.response.status);
      console.error('[DEBUG] fetchBookings: response data', err.response.data);
      console.error('[DEBUG] fetchBookings: response headers', err.response.headers);
    } else if (err.request) {
      console.error('[DEBUG] fetchBookings: no response received, request:', err.request);
    } else {
      console.error('[DEBUG] fetchBookings: error message', err.message);
    }
    throw err;
  }
}

/** Fetch a single booking */
export async function fetchBooking(bookingId) {
  const res = await api.get(`/opentrip/bookings/${bookingId}`);
  return res.data;
}

/** Fetch all bookings for the current user with participants */
export async function fetchUserBookings() {
  try {
    console.log('[fetchUserBookings] Fetching user bookings from /user/me');
    const res = await opentripAPI.get('/bookings/user/me');
    console.log('[fetchUserBookings] Received bookings:', res?.data);
    return Array.isArray(res.data) ? res.data : [];
  } catch (err) {
    console.error('[fetchUserBookings] Error fetching user bookings:', err);
    // Fallback to gateway
    try {
      const res2 = await api.get('/opentrip/bookings/user/me');
      console.log('[fetchUserBookings] Received bookings from gateway:', res2?.data);
      return Array.isArray(res2.data) ? res2.data : [];
    } catch (err2) {
      console.error('[fetchUserBookings] Gateway also failed:', err2);
      throw err2;
    }
  }
}

/** Fetch all bookings for a specific trip_id */
export async function fetchBookingsByTrip(tripId) {
  try {
    const res = await api.get(`/opentrip/bookings/by_trip/${tripId}`);
    return Array.isArray(res.data) ? res.data : [];
  } catch (err) {
    console.error('[fetchBookingsByTrip] Error fetching bookings:', err);
    return [];
  }
}

/** Create a booking */
export async function createBooking(tripId, participantName, contact, address) {
  return api.post('/opentrip/bookings/', {
    trip_id: tripId,
    participant: { name: participantName, contact, address },
  });
}

/** Confirm a booking */
export async function confirmBooking(bookingId) {
  return api.post(`/opentrip/bookings/${bookingId}/confirm`);
}

/** Cancel a booking */
export async function cancelBooking(bookingId, reason) {
  return api.post(`/opentrip/bookings/${bookingId}/cancel`, { reason });
}

// ─── Transactions ───────────────────────────────────────────

/** Fetch all transactions for current user */
export async function fetchTransactions() {
  const res = await api.get('/opentrip/transactions/');
  return Array.isArray(res.data) ? res.data : [];
}

/** Initiate a payment */
export async function initiatePayment(bookingId, amount, paymentType, provider) {
  return api.post('/opentrip/transactions/', {
    booking_id: bookingId,
    amount,
    payment_type: paymentType,
    provider,
  });
}

/** Validate a payment */
export async function validatePayment(transactionId) {
  return api.post(`/opentrip/transactions/${transactionId}/validate`);
}

/** Confirm a payment */
export async function confirmPayment(transactionId) {
  return api.post(`/opentrip/transactions/${transactionId}/confirm`);
}

/** Refund a payment */
export async function refundPayment(transactionId) {
  return api.post(`/opentrip/transactions/${transactionId}/refund`);
}

/**
 * Fetch pickup points for a specific trip by trip/plan ID
 * Uses the authenticated endpoint through gateway: GET /api/planner/{rencana_id}/pickup-points
 * Gateway forwards to: GET /api/perencanaan/{rencana_id}/pickup-points
 * 
 * @param {string} tripId - The trip/plan ID (id_rencana)
 * @returns {Array} Array of pickup points with trip_pickup_id and lokasi_jemput
 */
export async function fetchPickupPoints(tripId) {
  try {
    console.log('[fetchPickupPoints] Fetching pickup points for trip:', tripId);
    const response = await plannerAPI.get(`/${tripId}/pickup-points`);
    console.log('[fetchPickupPoints] Received pickup points:', response.data);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('[fetchPickupPoints] Error fetching pickup points:', error.response?.status, error.message);
    return [];
  }
}

/**
 * Update a trip in the Travel Planner service
 * Uses the authenticated endpoint through gateway: PUT /api/planner/trips/{tripId}
 * Gateway forwards to: PUT /api/perencanaan/trips/{tripId}
 * 
 * @param {string} tripId - The trip ID (id_rencana)
 * @param {Object} updateData - Object containing fields to update
 * @returns {Object} Updated trip data
 */
export async function updatePlannerTrip(tripId, updateData) {
  try {
    console.log('[updatePlannerTrip] Updating trip:', tripId, 'with data:', updateData);
    const response = await api.put(`/planner/trips/${tripId}`, updateData);
    console.log('[updatePlannerTrip] Trip updated successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('[updatePlannerTrip] Error updating trip:', error.response?.status, error.message);
    if (error.response?.data) {
      console.error('[updatePlannerTrip] Error details:', error.response.data);
    }
    throw error;
  }
}

export default {
  fetchTrips,
  fetchTrip,
  fetchLatestTripByEmail,
  createTrip,
  addSchedule,
  assignGuide,
  updateCapacity,
  updateItinerary,
  fetchBookings,
  fetchBooking,
  fetchUserBookings,
  createBooking,
  confirmBooking,
  cancelBooking,
  fetchTransactions,
  initiatePayment,
  validatePayment,
  confirmPayment,
  refundPayment,
  fetchLatestTrip,
  fetchPickupPoints,
  updatePlannerTrip,
};
