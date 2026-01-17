import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../App';

// Mock components
jest.mock('../components/Dashboard', () => {
  return function MockDashboard() {
    return <div data-testid="dashboard">Dashboard</div>;
  };
});

jest.mock('../components/Admin', () => {
  return function MockAdmin() {
    return <div data-testid="admin">Admin</div>;
  };
});

jest.mock('../components/Messages', () => {
  return function MockMessages() {
    return <div data-testid="messages">Messages</div>;
  };
});

jest.mock('../components/Community', () => {
  return function MockCommunity() {
    return <div data-testid="community">Community</div>;
  };
});

jest.mock('../components/Profile', () => {
  return function MockProfile() {
    return <div data-testid="profile">Profile</div>;
  };
});

jest.mock('../components/Login', () => {
  return function MockLogin() {
    return <div data-testid="login">Login</div>;
  };
});

jest.mock('../components/SignUp', () => {
  return function MockSignUp() {
    return <div data-testid="signup">SignUp</div>;
  };
});

describe('App Component', () => {
  beforeEach(() => {
    window.location.hash = '';
    localStorage.clear();
  });

  test('renders Dashboard by default', () => {
    render(<App />);
    expect(screen.getByTestId('dashboard')).toBeInTheDocument();
  });

  test('renders Admin when hash is #post-job', () => {
    window.location.hash = '#post-job';
    render(<App />);
    expect(screen.getByTestId('admin')).toBeInTheDocument();
  });

  test('renders Messages when hash is #messages', () => {
    window.location.hash = '#messages';
    render(<App />);
    expect(screen.getByTestId('messages')).toBeInTheDocument();
  });

  test('renders Community when hash is #community', () => {
    window.location.hash = '#community';
    render(<App />);
    expect(screen.getByTestId('community')).toBeInTheDocument();
  });

  test('renders Profile when hash is #profile', () => {
    window.location.hash = '#profile';
    render(<App />);
    expect(screen.getByTestId('profile')).toBeInTheDocument();
  });
});
