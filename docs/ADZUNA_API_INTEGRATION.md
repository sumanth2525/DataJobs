# How to Call Adzuna API to Post Jobs in the UI

This guide explains how to fetch jobs from the Adzuna API and display them in your UI.

## Prerequisites

1. **Backend Server Running**: Make sure your backend server is running on `http://localhost:5000`
2. **API Keys Configured**: Set up your Adzuna API keys in `backend/.env`:
   ```
   ADZUNA_APP_ID=your_adzuna_app_id
   ADZUNA_APP_KEY=your_adzuna_app_key
   ADZUNA_COUNTRY=us
   ```

## Available Adzuna API Endpoints

### 1. Search Jobs
```javascript
// Frontend: src/lib/api.js
import { adzunaAPI } from './lib/api';

// Search jobs with filters
const response = await adzunaAPI.searchJobs({
  what: 'data scientist',      // Job title/keywords
  where: 'San Francisco',       // Location
  page: 1,                      // Page number
  results_per_page: 20,         // Number of results
  sort_by: 'date',              // Sort by: 'date', 'salary', 'relevance'
  salary_min: 80000,            // Minimum salary
  salary_max: 150000,           // Maximum salary
  full_time: true,              // Filter full-time jobs
  max_days_old: 30              // Jobs posted in last N days
});
```

### 2. Get Data-Related Roles
```javascript
// Get data-related jobs (Data Scientist, Data Engineer, etc.)
const response = await adzunaAPI.getDataRoles({
  location: 'Remote',
  page: 1,
  results_per_page: 50
});
```

### 3. Get Job Details by ID
```javascript
// Get specific job details
const response = await adzunaAPI.getJobDetails('adzuna_job_id');
```

## Integration Example

### Option 1: Fetch Adzuna Jobs on App Load

Update `src/App.js` to fetch jobs from Adzuna API:

```javascript
import { adzunaAPI } from './lib/api';

// In your App component
useEffect(() => {
  const fetchJobsFromAdzuna = async () => {
    try {
      setIsLoadingJobs(true);
      
      // Fetch data-related jobs from Adzuna
      const adzunaResponse = await adzunaAPI.getDataRoles({
        location: '',
        page: 1,
        results_per_page: 50
      });
      
      if (adzunaResponse.success && adzunaResponse.data) {
        // Transform Adzuna jobs to match UI format
        const transformedJobs = adzunaResponse.data.map(job => ({
          id: job.id,
          company: job.company,
          companyLogo: job.company_logo || job.company?.charAt(0).toUpperCase() || '?',
          title: job.title,
          location: job.location,
          salary: job.salary,
          tags: job.tags || [],
          link: job.link,
          description: job.description,
          timestamp: job.created_at,
          date: job.created_at 
            ? new Date(job.created_at).toLocaleDateString('en-US', { 
                day: 'numeric', 
                month: 'short', 
                year: 'numeric' 
              })
            : new Date().toLocaleDateString()
        }));
        
        setJobs(transformedJobs);
      }
    } catch (error) {
      console.error('Error fetching Adzuna jobs:', error);
    } finally {
      setIsLoadingJobs(false);
    }
  };
  
  fetchJobsFromAdzuna();
}, []);
```

### Option 2: Merge Adzuna Jobs with Database Jobs

```javascript
import { jobsAPI, adzunaAPI } from './lib/api';

useEffect(() => {
  const fetchAllJobs = async () => {
    try {
      setIsLoadingJobs(true);
      
      // Fetch from both sources in parallel
      const [dbResponse, adzunaResponse] = await Promise.all([
        jobsAPI.getAll(),
        adzunaAPI.getDataRoles({ page: 1, results_per_page: 50 })
      ]);
      
      // Transform database jobs
      const dbJobs = dbResponse.success && dbResponse.data 
        ? dbResponse.data.map(job => ({
            id: job.id,
            company: job.company,
            companyLogo: job.company_logo || job.company?.charAt(0).toUpperCase() || '?',
            title: job.title,
            location: job.location,
            salary: job.salary,
            tags: job.tags || [],
            link: job.link,
            description: job.description,
            timestamp: job.created_at,
            date: job.created_at ? new Date(job.created_at).toLocaleDateString() : new Date().toLocaleDateString()
          }))
        : [];
      
      // Transform Adzuna jobs
      const adzunaJobs = adzunaResponse.success && adzunaResponse.data
        ? adzunaResponse.data.map(job => ({
            id: job.id,
            company: job.company,
            companyLogo: job.company_logo || job.company?.charAt(0).toUpperCase() || '?',
            title: job.title,
            location: job.location,
            salary: job.salary,
            tags: job.tags || [],
            link: job.link,
            description: job.description,
            timestamp: job.created_at,
            date: job.created_at ? new Date(job.created_at).toLocaleDateString() : new Date().toLocaleDateString()
          }))
        : [];
      
      // Combine and deduplicate (by title + company)
      const allJobs = [...dbJobs, ...adzunaJobs];
      const uniqueJobs = Array.from(
        new Map(allJobs.map(job => [`${job.title}-${job.company}`, job])).values()
      );
      
      setJobs(uniqueJobs);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setIsLoadingJobs(false);
    }
  };
  
  fetchAllJobs();
}, []);
```

### Option 3: Add Adzuna Jobs Button in Dashboard

Add a button to fetch Adzuna jobs on demand:

```javascript
// In Dashboard.js or a new component
const [adzunaJobs, setAdzunaJobs] = useState([]);
const [isLoadingAdzuna, setIsLoadingAdzuna] = useState(false);

const fetchAdzunaJobs = async () => {
  try {
    setIsLoadingAdzuna(true);
    const response = await adzunaAPI.getDataRoles({
      location: '',
      page: 1,
      results_per_page: 50
    });
    
    if (response.success && response.data) {
      const transformed = response.data.map(job => ({
        id: job.id,
        company: job.company,
        companyLogo: job.company_logo || job.company?.charAt(0).toUpperCase() || '?',
        title: job.title,
        location: job.location,
        salary: job.salary,
        tags: job.tags || [],
        link: job.link,
        description: job.description,
        timestamp: job.created_at,
        date: job.created_at ? new Date(job.created_at).toLocaleDateString() : new Date().toLocaleDateString()
      }));
      
      setAdzunaJobs(transformed);
      // Optionally merge with existing jobs
      setJobs(prev => [...prev, ...transformed]);
    }
  } catch (error) {
    console.error('Error fetching Adzuna jobs:', error);
    alert('Failed to fetch jobs from Adzuna API. Please check your API keys.');
  } finally {
    setIsLoadingAdzuna(false);
  }
};

// In your JSX
<button onClick={fetchAdzunaJobs} disabled={isLoadingAdzuna}>
  {isLoadingAdzuna ? 'Loading...' : 'Load Jobs from Adzuna'}
</button>
```

## Response Format

The Adzuna API returns jobs in this format:

```javascript
{
  success: true,
  data: [
    {
      id: "adzuna_12345",
      company: "Company Name",
      title: "Job Title",
      location: "Location",
      salary: "$80,000 - $120,000",
      company_logo: "A",
      tags: ["Full time", "Data"],
      link: "https://job-link.com",
      description: "Job description...",
      created_at: "2024-01-15T10:00:00Z",
      adzuna_id: 12345,
      adzuna_category: {...},
      adzuna_created: "2024-01-15T10:00:00Z"
    }
  ],
  count: 50,
  total: 1000,
  page: 1,
  results_per_page: 50
}
```

## Testing

Test the API endpoints:

```bash
# Test from backend directory
cd backend

# Search jobs
curl "http://localhost:5000/api/adzuna/jobs/search?what=data%20scientist&where=Remote&page=1&results_per_page=10"

# Get data roles
curl "http://localhost:5000/api/adzuna/jobs/data-roles?location=Remote&results_per_page=20"

# Get categories
curl "http://localhost:5000/api/adzuna/categories"
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
- **503**: Adzuna API keys not configured
- **404**: Job not found
- **500**: Server error or Adzuna API error

## Notes

1. **API Rate Limits**: Adzuna API has rate limits. Check their documentation for details.
2. **Job IDs**: Adzuna jobs have IDs prefixed with `adzuna_` (e.g., `adzuna_12345`)
3. **Transformations**: Adzuna job format is automatically transformed to match your UI format in the backend route
4. **Caching**: Consider implementing caching to reduce API calls
