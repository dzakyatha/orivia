import { opentripAPI } from './api';

/**
 * Create a booking with multiple passengers
 * @param {Object} bookingData - Booking data
 * @param {string} bookingData.id_rencana - Travel plan ID (trip ID from travel planner)
 * @param {Array} bookingData.participants - Array of participant objects
 * @param {string} bookingData.payment_method - Payment method (optional)
 * @returns {Promise<Object>} Booking response
 */
export const createMultiPassengerBooking = async (bookingData) => {
  try {
    const response = await opentripAPI.post('/bookings/multi-passenger', bookingData);
    return response.data;
  } catch (error) {
    console.error('Error creating booking:', error);
    throw error.response?.data || error;
  }
};

/**
 * Get booking by ID
 * @param {string} bookingId - Booking ID
 * @returns {Promise<Object>} Booking data
 */
export const getBooking = async (bookingId) => {
  try {
    const response = await opentripAPI.get(`/bookings/${bookingId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching booking:', error);
    throw error.response?.data || error;
  }
};

/**
 * Get all bookings for current user
 * @returns {Promise<Array>} List of bookings
 */
export const getAllBookings = async () => {
  try {
    const response = await opentripAPI.get('/bookings/');
    return response.data;
  } catch (error) {
    console.error('Error fetching bookings:', error);
    throw error.response?.data || error;
  }
};

/**
 * Get all bookings for the currently logged-in user (multi-passenger compatible)
 * @returns {Promise<Array>} List of bookings with participant details
 */
export const getMyBookings = async () => {
  try {
    const response = await opentripAPI.get('/bookings/user/me');
    return response.data;
  } catch (error) {
    console.error('Error fetching my bookings:', error);
    throw error.response?.data || error;
  }
};

/**
 * Cancel a booking
 * @param {string} bookingId - Booking ID
 * @param {string} reason - Cancellation reason (optional)
 * @returns {Promise<Object>} Cancellation response
 */
export const cancelBooking = async (bookingId, reason = null) => {
  try {
    const response = await opentripAPI.post(`/bookings/${bookingId}/cancel`, { booking_id: bookingId, reason });
    return response.data;
  } catch (error) {
    console.error('Error canceling booking:', error);
    throw error.response?.data || error;
  }
};
