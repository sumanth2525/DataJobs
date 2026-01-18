-- ============================================
-- DataJobPortal - Simplified Supabase Schema
-- ============================================
-- This schema includes only: Jobs, API Calls, and Logs tables
-- ============================================

-- ============================================
-- DROP EXISTING TABLES (if they exist)
-- ============================================
-- This will remove all existing tables and their data
-- WARNING: This will delete all data in these tables!
-- ============================================

-- Drop dependent tables first (due to foreign keys)
DROP TABLE IF EXISTS saved_jobs CASCADE;
DROP TABLE IF EXISTS job_applications CASCADE;
DROP TABLE IF EXISTS page_views CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;

-- Drop main tables
DROP TABLE IF EXISTS jobs CASCADE;
DROP TABLE IF EXISTS api_calls CASCADE;
DROP TABLE IF EXISTS logs CASCADE;

-- Drop views if they exist
DROP VIEW IF EXISTS job_stats CASCADE;
DROP VIEW IF EXISTS recent_jobs CASCADE;
DROP VIEW IF EXISTS error_logs CASCADE;
DROP VIEW IF EXISTS api_call_stats CASCADE;

-- Drop functions if they exist
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS update_conversation_on_message() CASCADE;
DROP FUNCTION IF EXISTS get_jobs_by_company() CASCADE;
DROP FUNCTION IF EXISTS get_top_posters(INTEGER) CASCADE;

-- ============================================
-- 1. JOBS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS jobs (
  id BIGSERIAL PRIMARY KEY,
  company TEXT NOT NULL,
  title TEXT NOT NULL,
  location TEXT DEFAULT 'Not specified',
  salary TEXT DEFAULT 'Not specified',
  company_logo TEXT,
  tags TEXT[] DEFAULT '{}',
  link TEXT NOT NULL,
  description TEXT DEFAULT '',
  work_location TEXT DEFAULT 'Remote',
  experience TEXT DEFAULT 'Middle',
  working_schedule TEXT DEFAULT 'Full time',
  employment_type TEXT DEFAULT 'Full day',
  posted_by TEXT DEFAULT 'Anonymous',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for jobs table
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_company ON jobs(company);
CREATE INDEX IF NOT EXISTS idx_jobs_title ON jobs(title);
CREATE INDEX IF NOT EXISTS idx_jobs_location ON jobs(location);
CREATE INDEX IF NOT EXISTS idx_jobs_tags ON jobs USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_jobs_posted_by ON jobs(posted_by);

-- ============================================
-- 2. API CALLS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS api_calls (
  id BIGSERIAL PRIMARY KEY,
  endpoint TEXT NOT NULL,
  method TEXT DEFAULT 'GET',
  status_code INTEGER DEFAULT 200,
  user_id TEXT,
  request_data JSONB,
  response_data JSONB,
  error_message TEXT,
  response_time_ms INTEGER,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for API calls
CREATE INDEX IF NOT EXISTS idx_api_calls_endpoint ON api_calls(endpoint);
CREATE INDEX IF NOT EXISTS idx_api_calls_created_at ON api_calls(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_api_calls_user ON api_calls(user_id);
CREATE INDEX IF NOT EXISTS idx_api_calls_method ON api_calls(method);
CREATE INDEX IF NOT EXISTS idx_api_calls_status ON api_calls(status_code);

-- ============================================
-- 3. LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS logs (
  id BIGSERIAL PRIMARY KEY,
  level TEXT NOT NULL DEFAULT 'info',  -- info, warning, error, debug
  category TEXT,                        -- 'api', 'job', 'auth', 'system', etc.
  message TEXT NOT NULL,
  details JSONB,                        -- Additional structured data
  user_id TEXT,
  ip_address TEXT,
  user_agent TEXT,
  stack_trace TEXT,                     -- For errors
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for logs
CREATE INDEX IF NOT EXISTS idx_logs_level ON logs(level);
CREATE INDEX IF NOT EXISTS idx_logs_category ON logs(category);
CREATE INDEX IF NOT EXISTS idx_logs_created_at ON logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_logs_user ON logs(user_id);

-- ============================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs ENABLE ROW LEVEL SECURITY;

-- Jobs: Public read, authenticated write
CREATE POLICY "Jobs are viewable by everyone"
  ON jobs FOR SELECT
  USING (true);

-- Allow service role (backend) and authenticated users to insert jobs
CREATE POLICY "Allow job inserts for service role and authenticated users"
  ON jobs FOR INSERT
  WITH CHECK (
    auth.role() = 'service_role' OR 
    auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update their own jobs"
  ON jobs FOR UPDATE
  USING (auth.uid()::text = posted_by OR auth.role() = 'service_role');

CREATE POLICY "Users can delete their own jobs"
  ON jobs FOR DELETE
  USING (auth.uid()::text = posted_by OR auth.role() = 'service_role');

-- API Calls: Service role only (for admin tracking)
CREATE POLICY "Service role can manage API calls"
  ON api_calls FOR ALL
  USING (auth.role() = 'service_role');

-- Logs: Service role only (for system logging)
CREATE POLICY "Service role can manage logs"
  ON logs FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================
-- 5. FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for jobs updated_at
CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 6. HELPER VIEWS (optional)
-- ============================================

-- View for job statistics
CREATE OR REPLACE VIEW job_stats AS
SELECT 
  COUNT(*) as total_jobs,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '24 hours') as jobs_last_24h,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days') as jobs_last_7d,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '30 days') as jobs_last_30d,
  COUNT(DISTINCT company) as unique_companies,
  COUNT(DISTINCT posted_by) as unique_posters
FROM jobs;

-- View for recent jobs
CREATE OR REPLACE VIEW recent_jobs AS
SELECT 
  id,
  company,
  title,
  location,
  salary,
  tags,
  created_at,
  posted_by
FROM jobs
ORDER BY created_at DESC
LIMIT 10;

-- View for error logs
CREATE OR REPLACE VIEW error_logs AS
SELECT 
  id,
  level,
  category,
  message,
  details,
  user_id,
  created_at
FROM logs
WHERE level = 'error'
ORDER BY created_at DESC;

-- View for API call statistics
CREATE OR REPLACE VIEW api_call_stats AS
SELECT 
  endpoint,
  method,
  status_code,
  COUNT(*) as call_count,
  AVG(response_time_ms) as avg_response_time_ms,
  MAX(created_at) as last_called_at
FROM api_calls
GROUP BY endpoint, method, status_code
ORDER BY call_count DESC;

-- ============================================
-- SETUP COMPLETE!
-- ============================================
-- Your simplified Supabase database schema includes:
-- 1. jobs - Job listings
-- 2. api_calls - API call tracking
-- 3. logs - Application logs
-- 
-- Run this in your Supabase SQL Editor
-- ============================================
