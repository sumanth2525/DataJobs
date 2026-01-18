# SerpAPI (Google Jobs) Integration

This guide explains how to integrate SerpAPI for Google Jobs search into the Data Job Portal.

## Overview

SerpAPI provides access to Google Jobs search results, allowing you to fetch job listings from Google's job aggregation platform. This integration complements the existing Adzuna and RapidAPI integrations.

## Setup

### Step 1: Get SerpAPI API Key

1. Sign up for a SerpAPI account at [https://serpapi.com](https://serpapi.com)
2. Navigate to your [dashboard](https://serpapi.com/dashboard)
3. Copy your API key

### Step 2: Configure API Key

Add the following to your `backend/.env` file:

```env
SERPAPI_KEY=your_serpapi_key_here
```

**Important**: Make sure the backend server is restarted after adding the environment variable.

### Step 3: Verify Backend API is Running

Make sure your backend server is running:

```bash
cd backend
npm start
```

The server should start on `http://localhost:5000`

## API Endpoints

### 1. Search Google Jobs

**Endpoint**: `GET /api/serpapi/jobs/search`

**Query Parameters**:
- `q` (string, optional): Search query (default: "data scientist jobs")
- `location` (string, optional): Location filter (e.g., "United States", "New York, NY")
- `start` (number, optional): Pagination offset (default: 0)
- `num` (number, optional): Number of results per page (default: 20)
- `engine` (string, optional): Search engine (default: "google_jobs")
- `lrad` (number, optional): Location radius in miles
- `hl` (string, optional): Language (default: "en")
- `gl` (string, optional): Country code (default: "us")

**Example**:
```bash
curl "http://localhost:5000/api/serpapi/jobs/search?q=data+scientist&location=United+States&num=10"
```

### 2. Get Data-Related Jobs

**Endpoint**: `GET /api/serpapi/jobs/data-roles`

**Query Parameters**:
- `location` (string, optional): Location filter
- `start` (number, optional): Pagination offset (default: 0)
- `num` (number, optional): Number of results (default: 50)

This endpoint searches for multiple data-related keywords:
- data scientist
- data analyst
- data engineer
- machine learning engineer
- business analyst

**Example**:
```bash
curl "http://localhost:5000/api/serpapi/jobs/data-roles?location=Remote&num=20"
```

### 3. Get Job Details

**Endpoint**: `GET /api/serpapi/jobs/:id`

**Parameters**:
- `id` (string): Job ID (with or without "serpapi_" prefix)

**Note**: SerpAPI doesn't have a direct job details endpoint, so this searches for jobs and finds the matching one.

**Example**:
```bash
curl "http://localhost:5000/api/serpapi/jobs/serpapi_12345"
```

## Frontend Usage

### Using the API Client

```javascript
import { serpAPI } from './lib/api';

// Search jobs
const response = await serpAPI.searchJobs({
  q: 'data scientist',
  location: 'United States',
  num: 20
});

// Get data-related roles
const dataRoles = await serpAPI.getDataRoles({
  location: 'Remote',
  num: 50
});

// Get job details
const job = await serpAPI.getJobDetails('serpapi_job_id');
```

### Automatic Integration

The app automatically fetches jobs from SerpAPI on load. Jobs are combined with:
1. Database jobs (Supabase)
2. Adzuna API jobs
3. SerpAPI (Google Jobs) jobs

Check the browser console (F12) for logs:
```
Fetching jobs from API...
Fetched X jobs from database
Fetched Y jobs from Adzuna API
Fetched Z jobs from SerpAPI (Google Jobs)
Total unique jobs: N (X from DB, Y from Adzuna, Z from SerpAPI)
```

## Response Format

All endpoints return jobs in a standardized format:

```javascript
{
  success: true,
  data: [
    {
      id: "serpapi_12345",
      company: "Company Name",
      title: "Job Title",
      location: "Location",
      salary: "Salary range or 'Not specified'",
      company_logo: "A",
      tags: ["Full time", "On-site"],
      link: "https://job-link.com",
      description: "Job description...",
      workLocation: "Remote" | "On-site" | "Hybrid",
      experience: "Junior" | "Middle" | "Senior",
      workingSchedule: "Full time" | "Part time",
      employmentType: "Full Day",
      created_at: "2024-01-15T10:00:00Z",
      serpapi_job_id: "original_job_id",
      serpapi_thumbnail: "thumbnail_url",
      serpapi_via: "via_source",
      serpapi_posted_at: "posted_date"
    }
  ],
  count: 20,
  total: 1000,
  pagination: {
    current: 1,
    start: 0,
    num: 20
  }
}
```

## Testing

Test the API endpoints:

```bash
# Run the test script
node scripts/test-serpapi.js
```

Or test manually:

```bash
# Search jobs
curl "http://localhost:5000/api/serpapi/jobs/search?q=data+scientist&location=United+States&num=10"

# Get data roles
curl "http://localhost:5000/api/serpapi/jobs/data-roles?location=Remote&num=20"
```

## Error Handling

The API returns errors in this format:

```javascript
{
  success: false,
  error: "Error message here"
}
```

Common errors:
- **503**: SerpAPI key not configured
- **404**: Job not found
- **500**: Server error or SerpAPI error
- **400**: Invalid request parameters

## Notes

1. **API Rate Limits**: SerpAPI has rate limits based on your plan. Check [SerpAPI pricing](https://serpapi.com/pricing) for details.

2. **Job IDs**: SerpAPI jobs have IDs prefixed with `serpapi_` (e.g., `serpapi_12345`)

3. **Transformations**: SerpAPI job format is automatically transformed to match your UI format in the backend route

4. **Google Jobs Data**: SerpAPI provides access to Google Jobs search results, which aggregates jobs from multiple sources

5. **Caching**: Consider implementing caching to reduce API calls and costs

6. **Cost Management**: Monitor your SerpAPI usage to stay within your plan limits

## Troubleshooting

### Issue: "SerpAPI key not configured"

**Solution**:
1. Make sure `backend/.env` has `SERPAPI_KEY` set
2. Restart the backend server after adding the key
3. Verify the key is correct by checking your SerpAPI dashboard

### Issue: "Failed to search jobs from SerpAPI"

**Possible causes**:
- Invalid API key
- API rate limit reached
- Network connectivity issues
- Invalid query parameters

**Solution**:
1. Verify your API key at [SerpAPI dashboard](https://serpapi.com/dashboard)
2. Check your API usage and remaining credits
3. Verify network connectivity
4. Check request parameters are valid

### Issue: No jobs returned

**Possible causes**:
- Search query too specific
- Location filter too restrictive
- No jobs match the criteria

**Solution**:
1. Try a broader search query
2. Remove or adjust location filters
3. Check if jobs exist for your search criteria

## Checklist

- [ ] SerpAPI account created
- [ ] API key added to `backend/.env`
- [ ] Backend server restarted
- [ ] Test endpoint returns data: `curl http://localhost:5000/api/serpapi/jobs/search?q=data+scientist&num=5`
- [ ] Jobs appear in UI Dashboard
- [ ] Browser console shows SerpAPI fetch logs

## Additional Resources

- [SerpAPI Documentation](https://serpapi.com/search-api)
- [Google Jobs API Documentation](https://serpapi.com/google-jobs-api)
- [SerpAPI Dashboard](https://serpapi.com/dashboard)
- [SerpAPI Pricing](https://serpapi.com/pricing)
