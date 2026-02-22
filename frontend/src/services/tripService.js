/**
 * Trip Service - handles all trip-related API calls through the Django gateway.
 * Gateway routes:
 *   /api/opentrip/trips/         → open-trip-system trips
 *   /api/opentrip/bookings/      → open-trip-system bookings
 *   /api/opentrip/transactions/  → open-trip-system transactions
 */
import api, { opentripAPI } from './api';

// ─── Helpers ────────────────────────────────────────────────

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
 */
function buildSchedules(mappedTrips) {
  const schedules = [];
  let scheduleIdCounter = 1;

  mappedTrips.forEach((trip) => {
    (trip._rawSchedules || []).forEach((s) => {
      schedules.push({
        scheduleId: scheduleIdCounter++,
        tripId: trip.tripId,
        start_date: s.start_date,
        end_date: s.end_date,
        status: 'ACTIVE',
        slotAvailable: trip.pax, // best available estimate
        location: s.location,
      });
    });
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
    // Validate role - only fetch for Customer role
    if (!role || role.toUpperCase() !== 'CUSTOMER') {
      return null;
    }

    if (!email) {
      throw new Error('Email is required to fetch latest trip');
    }

    // Call open-trip-system microservice directly
    const res = await opentripAPI.get('/opentrip/trips/latest', {
      params: { email }
    });

    if (!res.data) {
      return null;
    }

    // Map response from open-trip-system to frontend format
    // Response format: { trip_id, trip_name, departure_date, price }
    return {
      trip_id: res.data.trip_id,
      trip_name: res.data.trip_name,
      departure_date: res.data.departure_date,
      price: res.data.price,
      created_at: res.data.created_at || null,
      location: res.data.location || '',
      destination_type: res.data.destination_type || '',
      status: res.data.status || 'Upcoming',
    };
  } catch (error) {
    // Handle different error scenarios
    if (error.response?.status === 404) {
      // No trips found for this user
      return null;
    } else if (error.response?.status === 503) {
      // Service responded but is unavailable
      throw new Error('Open-trip-system service is currently unavailable');
    } else if (!error.response && error.code === 'ECONNREFUSED') {
      // Network error: service cannot be reached
      throw new Error('Open-trip-system service is currently unavailable');
    } else if (error.message) {
      throw error;
    } else {
      throw new Error('Failed to fetch latest trip');
    }
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
export async function fetchBookings() {
  try {
    const res = await api.get('/opentrip/bookings/');
    return Array.isArray(res.data) ? res.data : [];
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
  createBooking,
  confirmBooking,
  cancelBooking,
  fetchTransactions,
  initiatePayment,
  validatePayment,
  confirmPayment,
  refundPayment,
  fetchLatestTrip,
};
