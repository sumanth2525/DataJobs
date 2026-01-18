import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Admin from '../../components/Admin';
import * as jobUrlParser from '../../utils/jobUrlParser';

// Mock the jobUrlParser
jest.mock('../../utils/jobUrlParser', () => ({
  parseJobUrl: jest.fn(),
  detectJobBoard: jest.fn()
}));

describe('Admin Component', () => {
  const mockOnJobPost = jest.fn();
  const mockOnNavigate = jest.fn();

  const defaultProps = {
    onJobPost: mockOnJobPost,
    onNavigate: mockOnNavigate
  };

  beforeEach(() => {
    jest.clearAllMocks();
    global.alert = jest.fn();
    navigator.clipboard = {
      writeText: jest.fn().mockResolvedValue()
    };
  });

  test('renders admin form', () => {
    render(<Admin {...defaultProps} />);
    
    expect(screen.getByText(/post a new job/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/company name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/job title/i)).toBeInTheDocument();
  });

  test('renders all form fields', () => {
    render(<Admin {...defaultProps} />);
    
    expect(screen.getByLabelText(/company name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/job title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/location/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/salary/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/job application link/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/job description/i)).toBeInTheDocument();
  });

  test('handles form input changes', () => {
    render(<Admin {...defaultProps} />);
    
    const companyInput = screen.getByLabelText(/company name/i);
    const titleInput = screen.getByLabelText(/job title/i);
    
    fireEvent.change(companyInput, { target: { value: 'Tech Corp' } });
    fireEvent.change(titleInput, { target: { value: 'Data Scientist' } });
    
    expect(companyInput.value).toBe('Tech Corp');
    expect(titleInput.value).toBe('Data Scientist');
  });

  test('shows validation error when required fields are missing', () => {
    render(<Admin {...defaultProps} />);
    
    const submitButton = screen.getByText(/post job/i);
    fireEvent.click(submitButton);
    
    expect(global.alert).toHaveBeenCalledWith(
      'Please fill in all required fields (Company, Title, and Job Link)'
    );
  });

  test('submits form with valid data', () => {
    render(<Admin {...defaultProps} />);
    
    const companyInput = screen.getByLabelText(/company name/i);
    const titleInput = screen.getByLabelText(/job title/i);
    const linkInput = screen.getByLabelText(/job application link/i);
    
    fireEvent.change(companyInput, { target: { value: 'Tech Corp' } });
    fireEvent.change(titleInput, { target: { value: 'Data Scientist' } });
    fireEvent.change(linkInput, { target: { value: 'https://example.com/job' } });
    
    const submitButton = screen.getByText(/post job/i);
    fireEvent.click(submitButton);
    
    expect(mockOnJobPost).toHaveBeenCalled();
  });

  test('adds and removes tags', () => {
    render(<Admin {...defaultProps} />);
    
    const tagInput = screen.getByPlaceholderText(/type and press enter to add tags/i);
    const addTagButton = screen.getByText(/add tag/i);
    
    fireEvent.change(tagInput, { target: { value: 'Python' } });
    fireEvent.click(addTagButton);
    
    expect(screen.getByText('Python')).toBeInTheDocument();
    
    const removeButton = screen.getByLabelText(/remove tag python/i);
    fireEvent.click(removeButton);
    
    expect(screen.queryByText('Python')).not.toBeInTheDocument();
  });

  test('adds tag on Enter key press', () => {
    render(<Admin {...defaultProps} />);
    
    const tagInput = screen.getByPlaceholderText(/type and press enter to add tags/i);
    
    fireEvent.change(tagInput, { target: { value: 'React' } });
    fireEvent.keyPress(tagInput, { key: 'Enter', code: 'Enter' });
    
    expect(screen.getByText('React')).toBeInTheDocument();
  });

  test('does not add duplicate tags', () => {
    render(<Admin {...defaultProps} />);
    
    const tagInput = screen.getByPlaceholderText(/type and press enter to add tags/i);
    const addTagButton = screen.getByText(/add tag/i);
    
    fireEvent.change(tagInput, { target: { value: 'Python' } });
    fireEvent.click(addTagButton);
    fireEvent.click(addTagButton); // Try to add again
    
    const tags = screen.getAllByText('Python');
    expect(tags.length).toBe(1);
  });

  test('fetches job details from URL', async () => {
    const mockExtractedData = {
      company: 'Tech Corp',
      title: 'Data Scientist',
      location: 'San Francisco',
      link: 'https://example.com/job'
    };
    
    jobUrlParser.parseJobUrl.mockResolvedValue(mockExtractedData);
    jobUrlParser.detectJobBoard.mockReturnValue('LinkedIn');
    
    render(<Admin {...defaultProps} />);
    
    const urlInput = screen.getByPlaceholderText(/paste job posting url/i);
    const fetchButton = screen.getByText(/fetch job details/i);
    
    fireEvent.change(urlInput, { target: { value: 'https://linkedin.com/jobs/123' } });
    fireEvent.click(fetchButton);
    
    await waitFor(() => {
      expect(jobUrlParser.parseJobUrl).toHaveBeenCalled();
    });
  });

  test('shows error when URL fetch fails', async () => {
    jobUrlParser.parseJobUrl.mockResolvedValue({ error: 'Invalid URL format' });
    
    render(<Admin {...defaultProps} />);
    
    const urlInput = screen.getByPlaceholderText(/paste job posting url/i);
    const fetchButton = screen.getByText(/fetch job details/i);
    
    fireEvent.change(urlInput, { target: { value: 'invalid-url' } });
    fireEvent.click(fetchButton);
    
    await waitFor(() => {
      expect(screen.getByText(/invalid url format/i)).toBeInTheDocument();
    });
  });

  test('disables fetch button when URL is empty', () => {
    render(<Admin {...defaultProps} />);
    
    const fetchButton = screen.getByText(/fetch job details/i);
    expect(fetchButton).toBeDisabled();
  });

  test('copies company post link to clipboard', async () => {
    render(<Admin {...defaultProps} />);
    
    const copyButton = screen.getByText(/copy link/i);
    fireEvent.click(copyButton);
    
    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalled();
      expect(global.alert).toHaveBeenCalledWith(
        'Link copied to clipboard! Share this with companies to post jobs.'
      );
    });
  });

  test('resets form after successful submission', () => {
    render(<Admin {...defaultProps} />);
    
    const companyInput = screen.getByLabelText(/company name/i);
    const titleInput = screen.getByLabelText(/job title/i);
    const linkInput = screen.getByLabelText(/job application link/i);
    
    fireEvent.change(companyInput, { target: { value: 'Tech Corp' } });
    fireEvent.change(titleInput, { target: { value: 'Data Scientist' } });
    fireEvent.change(linkInput, { target: { value: 'https://example.com/job' } });
    
    const submitButton = screen.getByText(/post job/i);
    fireEvent.click(submitButton);
    
    waitFor(() => {
      expect(screen.getByText(/job posted successfully/i)).toBeInTheDocument();
    });
  });

  test('handles work location selection', () => {
    render(<Admin {...defaultProps} />);
    
    const workLocationSelect = screen.getByLabelText(/work location/i);
    fireEvent.change(workLocationSelect, { target: { value: 'Remote' } });
    
    expect(workLocationSelect.value).toBe('Remote');
  });

  test('handles experience level selection', () => {
    render(<Admin {...defaultProps} />);
    
    const experienceSelect = screen.getByLabelText(/experience level/i);
    fireEvent.change(experienceSelect, { target: { value: 'Senior' } });
    
    expect(experienceSelect.value).toBe('Senior');
  });

  test('handles working schedule selection', () => {
    render(<Admin {...defaultProps} />);
    
    const scheduleSelect = screen.getByLabelText(/working schedule/i);
    fireEvent.change(scheduleSelect, { target: { value: 'Part time' } });
    
    expect(scheduleSelect.value).toBe('Part time');
  });

  test('navigates back when back button is clicked', () => {
    render(<Admin {...defaultProps} />);
    
    const backButton = screen.getByText(/back to job portal/i);
    fireEvent.click(backButton);
    
    expect(mockOnNavigate).toHaveBeenCalledWith('dashboard');
  });
});
