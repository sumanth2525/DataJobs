import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Header from '../../components/Header';

// Mock adminStats
jest.mock('../../utils/adminStats', () => ({
  default: {
    trackPageView: jest.fn()
  }
}));

describe('Header Component', () => {
  const mockOnNavigate = jest.fn();
  const mockOnShowLogin = jest.fn();
  const mockOnShowSignUp = jest.fn();
  const mockOnLogout = jest.fn();

  const defaultProps = {
    onNavigate: mockOnNavigate,
    onShowLogin: mockOnShowLogin,
    onShowSignUp: mockOnShowSignUp,
    onLogout: mockOnLogout,
    user: null,
    onlineUsers: 100
  };

  beforeEach(() => {
    jest.clearAllMocks();
    window.location.hash = '';
  });

  test('renders header with logo and navigation', () => {
    render(<Header {...defaultProps} />);
    
    expect(screen.getByText(/datajobportal/i)).toBeInTheDocument();
    expect(screen.getByText(/find job/i)).toBeInTheDocument();
    expect(screen.getByText(/messages/i)).toBeInTheDocument();
    expect(screen.getByText(/community/i)).toBeInTheDocument();
  });

  test('displays online users count', () => {
    render(<Header {...defaultProps} onlineUsers={150} />);
    
    expect(screen.getByText(/150/i)).toBeInTheDocument();
  });

  test('displays user location', () => {
    render(<Header {...defaultProps} location="New York, NY" />);
    
    expect(screen.getByText(/new york, ny/i)).toBeInTheDocument();
  });

  test('shows login button when user is not logged in', () => {
    render(<Header {...defaultProps} user={null} />);
    
    expect(screen.getByText(/login/i)).toBeInTheDocument();
  });

  test('shows user menu when user is logged in', () => {
    const mockUser = {
      name: 'John Doe',
      email: 'john@example.com'
    };
    
    render(<Header {...defaultProps} user={mockUser} />);
    
    expect(screen.getByText(/john doe/i)).toBeInTheDocument();
  });

  test('calls onShowLogin when login button is clicked', () => {
    render(<Header {...defaultProps} user={null} />);
    
    const loginButton = screen.getByText(/login/i);
    fireEvent.click(loginButton);
    
    expect(mockOnShowLogin).toHaveBeenCalled();
  });

  test('calls onNavigate when navigation link is clicked', () => {
    render(<Header {...defaultProps} />);
    
    const messagesLink = screen.getByText(/messages/i);
    fireEvent.click(messagesLink);
    
    expect(mockOnNavigate).toHaveBeenCalledWith('Messages');
  });

  test('navigates to admin dashboard when admin button is clicked', () => {
    render(<Header {...defaultProps} />);
    
    const adminButton = screen.getByText(/admin dashboard/i);
    fireEvent.click(adminButton);
    
    expect(window.location.hash).toBe('#admin-dashboard');
  });

  test('calls onLogout when logout is clicked', () => {
    const mockUser = {
      name: 'John Doe',
      email: 'john@example.com'
    };
    
    render(<Header {...defaultProps} user={mockUser} />);
    
    // Open user menu first
    const userMenu = screen.getByText(/john doe/i);
    fireEvent.click(userMenu);
    
    const logoutButton = screen.getByText(/logout/i);
    fireEvent.click(logoutButton);
    
    expect(mockOnLogout).toHaveBeenCalled();
  });

  test('navigates to dashboard when logo is clicked', () => {
    render(<Header {...defaultProps} />);
    
    const logo = screen.getByText(/datajobportal/i);
    fireEvent.click(logo);
    
    expect(window.location.hash).toBe('');
  });

  test('toggles mobile menu on mobile devices', () => {
    window.innerWidth = 768;
    
    render(<Header {...defaultProps} />);
    
    const menuButton = screen.getByRole('button', { name: /menu/i });
    fireEvent.click(menuButton);
    
    // Mobile menu should be visible
    expect(screen.getByText(/find job/i)).toBeInTheDocument();
  });

  test('tracks page view on navigation', () => {
    const adminStats = require('../../utils/adminStats').default;
    
    render(<Header {...defaultProps} />);
    
    const messagesLink = screen.getByText(/messages/i);
    fireEvent.click(messagesLink);
    
    expect(adminStats.trackPageView).toHaveBeenCalled();
  });
});
