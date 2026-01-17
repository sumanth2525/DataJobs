const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');

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

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

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
    console.error('Error fetching jobs:', error);
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
    console.error('Error fetching job:', error);
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
    console.error('Error creating job:', error);
    res.status(500).json({ success: false, error: error.message });
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
    console.error('Error updating job:', error);
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
    console.error('Error deleting job:', error);
    res.status(500).json({ success: false, error: error.message });
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
    console.error('Error registering user:', error);
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
    console.error('Error logging in:', error);
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
    console.error('Error getting user:', error);
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
    console.error('Error getting online users:', error);
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
    console.error('Error fetching messages:', error);
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
    console.error('Error sending message:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Start server (only if not in test environment)
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 API endpoints available at http://localhost:${PORT}/api`);
  });
}

// Export app for testing
module.exports = app;
