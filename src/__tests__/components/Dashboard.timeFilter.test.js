/**
 * Unit Tests for Dashboard Time Filter Behavior
 * Tests that time filters correctly refetch jobs from API and filter by time range
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Dashboard from '../../components/Dashboard';
import { jobsAPI } from '../../lib/api';

// Mock the API
jest.mock('../../lib/api', () => ({
  jobsAPI: {
    getAll: jest.fn(),
    create: jest.fn(),
    getById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    scrapeJob: jest.fn()
  }
}));

// Mock child components
jest.mock('../../components/Header', () => {
  return function MockHeader() {
    return <div data-testid="header">Header</div>;
  };
});

jest.mock('../../components/SearchFilterBar', () => {
  return function MockSearchFilterBar() {
    return <div data-testid="search-filter-bar">Search Filter Bar</div>;
  };
});

jest.mock('../../components/JobListings', () => {
  return function MockJobListings({ jobs, onSortChange, currentSort }) {
    return (
      <div data-testid="job-listings">
        <div data-testid="job-count">{jobs.length}</div>
        <select 
          data-testid="sort-dropdown"
          value={currentSort || 'Latest'} 
          onChange={(e) => onSortChange(e.target.value)}
        >
          <option value="Latest">Latest</option>
          <option value="Last 24 hours">Last 24 hours</option>
          <option value="Last week">Last week</option>
          <option value="Last month">Last month</option>
        </select>
      </div>
    );
  };
});

jest.mock('../../components/MobileNav', () => () => <div data-testid="mobile-nav" />);
jest.mock('../../components/MobileFilterDrawer', () => () => null);
jest.mock('../../components/FilterPanel', () => () => null);

describe('Dashboard Time Filter Behavior', () => {
  const mockSetJobs = jest.fn();
  const mockProps = {
    jobs: [],
    setJobs: mockSetJobs,
    onNavigate: jest.fn(),
    user: null,
    onShowLogin: jest.fn(),
    onShowSignUp: jest.fn(),
    onLogout: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Time Filter API Refetch', () => {
    test('should refetch jobs from API when changing to "Last 24 hours" filter', async () => {
      const jobsFromLast24h = [
        {
          id: 1,
          company: 'Recent Company',
          company_logo: 'R',
          title: 'Recent Job',
          location: 'Remote',
          salary: '$100k',
          tags: ['Full time'],
          link: 'https://recent.com',
          description: 'Recent job',
          created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString() // 12 hours ago
        }
      ];

      jobsAPI.getAll.mockResolvedValueOnce({
        success: true,
        data: jobsFromLast24h,
        count: 1
      });

      render(<Dashboard {...mockProps} />);

      const sortSelect = screen.getByTestId('sort-dropdown');
      fireEvent.change(sortSelect, { target: { value: 'Last 24 hours' } });

      await waitFor(() => {
        expect(jobsAPI.getAll).toHaveBeenCalledWith({ timeFilter: 'Last 24 hours' });
      });

      await waitFor(() => {
        expect(mockSetJobs).toHaveBeenCalled();
        const transformedJobs = mockSetJobs.mock.calls[0][0];
        expect(transformedJobs.length).toBe(1);
        expect(transformedJobs[0].company).toBe('Recent Company');
      });
    });

    test('should refetch jobs from API when changing to "Last week" filter', async () => {
      const jobsFromLastWeek = [
        {
          id: 2,
          company: 'Week Company',
          company_logo: 'W',
          title: 'Week Job',
          location: 'Remote',
          salary: '$120k',
          tags: ['Full time'],
          link: 'https://week.com',
          description: 'Week job',
          created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() // 5 days ago
        }
      ];

      jobsAPI.getAll.mockResolvedValueOnce({
        success: true,
        data: jobsFromLastWeek,
        count: 1
      });

      render(<Dashboard {...mockProps} />);

      const sortSelect = screen.getByTestId('sort-dropdown');
      fireEvent.change(sortSelect, { target: { value: 'Last week' } });

      await waitFor(() => {
        expect(jobsAPI.getAll).toHaveBeenCalledWith({ timeFilter: 'Last week' });
      });

      await waitFor(() => {
        expect(mockSetJobs).toHaveBeenCalled();
      });
    });

    test('should refetch jobs from API when changing to "Latest" filter', async () => {
      const allJobs = [
        {
          id: 1,
          company: 'Company A',
          company_logo: 'A',
          title: 'Job A',
          location: 'Remote',
          salary: '$100k',
          tags: ['Full time'],
          link: 'https://a.com',
          description: 'Job A',
          created_at: new Date().toISOString()
        },
        {
          id: 2,
          company: 'Company B',
          company_logo: 'B',
          title: 'Job B',
          location: 'Remote',
          salary: '$110k',
          tags: ['Full time'],
          link: 'https://b.com',
          description: 'Job B',
          created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString() // 8 days ago
        }
      ];

      jobsAPI.getAll.mockResolvedValueOnce({
        success: true,
        data: allJobs,
        count: 2
      });

      render(<Dashboard {...mockProps} />);

      const sortSelect = screen.getByTestId('sort-dropdown');
      fireEvent.change(sortSelect, { target: { value: 'Latest' } });

      await waitFor(() => {
        expect(jobsAPI.getAll).toHaveBeenCalledWith({ timeFilter: 'Latest' });
      });
    });

    test('should NOT refetch when changing to salary sort (non-time filter)', async () => {
      render(<Dashboard {...mockProps} />);

      const sortSelect = screen.getByTestId('sort-dropdown');
      const initialCallCount = jobsAPI.getAll.mock.calls.length;

      // Change to salary sort - should NOT trigger API refetch
      fireEvent.change(sortSelect, { target: { value: 'Salary (High to Low)' } });

      // Wait a bit to ensure no API call
      await new Promise(resolve => setTimeout(resolve, 100));

      // Should not have made additional API calls
      expect(jobsAPI.getAll.mock.calls.length).toBe(initialCallCount);
    });
  });

  describe('Time Filter Accuracy', () => {
    test('"Last 24 hours" filter should only return jobs from last 24 hours', async () => {
      const now = new Date();
      const recentJob = {
        id: 1,
        company: 'Recent',
        company_logo: 'R',
        title: 'Recent Job',
        location: 'Remote',
        salary: '$100k',
        tags: ['Full time'],
        link: 'https://recent.com',
        description: 'Recent',
        created_at: new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString() // 12 hours ago - should be included
      };

      const oldJob = {
        id: 2,
        company: 'Old',
        company_logo: 'O',
        title: 'Old Job',
        location: 'Remote',
        salary: '$100k',
        tags: ['Full time'],
        link: 'https://old.com',
        description: 'Old',
        created_at: new Date(now.getTime() - 25 * 60 * 60 * 1000).toISOString() // 25 hours ago - should NOT be included
      };

      // Backend should only return recentJob (backend filters by timeFilter parameter)
      jobsAPI.getAll.mockResolvedValueOnce({
        success: true,
        data: [recentJob], // Backend already filtered - only recentJob
        count: 1
      });

      render(<Dashboard {...mockProps} />);

      const sortSelect = screen.getByTestId('sort-dropdown');
      fireEvent.change(sortSelect, { target: { value: 'Last 24 hours' } });

      await waitFor(() => {
        expect(jobsAPI.getAll).toHaveBeenCalledWith({ timeFilter: 'Last 24 hours' });
      });

      await waitFor(() => {
        expect(mockSetJobs).toHaveBeenCalled();
        const transformedJobs = mockSetJobs.mock.calls[0][0];
        // Should only have 1 job (recentJob), not oldJob
        expect(transformedJobs.length).toBe(1);
        expect(transformedJobs[0].id).toBe(1);
        expect(transformedJobs[0].company).toBe('Recent');
      });
    });

    test('"Last week" filter should only return jobs from last 7 days', async () => {
      const now = new Date();
      const weekJob = {
        id: 1,
        company: 'Week Company',
        company_logo: 'W',
        title: 'Week Job',
        location: 'Remote',
        salary: '$100k',
        tags: ['Full time'],
        link: 'https://week.com',
        description: 'Week',
        created_at: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString() // 5 days ago - should be included
      };

      const oldJob = {
        id: 2,
        company: 'Old Company',
        company_logo: 'O',
        title: 'Old Job',
        location: 'Remote',
        salary: '$100k',
        tags: ['Full time'],
        link: 'https://old.com',
        description: 'Old',
        created_at: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString() // 8 days ago - should NOT be included
      };

      // Backend should only return weekJob (backend filters by timeFilter parameter)
      jobsAPI.getAll.mockResolvedValueOnce({
        success: true,
        data: [weekJob], // Backend already filtered
        count: 1
      });

      render(<Dashboard {...mockProps} />);

      const sortSelect = screen.getByTestId('sort-dropdown');
      fireEvent.change(sortSelect, { target: { value: 'Last week' } });

      await waitFor(() => {
        expect(jobsAPI.getAll).toHaveBeenCalledWith({ timeFilter: 'Last week' });
      });

      await waitFor(() => {
        expect(mockSetJobs).toHaveBeenCalled();
        const transformedJobs = mockSetJobs.mock.calls[0][0];
        // Should only have weekJob, not oldJob
        expect(transformedJobs.length).toBe(1);
        expect(transformedJobs[0].id).toBe(1);
      });
    });

    test('job posted "just now" should appear in "Last 24 hours" filter', async () => {
      const justNowJob = {
        id: 999,
        company: 'Just Now Company',
        company_logo: 'J',
        title: 'Just Now Job',
        location: 'Remote',
        salary: '$100k',
        tags: ['Full time'],
        link: 'https://justnow.com',
        description: 'Just now',
        created_at: new Date().toISOString() // Just now - should be included in Last 24 hours
      };

      jobsAPI.getAll.mockResolvedValueOnce({
        success: true,
        data: [justNowJob],
        count: 1
      });

      render(<Dashboard {...mockProps} />);

      const sortSelect = screen.getByTestId('sort-dropdown');
      fireEvent.change(sortSelect, { target: { value: 'Last 24 hours' } });

      await waitFor(() => {
        expect(mockSetJobs).toHaveBeenCalled();
        const transformedJobs = mockSetJobs.mock.calls[0][0];
        expect(transformedJobs.length).toBe(1);
        expect(transformedJobs[0].id).toBe(999);
        expect(transformedJobs[0].company).toBe('Just Now Company');
      });
    });

    test('job posted "just now" should appear in "Last week" filter', async () => {
      const justNowJob = {
        id: 999,
        company: 'Just Now Company',
        company_logo: 'J',
        title: 'Just Now Job',
        location: 'Remote',
        salary: '$100k',
        tags: ['Full time'],
        link: 'https://justnow.com',
        description: 'Just now',
        created_at: new Date().toISOString() // Just now - should be included in Last week
      };

      jobsAPI.getAll.mockResolvedValueOnce({
        success: true,
        data: [justNowJob],
        count: 1
      });

      render(<Dashboard {...mockProps} />);

      const sortSelect = screen.getByTestId('sort-dropdown');
      fireEvent.change(sortSelect, { target: { value: 'Last week' } });

      await waitFor(() => {
        expect(mockSetJobs).toHaveBeenCalled();
        const transformedJobs = mockSetJobs.mock.calls[0][0];
        expect(transformedJobs.length).toBe(1);
        expect(transformedJobs[0].id).toBe(999);
      });
    });
  });

  describe('Data Transformation', () => {
    test('should transform backend job format to UI format correctly', async () => {
      const backendJob = {
        id: 100,
        company: 'Test Company',
        company_logo: 'T',
        title: 'Test Job',
        location: 'Remote',
        salary: '$120k',
        tags: ['Full time', 'Remote'],
        link: 'https://test.com',
        description: 'Test description',
        created_at: '2024-01-18T10:30:00Z'
      };

      jobsAPI.getAll.mockResolvedValueOnce({
        success: true,
        data: [backendJob],
        count: 1
      });

      render(<Dashboard {...mockProps} />);

      const sortSelect = screen.getByTestId('sort-dropdown');
      fireEvent.change(sortSelect, { target: { value: 'Latest' } });

      await waitFor(() => {
        expect(mockSetJobs).toHaveBeenCalled();
        const transformedJobs = mockSetJobs.mock.calls[0][0];

        expect(transformedJobs[0]).toMatchObject({
          id: 100,
          company: 'Test Company',
          companyLogo: 'T',
          title: 'Test Job',
          location: 'Remote',
          salary: '$120k',
          tags: ['Full time', 'Remote'],
          link: 'https://test.com',
          description: 'Test description',
          timestamp: '2024-01-18T10:30:00Z'
        });

        // Check date formatting
        expect(transformedJobs[0]).toHaveProperty('date');
        expect(typeof transformedJobs[0].date).toBe('string');
      });
    });

    test('should handle missing company_logo by using first letter', async () => {
      const backendJob = {
        id: 101,
        company: 'No Logo Company',
        company_logo: null,
        title: 'No Logo Job',
        location: 'Remote',
        salary: '$100k',
        tags: ['Full time'],
        link: 'https://nologo.com',
        description: 'No logo',
        created_at: new Date().toISOString()
      };

      jobsAPI.getAll.mockResolvedValueOnce({
        success: true,
        data: [backendJob],
        count: 1
      });

      render(<Dashboard {...mockProps} />);

      const sortSelect = screen.getByTestId('sort-dropdown');
      fireEvent.change(sortSelect, { target: { value: 'Latest' } });

      await waitFor(() => {
        expect(mockSetJobs).toHaveBeenCalled();
        const transformedJobs = mockSetJobs.mock.calls[0][0];
        expect(transformedJobs[0].companyLogo).toBe('N');
      });
    });
  });

  describe('Error Handling', () => {
    test('should handle API error gracefully when refetching with time filter', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      jobsAPI.getAll.mockRejectedValueOnce(new Error('API Error'));

      render(<Dashboard {...mockProps} jobs={[]} />);

      const sortSelect = screen.getByTestId('sort-dropdown');
      fireEvent.change(sortSelect, { target: { value: 'Last week' } });

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Error fetching jobs with timeFilter:',
          expect.any(Error)
        );
      });

      // Component should not crash
      expect(screen.getByTestId('dashboard')).toBeInTheDocument();
      expect(screen.getByTestId('job-listings')).toBeInTheDocument();

      consoleErrorSpy.mockRestore();
    });

    test('should handle invalid API response gracefully', async () => {
      jobsAPI.getAll.mockResolvedValueOnce({
        success: false,
        error: 'Invalid response'
      });

      render(<Dashboard {...mockProps} jobs={[]} />);

      const sortSelect = screen.getByTestId('sort-dropdown');
      fireEvent.change(sortSelect, { target: { value: 'Last 24 hours' } });

      // Should not crash - invalid response is handled
      await waitFor(() => {
        expect(screen.getByTestId('job-listings')).toBeInTheDocument();
      });
    });
  });

  describe('Filter Persistence', () => {
    test('should maintain filter state after API refetch', async () => {
      jobsAPI.getAll.mockResolvedValue({
        success: true,
        data: [],
        count: 0
      });

      render(<Dashboard {...mockProps} />);

      const sortSelect = screen.getByTestId('sort-dropdown');

      // Change to "Last week"
      fireEvent.change(sortSelect, { target: { value: 'Last week' } });

      await waitFor(() => {
        expect(jobsAPI.getAll).toHaveBeenCalledWith({ timeFilter: 'Last week' });
      });

      // Dropdown should still show "Last week"
      expect(sortSelect.value).toBe('Last week');
    });
  });
});
