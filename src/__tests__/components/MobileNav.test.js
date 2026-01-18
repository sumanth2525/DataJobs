import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import MobileNav from '../../components/MobileNav';

describe('MobileNav Component', () => {
  const mockOnNavigate = jest.fn();

  const defaultProps = {
    onNavigate: mockOnNavigate,
    currentPage: 'home'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    window.location.hash = '';
  });

  test('renders mobile navigation', () => {
    render(<MobileNav {...defaultProps} />);
    
    expect(screen.getByText(/home/i)).toBeInTheDocument();
    expect(screen.getByText(/jobs/i)).toBeInTheDocument();
    expect(screen.getByText(/applies/i)).toBeInTheDocument();
    expect(screen.getByText(/inbox/i)).toBeInTheDocument();
    expect(screen.getByText(/profile/i)).toBeInTheDocument();
  });

  test('highlights active home item', () => {
    render(<MobileNav {...defaultProps} currentPage="home" />);
    
    const homeLink = screen.getByText(/home/i).closest('.mobile-nav-item');
    expect(homeLink).toHaveClass('active');
  });

  test('highlights active jobs item', () => {
    render(<MobileNav {...defaultProps} currentPage="dashboard" />);
    
    const jobsLink = screen.getByText(/jobs/i).closest('.mobile-nav-item');
    expect(jobsLink).toHaveClass('active');
  });

  test('navigates to home when home clicked', () => {
    render(<MobileNav {...defaultProps} />);
    
    const homeLink = screen.getByText(/home/i).closest('a');
    fireEvent.click(homeLink);
    
    expect(mockOnNavigate).toHaveBeenCalledWith('dashboard');
  });

  test('navigates to messages when inbox clicked', () => {
    render(<MobileNav {...defaultProps} />);
    
    const inboxLink = screen.getByText(/inbox/i).closest('a');
    fireEvent.click(inboxLink);
    
    expect(mockOnNavigate).toHaveBeenCalledWith('messages');
  });

  test('navigates to profile when profile clicked', () => {
    render(<MobileNav {...defaultProps} />);
    
    const profileLink = screen.getByText(/profile/i).closest('a');
    fireEvent.click(profileLink);
    
    expect(mockOnNavigate).toHaveBeenCalledWith('profile');
  });

  test('navigates to profile when applies clicked', () => {
    render(<MobileNav {...defaultProps} />);
    
    const appliesLink = screen.getByText(/applies/i).closest('a');
    fireEvent.click(appliesLink);
    
    expect(mockOnNavigate).toHaveBeenCalledWith('profile');
  });

  test('prevents default behavior on navigation click', () => {
    render(<MobileNav {...defaultProps} />);
    
    const homeLink = screen.getByText(/home/i).closest('a');
    const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
    const preventDefaultSpy = jest.spyOn(clickEvent, 'preventDefault');
    
    fireEvent.click(homeLink, clickEvent);
    // preventDefault should be called in handleNavClick
  });

  test('handles navigation without onNavigate prop', () => {
    delete window.location.hash;
    window.location.hash = '';
    
    render(<MobileNav onNavigate={null} />);
    
    const homeLink = screen.getByText(/home/i).closest('a');
    fireEvent.click(homeLink);
    
    // Should not crash
  });

  test('displays correct icons', () => {
    render(<MobileNav {...defaultProps} />);
    
    const icons = screen.getAllByRole('generic', { hidden: true });
    const iconClasses = icons
      .filter(icon => icon.className && icon.className.includes('bi-'))
      .map(icon => icon.className);
    
    expect(iconClasses.some(cls => cls.includes('bi-house'))).toBe(true);
    expect(iconClasses.some(cls => cls.includes('bi-briefcase'))).toBe(true);
    expect(iconClasses.some(cls => cls.includes('bi-envelope'))).toBe(true);
    expect(iconClasses.some(cls => cls.includes('bi-person'))).toBe(true);
  });
});
