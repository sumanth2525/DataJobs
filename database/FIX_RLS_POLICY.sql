-- ============================================
-- Fix RLS Policy for Jobs Table
-- ============================================
-- This fixes the "new row violates row-level security policy" error
-- Run this in Supabase SQL Editor
-- ============================================

-- Drop existing INSERT policy
DROP POLICY IF EXISTS "Authenticated users can insert jobs" ON jobs;

-- Create new INSERT policy that allows service role (backend) and authenticated users
-- Service role is used by the backend server, so it should always work
CREATE POLICY "Allow job inserts for service role and authenticated users"
  ON jobs FOR INSERT
  WITH CHECK (
    auth.role() = 'service_role' OR 
    auth.role() = 'authenticated'
  );

-- Alternative: If you want to allow all inserts from backend (recommended for job posting)
-- This allows the service role (backend) to insert jobs without restrictions
-- Comment out the above policy and use this instead:

-- DROP POLICY IF EXISTS "Allow job inserts for service role and authenticated users" ON jobs;
-- CREATE POLICY "Backend can insert jobs"
--   ON jobs FOR INSERT
--   WITH CHECK (true);
-- 
-- Note: The service role key bypasses RLS, but if you still get errors,
-- this policy explicitly allows all inserts (use only if service role doesn't work)

-- ============================================
-- Verify Policies
-- ============================================
-- Check current policies:
SELECT * FROM pg_policies WHERE tablename = 'jobs';
