// SerpAPI integration for Google Jobs search
const express = require('express');
const axios = require('axios');
const router = express.Router();

const SERPAPI_KEY = process.env.SERPAPI_KEY || '';
const SERPAPI_BASE_URL = 'https://serpapi.com/search.json';

/**
 * Search Google Jobs via SerpAPI
 * GET /api/serpapi/jobs/search
 * Query params: q, location, num, next_page_token, etc.
 */
router.get('/jobs/search', async (req, res) => {
  try {
    // Check if API key is configured
    if (!SERPAPI_KEY) {
      return res.status(503).json({
        success: false,
        error: 'SerpAPI key not configured. Please set SERPAPI_KEY in your .env file.'
      });
    }

    const {
      q = 'data scientist jobs', // Search query
      location = '', // Location (e.g., "United States", "New York, NY")
      num = 20, // Number of results per page
      engine = 'google_jobs', // Search engine (google_jobs by default)
      lrad = '', // Location radius
      hl = 'en', // Language
      gl = 'us', // Country code
      next_page_token = '' // Pagination token (replaces deprecated 'start' parameter)
    } = req.query;

    // Build query parameters for SerpAPI
    const params = {
      api_key: SERPAPI_KEY,
      engine: engine,
      q: q,
      num: parseInt(num),
      hl: hl,
      gl: gl
    };

    // Add next_page_token for pagination if provided (replaces deprecated 'start' parameter)
    if (next_page_token) {
      params.next_page_token = next_page_token;
    }

    // Only add location-related params if provided
    if (location) {
      params.location = location;
    }
    if (lrad) {
      params.lrad = parseInt(lrad);
    }

    const response = await axios.get(SERPAPI_BASE_URL, { params });

    // Transform SerpAPI Google Jobs response to match our format
    const jobs = response.data?.jobs_results || [];
    
    const transformedJobs = jobs.map(job => ({
      id: `serpapi_${job.job_id || job.title?.replace(/\s+/g, '_') || Date.now()}`,
      company: job.company_name || 'Unknown Company',
      title: job.title || 'Job Title',
      location: job.location || 'Not specified',
      salary: job.detected_extensions?.salary || 
              (job.detected_extensions?.schedule_type ? `${job.detected_extensions.schedule_type} - Salary not specified` : 'Not specified'),
      company_logo: job.company_name?.charAt(0).toUpperCase() || 'A',
      tags: [
        job.detected_extensions?.schedule_type || 'Full time',
        job.detected_extensions?.work_type || 'On-site',
        ...(job.thumbnail ? ['Has image'] : [])
      ].filter(Boolean),
      link: job.apply_options?.[0]?.link || job.related_links?.[0]?.link || '#',
      description: job.description || '',
      workLocation: job.detected_extensions?.work_type === 'Remote' ? 'Remote' :
                   job.detected_extensions?.work_type === 'Hybrid' ? 'Hybrid' : 'On-site',
      experience: job.title?.toLowerCase().includes('senior') ? 'Senior' :
                  job.title?.toLowerCase().includes('junior') || job.title?.toLowerCase().includes('entry') ? 'Junior' : 'Middle',
      workingSchedule: job.detected_extensions?.schedule_type || 'Full time',
      employmentType: 'Full Day',
      created_at: job.posted_at ? new Date(job.posted_at).toISOString() : new Date().toISOString(),
      // Store SerpAPI-specific data
      serpapi_job_id: job.job_id,
      serpapi_thumbnail: job.thumbnail,
      serpapi_via: job.via,
      serpapi_posted_at: job.posted_at
    }));

    res.json({
      success: true,
      data: transformedJobs,
      count: transformedJobs.length,
      total: response.data?.search_information?.total_results || transformedJobs.length,
      pagination: {
        num: parseInt(num),
        next_page_token: response.data?.pagination?.next_page_token || null
      }
    });
  } catch (error) {
    res.status(error.response?.status || 500).json({
      success: false,
      error: error.response?.data?.error || error.message || 'Failed to search jobs from SerpAPI'
    });
  }
});

/**
 * Get data-related jobs from Google Jobs via SerpAPI
 * GET /api/serpapi/jobs/data-roles
 */
router.get('/jobs/data-roles', async (req, res) => {
  try {
    if (!SERPAPI_KEY) {
      return res.status(503).json({
        success: false,
        error: 'SerpAPI key not configured'
      });
    }

    const {
      location = '',
      num = 50
    } = req.query;

    // Search for data-related roles
    const dataKeywords = [
      'data scientist',
      'data analyst',
      'data engineer',
      'machine learning engineer',
      'business analyst'
    ];

    // Fetch jobs for each keyword and combine
    const searchPromises = dataKeywords.map((keyword, index) => {
      const params = {
        api_key: SERPAPI_KEY,
        engine: 'google_jobs',
        q: `${keyword} jobs`,
        num: Math.ceil(num / dataKeywords.length),
        hl: 'en',
        gl: 'us'
      };

      if (location) {
        params.location = location;
      }

      return axios.get(SERPAPI_BASE_URL, { params });
    });

    const responses = await Promise.allSettled(searchPromises);
    const allJobs = [];

    responses.forEach(response => {
      if (response.status === 'fulfilled' && response.value?.data?.jobs_results) {
        allJobs.push(...response.value.data.jobs_results);
      }
    });

    // Remove duplicates based on job_id or title
    const uniqueJobs = Array.from(
      new Map(allJobs.map(job => [job.job_id || job.title, job])).values()
    ).slice(0, parseInt(num));

    // Transform jobs
    const transformedJobs = uniqueJobs.map(job => ({
      id: `serpapi_${job.job_id || job.title?.replace(/\s+/g, '_') || Date.now()}`,
      company: job.company_name || 'Unknown Company',
      title: job.title || 'Job Title',
      location: job.location || 'Not specified',
      salary: job.detected_extensions?.salary || 'Not specified',
      company_logo: job.company_name?.charAt(0).toUpperCase() || 'A',
      tags: ['Data', job.detected_extensions?.schedule_type || 'Full time'].filter(Boolean),
      link: job.apply_options?.[0]?.link || job.related_links?.[0]?.link || '#',
      description: job.description || '',
      workLocation: job.detected_extensions?.work_type === 'Remote' ? 'Remote' : 'On-site',
      experience: 'Middle',
      workingSchedule: job.detected_extensions?.schedule_type || 'Full time',
      employmentType: 'Full Day',
      created_at: job.posted_at ? new Date(job.posted_at).toISOString() : new Date().toISOString()
    }));

    res.json({
      success: true,
      data: transformedJobs,
      count: transformedJobs.length
    });
  } catch (error) {
    res.status(error.response?.status || 500).json({
      success: false,
      error: error.response?.data?.error || error.message || 'Failed to fetch data roles from SerpAPI'
    });
  }
});

/**
 * Get job details by SerpAPI job ID
 * Note: SerpAPI doesn't have a direct job details endpoint,
 * so we search for the job by query and return the first match
 * GET /api/serpapi/jobs/:id
 */
router.get('/jobs/:id', async (req, res) => {
  try {
    if (!SERPAPI_KEY) {
      return res.status(503).json({
        success: false,
        error: 'SerpAPI key not configured'
      });
    }

    const { id } = req.params;
    // Remove 'serpapi_' prefix if present
    const jobId = id.replace(/^serpapi_/, '');

    // Search for jobs and find the one matching the ID
    // Note: This is a workaround since SerpAPI doesn't have direct job lookup
    const params = {
      api_key: SERPAPI_KEY,
      engine: 'google_jobs',
      q: 'data jobs',
      num: 100,
      hl: 'en',
      gl: 'us'
    };

    const response = await axios.get(SERPAPI_BASE_URL, { params });
    const jobs = response.data?.jobs_results || [];
    
    // Try to find job by ID or by matching title
    const job = jobs.find(j => 
      j.job_id === jobId || 
      j.title?.replace(/\s+/g, '_') === jobId
    );

    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Job not found'
      });
    }

    // Transform to match our format
    const transformedJob = {
      id: `serpapi_${job.job_id || job.title?.replace(/\s+/g, '_')}`,
      company: job.company_name || 'Unknown Company',
      title: job.title || 'Job Title',
      location: job.location || 'Not specified',
      salary: job.detected_extensions?.salary || 'Not specified',
      company_logo: job.company_name?.charAt(0).toUpperCase() || 'A',
      tags: [
        job.detected_extensions?.schedule_type || 'Full time',
        job.detected_extensions?.work_type || 'On-site'
      ].filter(Boolean),
      link: job.apply_options?.[0]?.link || job.related_links?.[0]?.link || '#',
      description: job.description || '',
      workLocation: job.detected_extensions?.work_type === 'Remote' ? 'Remote' : 'On-site',
      experience: job.title?.toLowerCase().includes('senior') ? 'Senior' :
                  job.title?.toLowerCase().includes('junior') || job.title?.toLowerCase().includes('entry') ? 'Junior' : 'Middle',
      workingSchedule: job.detected_extensions?.schedule_type || 'Full time',
      employmentType: 'Full Day',
      created_at: job.posted_at ? new Date(job.posted_at).toISOString() : new Date().toISOString(),
      serpapi_job_id: job.job_id,
      serpapi_thumbnail: job.thumbnail,
      serpapi_via: job.via,
      serpapi_posted_at: job.posted_at
    };

    res.json({
      success: true,
      data: transformedJob
    });
  } catch (error) {
    res.status(error.response?.status || 500).json({
      success: false,
      error: error.response?.data?.error || error.message || 'Failed to get job details from SerpAPI'
    });
  }
});

module.exports = router;
