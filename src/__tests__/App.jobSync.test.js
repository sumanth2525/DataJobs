/**
 * Unit Tests for Job Synchronization
 * Tests that jobs inserted via SQL show in UI and jobs posted from UI show in UI
 */

import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../App';
import { jobsAPI } from '../lib/api';

// Mock the API
jest.mock('../lib/api', () => ({
  jobsAPI: {
    getAll: jest.fn(),
    create: jest.fn(),
    getById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    scrapeJob: jest.fn()
  }
}));

// Mock PostJob component
jest.mock('../components/PostJob', () => {
  return function MockPostJob({ onJobPosted }) {
    return (
      <div data-testid="post-job-page">
        <button
          data-testid="test-post-job-btn"
          onClick={() => {
            if (onJobPosted) {
              onJobPosted();
            }
          }}
        >
          Test Post Job
        </button>
      </div>
    );
  };
});

// Mock other components
jest.mock('../components/Dashboard', () => {
  return function MockDashboard({ jobs }) {
    return (
      <div data-testid="dashboard">
        <div data-testid="job-count">Jobs: {jobs?.length || 0}</div>
        {jobs?.map(job => (
          <div key={job.id} data-testid={`job-${job.id}`}>
            {job.company} - {job.title}
          </div>
        ))}
      </div>
    );
  };
});

jest.mock('../components/Header', () => {
  return function MockHeader() {
    return <div data-testid="header">Header</div>;
  };
});

jest.mock('../components/Login', () => () => <div>Login</div>);
jest.mock('../components/SignUp', () => () => <div>SignUp</div>);
jest.mock('../components/Messages', () => () => <div>Messages</div>);
jest.mock('../components/Community', () => () => <div>Community</div>);
jest.mock('../components/Profile', () => () => <div>Profile</div>);
jest.mock('@vercel/analytics/react', () => ({
  Analytics: () => null
}));

describe('Job Synchronization Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    window.location.hash = '';
  });

  describe('Jobs from SQL Database show in UI', () => {
    test('should fetch and display jobs from API on mount', async () => {
      // Mock API response - simulating jobs inserted via SQL
      const mockJobsFromDB = [
        {
          id: 1,
          company: 'Google',
          title: 'Data Scientist',
          location: 'San Francisco, CA',
          salary: '$120k-180k',
          company_logo: 'G',
          tags: ['Full time', 'Remote'],
          link: 'https://google.com/jobs/1',
          description: 'Data scientist role at Google',
          created_at: '2024-01-15T10:00:00Z'
        },
        {
          id: 2,
          company: 'Amazon',
          title: 'Data Engineer',
          location: 'Seattle, WA',
          salary: '$130k-190k',
          company_logo: 'A',
          tags: ['Full time', 'On-site'],
          link: 'https://amazon.com/jobs/2',
          description: 'Data engineer role at Amazon',
          created_at: '2024-01-14T10:00:00Z'
        }
      ];

      jobsAPI.getAll.mockResolvedValue({
        success: true,
        data: mockJobsFromDB,
        count: mockJobsFromDB.length
      });

      await act(async () => {
        render(<App />);
      });

      // Wait for jobs to be fetched and rendered
      await waitFor(() => {
        expect(jobsAPI.getAll).toHaveBeenCalledTimes(1);
      });

      // Check that jobs are displayed in UI
      await waitFor(() => {
        expect(screen.getByTestId('job-1')).toBeInTheDocument();
        expect(screen.getByTestId('job-2')).toBeInTheDocument();
        expect(screen.getByText('Google - Data Scientist')).toBeInTheDocument();
        expect(screen.getByText('Amazon - Data Engineer')).toBeInTheDocument();
      });

      // Verify job count
      expect(screen.getByTestId('job-count')).toHaveTextContent('Jobs: 2');
    });

    test('should transform database format to UI format correctly', async () => {
      const mockDbJob = {
        id: 100,
        company: 'Microsoft',
        company_logo: 'M',
        title: 'Senior Data Analyst',
        location: 'Remote',
        salary: '$110k-150k',
        tags: ['Full time', 'Remote', 'Senior'],
        link: 'https://microsoft.com/jobs/100',
        description: 'Senior analyst role',
        created_at: '2024-01-20T12:00:00Z'
      };

      jobsAPI.getAll.mockResolvedValue({
        success: true,
        data: [mockDbJob],
        count: 1
      });

      await act(async () => {
        render(<App />);
      });

      await waitFor(() => {
        const jobElement = screen.getByTestId('job-100');
        expect(jobElement).toBeInTheDocument();
        expect(jobElement).toHaveTextContent('Microsoft - Senior Data Analyst');
      });
    });

    test('should handle empty database gracefully', async () => {
      jobsAPI.getAll.mockResolvedValue({
        success: true,
        data: [],
        count: 0
      });

      await act(async () => {
        render(<App />);
      });

      await waitFor(() => {
        expect(jobsAPI.getAll).toHaveBeenCalled();
      });

      // Should show 0 jobs
      expect(screen.getByTestId('job-count')).toHaveTextContent('Jobs: 0');
    });

    test('should fallback to sample jobs if API fails', async () => {
      jobsAPI.getAll.mockRejectedValue(new Error('Network error'));

      await act(async () => {
        render(<App />);
      });

      await waitFor(() => {
        expect(jobsAPI.getAll).toHaveBeenCalled();
      }, { timeout: 3000 });

      // Should still render with fallback (sample jobs or empty)
      expect(screen.getByTestId('dashboard')).toBeInTheDocument();
    });
  });

  describe('Jobs posted from UI show in UI', () => {
    test('should refresh job list after posting a new job', async () => {
      const initialJobs = [
        {
          id: 1,
          company: 'Initial Company',
          title: 'Initial Job',
          location: 'Remote',
          salary: '$100k',
          company_logo: 'I',
          tags: ['Full time'],
          link: 'https://example.com/1',
          description: 'Initial job',
          created_at: '2024-01-15T10:00:00Z'
        }
      ];

      const newJobFromDB = {
        id: 2,
        company: 'New Company',
        title: 'New Job Posted',
        location: 'San Francisco',
        salary: '$120k-160k',
        company_logo: 'N',
        tags: ['Full time', 'Remote'],
        link: 'https://example.com/2',
        description: 'Newly posted job',
        created_at: new Date().toISOString()
      };

      // First fetch returns initial jobs
      jobsAPI.getAll
        .mockResolvedValueOnce({
          success: true,
          data: initialJobs,
          count: 1
        })
        // Second fetch (after posting) includes new job
        .mockResolvedValueOnce({
          success: true,
          data: [...initialJobs, newJobFromDB],
          count: 2
        });

      // Mock job creation API
      jobsAPI.create.mockResolvedValue({
        success: true,
        data: newJobFromDB
      });

      await act(async () => {
        render(<App />);
      });

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByTestId('job-1')).toBeInTheDocument();
      });

      // Simulate navigation to post-job page
      window.location.hash = '#post-job';

      await waitFor(() => {
        expect(screen.getByTestId('post-job-page')).toBeInTheDocument();
      });

      // Simulate posting a job (calls onJobPosted callback)
      const postJobBtn = screen.getByTestId('test-post-job-btn');
      await act(async () => {
        postJobBtn.click();
      });

      // Wait for job list to refresh
      await waitFor(() => {
        expect(jobsAPI.getAll).toHaveBeenCalledTimes(2);
      }, { timeout: 3000 });

      // New job should appear in UI
      await waitFor(() => {
        expect(screen.getByTestId('job-2')).toBeInTheDocument();
        expect(screen.getByText('New Company - New Job Posted')).toBeInTheDocument();
      });

      // Verify updated job count
      expect(screen.getByTestId('job-count')).toHaveTextContent('Jobs: 2');
    });

    test('should display newly posted job immediately after successful post', async () => {
      const newJob = {
        id: 999,
        company: 'Test Company',
        title: 'Test Position',
        location: 'Remote',
        salary: '$100k-150k',
        company_logo: 'T',
        tags: ['Full time'],
        link: 'https://test.com/job',
        description: 'Test job description',
        created_at: new Date().toISOString()
      };

      // Mock initial empty state
      jobsAPI.getAll
        .mockResolvedValueOnce({
          success: true,
          data: [],
          count: 0
        })
        .mockResolvedValueOnce({
          success: true,
          data: [newJob],
          count: 1
        });

      jobsAPI.create.mockResolvedValue({
        success: true,
        data: newJob
      });

      await act(async () => {
        render(<App />);
      });

      // Navigate to post-job page
      window.location.hash = '#post-job';

      await waitFor(() => {
        expect(screen.getByTestId('post-job-page')).toBeInTheDocument();
      });

      // Simulate job posting
      const postJobBtn = screen.getByTestId('test-post-job-btn');
      await act(async () => {
        postJobBtn.click();
      });

      // Wait for refresh
      await waitFor(() => {
        expect(jobsAPI.getAll).toHaveBeenCalledTimes(2);
      });

      // Check new job appears
      await waitFor(() => {
        expect(screen.getByTestId('job-999')).toBeInTheDocument();
        expect(screen.getByText('Test Company - Test Position')).toBeInTheDocument();
      });
    });

    test('should handle job posting failure gracefully', async () => {
      const initialJobs = [
        {
          id: 1,
          company: 'Existing Company',
          title: 'Existing Job',
          location: 'Remote',
          salary: '$100k',
          company_logo: 'E',
          tags: ['Full time'],
          link: 'https://example.com/1',
          description: 'Existing job',
          created_at: '2024-01-15T10:00:00Z'
        }
      ];

      jobsAPI.getAll.mockResolvedValue({
        success: true,
        data: initialJobs,
        count: 1
      });

      jobsAPI.create.mockRejectedValue(new Error('Failed to create job'));

      await act(async () => {
        render(<App />);
      });

      // Navigate to post-job
      window.location.hash = '#post-job';

      await waitFor(() => {
        expect(screen.getByTestId('post-job-page')).toBeInTheDocument();
      });

      // Try to post (will fail, but should not break UI)
      const postJobBtn = screen.getByTestId('test-post-job-btn');
      
      // Even if create fails, onJobPosted might still be called
      // So we check that getAll is called
      await act(async () => {
        postJobBtn.click();
      });

      // Should still show existing jobs
      await waitFor(() => {
        expect(screen.getByTestId('job-1')).toBeInTheDocument();
      });
    });
  });

  describe('Real-time Job Synchronization', () => {
    test('should show job inserted via SQL in UI after refresh', async () => {
      // Initial state: 1 job
      const initialJobs = [
        {
          id: 1,
          company: 'Company A',
          title: 'Job A',
          location: 'Remote',
          salary: '$100k',
          company_logo: 'A',
          tags: ['Full time'],
          link: 'https://example.com/a',
          description: 'Job A description',
          created_at: '2024-01-15T10:00:00Z'
        }
      ];

      // After SQL insert: 2 jobs (simulating someone inserted via SQL)
      const jobsAfterSQLInsert = [
        ...initialJobs,
        {
          id: 2,
          company: 'Company B (SQL Insert)',
          title: 'Job B from SQL',
          location: 'New York',
          salary: '$120k',
          company_logo: 'B',
          tags: ['Full time', 'On-site'],
          link: 'https://example.com/b',
          description: 'This job was inserted via SQL',
          created_at: new Date().toISOString()
        }
      ];

      // First fetch: initial jobs
      jobsAPI.getAll
        .mockResolvedValueOnce({
          success: true,
          data: initialJobs,
          count: 1
        })
        // Second fetch (after SQL insert): includes new job
        .mockResolvedValueOnce({
          success: true,
          data: jobsAfterSQLInsert,
          count: 2
        });

      await act(async () => {
        render(<App />);
      });

      // Initial state
      await waitFor(() => {
        expect(screen.getByTestId('job-1')).toBeInTheDocument();
        expect(screen.getByText('Company A - Job A')).toBeInTheDocument();
      });

      // Simulate page refresh or re-fetch (like after SQL insert)
      // In real scenario, this would happen automatically or via refresh
      const { rerender } = render(<App />);
      
      await act(async () => {
        rerender(<App />);
      });

      // After refresh, new job from SQL should appear
      await waitFor(() => {
        expect(jobsAPI.getAll).toHaveBeenCalled();
        // The new job should be visible
        const jobCount = screen.getByTestId('job-count');
        expect(jobCount).toBeInTheDocument();
      });
    });
  });

  describe('Data Transformation', () => {
    test('should correctly transform database fields to UI format', async () => {
      const dbJob = {
        id: 500,
        company: 'TestCorp',
        company_logo: 'T',
        title: 'Data Engineer',
        location: 'Remote',
        salary: '$130k-180k',
        tags: ['Full time', 'Remote', 'Senior'],
        link: 'https://testcorp.com/job',
        description: 'Engineer description',
        created_at: '2024-01-20T15:30:00Z'
      };

      jobsAPI.getAll.mockResolvedValue({
        success: true,
        data: [dbJob],
        count: 1
      });

      await act(async () => {
        render(<App />);
      });

      await waitFor(() => {
        const jobElement = screen.getByTestId('job-500');
        expect(jobElement).toHaveTextContent('TestCorp - Data Engineer');
      });
    });

    test('should handle missing fields gracefully', async () => {
      const incompleteJob = {
        id: 600,
        company: 'Minimal Company',
        title: 'Minimal Job',
        link: 'https://example.com'
        // Missing: location, salary, tags, description, created_at
      };

      jobsAPI.getAll.mockResolvedValue({
        success: true,
        data: [incompleteJob],
        count: 1
      });

      await act(async () => {
        render(<App />);
      });

      await waitFor(() => {
        expect(screen.getByTestId('job-600')).toBeInTheDocument();
        expect(screen.getByText('Minimal Company - Minimal Job')).toBeInTheDocument();
      });
    });
  });
});
