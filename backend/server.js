const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');
const OpenAI = require('openai');
const axios = require('axios');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// RapidAPI routes
const rapidApiRoutes = require('./routes/rapidApi');
app.use('/api/rapidapi', rapidApiRoutes);

// Adzuna API routes
const adzunaApiRoutes = require('./routes/adzunaApi');
app.use('/api/adzuna', adzunaApiRoutes);

// SerpAPI routes
const serpApiRoutes = require('./routes/serpApi');
app.use('/api/serpapi', serpApiRoutes);

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Initialize OpenAI client
// Configure your OpenAI API key in backend/.env file: OPENAI_API_KEY=your-api-key-here
// Get your API key from: https://platform.openai.com/api-keys
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
}) : null;

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// ==================== JOBS API ====================

// Get all jobs with optional filters
app.get('/api/jobs', async (req, res) => {
  try {
    const { search, location, experience, salary_min, salary_max, schedule, employment_type, timeFilter } = req.query;
    
    let query = supabase.from('jobs').select('*');
    
    // Time-based filtering
    if (timeFilter && timeFilter !== 'Latest') {
      const now = new Date();
      let cutoffDate;

      switch (timeFilter) {
        case 'Last 24 hours':
          cutoffDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case 'Last week':
          cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'Last month':
          cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          cutoffDate = null;
      }

      if (cutoffDate) {
        query = query.gte('created_at', cutoffDate.toISOString());
      }
    }
    
    // Apply filters
    if (search) {
      query = query.or(`title.ilike.%${search}%,company.ilike.%${search}%`);
    }
    
    if (location) {
      query = query.ilike('location', `%${location}%`);
    }
    
    if (experience) {
      query = query.contains('tags', [experience]);
    }
    
    if (schedule) {
      query = query.contains('tags', [schedule]);
    }
    
    if (employment_type) {
      query = query.contains('tags', [employment_type]);
    }
    
    // Order by newest first
    query = query.order('created_at', { ascending: false });
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    // Filter by salary range if provided
    let filteredData = data;
    if (salary_min || salary_max) {
      filteredData = data.filter(job => {
        const salaryMatch = job.salary?.match(/\$?(\d+)/);
        if (!salaryMatch) return true;
        
        const salaryValue = parseInt(salaryMatch[1]);
        const monthlySalary = job.salary?.includes('/hr') ? salaryValue * 160 : salaryValue;
        
        if (salary_min && monthlySalary < parseInt(salary_min)) return false;
        if (salary_max && monthlySalary > parseInt(salary_max)) return false;
        return true;
      });
    }
    
    res.json({ success: true, data: filteredData, count: filteredData.length });
  } catch (error) {
    // console.error('Error fetching jobs:', error); // Removed by Issue Fixer Agent
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get single job by ID
app.get('/api/jobs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    if (!data) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }
    
    res.json({ success: true, data });
  } catch (error) {
    // console.error('Error fetching job:', error); // Removed by Issue Fixer Agent
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create new job
app.post('/api/jobs', async (req, res) => {
  try {
    const {
      company,
      title,
      location,
      salary,
      workLocation,
      experience,
      workingSchedule,
      employmentType,
      tags,
      description,
      link
    } = req.body;
    
    // Validation
    if (!company || !title || !link) {
      return res.status(400).json({
        success: false,
        error: 'Company, title, and link are required'
      });
    }
    
    // Prepare tags array
    const jobTags = [
      workingSchedule,
      `${experience} level`,
      workLocation === 'Remote' ? 'Distant' : workLocation,
      employmentType,
      ...(tags || [])
    ].filter(Boolean);
    
    const jobData = {
      company,
      title,
      location: location || 'Not specified',
      salary: salary || 'Not specified',
      company_logo: company.charAt(0).toUpperCase(),
      tags: jobTags,
      link,
      description: description || '',
      created_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('jobs')
      .insert([jobData])
      .select()
      .single();
    
    if (error) throw error;
    
    res.status(201).json({ success: true, data });
  } catch (error) {
    // console.error('Error creating job:', error); // Removed by Issue Fixer Agent
    res.status(500).json({ success: false, error: error.message });
  }
});

// Bulk create jobs from external APIs (with duplicate checking)
app.post('/api/jobs/bulk', async (req, res) => {
  try {
    const { jobs } = req.body;
    
    if (!Array.isArray(jobs) || jobs.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Jobs array is required and cannot be empty'
      });
    }

    // Get existing jobs to check for duplicates
    const { data: existingJobs, error: fetchError } = await supabase
      .from('jobs')
      .select('link, company, title');
    
    if (fetchError) throw fetchError;

    // Create a Set of existing job links for fast lookup
    const existingLinks = new Set(existingJobs?.map(j => j.link?.toLowerCase().trim()) || []);
    
    // Process and filter jobs
    const jobsToInsert = [];
    const skipped = [];

    for (const job of jobs) {
      // Validate required fields
      if (!job.company || !job.title || !job.link) {
        skipped.push({ job, reason: 'Missing required fields (company, title, or link)' });
        continue;
      }

      // Check for duplicates by link
      const normalizedLink = job.link.toLowerCase().trim();
      if (existingLinks.has(normalizedLink)) {
        skipped.push({ job: { title: job.title, company: job.company }, reason: 'Duplicate link' });
        continue;
      }

      // Prepare job data for database
      const jobData = {
        company: job.company,
        title: job.title,
        location: job.location || 'Not specified',
        salary: job.salary || 'Not specified',
        company_logo: job.company_logo || job.company?.charAt(0).toUpperCase() || '?',
        tags: Array.isArray(job.tags) ? job.tags : (job.tags ? [job.tags] : []),
        link: job.link,
        description: job.description || '',
        work_location: job.workLocation || 'Remote',
        experience: job.experience || 'Middle',
        working_schedule: job.workingSchedule || 'Full time',
        employment_type: job.employmentType || 'Full Day',
        posted_by: 'External API',
        created_at: job.created_at || new Date().toISOString()
      };

      jobsToInsert.push(jobData);
      existingLinks.add(normalizedLink); // Add to set to prevent duplicates in the same batch
    }

    // Insert new jobs
    let insertedCount = 0;
    if (jobsToInsert.length > 0) {
      const { data: insertedJobs, error: insertError } = await supabase
        .from('jobs')
        .insert(jobsToInsert)
        .select();
      
      if (insertError) throw insertError;
      insertedCount = insertedJobs?.length || 0;
    }

    res.json({
      success: true,
      inserted: insertedCount,
      skipped: skipped.length,
      total: jobs.length,
      details: {
        inserted: insertedCount,
        skipped: skipped.length,
        skippedDetails: skipped.slice(0, 10) // Include first 10 skipped items for debugging
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to bulk insert jobs'
    });
  }
});

// Update job
app.put('/api/jobs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const { data, error } = await supabase
      .from('jobs')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({ success: true, data });
  } catch (error) {
    // console.error('Error updating job:', error); // Removed by Issue Fixer Agent
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete job
app.delete('/api/jobs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabase
      .from('jobs')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    res.json({ success: true, message: 'Job deleted successfully' });
  } catch (error) {
    // console.error('Error deleting job:', error); // Removed by Issue Fixer Agent
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== JOB SCRAPING API (ChatGPT) ====================

// Scrape job details from URL using ChatGPT
app.post('/api/scrape-job', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'URL is required'
      });
    }

    // Validate URL
    try {
      new URL(url);
    } catch (e) {
      return res.status(400).json({
        success: false,
        error: 'Invalid URL format'
      });
    }

    // Check if OpenAI API key is configured
    if (!openai) {
      return res.status(503).json({
        success: false,
        error: 'OpenAI API key not configured. Please set OPENAI_API_KEY in your .env file.'
      });
    }

    // Fetch webpage content
    let webpageContent = '';
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        timeout: 10000,
        maxRedirects: 5
      });
      webpageContent = response.data;
    } catch (error) {
      // If direct fetch fails, we'll still try with just the URL
      webpageContent = `Job posting URL: ${url}`;
    }

    // Extract text content (basic HTML stripping)
    const textContent = webpageContent
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 10000); // Limit to first 10000 characters to avoid token limits

    // Create prompt for ChatGPT
    const prompt = `Extract job details from the following job posting webpage content. Return a JSON object with the following structure (use null for missing fields):

{
  "company": "Company name",
  "title": "Job title",
  "location": "Job location (city, state, or remote)",
  "salary": "Salary range or compensation",
  "description": "Full job description",
  "workLocation": "Remote" or "On-site" or "Hybrid",
  "experience": "Junior" or "Middle" or "Senior",
  "workingSchedule": "Full time" or "Part time" or "Contract" or "Internship",
  "employmentType": "Full Day" or "Shift work" or "Flexible schedule" or "Project work",
  "tags": ["tag1", "tag2"]
}

Webpage content:
${textContent.substring(0, 8000)}

Return ONLY valid JSON, no additional text or markdown formatting.`;

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that extracts structured job information from web pages. Always return valid JSON only.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 1000
    });

    // Parse the response
    let jobData;
    try {
      const responseText = completion.choices[0].message.content.trim();
      // Remove markdown code blocks if present
      const jsonText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      jobData = JSON.parse(jsonText);
    } catch (parseError) {
      return res.status(500).json({
        success: false,
        error: 'Failed to parse job details from ChatGPT response'
      });
    }

    // Add the original URL as link
    jobData.link = url;

    // Set defaults for required fields
    if (!jobData.workLocation) jobData.workLocation = 'Remote';
    if (!jobData.experience) jobData.experience = 'Middle';
    if (!jobData.workingSchedule) jobData.workingSchedule = 'Full time';
    if (!jobData.employmentType) jobData.employmentType = 'Full Day';
    if (!jobData.tags) jobData.tags = [];

    res.json({
      success: true,
      data: jobData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to scrape job details'
    });
  }
});

// ==================== AUTHENTICATION API ====================

// Register new user
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, phone, name } = req.body;
    
    if (!email && !phone) {
      return res.status(400).json({
        success: false,
        error: 'Email or phone is required'
      });
    }
    
    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters'
      });
    }
    
    // Use Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email: email || undefined,
      phone: phone || undefined,
      password,
      options: {
        data: {
          name: name || 'User',
          full_name: name || 'User'
        }
      }
    });
    
    if (error) throw error;
    
    res.status(201).json({
      success: true,
      data: {
        user: data.user,
        message: 'User registered successfully'
      }
    });
  } catch (error) {
    // console.error('Error registering user:', error); // Removed by Issue Fixer Agent
    res.status(500).json({ success: false, error: error.message });
  }
});

// Login user
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, phone, password } = req.body;
    
    if (!password) {
      return res.status(400).json({
        success: false,
        error: 'Password is required'
      });
    }
    
    // Use Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email || undefined,
      phone: phone || undefined,
      password
    });
    
    if (error) throw error;
    
    res.json({
      success: true,
      data: {
        user: data.user,
        session: data.session
      }
    });
  } catch (error) {
    // console.error('Error logging in:', error); // Removed by Issue Fixer Agent
    res.status(401).json({ success: false, error: 'Invalid credentials' });
  }
});

// Get current user
app.get('/api/auth/user', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ success: false, error: 'No token provided' });
    }
    
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error) throw error;
    
    res.json({ success: true, data: user });
  } catch (error) {
    // console.error('Error getting user:', error); // Removed by Issue Fixer Agent
    res.status(401).json({ success: false, error: 'Invalid token' });
  }
});

// ==================== ONLINE USERS API ====================

// Get online users count (using presence)
app.get('/api/users/online', async (req, res) => {
  try {
    // This would typically use Supabase Realtime presence
    // For now, return a count from a separate table or use realtime
    const { data, error } = await supabase
      .from('online_users')
      .select('count')
      .single();
    
    if (error && error.code !== 'PGRST116') {
      // PGRST116 is "no rows returned" - we'll handle that
      throw error;
    }
    
    const count = data?.count || 1247; // Default fallback
    
    res.json({ success: true, count });
  } catch (error) {
    // console.error('Error getting online users:', error); // Removed by Issue Fixer Agent
    res.json({ success: true, count: 1247 }); // Fallback
  }
});

// ==================== MESSAGES API ====================

// Get messages for a user
app.get('/api/messages', async (req, res) => {
  try {
    const userId = req.query.userId;
    
    if (!userId) {
      return res.status(400).json({ success: false, error: 'User ID required' });
    }
    
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    res.json({ success: true, data });
  } catch (error) {
    // console.error('Error fetching messages:', error); // Removed by Issue Fixer Agent
    res.status(500).json({ success: false, error: error.message });
  }
});

// Send message
app.post('/api/messages', async (req, res) => {
  try {
    const { sender_id, receiver_id, content } = req.body;
    
    if (!sender_id || !receiver_id || !content) {
      return res.status(400).json({
        success: false,
        error: 'Sender ID, receiver ID, and content are required'
      });
    }
    
    const { data, error } = await supabase
      .from('messages')
      .insert([{
        sender_id,
        receiver_id,
        content,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    res.status(201).json({ success: true, data });
  } catch (error) {
    // console.error('Error sending message:', error); // Removed by Issue Fixer Agent
    res.status(500).json({ success: false, error: error.message });
  }
});

// Start server (only if not in test environment)
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    // console.log(`🚀 Server running on http://localhost:${PORT}`); // Removed by Issue Fixer Agent
    // console.log(`📊 API endpoints available at http://localhost:${PORT}/api`); // Removed by Issue Fixer Agent
  });
}

// Export app for testing
module.exports = app;
