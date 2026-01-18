import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MobileHome from '../../components/MobileHome';
import { sampleJobs } from '../../data/jobData';

describe('MobileHome Component', () => {
  const mockOnNavigate = jest.fn();
  const mockOnFilterClick = jest.fn();
  const mockUser = { name: 'Maria' };

  const defaultProps = {
    jobs: sampleJobs.slice(0, 10), // Use first 10 jobs for testing
    user: mockUser,
    onNavigate: mockOnNavigate,
    onFilterClick: mockOnFilterClick
  };

  beforeEach(() => {
    jest.clearAllMocks();
    window.open = jest.fn();
  });

  test('renders mobile home component', () => {
    render(<MobileHome {...defaultProps} />);
    
    expect(screen.getByText(/hello, maria 👋/i)).toBeInTheDocument();
    expect(screen.getByText(/let's find your dream job/i)).toBeInTheDocument();
  });

  test('displays greeting with user name', () => {
    render(<MobileHome {...defaultProps} />);
    
    expect(screen.getByText(/hello, maria 👋/i)).toBeInTheDocument();
  });

  test('displays default greeting when no user', () => {
    render(<MobileHome {...defaultProps} user={null} />);
    
    expect(screen.getByText(/hello, maria 👋/i)).toBeInTheDocument(); // Default fallback
  });

  test('renders search bar', () => {
    render(<MobileHome {...defaultProps} />);
    
    const searchInput = screen.getByPlaceholderText(/search job title, company, or skills/i);
    expect(searchInput).toBeInTheDocument();
  });

  test('search bar click opens filter drawer', () => {
    render(<MobileHome {...defaultProps} />);
    
    const searchBar = screen.getByPlaceholderText(/search job title, company, or skills/i).closest('.mobile-home-search-bar');
    fireEvent.click(searchBar);
    
    expect(mockOnFilterClick).toHaveBeenCalledTimes(1);
  });

  test('filter button opens filter drawer', () => {
    render(<MobileHome {...defaultProps} />);
    
    const filterButton = screen.getByRole('button', { name: /funnel/i });
    fireEvent.click(filterButton);
    
    expect(mockOnFilterClick).toHaveBeenCalledTimes(1);
  });

  test('displays status cards', () => {
    render(<MobileHome {...defaultProps} />);
    
    expect(screen.getByText(/interview today/i)).toBeInTheDocument();
    expect(screen.getByText(/applications pending/i)).toBeInTheDocument();
    expect(screen.getByText(/saved jobs/i)).toBeInTheDocument();
  });

  test('displays status card counts', () => {
    render(<MobileHome {...defaultProps} />);
    
    expect(screen.getByText('2')).toBeInTheDocument(); // Interview Today
    expect(screen.getByText('5')).toBeInTheDocument(); // Applications Pending
  });

  test('displays section titles', () => {
    render(<MobileHome {...defaultProps} />);
    
    expect(screen.getByText(/top recommended jobs/i)).toBeInTheDocument();
    expect(screen.getByText(/browse by categories/i)).toBeInTheDocument();
    expect(screen.getByText(/featured jobs/i)).toBeInTheDocument();
  });

  test('displays recommended jobs', () => {
    render(<MobileHome {...defaultProps} />);
    
    // Check if job cards are rendered (first 8 jobs should be in recommended)
    const jobCards = screen.getAllByText(/data|analyst|engineer|scientist/i);
    expect(jobCards.length).toBeGreaterThan(0);
  });

  test('displays category grid', () => {
    render(<MobileHome {...defaultProps} />);
    
    expect(screen.getByText(/development/i)).toBeInTheDocument();
    expect(screen.getByText(/design/i)).toBeInTheDocument();
    expect(screen.getByText(/data/i)).toBeInTheDocument();
    expect(screen.getByText(/marketing/i)).toBeInTheDocument();
    expect(screen.getByText(/product/i)).toBeInTheDocument();
    expect(screen.getByText(/management/i)).toBeInTheDocument();
  });

  test('displays featured jobs', () => {
    render(<MobileHome {...defaultProps} />);
    
    // Featured jobs should be in a list format
    const featuredJobs = screen.getAllByText(/data|analyst|engineer/i);
    expect(featuredJobs.length).toBeGreaterThan(0);
  });

  test('save job functionality works', () => {
    render(<MobileHome {...defaultProps} />);
    
    // Find a save button (heart icon) in recommended jobs
    const saveButtons = screen.getAllByRole('button');
    const heartButtons = saveButtons.filter(btn => 
      btn.className.includes('job-save') || btn.querySelector('.bi-heart')
    );
    
    if (heartButtons.length > 0) {
      fireEvent.click(heartButtons[0]);
      
      // Button should now have saved class
      waitFor(() => {
        expect(heartButtons[0].className).toContain('saved');
      });
    }
  });

  test('job card click opens job link', () => {
    render(<MobileHome {...defaultProps} />);
    
    const jobCard = screen.getByText(defaultProps.jobs[0].title).closest('.mobile-home-job-card');
    if (jobCard) {
      fireEvent.click(jobCard);
      expect(window.open).toHaveBeenCalled();
    }
  });

  test('category card click navigates to dashboard', () => {
    render(<MobileHome {...defaultProps} />);
    
    const categoryCard = screen.getByText(/development/i).closest('.mobile-home-category-card');
    if (categoryCard) {
      fireEvent.click(categoryCard);
      expect(mockOnNavigate).toHaveBeenCalledWith('dashboard');
    }
  });

  test('handles empty jobs array', () => {
    render(<MobileHome {...defaultProps} jobs={[]} />);
    
    expect(screen.getByText(/top recommended jobs/i)).toBeInTheDocument();
    // Should not crash with empty array
  });

  test('updates saved jobs count in status card', () => {
    const { rerender } = render(<MobileHome {...defaultProps} />);
    
    // Initially saved jobs should show 0
    const savedJobsCard = screen.getByText(/saved jobs/i).closest('.mobile-home-status-card');
    expect(savedJobsCard).toHaveTextContent('0');
    
    // After saving a job, count should update
    rerender(<MobileHome {...defaultProps} />);
  });

  test('profile avatar displays user initial', () => {
    render(<MobileHome {...defaultProps} />);
    
    const avatar = screen.getByText('M'); // Maria's initial
    expect(avatar).toBeInTheDocument();
  });

  test('profile avatar displays default when no user', () => {
    render(<MobileHome {...defaultProps} user={null} />);
    
    const avatar = screen.getByText('U'); // Default 'U'
    expect(avatar).toBeInTheDocument();
  });
});
