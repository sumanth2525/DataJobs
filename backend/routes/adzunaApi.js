// Adzuna API integration for job search
const express = require('express');
const axios = require('axios');
const router = express.Router();

const ADZUNA_APP_ID = process.env.ADZUNA_APP_ID || '';
const ADZUNA_APP_KEY = process.env.ADZUNA_APP_KEY || '';
const ADZUNA_BASE_URL = 'https://api.adzuna.com/v1/api';
const ADZUNA_COUNTRY = process.env.ADZUNA_COUNTRY || 'us'; // Default to US, options: us, gb, au, ca, de, etc.

// Create axios instance for Adzuna API
const adzunaClient = axios.create({
  baseURL: ADZUNA_BASE_URL,
  params: {
    app_id: ADZUNA_APP_ID,
    app_key: ADZUNA_APP_KEY
  },
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * Search jobs via Adzuna API
 * GET /api/adzuna/jobs/search
 * Query params: what, where, page, results_per_page, etc.
 */
router.get('/jobs/search', async (req, res) => {
  try {
    // Check if API keys are configured
    if (!ADZUNA_APP_ID || !ADZUNA_APP_KEY) {
      return res.status(503).json({
        success: false,
        error: 'Adzuna API keys not configured. Please set ADZUNA_APP_ID and ADZUNA_APP_KEY in your .env file.'
      });
    }

    const {
      what = 'data', // Job title/keywords
      where = '', // Location
      page = 1,
      results_per_page = 20,
      sort_by = 'date', // date, salary, relevance
      content_type = 'job', // job, resume
      category = '', // Job category
      max_days_old = '',
      salary_min = '',
      salary_max = '',
      full_time = '',
      part_time = '',
      contract = '',
      permanent = ''
    } = req.query;

    // Build query parameters
    // Note: app_id and app_key are already set in adzunaClient instance params
    const params = {
      what: what,
      page: parseInt(page),
      results_per_page: parseInt(results_per_page),
      sort_by: sort_by,
      content_type: content_type
    };
    
    // Only add 'where' if provided
    if (where) {
      params.where = where;
    }

    // Add optional parameters
    if (category) params.category = category;
    if (max_days_old) params.max_days_old = parseInt(max_days_old);
    if (salary_min) params.salary_min = parseInt(salary_min);
    if (salary_max) params.salary_max = parseInt(salary_max);
    if (full_time) params.full_time = full_time === 'true' ? 1 : 0;
    if (part_time) params.part_time = part_time === 'true' ? 1 : 0;
    if (contract) params.contract = contract === 'true' ? 1 : 0;
    if (permanent) params.permanent = permanent === 'true' ? 1 : 0;

    // Remove undefined values from params before sending
    Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);
    
    const response = await adzunaClient.get(`/jobs/${ADZUNA_COUNTRY}/search/${page}`, { params });

    // Transform Adzuna response to match our format
    const transformedJobs = (response.data.results || []).map(job => ({
      id: `adzuna_${job.id}`,
      company: job.company?.display_name || 'Unknown Company',
      title: job.title || 'Job Title',
      location: job.location?.display_name || job.location?.area?.join(', ') || 'Not specified',
      salary: job.salary_min && job.salary_max 
        ? `$${job.salary_min?.toLocaleString()} - $${job.salary_max?.toLocaleString()}`
        : job.salary_min 
        ? `$${job.salary_min?.toLocaleString()}+`
        : job.salary_max
        ? `Up to $${job.salary_max?.toLocaleString()}`
        : 'Not specified',
      company_logo: job.company?.display_name?.charAt(0).toUpperCase() || 'A',
      tags: [
        job.contract_time || 'Full time',
        job.category?.label || 'General',
        ...(job.latitude && job.longitude ? ['Location-based'] : [])
      ].filter(Boolean),
      link: job.redirect_url || job.url || '#',
      description: job.description || '',
      workLocation: job.contract_time?.toLowerCase().includes('remote') ? 'Remote' : 
                   job.location?.display_name?.toLowerCase().includes('remote') ? 'Remote' : 'On-site',
      experience: job.title?.toLowerCase().includes('senior') ? 'Senior' :
                  job.title?.toLowerCase().includes('junior') || job.title?.toLowerCase().includes('entry') ? 'Junior' : 'Middle',
      workingSchedule: job.contract_time === 'full_time' ? 'Full time' :
                      job.contract_time === 'part_time' ? 'Part time' :
                      job.contract_time === 'contract' ? 'Contract' : 'Full time',
      employmentType: job.contract_type === 'permanent' ? 'Full Day' : 'Contract',
      created_at: job.created ? new Date(job.created).toISOString() : new Date().toISOString(),
      // Store Adzuna-specific data
      adzuna_id: job.id,
      adzuna_category: job.category,
      adzuna_created: job.created
    }));

    res.json({
      success: true,
      data: transformedJobs,
      count: transformedJobs.length,
      total: response.data.count || 0,
      page: parseInt(page),
      results_per_page: parseInt(results_per_page)
    });
  } catch (error) {
    res.status(error.response?.status || 500).json({
      success: false,
      error: error.response?.data?.error || error.message || 'Failed to search jobs from Adzuna'
    });
  }
});

/**
 * Get job details by Adzuna ID
 * GET /api/adzuna/jobs/:id
 */
router.get('/jobs/:id', async (req, res) => {
  try {
    // Check if API keys are configured
    if (!ADZUNA_APP_ID || !ADZUNA_APP_KEY) {
      return res.status(503).json({
        success: false,
        error: 'Adzuna API keys not configured. Please set ADZUNA_APP_ID and ADZUNA_APP_KEY in your .env file.'
      });
    }

    const { id } = req.params;
    // Remove 'adzuna_' prefix if present
    const adzunaId = id.replace(/^adzuna_/, '');

    const response = await adzunaClient.get(`/jobs/${ADZUNA_COUNTRY}/search/1`, {
      params: {
        app_id: ADZUNA_APP_ID,
        app_key: ADZUNA_APP_KEY,
        what_or_id: adzunaId,
        results_per_page: 1
      }
    });

    const job = response.data.results?.[0];
    
    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Job not found'
      });
    }

    // Transform to match our format
    const transformedJob = {
      id: `adzuna_${job.id}`,
      company: job.company?.display_name || 'Unknown Company',
      title: job.title || 'Job Title',
      location: job.location?.display_name || job.location?.area?.join(', ') || 'Not specified',
      salary: job.salary_min && job.salary_max 
        ? `$${job.salary_min?.toLocaleString()} - $${job.salary_max?.toLocaleString()}`
        : job.salary_min 
        ? `$${job.salary_min?.toLocaleString()}+`
        : 'Not specified',
      company_logo: job.company?.display_name?.charAt(0).toUpperCase() || 'A',
      tags: [
        job.contract_time || 'Full time',
        job.category?.label || 'General'
      ].filter(Boolean),
      link: job.redirect_url || job.url || '#',
      description: job.description || '',
      workLocation: job.contract_time?.toLowerCase().includes('remote') ? 'Remote' : 'On-site',
      experience: job.title?.toLowerCase().includes('senior') ? 'Senior' :
                  job.title?.toLowerCase().includes('junior') || job.title?.toLowerCase().includes('entry') ? 'Junior' : 'Middle',
      workingSchedule: job.contract_time === 'full_time' ? 'Full time' : 'Full time',
      employmentType: job.contract_type === 'permanent' ? 'Full Day' : 'Contract',
      created_at: job.created ? new Date(job.created).toISOString() : new Date().toISOString(),
      adzuna_id: job.id,
      adzuna_category: job.category,
      adzuna_created: job.created
    };

    res.json({
      success: true,
      data: transformedJob
    });
  } catch (error) {
    res.status(error.response?.status || 500).json({
      success: false,
      error: error.response?.data?.error || error.message || 'Failed to get job details from Adzuna'
    });
  }
});

/**
 * Get job categories from Adzuna
 * GET /api/adzuna/categories
 */
router.get('/categories', async (req, res) => {
  try {
    if (!ADZUNA_APP_ID || !ADZUNA_APP_KEY) {
      return res.status(503).json({
        success: false,
        error: 'Adzuna API keys not configured'
      });
    }

    const response = await adzunaClient.get(`/jobs/${ADZUNA_COUNTRY}/categories`);

    res.json({
      success: true,
      data: response.data.results || []
    });
  } catch (error) {
    res.status(error.response?.status || 500).json({
      success: false,
      error: error.response?.data?.error || error.message || 'Failed to fetch categories'
    });
  }
});

/**
 * Search data-related jobs specifically
 * GET /api/adzuna/jobs/data-roles
 */
router.get('/jobs/data-roles', async (req, res) => {
  try {
    if (!ADZUNA_APP_ID || !ADZUNA_APP_KEY) {
      return res.status(503).json({
        success: false,
        error: 'Adzuna API keys not configured'
      });
    }

    const {
      location = '',
      page = 1,
      results_per_page = 50
    } = req.query;

    // Search for data-related roles
    const dataKeywords = [
      'data scientist',
      'data analyst',
      'data engineer',
      'machine learning',
      'business analyst',
      'data science'
    ];

    // Fetch jobs for each keyword and combine
    const searchPromises = dataKeywords.map(keyword => {
      const params = {
        what: keyword,
        results_per_page: Math.ceil(results_per_page / dataKeywords.length)
      };
      // Only add 'where' if location is provided
      if (location) {
        params.where = location;
      }
      return adzunaClient.get(`/jobs/${ADZUNA_COUNTRY}/search/${page}`, { params });
    });

    const responses = await Promise.all(searchPromises);
    const allJobs = responses.flatMap(response => response.data.results || []);

    // Remove duplicates based on job ID
    const uniqueJobs = Array.from(
      new Map(allJobs.map(job => [job.id, job])).values()
    ).slice(0, parseInt(results_per_page));

    // Transform jobs
    const transformedJobs = uniqueJobs.map(job => ({
      id: `adzuna_${job.id}`,
      company: job.company?.display_name || 'Unknown Company',
      title: job.title || 'Job Title',
      location: job.location?.display_name || 'Not specified',
      salary: job.salary_min && job.salary_max 
        ? `$${job.salary_min?.toLocaleString()} - $${job.salary_max?.toLocaleString()}`
        : 'Not specified',
      company_logo: job.company?.display_name?.charAt(0).toUpperCase() || 'A',
      tags: ['Data', job.contract_time || 'Full time', job.category?.label || 'General'].filter(Boolean),
      link: job.redirect_url || job.url || '#',
      description: job.description || '',
      workLocation: 'Remote',
      experience: 'Middle',
      workingSchedule: 'Full time',
      employmentType: 'Full Day',
      created_at: job.created ? new Date(job.created).toISOString() : new Date().toISOString()
    }));

    res.json({
      success: true,
      data: transformedJobs,
      count: transformedJobs.length
    });
  } catch (error) {
    res.status(error.response?.status || 500).json({
      success: false,
      error: error.response?.data?.error || error.message || 'Failed to fetch data roles'
    });
  }
});

module.exports = router;
