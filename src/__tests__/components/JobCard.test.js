import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import JobCard from '../../components/JobCard';

describe('JobCard Component', () => {
  const mockJob = {
    id: 1,
    company: 'Tech Corp',
    title: 'Data Scientist',
    location: 'San Francisco, CA',
    salary: '$120k - $150k',
    companyLogo: 'T',
    tags: ['Remote', 'Full time', 'Senior'],
    link: 'https://example.com/job/1',
    timestamp: new Date().toISOString(),
    date: 'Jan 15, 2024'
  };

  beforeEach(() => {
    window.open = jest.fn();
    global.alert = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders job card with all details', () => {
    render(<JobCard job={mockJob} />);
    
    expect(screen.getByText('Tech Corp')).toBeInTheDocument();
    expect(screen.getByText('Data Scientist')).toBeInTheDocument();
    expect(screen.getByText('San Francisco, CA')).toBeInTheDocument();
    expect(screen.getByText('$120k - $150k')).toBeInTheDocument();
  });

  test('renders job tags', () => {
    render(<JobCard job={mockJob} />);
    
    expect(screen.getByText('Remote')).toBeInTheDocument();
    expect(screen.getByText('Full time')).toBeInTheDocument();
    expect(screen.getByText('Senior')).toBeInTheDocument();
  });

  test('renders company logo', () => {
    render(<JobCard job={mockJob} />);
    
    expect(screen.getByText('T')).toBeInTheDocument();
  });

  test('renders date information', () => {
    render(<JobCard job={mockJob} />);
    
    expect(screen.getByText('Jan 15, 2024')).toBeInTheDocument();
  });

  test('opens job link in new tab when Apply Now is clicked', () => {
    render(<JobCard job={mockJob} />);
    
    const applyButton = screen.getByText('Apply Now');
    fireEvent.click(applyButton);
    
    expect(window.open).toHaveBeenCalledWith(
      'https://example.com/job/1',
      '_blank',
      'noopener,noreferrer'
    );
  });

  test('shows alert when job has no link and Details is clicked', () => {
    const jobWithoutLink = { ...mockJob, link: null };
    render(<JobCard job={jobWithoutLink} />);
    
    const detailsButton = screen.getByText('Details');
    fireEvent.click(detailsButton);
    
    expect(global.alert).toHaveBeenCalled();
  });

  test('displays "New" badge for recent jobs', () => {
    const recentJob = {
      ...mockJob,
      timestamp: new Date().toISOString() // Just created
    };
    
    render(<JobCard job={recentJob} />);
    
    expect(screen.getByText(/posted/i)).toBeInTheDocument();
  });

  test('handles job without timestamp', () => {
    const jobWithoutTimestamp = { ...mockJob, timestamp: null };
    
    render(<JobCard job={jobWithoutTimestamp} />);
    
    expect(screen.getByText('Tech Corp')).toBeInTheDocument();
  });

  test('handles job without tags', () => {
    const jobWithoutTags = { ...mockJob, tags: [] };
    
    render(<JobCard job={jobWithoutTags} />);
    
    expect(screen.getByText('Tech Corp')).toBeInTheDocument();
  });

  test('applies correct color class based on job id', () => {
    const { container } = render(<JobCard job={mockJob} />);
    
    const jobCard = container.querySelector('.job-card');
    expect(jobCard).toHaveClass('job-card-peach'); // id % 6 = 1, so peach
  });

  test('handles empty location', () => {
    const jobWithoutLocation = { ...mockJob, location: '' };
    
    render(<JobCard job={jobWithoutLocation} />);
    
    expect(screen.getByText('Tech Corp')).toBeInTheDocument();
  });

  test('handles empty salary', () => {
    const jobWithoutSalary = { ...mockJob, salary: '' };
    
    render(<JobCard job={jobWithoutSalary} />);
    
    expect(screen.getByText('Tech Corp')).toBeInTheDocument();
  });
});
