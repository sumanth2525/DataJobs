// RapidAPI integration for job search
import axios from 'axios';

const RAPIDAPI_BASE_URL = 'https://rapidapi.com';
const RAPIDAPI_KEY = process.env.REACT_APP_RAPIDAPI_KEY || '8ee6bd0bedmsh81dd306367586c8p1bff7fjsn0de54799feba';
const RAPIDAPI_HOST = process.env.REACT_APP_RAPIDAPI_HOST || 'rapidapi.com';
const RAPIDAPI_APP = process.env.REACT_APP_RAPIDAPI_APP || 'default-application_8592907';

// Create axios instance for RapidAPI
const rapidApiClient = axios.create({
  baseURL: RAPIDAPI_BASE_URL,
  headers: {
    'X-RapidAPI-Key': RAPIDAPI_KEY,
    'X-RapidAPI-Host': RAPIDAPI_HOST,
    'X-RapidAPI-App': RAPIDAPI_APP,
    'Content-Type': 'application/json'
  }
});

// RapidAPI Job Search Service
export const rapidApiService = {
  /**
   * Search jobs using RapidAPI
   * @param {Object} params - Search parameters
   * @param {string} params.title - Job title to search
   * @param {number} params.offset - Pagination offset (default: 0)
   * @param {number} params.limit - Number of results (default: 20)
   * @param {string} params.location - Job location filter
   * @returns {Promise} API response
   */
  searchJobs: async (params = {}) => {
    try {
      const {
        title = '',
        offset = 0,
        limit = 20,
        location = '',
        ...otherParams
      } = params;

      // Build query parameters
      const queryParams = new URLSearchParams({
        offset: offset.toString(),
        limit: limit.toString(),
        ...(title && { title: title }),
        ...(location && { location: location }),
        ...otherParams
      });

      const response = await rapidApiClient.get(`/jobs/search?${queryParams.toString()}`);
      return {
        success: true,
        data: response.data,
        error: null
      };
    } catch (error) {
      // console.error('RapidAPI search error:', error); // Removed by Issue Fixer Agent
      return {
        success: false,
        data: null,
        error: error.response?.data?.message || error.message || 'Failed to search jobs'
      };
    }
  },

  /**
   * Get job details by ID
   * @param {string} jobId - Job ID
   * @returns {Promise} API response
   */
  getJobDetails: async (jobId) => {
    try {
      const response = await rapidApiClient.get(`/jobs/${jobId}`);
      return {
        success: true,
        data: response.data,
        error: null
      };
    } catch (error) {
      // console.error('RapidAPI get job error:', error); // Removed by Issue Fixer Agent
      return {
        success: false,
        data: null,
        error: error.response?.data?.message || error.message || 'Failed to get job details'
      };
    }
  },

  /**
   * Get jobs by company
   * @param {string} company - Company name
   * @param {Object} params - Additional parameters
   * @returns {Promise} API response
   */
  getJobsByCompany: async (company, params = {}) => {
    try {
      const queryParams = new URLSearchParams({
        company,
        ...params
      });

      const response = await rapidApiClient.get(`/jobs/company?${queryParams.toString()}`);
      return {
        success: true,
        data: response.data,
        error: null
      };
    } catch (error) {
      // console.error('RapidAPI company jobs error:', error); // Removed by Issue Fixer Agent
      return {
        success: false,
        data: null,
        error: error.response?.data?.message || error.message || 'Failed to get company jobs'
      };
    }
  },

  /**
   * Get data-related internships
   * @returns {Promise} API response with filtered data internships
   */
  getDataInternships: async () => {
    try {
      // Call backend endpoint which handles RapidAPI
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_BASE_URL}/rapidapi/internships/data-roles`);
      const data = await response.json();
      
      if (response.ok && data.success) {
        return {
          success: true,
          data: data.data || [],
          count: data.count || 0,
          total: data.total || 0,
          error: null
        };
      } else {
        return {
          success: false,
          data: null,
          error: data.error || 'Failed to get internships'
        };
      }
    } catch (error) {
      // console.error('Internships API error:', error); // Removed by Issue Fixer Agent
      return {
        success: false,
        data: null,
        error: error.message || 'Failed to get internships'
      };
    }
  }
};

export default rapidApiService;
