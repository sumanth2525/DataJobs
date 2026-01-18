import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import JobListings from '../../components/JobListings';
import { sampleJobs } from '../../data/jobData';

describe('JobListings Component', () => {
  const mockOnFilterClick = jest.fn();
  const mockOnSortChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders job listings with correct count', () => {
    render(<JobListings jobs={sampleJobs} />);
    
    expect(screen.getByText('Recommended jobs')).toBeInTheDocument();
    expect(screen.getByText(sampleJobs.length.toString())).toBeInTheDocument();
  });

  test('renders filter button when showFilterButton is true', () => {
    render(<JobListings jobs={sampleJobs} showFilterButton={true} />);
    
    expect(screen.getByText('Filters')).toBeInTheDocument();
  });

  test('does not render filter button when showFilterButton is false', () => {
    render(<JobListings jobs={sampleJobs} showFilterButton={false} />);
    
    expect(screen.queryByText('Filters')).not.toBeInTheDocument();
  });

  test('calls onFilterClick when filter button is clicked', () => {
    render(
      <JobListings 
        jobs={sampleJobs} 
        onFilterClick={mockOnFilterClick}
        showFilterButton={true}
      />
    );
    
    const filterButton = screen.getByText('Filters');
    fireEvent.click(filterButton);
    
    expect(mockOnFilterClick).toHaveBeenCalled();
  });

  test('calls onSortChange when sort dropdown changes', () => {
    render(
      <JobListings 
        jobs={sampleJobs} 
        onSortChange={mockOnSortChange}
      />
    );
    
    const sortSelect = screen.getByRole('combobox');
    fireEvent.change(sortSelect, { target: { value: 'Last 24 hours' } });
    
    expect(mockOnSortChange).toHaveBeenCalledWith('Last 24 hours');
  });

  test('displays all sort options', () => {
    render(<JobListings jobs={sampleJobs} />);
    
    const sortSelect = screen.getByRole('combobox');
    const options = Array.from(sortSelect.options).map(opt => opt.value);
    
    expect(options).toContain('Latest');
    expect(options).toContain('Last 24 hours');
    expect(options).toContain('Last week');
    expect(options).toContain('Last month');
    expect(options).toContain('Salary (High to Low)');
    expect(options).toContain('Salary (Low to High)');
  });

  test('renders all job cards', () => {
    render(<JobListings jobs={sampleJobs} />);
    
    // Each job should have a company name rendered
    sampleJobs.forEach(job => {
      expect(screen.getByText(job.company)).toBeInTheDocument();
    });
  });

  test('handles empty jobs array', () => {
    render(<JobListings jobs={[]} />);
    
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('Recommended jobs')).toBeInTheDocument();
  });

  test('defaults to Latest sort option', () => {
    render(<JobListings jobs={sampleJobs} />);
    
    const sortSelect = screen.getByRole('combobox');
    expect(sortSelect.value).toBe('Latest');
  });

  test('updates sort dropdown when currentSort prop changes', async () => {
    const { rerender } = render(
      <JobListings 
        jobs={sampleJobs} 
        onSortChange={mockOnSortChange}
        currentSort="Latest"
      />
    );
    
    let sortSelect = screen.getByRole('combobox');
    expect(sortSelect.value).toBe('Latest');
    
    // Update currentSort prop
    rerender(
      <JobListings 
        jobs={sampleJobs} 
        onSortChange={mockOnSortChange}
        currentSort="Last 24 hours"
      />
    );
    
    await waitFor(() => {
      sortSelect = screen.getByRole('combobox');
      expect(sortSelect.value).toBe('Last 24 hours');
    });
  });

  test('syncs with parent component sort state via currentSort prop', () => {
    render(
      <JobListings 
        jobs={sampleJobs} 
        onSortChange={mockOnSortChange}
        currentSort="Last week"
      />
    );
    
    const sortSelect = screen.getByRole('combobox');
    expect(sortSelect.value).toBe('Last week');
  });

  test('calls onSortChange with correct value when dropdown changes', () => {
    render(
      <JobListings 
        jobs={sampleJobs} 
        onSortChange={mockOnSortChange}
        currentSort="Latest"
      />
    );
    
    const sortSelect = screen.getByRole('combobox');
    
    // Test all time filter options
    fireEvent.change(sortSelect, { target: { value: 'Last 24 hours' } });
    expect(mockOnSortChange).toHaveBeenCalledWith('Last 24 hours');
    
    fireEvent.change(sortSelect, { target: { value: 'Last week' } });
    expect(mockOnSortChange).toHaveBeenCalledWith('Last week');
    
    fireEvent.change(sortSelect, { target: { value: 'Last month' } });
    expect(mockOnSortChange).toHaveBeenCalledWith('Last month');
    
    expect(mockOnSortChange).toHaveBeenCalledTimes(3);
  });

  test('shows alert when filter clicked without onFilterClick prop', () => {
    global.alert = jest.fn();
    
    render(<JobListings jobs={sampleJobs} showFilterButton={true} />);
    
    const filterButton = screen.getByText('Filters');
    fireEvent.click(filterButton);
    
    expect(global.alert).toHaveBeenCalledWith('Filter options');
  });
});
