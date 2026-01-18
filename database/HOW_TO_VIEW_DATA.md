# How to View Data in Supabase

## 🎯 Quick Access Methods

### Method 1: Supabase Dashboard - Table Editor (Easiest)

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard
   - Log in to your account

2. **Select Your Project**
   - Click on your project (e.g., `DataJobPortal`)

3. **Navigate to Table Editor**
   - Click **"Table Editor"** in the left sidebar
   - Or go directly to: `https://supabase.com/dashboard/project/[YOUR_PROJECT_ID]/editor`

4. **View Jobs Table**
   - Click on the **`jobs`** table
   - You'll see all rows with columns: `id`, `company`, `title`, `location`, `salary`, `link`, etc.
   - You can:
     - ✅ View all data in a table format
     - ✅ Edit data directly (double-click any cell)
     - ✅ Add new rows
     - ✅ Filter and sort columns
     - ✅ Export data (CSV, JSON)

---

### Method 2: SQL Editor (For Queries)

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard
   - Select your project

2. **Navigate to SQL Editor**
   - Click **"SQL Editor"** in the left sidebar
   - Or go to: `https://supabase.com/dashboard/project/[YOUR_PROJECT_ID]/sql/new`

3. **Run SQL Queries**
   - Copy and paste any query from `VIEW_JOBS.sql`
   - Click **"Run"** button (or press `Ctrl+Enter`)
   - View results in the bottom panel

**Quick Queries:**

```sql
-- View all jobs
SELECT * FROM jobs ORDER BY created_at DESC;

-- Count jobs
SELECT COUNT(*) FROM jobs;

-- View job statistics
SELECT * FROM job_stats;
```

---

### Method 3: Database Tables (Database Inspector)

1. **Open Supabase Dashboard**
   - Select your project

2. **Go to Database**
   - Click **"Database"** in the left sidebar
   - Click **"Tables"**

3. **Select Jobs Table**
   - Click on **`jobs`** table
   - View table structure, relationships, and data

---

## 📊 Useful Views Already Available

Your database has pre-built views for easy data access:

### `job_stats` View
```sql
SELECT * FROM job_stats;
```
Shows:
- Total jobs count
- Jobs in last 24h, 7d, 30d
- Unique companies count
- Unique posters count

### `recent_jobs` View
```sql
SELECT * FROM recent_jobs;
```
Shows last 10 jobs with basic details

### `error_logs` View
```sql
SELECT * FROM error_logs;
```
Shows all error-level logs

### `api_call_stats` View
```sql
SELECT * FROM api_call_stats;
```
Shows API call statistics by endpoint

---

## 🔍 Quick Reference

| Feature | Location | Purpose |
|---------|----------|---------|
| **Table Editor** | Dashboard → Table Editor | Visual table view, edit data |
| **SQL Editor** | Dashboard → SQL Editor | Run custom SQL queries |
| **Database Tables** | Dashboard → Database → Tables | View table structure |
| **API Docs** | Dashboard → API Docs | API reference |
| **Logs** | Dashboard → Logs | View application logs |

---

## 📝 Example Queries

### View All Jobs with Details
```sql
SELECT 
  id,
  company,
  title,
  location,
  salary,
  link,
  created_at
FROM jobs 
ORDER BY created_at DESC;
```

### Search Jobs
```sql
SELECT * FROM jobs 
WHERE title ILIKE '%Data%' 
   OR company ILIKE '%Tech%'
ORDER BY created_at DESC;
```

### Jobs Added Today
```sql
SELECT * FROM jobs 
WHERE created_at::date = CURRENT_DATE
ORDER BY created_at DESC;
```

### Company Statistics
```sql
SELECT 
  company,
  COUNT(*) as job_count,
  MAX(created_at) as latest_job
FROM jobs
GROUP BY company
ORDER BY job_count DESC;
```

---

## 🎯 Quick Steps to View Your 2 Jobs

1. Go to: https://supabase.com/dashboard
2. Click **"Table Editor"**
3. Click on **`jobs`** table
4. You should see 2 rows:
   - Job ID: 1 - "Test Company - Test Job"
   - Job ID: 3 - "Test Company - Test Job"

---

## 💡 Tips

- **Filter Columns**: Click column headers in Table Editor to filter/sort
- **Export Data**: Click "Export" button to download as CSV/JSON
- **Edit Data**: Double-click any cell to edit directly
- **Add Row**: Click "+" button or "Insert row" to add new job
- **View Row Details**: Click on a row to see full details in a modal

---

## 🔗 Direct Links

- **Table Editor**: `https://supabase.com/dashboard/project/[PROJECT_ID]/editor`
- **SQL Editor**: `https://supabase.com/dashboard/project/[PROJECT_ID]/sql/new`
- **Database Tables**: `https://supabase.com/dashboard/project/[PROJECT_ID]/database/tables`

*Replace `[PROJECT_ID]` with your actual Supabase project ID*
