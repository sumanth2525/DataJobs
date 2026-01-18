import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AdminDashboard from '../../components/AdminDashboard';
import * as adminStats from '../../utils/adminStats';

// Mock adminStats
jest.mock('../../utils/adminStats', () => ({
  default: {
    getAnalyticsSummary: jest.fn(() => ({
      totalJobs: 100,
      jobsLast24h: 10,
      totalAPICalls: 500,
      apiCallsLast24h: 50,
      uniqueUsers: 25,
      activeUsersLast24h: 5,
      totalPageViews: 1000,
      pageViewsLast24h: 100,
      topPosters: [
        { user: 'User1', count: 20 },
        { user: 'User2', count: 15 }
      ],
      topEndpoints: [
        { endpoint: '/api/jobs', count: 200 },
        { endpoint: '/api/search', count: 150 }
      ],
      recentJobs: [
        { title: 'Job1', company: 'Company1', postedBy: 'User1', postedAt: new Date().toISOString() }
      ],
      recentAPICalls: [
        { method: 'GET', endpoint: '/api/jobs', status: 200, timestamp: new Date().toISOString() }
      ],
      jobsLast7d: 30,
      apiCallsLast7d: 200,
      jobsLast30d: 80
    })),
    getStats: jest.fn(() => ({
      jobsPosted: [],
      apiCalls: []
    })),
    getJobsByCompany: jest.fn(() => [
      { company: 'Company1', count: 10 },
      { company: 'Company2', count: 5 }
    ]),
    getHourlyActivity: jest.fn(() => [
      { hour: '10:00', jobs: 5, apiCalls: 20 }
    ])
  }
}));

describe('AdminDashboard Component', () => {
  const mockOnNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    global.URL.createObjectURL = jest.fn(() => 'blob:url');
    global.URL.revokeObjectURL = jest.fn();
    
    // Mock document.createElement
    const mockLink = {
      href: '',
      download: '',
      click: jest.fn()
    };
    document.createElement = jest.fn(() => mockLink);
    document.body.appendChild = jest.fn();
    document.body.removeChild = jest.fn();
  });

  test('renders admin dashboard', () => {
    render(<AdminDashboard onNavigate={mockOnNavigate} />);
    
    expect(screen.getByText(/admin dashboard/i)).toBeInTheDocument();
  });

  test('displays loading state initially', () => {
    adminStats.default.getAnalyticsSummary.mockReturnValueOnce(null);
    
    render(<AdminDashboard onNavigate={mockOnNavigate} />);
    
    expect(screen.getByText(/loading dashboard data/i)).toBeInTheDocument();
  });

  test('displays key metrics', async () => {
    render(<AdminDashboard onNavigate={mockOnNavigate} />);
    
    await waitFor(() => {
      expect(screen.getByText('100')).toBeInTheDocument(); // Total Jobs
      expect(screen.getByText('500')).toBeInTheDocument(); // Total API Calls
      expect(screen.getByText('25')).toBeInTheDocument(); // Unique Users
      expect(screen.getByText('1000')).toBeInTheDocument(); // Page Views
    });
  });

  test('displays top posters table', async () => {
    render(<AdminDashboard onNavigate={mockOnNavigate} />);
    
    await waitFor(() => {
      expect(screen.getByText(/top job posters/i)).toBeInTheDocument();
      expect(screen.getByText('User1')).toBeInTheDocument();
      expect(screen.getByText('User2')).toBeInTheDocument();
    });
  });

  test('displays jobs by company table', async () => {
    render(<AdminDashboard onNavigate={mockOnNavigate} />);
    
    await waitFor(() => {
      expect(screen.getByText(/jobs by company/i)).toBeInTheDocument();
      expect(screen.getByText('Company1')).toBeInTheDocument();
    });
  });

  test('displays top endpoints table', async () => {
    render(<AdminDashboard onNavigate={mockOnNavigate} />);
    
    await waitFor(() => {
      expect(screen.getByText(/most used api endpoints/i)).toBeInTheDocument();
      expect(screen.getByText('/api/jobs')).toBeInTheDocument();
    });
  });

  test('filters tables by search query', async () => {
    render(<AdminDashboard onNavigate={mockOnNavigate} />);
    
    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText(/search tables/i);
      fireEvent.change(searchInput, { target: { value: 'User1' } });
      
      expect(screen.getByText('User1')).toBeInTheDocument();
    });
  });

  test('switches between time range filters', async () => {
    render(<AdminDashboard onNavigate={mockOnNavigate} />);
    
    await waitFor(() => {
      const dayButton = screen.getByText('7D');
      fireEvent.click(dayButton);
      
      expect(dayButton).toHaveClass('active');
    });
  });

  test('exports data as JSON', async () => {
    render(<AdminDashboard onNavigate={mockOnNavigate} />);
    
    await waitFor(() => {
      const exportButton = screen.getByText(/export json/i);
      fireEvent.click(exportButton);
      
      expect(document.createElement).toHaveBeenCalledWith('a');
    });
  });

  test('exports data as CSV', async () => {
    render(<AdminDashboard onNavigate={mockOnNavigate} />);
    
    await waitFor(() => {
      const exportButton = screen.getByText(/export csv/i);
      fireEvent.click(exportButton);
      
      expect(document.createElement).toHaveBeenCalledWith('a');
    });
  });

  test('refreshes data when refresh button is clicked', async () => {
    render(<AdminDashboard onNavigate={mockOnNavigate} />);
    
    await waitFor(() => {
      const refreshButton = screen.getByText(/refresh/i);
      fireEvent.click(refreshButton);
      
      expect(adminStats.default.getAnalyticsSummary).toHaveBeenCalled();
    });
  });

  test('switches between table tabs', async () => {
    render(<AdminDashboard onNavigate={mockOnNavigate} />);
    
    await waitFor(() => {
      const postersTab = screen.getByText(/top posters/i);
      fireEvent.click(postersTab);
      
      expect(postersTab).toHaveClass('active');
    });
  });

  test('navigates back when back button is clicked', async () => {
    render(<AdminDashboard onNavigate={mockOnNavigate} />);
    
    await waitFor(() => {
      const backButton = screen.getByText(/back to portal/i);
      fireEvent.click(backButton);
      
      expect(mockOnNavigate).toHaveBeenCalledWith('dashboard');
    });
  });

  test('displays recent job postings', async () => {
    render(<AdminDashboard onNavigate={mockOnNavigate} />);
    
    await waitFor(() => {
      expect(screen.getByText(/recent job postings/i)).toBeInTheDocument();
      expect(screen.getByText('Job1')).toBeInTheDocument();
    });
  });

  test('displays recent API calls', async () => {
    render(<AdminDashboard onNavigate={mockOnNavigate} />);
    
    await waitFor(() => {
      expect(screen.getByText(/recent api calls/i)).toBeInTheDocument();
      expect(screen.getByText('/api/jobs')).toBeInTheDocument();
    });
  });

  test('displays period stats', async () => {
    render(<AdminDashboard onNavigate={mockOnNavigate} />);
    
    await waitFor(() => {
      expect(screen.getByText(/last 24 hours/i)).toBeInTheDocument();
      expect(screen.getByText(/last 7 days/i)).toBeInTheDocument();
      expect(screen.getByText(/last 30 days/i)).toBeInTheDocument();
    });
  });
});
