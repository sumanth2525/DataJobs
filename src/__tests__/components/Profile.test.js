import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Profile from '../../components/Profile';
import { userProfile, recruiters } from '../../data/profileData';

describe('Profile Component', () => {
  const mockOnNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    global.alert = jest.fn();
    navigator.clipboard = {
      writeText: jest.fn().mockResolvedValue()
    };
  });

  test('renders profile component', () => {
    render(<Profile onNavigate={mockOnNavigate} />);
    
    expect(screen.getByText(/profile/i)).toBeInTheDocument();
  });

  test('displays user profile information', () => {
    render(<Profile onNavigate={mockOnNavigate} />);
    
    expect(screen.getByText(userProfile.name)).toBeInTheDocument();
    expect(screen.getByText(userProfile.title)).toBeInTheDocument();
    expect(screen.getByText(userProfile.location)).toBeInTheDocument();
  });

  test('displays profile stats', () => {
    render(<Profile onNavigate={mockOnNavigate} />);
    
    expect(screen.getByText(userProfile.stats.applications.toString())).toBeInTheDocument();
    expect(screen.getByText(userProfile.stats.savedJobs.toString())).toBeInTheDocument();
    expect(screen.getByText(userProfile.stats.connections.toString())).toBeInTheDocument();
  });

  test('switches to overview tab', () => {
    render(<Profile onNavigate={mockOnNavigate} />);
    
    const overviewTab = screen.getByText(/overview/i);
    fireEvent.click(overviewTab);
    
    expect(screen.getByText(/about/i)).toBeInTheDocument();
  });

  test('switches to recruiters tab', () => {
    render(<Profile onNavigate={mockOnNavigate} />);
    
    const recruitersTab = screen.getByText(/recruiters/i);
    fireEvent.click(recruitersTab);
    
    expect(screen.getByText(/connect with top recruiters/i)).toBeInTheDocument();
  });

  test('switches to settings tab', () => {
    render(<Profile onNavigate={mockOnNavigate} />);
    
    const settingsTab = screen.getByText(/settings/i);
    fireEvent.click(settingsTab);
    
    expect(screen.getByText(/manage your account/i)).toBeInTheDocument();
  });

  test('displays user skills', () => {
    render(<Profile onNavigate={mockOnNavigate} />);
    
    userProfile.skills.forEach(skill => {
      expect(screen.getByText(skill)).toBeInTheDocument();
    });
  });

  test('displays user experience', () => {
    render(<Profile onNavigate={mockOnNavigate} />);
    
    userProfile.experience.forEach(exp => {
      expect(screen.getByText(exp.title)).toBeInTheDocument();
      expect(screen.getByText(exp.company)).toBeInTheDocument();
    });
  });

  test('displays user education', () => {
    render(<Profile onNavigate={mockOnNavigate} />);
    
    userProfile.education.forEach(edu => {
      expect(screen.getByText(edu.degree)).toBeInTheDocument();
      expect(screen.getByText(edu.school)).toBeInTheDocument();
    });
  });

  test('displays contact information', () => {
    render(<Profile onNavigate={mockOnNavigate} />);
    
    expect(screen.getByText(userProfile.email)).toBeInTheDocument();
    expect(screen.getByText(userProfile.phone)).toBeInTheDocument();
  });

  test('copies email to clipboard', async () => {
    render(<Profile onNavigate={mockOnNavigate} />);
    
    const copyButtons = screen.getAllByLabelText(/copy email/i);
    if (copyButtons.length > 0) {
      fireEvent.click(copyButtons[0]);
      
      await waitFor(() => {
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith(userProfile.email);
        expect(global.alert).toHaveBeenCalledWith('Email copied to clipboard!');
      });
    }
  });

  test('opens email client when email is clicked', () => {
    window.location.href = '';
    
    render(<Profile onNavigate={mockOnNavigate} />);
    
    const emailButtons = screen.getAllByRole('button', { name: /email/i });
    if (emailButtons.length > 0) {
      fireEvent.click(emailButtons[0]);
      
      expect(window.location.href).toContain('mailto:');
    }
  });

  test('opens phone dialer when phone is clicked', () => {
    window.location.href = '';
    
    render(<Profile onNavigate={mockOnNavigate} />);
    
    const phoneButtons = screen.getAllByLabelText(/call/i);
    if (phoneButtons.length > 0) {
      fireEvent.click(phoneButtons[0]);
      
      expect(window.location.href).toContain('tel:');
    }
  });

  test('opens contact modal', () => {
    render(<Profile onNavigate={mockOnNavigate} />);
    
    const contactButton = screen.getByText(/contact us/i);
    fireEvent.click(contactButton);
    
    expect(screen.getByText(/contact us/i)).toBeInTheDocument();
    expect(screen.getByText(/get in touch/i)).toBeInTheDocument();
  });

  test('submits contact form', () => {
    render(<Profile onNavigate={mockOnNavigate} />);
    
    const contactButton = screen.getByText(/contact us/i);
    fireEvent.click(contactButton);
    
    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const subjectInput = screen.getByLabelText(/subject/i);
    const messageInput = screen.getByLabelText(/message/i);
    
    fireEvent.change(nameInput, { target: { value: 'Test User' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(subjectInput, { target: { value: 'Test Subject' } });
    fireEvent.change(messageInput, { target: { value: 'Test Message' } });
    
    const submitButton = screen.getByText(/send message/i);
    fireEvent.click(submitButton);
    
    expect(global.alert).toHaveBeenCalledWith('Thank you for contacting us! We will get back to you soon.');
  });

  test('displays recruiters in recruiters tab', () => {
    render(<Profile onNavigate={mockOnNavigate} />);
    
    const recruitersTab = screen.getByText(/recruiters/i);
    fireEvent.click(recruitersTab);
    
    recruiters.forEach(recruiter => {
      expect(screen.getByText(recruiter.name)).toBeInTheDocument();
      expect(screen.getByText(recruiter.company)).toBeInTheDocument();
    });
  });

  test('navigates back when back button is clicked', () => {
    render(<Profile onNavigate={mockOnNavigate} />);
    
    const backButton = screen.getByLabelText(/back to dashboard/i);
    fireEvent.click(backButton);
    
    expect(mockOnNavigate).toHaveBeenCalledWith('dashboard');
  });

  test('closes contact modal when close button is clicked', () => {
    render(<Profile onNavigate={mockOnNavigate} />);
    
    const contactButton = screen.getByText(/contact us/i);
    fireEvent.click(contactButton);
    
    const closeButton = screen.getByLabelText(/close/i);
    fireEvent.click(closeButton);
    
    expect(screen.queryByText(/get in touch/i)).not.toBeInTheDocument();
  });
});
