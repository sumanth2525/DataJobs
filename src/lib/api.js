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
  (response) => {
    return response;
  },
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

  // Scrape job details from URL using ChatGPT
  scrapeJob: async (url) => {
    const response = await api.post('/scrape-job', { url });
    return response.data;
  },

  // Bulk create jobs from external APIs
  bulkCreate: async (jobs) => {
    const response = await api.post('/jobs/bulk', { jobs });
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

// ==================== SERPAPI (Google Jobs) ====================

export const serpAPI = {
  // Search Google Jobs via SerpAPI
  searchJobs: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    if (params.q) queryParams.append('q', params.q);
    if (params.location) queryParams.append('location', params.location);
    if (params.next_page_token) queryParams.append('next_page_token', params.next_page_token);
    if (params.num !== undefined) queryParams.append('num', params.num);
    if (params.engine) queryParams.append('engine', params.engine);
    if (params.lrad) queryParams.append('lrad', params.lrad);
    if (params.hl) queryParams.append('hl', params.hl);
    if (params.gl) queryParams.append('gl', params.gl);
    
    const response = await api.get(`/serpapi/jobs/search?${queryParams.toString()}`);
    return response.data;
  },

  // Get job details by SerpAPI ID
  getJobDetails: async (id) => {
    const response = await api.get(`/serpapi/jobs/${id}`);
    return response.data;
  },

  // Get data-related roles from Google Jobs via SerpAPI
  getDataRoles: async (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.location) queryParams.append('location', params.location);
    if (params.num !== undefined) queryParams.append('num', params.num);
    
    const response = await api.get(`/serpapi/jobs/data-roles?${queryParams.toString()}`);
    return response.data;
  },
};

// ==================== ADZUNA API ====================

export const adzunaAPI = {
  // Search jobs via Adzuna
  searchJobs: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    if (params.what) queryParams.append('what', params.what);
    if (params.where) queryParams.append('where', params.where);
    if (params.page) queryParams.append('page', params.page);
    if (params.results_per_page) queryParams.append('results_per_page', params.results_per_page);
    if (params.sort_by) queryParams.append('sort_by', params.sort_by);
    if (params.category) queryParams.append('category', params.category);
    if (params.salary_min) queryParams.append('salary_min', params.salary_min);
    if (params.salary_max) queryParams.append('salary_max', params.salary_max);
    if (params.max_days_old) queryParams.append('max_days_old', params.max_days_old);
    if (params.full_time !== undefined) queryParams.append('full_time', params.full_time);
    if (params.part_time !== undefined) queryParams.append('part_time', params.part_time);
    if (params.contract !== undefined) queryParams.append('contract', params.contract);
    if (params.permanent !== undefined) queryParams.append('permanent', params.permanent);
    
    const response = await api.get(`/adzuna/jobs/search?${queryParams.toString()}`);
    return response.data;
  },

  // Get job details by Adzuna ID
  getJobDetails: async (id) => {
    const response = await api.get(`/adzuna/jobs/${id}`);
    return response.data;
  },

  // Get data-related roles from Adzuna
  getDataRoles: async (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.location) queryParams.append('location', params.location);
    if (params.page) queryParams.append('page', params.page);
    if (params.results_per_page) queryParams.append('results_per_page', params.results_per_page);
    
    const response = await api.get(`/adzuna/jobs/data-roles?${queryParams.toString()}`);
    return response.data;
  },

  // Get job categories
  getCategories: async () => {
    const response = await api.get('/adzuna/categories');
    return response.data;
  },
};

export default api;
