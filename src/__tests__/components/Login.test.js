import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Login from '../../components/Login';

describe('Login Component', () => {
  const mockOnLogin = jest.fn();
  const mockOnSwitchToSignUp = jest.fn();
  const mockOnClose = jest.fn();

  const defaultProps = {
    onLogin: mockOnLogin,
    onSwitchToSignUp: mockOnSwitchToSignUp,
    onClose: mockOnClose
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders login form', () => {
    render(<Login {...defaultProps} />);
    
    expect(screen.getByText(/login/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
  });

  test('switches between email and phone login', () => {
    render(<Login {...defaultProps} />);
    
    const phoneTab = screen.getByText(/phone/i);
    fireEvent.click(phoneTab);
    
    expect(screen.getByPlaceholderText(/phone/i)).toBeInTheDocument();
  });

  test('shows validation error for empty email', async () => {
    render(<Login {...defaultProps} />);
    
    const submitButton = screen.getByRole('button', { name: /login/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    });
  });

  test('shows validation error for invalid email', async () => {
    render(<Login {...defaultProps} />);
    
    const emailInput = screen.getByPlaceholderText(/email/i);
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    
    const submitButton = screen.getByRole('button', { name: /login/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/email is invalid/i)).toBeInTheDocument();
    });
  });

  test('shows validation error for short password', async () => {
    render(<Login {...defaultProps} />);
    
    const emailInput = screen.getByPlaceholderText(/email/i);
    const passwordInput = screen.getByPlaceholderText(/password/i);
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: '123' } });
    
    const submitButton = screen.getByRole('button', { name: /login/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/password must be at least 6 characters/i)).toBeInTheDocument();
    });
  });

  test('calls onLogin with valid credentials', async () => {
    render(<Login {...defaultProps} />);
    
    const emailInput = screen.getByPlaceholderText(/email/i);
    const passwordInput = screen.getByPlaceholderText(/password/i);
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    
    const submitButton = screen.getByRole('button', { name: /login/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockOnLogin).toHaveBeenCalled();
    });
  });

  test('calls onSwitchToSignUp when clicking sign up link', () => {
    render(<Login {...defaultProps} />);
    
    const signUpLink = screen.getByText(/sign up/i);
    fireEvent.click(signUpLink);
    
    expect(mockOnSwitchToSignUp).toHaveBeenCalled();
  });

  test('calls onClose when clicking close button', () => {
    render(<Login {...defaultProps} />);
    
    const closeButton = screen.getByLabelText(/close/i);
    fireEvent.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalled();
  });
});
