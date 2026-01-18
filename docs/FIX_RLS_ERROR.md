# Fix: "new row violates row-level security policy" Error

## 🐛 Problem

When posting a job from the UI, you get this error:
```
new row violates row-level security policy for table "jobs"
```

## ✅ Solution

The RLS (Row Level Security) policy needs to be updated to allow the backend service role to insert jobs.

### Option 1: Update RLS Policy (Recommended)

**Run this SQL in Supabase SQL Editor:**

```sql
-- Drop existing INSERT policy
DROP POLICY IF EXISTS "Authenticated users can insert jobs" ON jobs;

-- Create new policy that explicitly allows service role
CREATE POLICY "Allow job inserts for service role and authenticated users"
  ON jobs FOR INSERT
  WITH CHECK (
    auth.role() = 'service_role' OR 
    auth.role() = 'authenticated'
  );
```

**Or run the complete fix file:**
```bash
# Copy contents of database/FIX_RLS_POLICY.sql
# Paste into Supabase SQL Editor → Run
```

### Option 2: Temporarily Disable RLS (Not Recommended)

**Only use if Option 1 doesn't work:**

```sql
-- Temporarily disable RLS for testing
ALTER TABLE jobs DISABLE ROW LEVEL SECURITY;
```

⚠️ **Warning:** This removes all security. Only use for testing!

### Option 3: Allow All Inserts (Quick Fix)

**If service role still doesn't work:**

```sql
DROP POLICY IF EXISTS "Authenticated users can insert jobs" ON jobs;

CREATE POLICY "Backend can insert jobs"
  ON jobs FOR INSERT
  WITH CHECK (true);
```

---

## 🔍 Why This Happens

1. **RLS is enabled** on the `jobs` table (for security)
2. **Backend uses service role key** to insert jobs
3. **RLS policy** checks `auth.role()` which should be `service_role`
4. **Sometimes the policy** doesn't recognize service role correctly

---

## ✅ Verification Steps

1. **Update the policy** (run SQL above)
2. **Try posting a job** again from UI
3. **Should work** without errors now

---

## 📋 Complete Fix SQL

See `database/FIX_RLS_POLICY.sql` for the complete fix.

---

## 🎯 Root Cause

The backend server uses `SUPABASE_SERVICE_ROLE_KEY` which should bypass RLS automatically. However, if the RLS policy is too restrictive, it can still block inserts. The fix above explicitly allows the service role to insert jobs.
