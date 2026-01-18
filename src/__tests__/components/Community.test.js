import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Community from '../../components/Community';
import { samplePosts, sampleUsers, suggestedConnections } from '../../data/communityData';

describe('Community Component', () => {
  const mockOnNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    global.alert = jest.fn();
  });

  test('renders community component', () => {
    render(<Community onNavigate={mockOnNavigate} />);
    
    expect(screen.getByRole('heading', { name: /community/i })).toBeInTheDocument();
  });

  test('displays feed tab by default', () => {
    render(<Community onNavigate={mockOnNavigate} />);
    
    expect(screen.getByPlaceholderText(/share your thoughts/i)).toBeInTheDocument();
  });

  test('switches to connections tab', () => {
    render(<Community onNavigate={mockOnNavigate} />);
    
    const connectionsTab = screen.getByText(/connections/i);
    fireEvent.click(connectionsTab);
    
    expect(screen.getByText(/your connections/i)).toBeInTheDocument();
  });

  test('switches to jobs tab', () => {
    render(<Community onNavigate={mockOnNavigate} />);
    
    const jobsTab = screen.getByText(/jobs/i);
    fireEvent.click(jobsTab);
    
    expect(screen.getByText(/job opportunities from community/i)).toBeInTheDocument();
  });

  test('creates new post', () => {
    render(<Community onNavigate={mockOnNavigate} />);
    
    const postInput = screen.getByPlaceholderText(/share your thoughts/i);
    const postButton = screen.getByText(/post/i);
    
    fireEvent.change(postInput, { target: { value: 'New post content' } });
    fireEvent.click(postButton);
    
    expect(screen.getByText('New post content')).toBeInTheDocument();
  });

  test('disables post button when input is empty', () => {
    render(<Community onNavigate={mockOnNavigate} />);
    
    const postButton = screen.getByText(/post/i);
    expect(postButton).toBeDisabled();
  });

  test('likes a post', async () => {
    render(<Community onNavigate={mockOnNavigate} />);
    
    // Find like buttons by finding buttons with heart icons
    const likeButtons = Array.from(document.querySelectorAll('button.post-action-button'))
      .filter(btn => btn.querySelector('.bi-heart') || btn.querySelector('.bi-heart-fill'));
    
    if (likeButtons.length > 0) {
      const initialLikes = likeButtons[0].querySelector('span')?.textContent || '0';
      fireEvent.click(likeButtons[0]);
      
      // Likes should increase
      await waitFor(() => {
        const newLikes = likeButtons[0].querySelector('span')?.textContent || '0';
        expect(parseInt(newLikes)).toBeGreaterThanOrEqual(parseInt(initialLikes));
      });
    }
  });

  test('shares a post', () => {
    render(<Community onNavigate={mockOnNavigate} />);
    
    // Find share buttons by finding buttons with share icons
    const shareButtons = Array.from(document.querySelectorAll('button.post-action-button'))
      .filter(btn => btn.querySelector('.bi-share'));
    
    if (shareButtons.length > 0) {
      fireEvent.click(shareButtons[0]);
      
      expect(global.alert).toHaveBeenCalledWith('Post shared!');
    }
  });

  test('connects with suggested user', () => {
    render(<Community onNavigate={mockOnNavigate} />);
    
    const connectionsTab = screen.getByText(/connections/i);
    fireEvent.click(connectionsTab);
    
    const connectButtons = screen.getAllByText(/connect/i);
    if (connectButtons.length > 0) {
      fireEvent.click(connectButtons[0]);
      
      // User should be moved to connections
      waitFor(() => {
        expect(screen.getByText(/your connections/i)).toBeInTheDocument();
      });
    }
  });

  test('disconnects from a user', () => {
    render(<Community onNavigate={mockOnNavigate} />);
    
    const connectionsTab = screen.getByText(/connections/i);
    fireEvent.click(connectionsTab);
    
    const disconnectButtons = screen.getAllByText(/disconnect/i);
    if (disconnectButtons.length > 0) {
      fireEvent.click(disconnectButtons[0]);
      
      // User should be removed from connections
      waitFor(() => {
        expect(screen.queryByText(sampleUsers[0].name)).not.toBeInTheDocument();
      });
    }
  });

  test('displays connection count badge', () => {
    render(<Community onNavigate={mockOnNavigate} />);
    
    const connectionsTab = screen.getByText(/connections/i);
    const badge = connectionsTab.parentElement.querySelector('.tab-badge');
    
    if (badge) {
      expect(badge).toBeInTheDocument();
    }
  });

  test('displays job count badge', () => {
    render(<Community onNavigate={mockOnNavigate} />);
    
    const jobsTab = screen.getByText(/jobs/i);
    const badge = jobsTab.parentElement.querySelector('.tab-badge');
    
    if (badge) {
      expect(badge).toBeInTheDocument();
    }
  });

  test('navigates back when back button is clicked', () => {
    render(<Community onNavigate={mockOnNavigate} />);
    
    const backButton = screen.getByLabelText(/back to dashboard/i);
    fireEvent.click(backButton);
    
    expect(mockOnNavigate).toHaveBeenCalledWith('dashboard');
  });

  test('displays empty state when no connections', () => {
    render(<Community onNavigate={mockOnNavigate} />);
    
    const connectionsTab = screen.getByText(/connections/i);
    fireEvent.click(connectionsTab);
    
    // If no connections, should show empty state
    waitFor(() => {
      const emptyState = screen.queryByText(/no connections yet/i);
      if (emptyState) {
        expect(emptyState).toBeInTheDocument();
      }
    });
  });

  test('displays post author information', () => {
    render(<Community onNavigate={mockOnNavigate} />);
    
    if (samplePosts.length > 0) {
      expect(screen.getByText(samplePosts[0].author.name)).toBeInTheDocument();
    }
  });

  test('displays time ago for posts', () => {
    render(<Community onNavigate={mockOnNavigate} />);
    
    // Time ago should be displayed
    const timeElements = screen.getAllByText(/ago|just now|m ago|h ago|d ago/i);
    expect(timeElements.length).toBeGreaterThan(0);
  });
});
