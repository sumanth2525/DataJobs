import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Header from '../../components/Header';

// Mock online users utility
jest.mock('../../utils/onlineUsers', () => ({
  subscribeToOnlineUsers: jest.fn((callback) => {
    callback(1500);
    return jest.fn(); // unsubscribe function
  })
}));

describe('Header Component', () => {
  const mockOnNavigate = jest.fn();
  const mockOnShowLogin = jest.fn();
  const mockOnShowSignUp = jest.fn();
  const mockOnLogout = jest.fn();

  const defaultProps = {
    onNavigate: mockOnNavigate,
    user: null,
    onShowLogin: mockOnShowLogin,
    onShowSignUp: mockOnShowSignUp,
    onLogout: mockOnLogout
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders logo and navigation links', () => {
    render(<Header {...defaultProps} />);
    
    expect(screen.getByText('DataJobPortal')).toBeInTheDocument();
    expect(screen.getByText('Find job')).toBeInTheDocument();
    expect(screen.getByText('Messages')).toBeInTheDocument();
    expect(screen.getByText('Community')).toBeInTheDocument();
  });

  test('displays online users count', () => {
    render(<Header {...defaultProps} />);
    
    expect(screen.getByText(/online/i)).toBeInTheDocument();
  });

  test('opens burger menu on click', () => {
    render(<Header {...defaultProps} />);
    
    const menuButton = screen.getByLabelText('Menu');
    fireEvent.click(menuButton);
    
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByText('Sign Up')).toBeInTheDocument();
  });

  test('shows login button when user is not logged in', () => {
    render(<Header {...defaultProps} />);
    
    const menuButton = screen.getByLabelText('Menu');
    fireEvent.click(menuButton);
    
    expect(screen.getByText('Login')).toBeInTheDocument();
  });

  test('shows user info when user is logged in', () => {
    const user = {
      name: 'John Doe',
      email: 'john@example.com'
    };
    
    render(<Header {...defaultProps} user={user} />);
    
    const menuButton = screen.getByLabelText('Menu');
    fireEvent.click(menuButton);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  test('calls onNavigate when clicking Post a Job', () => {
    render(<Header {...defaultProps} />);
    
    const menuButton = screen.getByLabelText('Menu');
    fireEvent.click(menuButton);
    
    const postJobButton = screen.getByText('Post a Job');
    fireEvent.click(postJobButton);
    
    expect(mockOnNavigate).toHaveBeenCalledWith('admin');
  });

  test('calls onShowLogin when clicking Login', () => {
    render(<Header {...defaultProps} />);
    
    const menuButton = screen.getByLabelText('Menu');
    fireEvent.click(menuButton);
    
    const loginButton = screen.getByText('Login');
    fireEvent.click(loginButton);
    
    expect(mockOnShowLogin).toHaveBeenCalled();
  });

  test('calls onLogout when clicking Logout', () => {
    const user = { name: 'John Doe', email: 'john@example.com' };
    
    render(<Header {...defaultProps} user={user} />);
    
    const menuButton = screen.getByLabelText('Menu');
    fireEvent.click(menuButton);
    
    const logoutButton = screen.getByText('Logout');
    fireEvent.click(logoutButton);
    
    expect(mockOnLogout).toHaveBeenCalled();
  });

  test('closes menu when clicking outside', () => {
    render(<Header {...defaultProps} />);
    
    const menuButton = screen.getByLabelText('Menu');
    fireEvent.click(menuButton);
    
    expect(screen.getByText('Login')).toBeInTheDocument();
    
    // Click outside
    fireEvent.mouseDown(document.body);
    
    // Menu should close (Login button not visible)
    waitFor(() => {
      expect(screen.queryByText('Login')).not.toBeInTheDocument();
    });
  });
});
