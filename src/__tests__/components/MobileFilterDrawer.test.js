import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MobileFilterDrawer from '../../components/MobileFilterDrawer';

describe('MobileFilterDrawer Component', () => {
  const mockOnFilterChange = jest.fn();
  const mockOnClose = jest.fn();
  const mockOnClear = jest.fn();

  const defaultFilters = {
    search: '',
    workLocation: '',
    experience: '',
    salaryRange: [2500, 10000],
    workingSchedule: [],
    employmentType: [],
    workStyle: []
  };

  const defaultProps = {
    filters: defaultFilters,
    onFilterChange: mockOnFilterChange,
    onClose: mockOnClose,
    onClear: mockOnClear,
    isOpen: true
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('does not render when closed', () => {
    render(<MobileFilterDrawer {...defaultProps} isOpen={false} />);
    
    expect(screen.queryByText(/filters/i)).not.toBeInTheDocument();
  });

  test('renders when open', () => {
    render(<MobileFilterDrawer {...defaultProps} />);
    
    expect(screen.getByText(/filters/i)).toBeInTheDocument();
  });

  test('displays filter header with reset button', () => {
    render(<MobileFilterDrawer {...defaultProps} />);
    
    expect(screen.getByText(/filters/i)).toBeInTheDocument();
    expect(screen.getByText(/reset all/i)).toBeInTheDocument();
  });

  test('reset all button calls onClear', () => {
    render(<MobileFilterDrawer {...defaultProps} />);
    
    const resetButton = screen.getByText(/reset all/i);
    fireEvent.click(resetButton);
    
    expect(mockOnClear).toHaveBeenCalledTimes(1);
  });

  test('close button calls onClose', () => {
    render(<MobileFilterDrawer {...defaultProps} />);
    
    const closeButton = screen.getByRole('button', { name: /✕/ });
    fireEvent.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('displays search input', () => {
    render(<MobileFilterDrawer {...defaultProps} />);
    
    const searchInput = screen.getByPlaceholderText(/search by job title/i);
    expect(searchInput).toBeInTheDocument();
  });

  test('search input updates filter', () => {
    render(<MobileFilterDrawer {...defaultProps} />);
    
    const searchInput = screen.getByPlaceholderText(/search by job title/i);
    fireEvent.change(searchInput, { target: { value: 'Data Engineer' } });
    
    expect(mockOnFilterChange).toHaveBeenCalledWith('search', 'Data Engineer');
  });

  test('displays work schedule checkboxes', () => {
    render(<MobileFilterDrawer {...defaultProps} />);
    
    expect(screen.getByText(/work schedule/i)).toBeInTheDocument();
    expect(screen.getByText(/full-time/i)).toBeInTheDocument();
    expect(screen.getByText(/part-time/i)).toBeInTheDocument();
  });

  test('work schedule checkbox toggles correctly', () => {
    render(<MobileFilterDrawer {...defaultProps} />);
    
    const fullTimeCheckbox = screen.getByLabelText(/full-time/i);
    fireEvent.click(fullTimeCheckbox);
    
    expect(mockOnFilterChange).toHaveBeenCalled();
    // Should pass new array with 'Full-time' included
  });

  test('displays salary range inputs', () => {
    render(<MobileFilterDrawer {...defaultProps} />);
    
    const salaryInputs = screen.getAllByRole('spinbutton');
    expect(salaryInputs.length).toBeGreaterThanOrEqual(2);
  });

  test('salary range inputs update filter', () => {
    render(<MobileFilterDrawer {...defaultProps} />);
    
    const minInput = screen.getAllByRole('spinbutton')[0];
    fireEvent.change(minInput, { target: { value: '5000' } });
    
    expect(mockOnFilterChange).toHaveBeenCalled();
  });

  test('displays employment type checkboxes', () => {
    render(<MobileFilterDrawer {...defaultProps} />);
    
    expect(screen.getByText(/employment type/i)).toBeInTheDocument();
    expect(screen.getByText(/full day/i)).toBeInTheDocument();
  });

  test('displays work style checkboxes', () => {
    render(<MobileFilterDrawer {...defaultProps} />);
    
    expect(screen.getByText(/work style/i)).toBeInTheDocument();
    expect(screen.getByText(/office/i)).toBeInTheDocument();
    expect(screen.getByText(/hybrid/i)).toBeInTheDocument();
    expect(screen.getByText(/remote/i)).toBeInTheDocument();
  });

  test('work style checkbox toggles correctly', () => {
    render(<MobileFilterDrawer {...defaultProps} />);
    
    const remoteCheckbox = screen.getByLabelText(/remote/i);
    fireEvent.click(remoteCheckbox);
    
    expect(mockOnFilterChange).toHaveBeenCalled();
  });

  test('displays apply filters button', () => {
    render(<MobileFilterDrawer {...defaultProps} />);
    
    expect(screen.getByText(/apply filters/i)).toBeInTheDocument();
  });

  test('apply filters button closes drawer', () => {
    render(<MobileFilterDrawer {...defaultProps} />);
    
    const applyButton = screen.getByText(/apply filters/i);
    fireEvent.click(applyButton);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('overlay click closes drawer', () => {
    render(<MobileFilterDrawer {...defaultProps} />);
    
    const overlay = screen.getByTestId ? screen.getByTestId('overlay') : 
                    document.querySelector('.mobile-filter-overlay');
    if (overlay) {
      fireEvent.click(overlay);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    }
  });

  test('handles multiple checkbox selections', () => {
    const filtersWithSelections = {
      ...defaultFilters,
      workingSchedule: ['Full-time']
    };

    render(<MobileFilterDrawer {...defaultProps} filters={filtersWithSelections} />);
    
    const fullTimeCheckbox = screen.getByLabelText(/full-time/i);
    expect(fullTimeCheckbox.checked).toBe(true);
  });

  test('handles empty filters gracefully', () => {
    const emptyFilters = {
      search: '',
      workLocation: '',
      experience: '',
      salaryRange: [0, 0],
      workingSchedule: [],
      employmentType: [],
      workStyle: []
    };

    render(<MobileFilterDrawer {...defaultProps} filters={emptyFilters} />);
    
    expect(screen.getByText(/filters/i)).toBeInTheDocument();
  });
});
