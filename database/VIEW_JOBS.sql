-- ============================================
-- DataJobPortal - View Jobs in Supabase
-- ============================================
-- Copy and paste these queries into Supabase SQL Editor
-- ============================================

-- 1. VIEW ALL JOBS (with all details)
-- ============================================
SELECT * FROM jobs 
ORDER BY created_at DESC;

-- 2. VIEW JOBS SUMMARY (compact view)
-- ============================================
SELECT 
  id,
  company,
  title,
  location,
  salary,
  link,
  created_at,
  updated_at
FROM jobs 
ORDER BY created_at DESC;

-- 3. COUNT TOTAL JOBS
-- ============================================
SELECT COUNT(*) as total_jobs FROM jobs;

-- 4. VIEW RECENT JOBS (last 24 hours)
-- ============================================
SELECT * FROM jobs 
WHERE created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;

-- 5. VIEW JOBS BY COMPANY
-- ============================================
SELECT 
  company,
  COUNT(*) as job_count
FROM jobs
GROUP BY company
ORDER BY job_count DESC;

-- 6. VIEW JOB STATISTICS (using view)
-- ============================================
SELECT * FROM job_stats;

-- 7. VIEW RECENT JOBS (using view - last 10)
-- ============================================
SELECT * FROM recent_jobs;

-- 8. SEARCH JOBS BY TITLE OR COMPANY
-- ============================================
-- Replace 'Test' with your search term
SELECT * FROM jobs 
WHERE title ILIKE '%Test%' 
   OR company ILIKE '%Test%'
ORDER BY created_at DESC;

-- 9. VIEW JOBS WITH TAGS
-- ============================================
SELECT 
  id,
  company,
  title,
  tags,
  created_at
FROM jobs
WHERE tags IS NOT NULL AND array_length(tags, 1) > 0
ORDER BY created_at DESC;

-- 10. VIEW LATEST JOB
-- ============================================
SELECT * FROM jobs 
ORDER BY created_at DESC 
LIMIT 1;
