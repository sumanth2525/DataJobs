# Testing Adzuna API Integration

## Step 1: Configure API Keys

Add the following to your `backend/.env` file:

```env
ADZUNA_APP_ID=8d111a0b
ADZUNA_APP_KEY=81818d272d30e30e98627938eeca981d
ADZUNA_COUNTRY=us
```

**Important**: Make sure the backend server is restarted after adding these environment variables.

## Step 2: Verify Backend API is Running

Make sure your backend server is running:

```bash
cd backend
npm start
```

The server should start on `http://localhost:5000`

## Step 3: Test Adzuna API Endpoints

### Test 1: Search Data-Related Jobs

```bash
curl "http://localhost:5000/api/adzuna/jobs/data-roles?location=Remote&results_per_page=10"
```

Expected response:
```json
{
  "success": true,
  "data": [
    {
      "id": "adzuna_12345",
      "company": "Company Name",
      "title": "Data Scientist",
      "location": "Remote",
      "salary": "$100,000 - $150,000",
      ...
    }
  ],
  "count": 10
}
```

### Test 2: Search Jobs with Filters

```bash
curl "http://localhost:5000/api/adzuna/jobs/search?what=data%20engineer&where=Remote&page=1&results_per_page=10"
```

### Test 3: Get Categories

```bash
curl "http://localhost:5000/api/adzuna/categories"
```

## Step 4: Check UI Integration

The app has been updated to automatically fetch jobs from both:

1. **Database** (Supabase) - Jobs posted by users
2. **Adzuna API** - External job listings

When you start the app, check the browser console (F12) for logs:

```
Fetching jobs from API...
Fetched X jobs from database
Fetched Y jobs from Adzuna API
Total unique jobs: Z (X from DB, Y from Adzuna)
```

## Step 5: Verify Jobs Display

1. Start the frontend:
   ```bash
   npm start
   ```

2. Navigate to `http://localhost:3000`

3. Check the Dashboard - you should see:
   - Jobs from your database
   - Jobs from Adzuna API (with gradient card design)
   - Total count should reflect both sources

## Troubleshooting

### Issue: "Adzuna API keys not configured"

**Solution**: 
1. Make sure `backend/.env` has the Adzuna keys
2. Restart the backend server
3. Check that the keys are exactly as shown above (no extra spaces)

### Issue: "Adzuna API request failed"

**Possible causes**:
- API keys are invalid or expired
- Adzuna API rate limit reached
- Network connectivity issue

**Solution**: 
- The app will continue to work with database jobs even if Adzuna fails
- Check browser console for detailed error messages

### Issue: No jobs showing in UI

**Check**:
1. Browser console for error messages
2. Network tab (F12) to see API requests
3. Backend server logs for errors
4. Verify `http://localhost:5000/api/adzuna/jobs/data-roles` returns data

## API Response Format

Adzuna API jobs are automatically transformed to match your UI format:

```javascript
{
  id: "adzuna_12345",
  company: "Company Name",
  title: "Data Scientist",
  location: "Remote, US",
  salary: "$100,000 - $150,000",
  company_logo: "C",
  tags: ["Full time", "Data"],
  link: "https://job-link.com",
  description: "Job description...",
  created_at: "2024-01-15T10:00:00Z"
}
```

## Expected Behavior

- Jobs from both sources are combined
- Duplicates are removed (based on title + company)
- Database jobs are shown first
- Adzuna jobs appear with the same card design
- All jobs are sortable and filterable through the UI

## Testing Checklist

- [ ] Backend `.env` has Adzuna API keys
- [ ] Backend server is running and restarted
- [ ] Test endpoint returns data: `curl http://localhost:5000/api/adzuna/jobs/data-roles`
- [ ] Frontend shows jobs from both sources in console logs
- [ ] UI displays all jobs correctly
- [ ] Job cards show gradient design
- [ ] Jobs are clickable and links work
