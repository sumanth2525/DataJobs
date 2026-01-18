# Troubleshooting: Jobs Not Showing in UI

## Issue: Job inserted via SQL not appearing in UI

### ✅ Quick Checklist

1. **Backend Server Running?**
   ```bash
   cd backend
   npm start
   ```
   - Server should run on `http://localhost:5000`
   - Check console for errors

2. **Frontend Running?**
   ```bash
   npm start
   ```
   - Frontend should run on `http://localhost:3000`
   - Check browser console for errors

3. **Check Browser Console (F12)**
   - Open Developer Tools (F12)
   - Go to Console tab
   - Look for:
     - `Fetching jobs from API...`
     - `API Response: { success: true, data: [...] }`
     - Any error messages (red text)

### 🔍 Step-by-Step Debugging

#### Step 1: Test Backend API Directly
```bash
# Test if backend is accessible
curl http://localhost:5000/api/jobs

# Or use the test script
node scripts/test-api-jobs.js
```

#### Step 2: Check Supabase Connection
```bash
# Test Supabase connection
node scripts/test-supabase.js
```

Expected output:
- ✅ `SELECT successful (found X jobs)`
- ✅ `Total jobs: X`

#### Step 3: Verify Database Content
In Supabase SQL Editor, run:
```sql
SELECT * FROM jobs ORDER BY created_at DESC LIMIT 10;
```

#### Step 4: Check Frontend API Calls

**In Browser Console (F12), you should see:**
```
Fetching jobs from API...
API Response: { success: true, data: [...] }
Fetched X jobs from API
```

**If you see errors like:**
- `Network Error` → Backend server not running
- `Failed to fetch` → CORS issue or wrong API URL
- `API response invalid` → Backend returned wrong format

### 🐛 Common Issues & Solutions

#### Issue 1: Backend Server Not Running
**Symptom:** `ECONNREFUSED` or `Network Error`

**Solution:**
```bash
cd backend
npm start
```

#### Issue 2: Wrong API URL
**Symptom:** `Failed to fetch` or 404 errors

**Solution:**
- Check `src/lib/api.js` - should have: `http://localhost:5000/api`
- Verify `.env` file (if using environment variables)

#### Issue 3: Supabase Credentials Invalid
**Symptom:** `Invalid API key` error

**Solution:**
1. Check `backend/.env` file:
   ```
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```
2. Get correct keys from Supabase Dashboard → Settings → API

#### Issue 4: CORS Issues
**Symptom:** Browser console shows CORS errors

**Solution:**
- Backend already has CORS enabled (`app.use(cors())`)
- If still having issues, check `backend/server.js` has cors middleware

#### Issue 5: Data Format Mismatch
**Symptom:** Jobs exist in DB but not showing in UI

**Solution:**
- Check browser console for transformation errors
- Verify job has required fields: `company`, `title`, `link`

### 📝 Manual Testing Steps

1. **Insert job via SQL:**
   ```sql
   INSERT INTO jobs (company, title, location, link) 
   VALUES ('Test Company', 'Test Job', 'Remote', 'https://test.com');
   ```

2. **Test backend API:**
   ```bash
   node scripts/test-api-jobs.js
   ```
   Should show the inserted job.

3. **Refresh browser:**
   - Hard refresh: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
   - Check console for `Fetched X jobs from API`

4. **Check UI:**
   - Job should appear in the job listings

### 🔧 Still Not Working?

1. **Check all services are running:**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm start
   
   # Terminal 2 - Frontend
   npm start
   ```

2. **Clear browser cache:**
   - Hard refresh: `Ctrl + Shift + R`
   - Or clear cache in DevTools

3. **Check network tab (F12 → Network):**
   - Look for `/api/jobs` request
   - Check if it returns 200 OK
   - Check response body has `{ success: true, data: [...] }`

4. **Verify Supabase RLS policies:**
   - Jobs table should have: `"Jobs are viewable by everyone"` policy
   - Check in Supabase Dashboard → Authentication → Policies

### 📞 Quick Debug Commands

```bash
# Test Supabase connection
node scripts/test-supabase.js

# Test API endpoint
node scripts/test-api-jobs.js

# Check if backend is running
curl http://localhost:5000/api/health

# Should return: { "status": "OK", "message": "Server is running" }
```
