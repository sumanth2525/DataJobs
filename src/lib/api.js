// API client for backend communication
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      window.location.hash = '#login';
    }
    return Promise.reject(error);
  }
);

// ==================== JOBS API ====================

export const jobsAPI = {
  // Get all jobs with optional filters
  getAll: async (filters = {}) => {
    const params = new URLSearchParams();
    
    if (filters.search) params.append('search', filters.search);
    if (filters.location) params.append('location', filters.location);
    if (filters.experience) params.append('experience', filters.experience);
    if (filters.salary_min) params.append('salary_min', filters.salary_min);
    if (filters.salary_max) params.append('salary_max', filters.salary_max);
    if (filters.schedule) params.append('schedule', filters.schedule);
    if (filters.employment_type) params.append('employment_type', filters.employment_type);
    if (filters.timeFilter) params.append('timeFilter', filters.timeFilter);
    
    const response = await api.get(`/jobs?${params.toString()}`);
    return response.data;
  },

  // Get single job by ID
  getById: async (id) => {
    const response = await api.get(`/jobs/${id}`);
    return response.data;
  },

  // Create new job
  create: async (jobData) => {
    const response = await api.post('/jobs', jobData);
    return response.data;
  },

  // Update job
  update: async (id, updates) => {
    const response = await api.put(`/jobs/${id}`, updates);
    return response.data;
  },

  // Delete job
  delete: async (id) => {
    const response = await api.delete(`/jobs/${id}`);
    return response.data;
  },
};

// ==================== AUTH API ====================

export const authAPI = {
  // Register new user
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    
    // Store token if provided
    if (response.data.data?.session?.access_token) {
      localStorage.setItem('auth_token', response.data.data.session.access_token);
    }
    
    return response.data;
  },

  // Login user
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    
    // Store token
    if (response.data.data?.session?.access_token) {
      localStorage.setItem('auth_token', response.data.data.session.access_token);
    }
    
    return response.data;
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await api.get('/auth/user');
    return response.data;
  },

  // Logout (client-side only)
  logout: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  },
};

// ==================== ONLINE USERS API ====================

export const usersAPI = {
  // Get online users count
  getOnlineCount: async () => {
    const response = await api.get('/users/online');
    return response.data;
  },
};

// ==================== MESSAGES API ====================

export const messagesAPI = {
  // Get messages for user
  getAll: async (userId) => {
    const response = await api.get(`/messages?userId=${userId}`);
    return response.data;
  },

  // Send message
  send: async (messageData) => {
    const response = await api.post('/messages', messageData);
    return response.data;
  },
};

// ==================== INTERNSHIPS API ====================


export const internshipsAPI = {
  // Get data-related internships
  getDataInternships: async () => {
    const response = await api.get('/rapidapi/internships/data-roles');
    return response.data;
  },
};

export default api;
