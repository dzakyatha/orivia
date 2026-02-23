import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
// Route all microservice requests through the gateway for proper authentication and routing
// Gateway will forward opentrip requests to Open Trip service and planner requests to Travel Planner
const OPENTRIP_API_URL = import.meta.env.VITE_OPENTRIP_API_URL || 'http://localhost:8000/api/opentrip';
const PLANNER_API_URL = import.meta.env.VITE_PLANNER_API_URL || 'http://localhost:8000/api/planner';

// Create axios instance for main API (orivia - central database)
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Create axios instance for open-trip-system microservice
export const opentripAPI = axios.create({
  baseURL: OPENTRIP_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Create axios instance for travel-planner microservice
export const plannerAPI = axios.create({
  baseURL: PLANNER_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token for main API
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add request interceptor for opentrip API
opentripAPI.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    console.log('[opentripAPI] Request to:', config.url, 'with token:', token?.substring(0, 50) + '...');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('[opentripAPI] Request error:', error);
    return Promise.reject(error);
  }
);

// Add request interceptor for planner API
plannerAPI.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    console.log('[plannerAPI] Request to:', config.url, 'with token:', token?.substring(0, 50) + '...');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('[plannerAPI] Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling (main API)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('authToken');
      localStorage.removeItem('role');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Add response interceptor for opentrip API
opentripAPI.interceptors.response.use(
  (response) => {
    console.log('[opentripAPI] Response from:', response.config.url, 'status:', response.status);
    return response;
  },
  (error) => {
    console.error('[opentripAPI] Response error:', error.config?.url, 'status:', error.response?.status, 'message:', error.response?.data);
    // Don't auto-logout on 401 from microservices - they might not have the endpoint
    // if (error.response?.status === 401) {
    //   localStorage.removeItem('authToken');
    //   localStorage.removeItem('role');
    //   localStorage.removeItem('user');
    //   window.location.href = '/login';
    // }
    return Promise.reject(error);
  }
);

// Add response interceptor for planner API
plannerAPI.interceptors.response.use(
  (response) => {
    console.log('[plannerAPI] Response from:', response.config.url, 'status:', response.status);
    return response;
  },
  (error) => {
    console.error('[plannerAPI] Response error:', error.config?.url, 'status:', error.response?.status, 'message:', error.response?.data);
    // Don't auto-logout on 401 from microservices - they might not have the endpoint
    // if (error.response?.status === 401) {
    //   localStorage.removeItem('authToken');
    //   localStorage.removeItem('role');
    //   localStorage.removeItem('user');
    //   window.location.href = '/login';
    // }
    return Promise.reject(error);
  }
);

// Auth API endpoints
export const authAPI = {
  // Regular login
  login: (email, password) => api.post('/auth/login', { email, password }),
  
  // Regular registration
  register: (userData) => api.post('/auth/register', userData),
  
  // Google OAuth
  googleAuth: (googleData) => api.post('/auth/google', googleData),
  
  // Logout
  logout: () => api.post('/auth/logout'),
  
  // Get current user
  getCurrentUser: () => api.get('/auth/me'),
};

export default api;
