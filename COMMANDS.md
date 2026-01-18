# DataJobPortal - All Commands Reference

## 📋 Table of Contents
1. [Backend Server Commands](#backend-server-commands)
2. [Frontend Commands](#frontend-commands)
3. [Database & Supabase Commands](#database--supabase-commands)
4. [Test Commands](#test-commands)
5. [API Testing Commands](#api-testing-commands)
6. [Troubleshooting Commands](#troubleshooting-commands)
7. [Development Workflow](#development-workflow)

---

## 🔧 Backend Server Commands

### Start Backend Server
```bash
cd backend
npm start
```
- Runs on: `http://localhost:5000`
- Default port: `5000`

### Check if Backend Server is Running
```bash
curl http://localhost:5000/api/health
```
- Expected: `{"status":"OK","message":"Server is running"}`

### Stop Backend Server (Windows)
```powershell
# Find process using port 5000
netstat -ano | findstr :5000

# Kill process by PID (replace 12345 with actual PID)
taskkill /F /PID 12345
```

### Install Backend Dependencies
```bash
cd backend
npm install
```

---

## 🎨 Frontend Commands

### Start Frontend Development Server
```bash
npm start
```
- Runs on: `http://localhost:3000`
- Opens browser automatically

### Build Frontend for Production
```bash
npm run build
```
- Creates optimized build in `build/` directory

### Install Frontend Dependencies
```bash
npm install
```

---

## 🗄️ Database & Supabase Commands

### Test Supabase Connection
```bash
node scripts/test-supabase.js
```
- Tests connection to Supabase
- Verifies tables exist
- Tests CRUD operations

### Check Jobs Count in Database
```bash
node scripts/check-jobs-count.js
```
- Shows total jobs count
- Lists recent jobs

### View All Jobs (SQL Query)
```sql
SELECT * FROM jobs ORDER BY created_at DESC;
```

### Count Total Jobs (SQL Query)
```sql
SELECT COUNT(*) as total_jobs FROM jobs;
```

### View Jobs from Last 24 Hours (SQL Query)
```sql
SELECT * FROM jobs 
WHERE created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;
```

### View Jobs from Last Week (SQL Query)
```sql
SELECT * FROM jobs 
WHERE created_at > NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;
```

### Insert Job via SQL
```sql
INSERT INTO jobs (company, title, location, link) 
VALUES ('Test Company', 'Test Job', 'Remote', 'https://test.com');
```

### Fix RLS Policy (SQL - Run in Supabase SQL Editor)
```sql
-- Drop existing INSERT policy
DROP POLICY IF EXISTS "Authenticated users can insert jobs" ON jobs;

-- Create new policy that allows service role
CREATE POLICY "Allow job inserts for service role and authenticated users"
  ON jobs FOR INSERT
  WITH CHECK (
    auth.role() = 'service_role' OR 
    auth.role() = 'authenticated'
  );
```

---

## 🧪 Test Commands

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm test -- --watch
```

### Run Specific Test File
```bash
npm test -- Dashboard.test.js
npm test -- JobListings.test.js
npm test -- Dashboard.timeFilter.test.js
npm test -- App.jobSync.test.js
```

### Run Tests with Coverage
```bash
npm test -- --coverage
```

### Run Tests Without Watch Mode
```bash
npm test -- --watchAll=false
```

### Run All Tests Once
```bash
npm test -- --watchAll=false --passWithNoTests
```

---

## 🔌 API Testing Commands

### Test API Endpoint (Jobs)
```bash
node scripts/test-api-jobs.js
```
- Tests: `GET /api/jobs`
- Shows jobs from database

### Test Supabase Connection
```bash
node scripts/test-supabase.js
```
- Full connection test
- Tests all tables
- Tests CRUD operations

### Test API Health Endpoint (PowerShell)
```powershell
Invoke-WebRequest -Uri "http://localhost:5000/api/health" -UseBasicParsing
```

### Test API Health Endpoint (curl)
```bash
curl http://localhost:5000/api/health
```

---

## 🐛 Troubleshooting Commands

### Check Port 5000 Status (Windows)
```powershell
netstat -ano | findstr :5000
```
- Shows if port is in use
- Shows Process ID (PID)

### Kill Process on Port 5000 (Windows)
```powershell
# Step 1: Find PID
netstat -ano | findstr :5000

# Step 2: Kill process (replace 12345 with actual PID)
taskkill /F /PID 12345
```

### Check if Backend Server is Running
```powershell
# PowerShell
try { 
  $response = Invoke-WebRequest -Uri "http://localhost:5000/api/health" -UseBasicParsing -TimeoutSec 2
  Write-Host "✅ Backend server is RUNNING"
  Write-Host "Response: $($response.Content)"
} catch { 
  Write-Host "❌ Backend server is NOT running"
  Write-Host "Error: $($_.Exception.Message)"
}
```

### View Backend Logs
```bash
cd backend
npm start
# Logs appear in console
```

### View Frontend Logs
```bash
npm start
# Logs appear in browser console (F12)
```

### Clear Browser Cache (Hard Refresh)
- **Windows**: `Ctrl + Shift + R` or `Ctrl + F5`
- **Mac**: `Cmd + Shift + R`

---

## 🚀 Development Workflow

### Full Development Setup (Two Terminals)

#### Terminal 1 - Backend
```bash
cd backend
npm start
```

#### Terminal 2 - Frontend
```bash
npm start
```

### Check Both Services are Running
```powershell
# Check backend (port 5000)
netstat -ano | findstr :5000

# Check frontend (port 3000)
netstat -ano | findstr :3000
```

---

## 📊 Database Queries (Supabase SQL Editor)

### All Common Queries
Copy from: `database/VIEW_JOBS.sql`

### Quick Reference Queries

#### View All Jobs
```sql
SELECT * FROM jobs ORDER BY created_at DESC;
```

#### Count Jobs
```sql
SELECT COUNT(*) FROM jobs;
```

#### View Job Statistics
```sql
SELECT * FROM job_stats;
```

#### View Recent Jobs (Last 10)
```sql
SELECT * FROM recent_jobs;
```

#### Search Jobs
```sql
SELECT * FROM jobs 
WHERE title ILIKE '%Data%' 
   OR company ILIKE '%Tech%'
ORDER BY created_at DESC;
```

#### Jobs by Company
```sql
SELECT company, COUNT(*) as job_count
FROM jobs
GROUP BY company
ORDER BY job_count DESC;
```

---

## 🔐 Environment Variables

### Backend `.env` File Location
```
backend/.env
```

### Required Variables
```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Server
PORT=5000
NODE_ENV=development

# OpenAI (Optional - for job scraping)
OPENAI_API_KEY=your_openai_api_key_here

# Adzuna (Optional)
ADZUNA_APP_ID=your_adzuna_app_id
ADZUNA_APP_KEY=your_adzuna_app_key
ADZUNA_COUNTRY=us
```

---

## 🧹 Cleanup Commands

### Clear Node Modules (Reinstall)
```bash
# Backend
cd backend
rm -rf node_modules
npm install

# Frontend
rm -rf node_modules
npm install
```

### Clear Build Directory
```bash
rm -rf build
```

### Clear Test Cache
```bash
npm test -- --clearCache
```

---

## 📦 Package Management

### Install All Dependencies
```bash
# Root (Frontend)
npm install

# Backend
cd backend
npm install
```

### Update Dependencies
```bash
npm update
cd backend
npm update
```

---

## 🔍 Quick Diagnostic Commands

### Test Everything at Once
```bash
# 1. Test Supabase Connection
node scripts/test-supabase.js

# 2. Test API Endpoint
node scripts/test-api-jobs.js

# 3. Check Jobs Count
node scripts/check-jobs-count.js
```

### Verify Setup
```bash
# Check if backend server is accessible
curl http://localhost:5000/api/health

# Check jobs endpoint
curl http://localhost:5000/api/jobs

# Check frontend is running
curl http://localhost:3000
```

---

## 📝 Common Workflows

### Post a New Job and Verify
```bash
# 1. Start backend (if not running)
cd backend
npm start

# 2. In another terminal, start frontend (if not running)
npm start

# 3. Post job from UI, then verify in Supabase:
SELECT * FROM jobs ORDER BY created_at DESC LIMIT 1;
```

### Test Time Filter Functionality
```bash
# 1. Start both servers (backend + frontend)
# 2. Post a job "just now"
# 3. Change filter to "Last 24 hours" - job should appear
# 4. Change filter to "Last week" - job should appear
# 5. Check API call in browser Network tab (F12)
```

### Full Test Suite
```bash
# Run all tests
npm test -- --watchAll=false

# Run specific test suites
npm test -- Dashboard.test.js --watchAll=false
npm test -- JobListings.test.js --watchAll=false
npm test -- App.jobSync.test.js --watchAll=false
npm test -- Dashboard.timeFilter.test.js --watchAll=false
```

---

## 🆘 Emergency Commands

### Force Kill All Node Processes (Windows)
```powershell
taskkill /F /IM node.exe
```

### Reset Port 5000
```powershell
# Find and kill process on port 5000
$process = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue
if ($process) {
  Stop-Process -Id $process.OwningProcess -Force
}
```

### Clear All Caches
```bash
# Clear npm cache
npm cache clean --force

# Clear build
rm -rf build

# Clear node_modules (reinstall)
rm -rf node_modules
npm install
```

---

## 📚 Additional Resources

- **SQL Queries**: See `database/VIEW_JOBS.sql`
- **Troubleshooting**: See `TROUBLESHOOTING.md`
- **Database Schema**: See `database/SUPABASE_SIMPLE_SCHEMA.sql`
- **Fix RLS Policy**: See `database/FIX_RLS_POLICY.sql`

---

## ✅ Quick Checklist

```bash
# ✅ Backend server running?
curl http://localhost:5000/api/health

# ✅ Frontend server running?
# Open: http://localhost:3000

# ✅ Supabase connection working?
node scripts/test-supabase.js

# ✅ API endpoint working?
node scripts/test-api-jobs.js

# ✅ Jobs in database?
node scripts/check-jobs-count.js
```

---

*Last Updated: Based on current project structure and implementation*
