// RapidAPI integration for backend
const express = require('express');
const axios = require('axios');
const router = express.Router();

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || '8ee6bd0bedmsh81dd306367586c8p1bff7fjsn0de54799feba';
const RAPIDAPI_HOST = process.env.RAPIDAPI_HOST || 'rapidapi.com';
const RAPIDAPI_APP = process.env.RAPIDAPI_APP || 'default-application_8592907';
const RAPIDAPI_BASE_URL = 'https://rapidapi.com';
const INTERNSHIPS_API_HOST = 'internships-api.p.rapidapi.com';

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

/**
 * Search jobs via RapidAPI
 * GET /api/rapidapi/jobs/search
 */
router.get('/jobs/search', async (req, res) => {
  try {
    const {
      title = '',
      offset = 0,
      limit = 20,
      location = '',
      ...otherParams
    } = req.query;

    // Build query parameters
    const queryParams = new URLSearchParams({
      offset: offset.toString(),
      limit: limit.toString(),
      ...(title && { title: title }),
      ...(location && { location: location }),
      ...otherParams
    });

    const response = await rapidApiClient.get(`/jobs/search?${queryParams.toString()}`);
    
    res.json({
      success: true,
      data: response.data,
      count: response.data?.results?.length || 0
    });
  } catch (error) {
    // console.error('RapidAPI search error:', error); // Removed by Issue Fixer Agent
    res.status(error.response?.status || 500).json({
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to search jobs'
    });
  }
});

/**
 * Get job details by ID
 * GET /api/rapidapi/jobs/:id
 */
router.get('/jobs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const response = await rapidApiClient.get(`/jobs/${id}`);
    
    res.json({
      success: true,
      data: response.data
    });
  } catch (error) {
    // console.error('RapidAPI get job error:', error); // Removed by Issue Fixer Agent
    res.status(error.response?.status || 500).json({
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to get job details'
    });
  }
});

/**
 * Get jobs by company
 * GET /api/rapidapi/jobs/company/:company
 */
router.get('/jobs/company/:company', async (req, res) => {
  try {
    const { company } = req.params;
    const queryParams = new URLSearchParams({
      company,
      ...req.query
    });

    const response = await rapidApiClient.get(`/jobs/company?${queryParams.toString()}`);
    
    res.json({
      success: true,
      data: response.data,
      count: response.data?.results?.length || 0
    });
  } catch (error) {
    // console.error('RapidAPI company jobs error:', error); // Removed by Issue Fixer Agent
    res.status(error.response?.status || 500).json({
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to get company jobs'
    });
  }
});

/**
 * Get internships for data-related roles
 * GET /api/rapidapi/internships/data-roles
 */
router.get('/internships/data-roles', async (req, res) => {
  try {
    const https = require('https');
    
    const options = {
      method: 'GET',
      hostname: INTERNSHIPS_API_HOST,
      port: null,
      path: '/active-jb-7d',
      headers: {
        'x-rapidapi-key': RAPIDAPI_KEY,
        'x-rapidapi-host': INTERNSHIPS_API_HOST,
        'x-rapidapi-app': RAPIDAPI_APP
      }
    };

    const internshipData = await new Promise((resolve, reject) => {
      const req = https.request(options, function (res) {
        const chunks = [];

        res.on('data', function (chunk) {
          chunks.push(chunk);
        });

        res.on('end', function () {
          try {
            const body = Buffer.concat(chunks);
            const data = JSON.parse(body.toString());
            resolve(data);
          } catch (error) {
            reject(error);
          }
        });
      });

      req.on('error', function (error) {
        reject(error);
      });

      req.end();
    });

    // Filter for data-related roles only
    const dataRoles = [
      'data scientist', 'data analyst', 'data engineer', 'data science',
      'machine learning', 'ml engineer', 'ai engineer', 'business analyst',
      'data intern', 'analytics', 'big data', 'data visualization',
      'statistics', 'python', 'sql', 'r programming', 'tableau', 'power bi'
    ];

    let filteredInternships = [];
    
    if (Array.isArray(internshipData)) {
      filteredInternships = internshipData.filter(internship => {
        const title = (internship.title || internship.job_title || '').toLowerCase();
        const description = (internship.description || internship.job_description || '').toLowerCase();
        const company = (internship.company || internship.company_name || '').toLowerCase();
        
        return dataRoles.some(role => 
          title.includes(role) || 
          description.includes(role) || 
          company.includes(role)
        );
      });
    } else if (internshipData.jobs || internshipData.results || internshipData.data) {
      const jobs = internshipData.jobs || internshipData.results || internshipData.data || [];
      filteredInternships = jobs.filter(internship => {
        const title = (internship.title || internship.job_title || '').toLowerCase();
        const description = (internship.description || internship.job_description || '').toLowerCase();
        const company = (internship.company || internship.company_name || '').toLowerCase();
        
        return dataRoles.some(role => 
          title.includes(role) || 
          description.includes(role) || 
          company.includes(role)
        );
      });
    }

    res.json({
      success: true,
      data: filteredInternships,
      count: filteredInternships.length,
      total: Array.isArray(internshipData) ? internshipData.length : (internshipData.jobs?.length || internshipData.results?.length || internshipData.data?.length || 0)
    });
  } catch (error) {
    // console.error('Internships API error:', error); // Removed by Issue Fixer Agent
    res.status(error.response?.status || 500).json({
      success: false,
      error: error.message || 'Failed to fetch internships'
    });
  }
});

module.exports = router;
