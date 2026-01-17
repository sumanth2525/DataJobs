import React, { useState, useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';
import './App.css';
import Dashboard from './components/Dashboard';
import Admin from './components/Admin';
import Messages from './components/Messages';
import Community from './components/Community';
import Profile from './components/Profile';
import Login from './components/Login';
import SignUp from './components/SignUp';
import { sampleJobs } from './data/jobData';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [jobs, setJobs] = useState(sampleJobs);
  const [user, setUser] = useState(null); // null when not logged in
  const [showLogin, setShowLogin] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);

  // Check URL hash on mount and when it changes
  useEffect(() => {
    const checkHash = () => {
      const hash = window.location.hash;
      if (hash === '#post-job' || hash === '#admin') {
        setCurrentPage('admin');
      } else if (hash === '#messages') {
        setCurrentPage('messages');
      } else if (hash === '#community') {
        setCurrentPage('community');
      } else if (hash === '#profile') {
        setCurrentPage('profile');
      } else {
        setCurrentPage('dashboard');
      }
    };

    checkHash();
    window.addEventListener('hashchange', checkHash);
    return () => window.removeEventListener('hashchange', checkHash);
  }, []);

  const handleJobPost = (newJob) => {
    // Add new job to the beginning of the array (newest first)
    setJobs(prevJobs => [newJob, ...prevJobs]);
    // Switch back to dashboard to see the new job
    window.location.hash = '';
    setCurrentPage('dashboard');
  };

  const handleNavigate = (page) => {
    if (page === 'admin') {
      window.location.hash = '#post-job';
    } else if (page === 'messages') {
      window.location.hash = '#messages';
    } else if (page === 'community') {
      window.location.hash = '#community';
    } else if (page === 'profile') {
      window.location.hash = '#profile';
    } else {
      window.location.hash = '';
    }
    setCurrentPage(page);
  };

  const handleLogin = (userData) => {
    setUser(userData);
    setShowLogin(false);
    // Store in localStorage for persistence
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleSignUp = (userData) => {
    setUser(userData);
    setShowSignUp(false);
    // Store in localStorage for persistence
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    window.location.hash = '';
    setCurrentPage('dashboard');
  };

  // Check for existing session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('user');
      }
    }
  }, []);

  return (
    <div className="App">
      {currentPage === 'dashboard' && (
        <Dashboard 
          jobs={jobs} 
          setJobs={setJobs} 
          onNavigate={handleNavigate}
          user={user}
          onShowLogin={() => setShowLogin(true)}
          onShowSignUp={() => setShowSignUp(true)}
          onLogout={handleLogout}
        />
      )}
      {currentPage === 'admin' && (
        <Admin onJobPost={handleJobPost} onNavigate={handleNavigate} />
      )}
      {currentPage === 'messages' && (
        <Messages onNavigate={handleNavigate} />
      )}
      {currentPage === 'community' && (
        <Community onNavigate={handleNavigate} />
      )}
      {currentPage === 'profile' && (
        <Profile onNavigate={handleNavigate} />
      )}
      
      {/* Auth Modals */}
      {showLogin && (
        <Login
          onLogin={handleLogin}
          onSwitchToSignUp={() => {
            setShowLogin(false);
            setShowSignUp(true);
          }}
          onClose={() => setShowLogin(false)}
        />
      )}
      {showSignUp && (
        <SignUp
          onSignUp={handleSignUp}
          onSwitchToLogin={() => {
            setShowSignUp(false);
            setShowLogin(true);
          }}
          onClose={() => setShowSignUp(false)}
        />
      )}
      <Analytics />
    </div>
  );
}

export default App;
