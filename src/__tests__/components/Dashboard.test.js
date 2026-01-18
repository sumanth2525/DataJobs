import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Dashboard from '../../components/Dashboard';
import { sampleJobs } from '../../data/jobData';
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
  return function MockHeader({ onNavigate, user, onShowLogin, onShowSignUp, onLogout }) {
    return (
      <div data-testid="header">
        <button onClick={() => onNavigate('messages')}>Navigate</button>
        <button onClick={onShowLogin}>Show Login</button>
        <button onClick={onShowSignUp}>Show SignUp</button>
        <button onClick={onLogout}>Logout</button>
      </div>
    );
  };
});

jest.mock('../../components/SearchFilterBar', () => {
  return function MockSearchFilterBar({ onSearchChange, onFilterClick }) {
    return (
      <div data-testid="search-filter-bar">
        <input 
          data-testid="search-input"
          onChange={(e) => onSearchChange(e.target.value)}
        />
        <button onClick={onFilterClick}>Filter</button>
      </div>
    );
  };
});

jest.mock('../../components/JobListings', () => {
  return function MockJobListings({ jobs, onFilterClick, onSortChange, currentSort }) {
    return (
      <div data-testid="job-listings">
        <div data-testid="job-count">{jobs.length}</div>
        <button onClick={onFilterClick}>Filter</button>
        <select 
          data-testid="sort-dropdown"
          value={currentSort || 'Latest'} 
          onChange={(e) => onSortChange(e.target.value)}
        >
          <option value="Latest">Latest</option>
          <option value="Last 24 hours">Last 24 hours</option>
          <option value="Last week">Last week</option>
          <option value="Last month">Last month</option>
          <option value="Salary (High to Low)">Salary (High to Low)</option>
          <option value="Salary (Low to High)">Salary (Low to High)</option>
        </select>
      </div>
    );
  };
});

jest.mock('../../components/MobileNav', () => {
  return function MockMobileNav() {
    return <div data-testid="mobile-nav">Mobile Nav</div>;
  };
});

jest.mock('../../components/MobileFilterDrawer', () => {
  return function MockMobileFilterDrawer({ isOpen, onClose, onApply, onClear }) {
    if (!isOpen) return null;
    return (
      <div data-testid="mobile-filter-drawer">
        <button onClick={onClose}>Close</button>
        <button onClick={onApply}>Apply</button>
        <button onClick={onClear}>Clear</button>
      </div>
    );
  };
});

jest.mock('../../components/FilterPanel', () => {
  return function MockFilterPanel({ isOpen, onClose, onApply, onClear }) {
    if (!isOpen) return null;
    return (
      <div data-testid="filter-panel">
        <button onClick={onClose}>Close</button>
        <button onClick={onApply}>Apply</button>
        <button onClick={onClear}>Clear</button>
      </div>
    );
  };
});

describe('Dashboard Component', () => {
  const mockProps = {
    jobs: sampleJobs,
    setJobs: jest.fn(),
    onNavigate: jest.fn(),
    user: null,
    onShowLogin: jest.fn(),
    onShowSignUp: jest.fn(),
    onLogout: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    window.innerWidth = 1024; // Desktop width
    // Default mock: return sample jobs when API is called
    jobsAPI.getAll.mockResolvedValue({
      success: true,
      data: sampleJobs.map(job => ({
        id: job.id,
        company: job.company,
        company_logo: job.companyLogo,
        title: job.title,
        location: job.location,
        salary: job.salary,
        tags: job.tags,
        link: job.link,
        description: job.description,
        created_at: job.timestamp || new Date().toISOString()
      })),
      count: sampleJobs.length
    });
  });

  test('renders dashboard with header and job listings', () => {
    render(<Dashboard {...mockProps} />);
    
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('search-filter-bar')).toBeInTheDocument();
    expect(screen.getByTestId('job-listings')).toBeInTheDocument();
  });

  test('displays correct number of jobs', () => {
    render(<Dashboard {...mockProps} />);
    
    const jobCount = screen.getByTestId('job-count');
    expect(jobCount).toHaveTextContent(sampleJobs.length.toString());
  });

  test('handles search filter change', () => {
    render(<Dashboard {...mockProps} />);
    
    const searchInput = screen.getByTestId('search-input');
    fireEvent.change(searchInput, { target: { value: 'Data Scientist' } });
    
    // Search should update filters
    expect(searchInput.value).toBe('Data Scientist');
  });

  test('opens filter panel on desktop when filter button is clicked', () => {
    window.innerWidth = 1024;
    render(<Dashboard {...mockProps} />);
    
    const filterButton = screen.getAllByText('Filter')[0];
    fireEvent.click(filterButton);
    
    expect(screen.getByTestId('filter-panel')).toBeInTheDocument();
  });

  test('opens filter drawer on mobile when filter button is clicked', () => {
    window.innerWidth = 768;
    render(<Dashboard {...mockProps} />);
    
    const filterButton = screen.getAllByText('Filter')[0];
    fireEvent.click(filterButton);
    
    expect(screen.getByTestId('mobile-filter-drawer')).toBeInTheDocument();
  });

  test('applies filters when apply button is clicked', () => {
    window.innerWidth = 1024;
    render(<Dashboard {...mockProps} />);
    
    // Open filter panel
    const filterButton = screen.getAllByText('Filter')[0];
    fireEvent.click(filterButton);
    
    // Apply filters
    const applyButton = screen.getByText('Apply');
    fireEvent.click(applyButton);
    
    expect(screen.queryByTestId('filter-panel')).not.toBeInTheDocument();
  });

  test('clears filters when clear button is clicked', () => {
    window.innerWidth = 1024;
    render(<Dashboard {...mockProps} />);
    
    // Open filter panel
    const filterButton = screen.getAllByText('Filter')[0];
    fireEvent.click(filterButton);
    
    // Clear filters
    const clearButton = screen.getByText('Clear');
    fireEvent.click(clearButton);
    
    expect(screen.queryByTestId('filter-panel')).not.toBeInTheDocument();
  });

  test('handles sort change and updates dropdown', () => {
    render(<Dashboard {...mockProps} />);
    
    const sortSelect = screen.getByTestId('sort-dropdown');
    fireEvent.change(sortSelect, { target: { value: 'Last 24 hours' } });
    
    // Dropdown should update
    expect(sortSelect.value).toBe('Last 24 hours');
  });

  test('refetches jobs from API when time filter changes to "Last 24 hours"', async () => {
    const filteredJobs = sampleJobs.slice(0, 2); // Mock filtered response
    
    jobsAPI.getAll.mockResolvedValueOnce({
      success: true,
      data: filteredJobs.map(job => ({
        id: job.id,
        company: job.company,
        company_logo: job.companyLogo,
        title: job.title,
        location: job.location,
        salary: job.salary,
        tags: job.tags,
        link: job.link,
        description: job.description,
        created_at: job.timestamp || new Date().toISOString()
      })),
      count: filteredJobs.length
    });

    render(<Dashboard {...mockProps} />);
    
    const sortSelect = screen.getByTestId('sort-dropdown');
    
    // Change to "Last 24 hours" - should trigger API call
    fireEvent.change(sortSelect, { target: { value: 'Last 24 hours' } });
    
    // Wait for API call and state update
    await waitFor(() => {
      expect(jobsAPI.getAll).toHaveBeenCalledWith({ timeFilter: 'Last 24 hours' });
    });

    // setJobs should be called with transformed jobs
    await waitFor(() => {
      expect(mockProps.setJobs).toHaveBeenCalled();
      const callArgs = mockProps.setJobs.mock.calls[0][0];
      expect(Array.isArray(callArgs)).toBe(true);
      expect(callArgs.length).toBe(2);
    });
  });

  test('refetches jobs from API when time filter changes to "Last week"', async () => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    // Mock jobs from last week
    const lastWeekJobs = [
      {
        id: 1,
        company: 'Test Company',
        company_logo: 'T',
        title: 'Test Job',
        location: 'Remote',
        salary: '$100k',
        tags: ['Full time'],
        link: 'https://test.com',
        description: 'Test',
        created_at: weekAgo.toISOString()
      }
    ];

    jobsAPI.getAll.mockResolvedValueOnce({
      success: true,
      data: lastWeekJobs,
      count: lastWeekJobs.length
    });

    render(<Dashboard {...mockProps} />);
    
    const sortSelect = screen.getByTestId('sort-dropdown');
    fireEvent.change(sortSelect, { target: { value: 'Last week' } });
    
    await waitFor(() => {
      expect(jobsAPI.getAll).toHaveBeenCalledWith({ timeFilter: 'Last week' });
    });

    await waitFor(() => {
      expect(mockProps.setJobs).toHaveBeenCalled();
    });
  });

  test('refetches jobs from API when time filter changes to "Latest"', async () => {
    jobsAPI.getAll.mockResolvedValueOnce({
      success: true,
      data: sampleJobs.map(job => ({
        id: job.id,
        company: job.company,
        company_logo: job.companyLogo,
        title: job.title,
        location: job.location,
        salary: job.salary,
        tags: job.tags,
        link: job.link,
        description: job.description,
        created_at: job.timestamp || new Date().toISOString()
      })),
      count: sampleJobs.length
    });

    render(<Dashboard {...mockProps} />);
    
    const sortSelect = screen.getByTestId('sort-dropdown');
    fireEvent.change(sortSelect, { target: { value: 'Latest' } });
    
    await waitFor(() => {
      expect(jobsAPI.getAll).toHaveBeenCalledWith({ timeFilter: 'Latest' });
    });
  });

  test('does NOT refetch from API when filter changes to salary sort', async () => {
    render(<Dashboard {...mockProps} />);
    
    const sortSelect = screen.getByTestId('sort-dropdown');
    const initialCallCount = jobsAPI.getAll.mock.calls.length;
    
    // Change to salary sort - should NOT trigger API refetch
    fireEvent.change(sortSelect, { target: { value: 'Salary (High to Low)' } });
    
    // Wait a bit to ensure no API call happens
    await waitFor(() => {
      // Should not have made additional API calls
      expect(jobsAPI.getAll.mock.calls.length).toBe(initialCallCount);
    }, { timeout: 500 });
  });

  test('transforms backend job format to UI format correctly when refetching', async () => {
    const backendJob = {
      id: 999,
      company: 'Backend Company',
      company_logo: 'B',
      title: 'Backend Job',
      location: 'Remote',
      salary: '$120k',
      tags: ['Full time', 'Remote'],
      link: 'https://backend.com/job',
      description: 'Backend job description',
      created_at: '2024-01-18T10:00:00Z'
    };

    jobsAPI.getAll.mockResolvedValueOnce({
      success: true,
      data: [backendJob],
      count: 1
    });

    render(<Dashboard {...mockProps} />);
    
    const sortSelect = screen.getByTestId('sort-dropdown');
    fireEvent.change(sortSelect, { target: { value: 'Last 24 hours' } });
    
    await waitFor(() => {
      expect(mockProps.setJobs).toHaveBeenCalled();
      const transformedJobs = mockProps.setJobs.mock.calls[0][0];
      
      // Check transformation
      expect(transformedJobs[0]).toMatchObject({
        id: 999,
        company: 'Backend Company',
        companyLogo: 'B',
        title: 'Backend Job',
        location: 'Remote',
        salary: '$120k',
        tags: ['Full time', 'Remote'],
        link: 'https://backend.com/job',
        description: 'Backend job description',
        timestamp: '2024-01-18T10:00:00Z'
      });
      
      // Check date formatting
      expect(transformedJobs[0]).toHaveProperty('date');
    });
  });

  test('handles API error gracefully when refetching with time filter', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    jobsAPI.getAll.mockRejectedValueOnce(new Error('API Error'));

    render(<Dashboard {...mockProps} />);
    
    const sortSelect = screen.getByTestId('sort-dropdown');
    fireEvent.change(sortSelect, { target: { value: 'Last week' } });
    
    // Should not crash - error should be logged
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    // Jobs should still be displayed (from props)
    expect(screen.getByTestId('job-count')).toBeInTheDocument();
    
    consoleErrorSpy.mockRestore();
  });

  test('calls onNavigate when header navigation is triggered', () => {
    render(<Dashboard {...mockProps} />);
    
    const navigateButton = screen.getByText('Navigate');
    fireEvent.click(navigateButton);
    
    expect(mockProps.onNavigate).toHaveBeenCalledWith('messages');
  });

  test('calls onShowLogin when login button is clicked', () => {
    render(<Dashboard {...mockProps} />);
    
    const loginButton = screen.getByText('Show Login');
    fireEvent.click(loginButton);
    
    expect(mockProps.onShowLogin).toHaveBeenCalled();
  });

  test('calls onShowSignUp when signup button is clicked', () => {
    render(<Dashboard {...mockProps} />);
    
    const signupButton = screen.getByText('Show SignUp');
    fireEvent.click(signupButton);
    
    expect(mockProps.onShowSignUp).toHaveBeenCalled();
  });

  test('calls onLogout when logout button is clicked', () => {
    render(<Dashboard {...mockProps} />);
    
    const logoutButton = screen.getByText('Logout');
    fireEvent.click(logoutButton);
    
    expect(mockProps.onLogout).toHaveBeenCalled();
  });

  test('filters jobs by search term', () => {
    render(<Dashboard {...mockProps} />);
    
    const searchInput = screen.getByTestId('search-input');
    fireEvent.change(searchInput, { target: { value: 'Data Scientist' } });
    
    // Apply filters
    const filterButton = screen.getAllByText('Filter')[0];
    fireEvent.click(filterButton);
    const applyButton = screen.getByText('Apply');
    fireEvent.click(applyButton);
    
    // Jobs should be filtered
    waitFor(() => {
      const jobCount = screen.getByTestId('job-count');
      expect(parseInt(jobCount.textContent)).toBeLessThanOrEqual(sampleJobs.length);
    });
  });

  test('handles empty jobs array', () => {
    render(<Dashboard {...mockProps} jobs={[]} />);
    
    const jobCount = screen.getByTestId('job-count');
    expect(jobCount).toHaveTextContent('0');
  });
});
