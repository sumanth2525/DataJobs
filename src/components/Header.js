import React, { useState, useEffect, useRef } from 'react';
import { subscribeToOnlineUsers } from '../utils/onlineUsers';
import './Header.css';

const Header = ({ onNavigate, user, onShowLogin, onShowSignUp, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [onlineUsersCount, setOnlineUsersCount] = useState(0);
  const menuRef = useRef(null);

  const handleLogoClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogoKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleLogoClick();
    }
  };

  const handleNavClick = (e, section) => {
    e.preventDefault();
    e.stopPropagation();
    // Navigate to the section or route
    if (section === 'Messages') {
      if (onNavigate) {
        onNavigate('messages');
      } else {
        window.location.hash = '#messages';
      }
    } else if (section === 'Community') {
      if (onNavigate) {
        onNavigate('community');
      } else {
        window.location.hash = '#community';
      }
    } else if (section === 'FAQ') {
      alert('FAQ section coming soon! ❓');
    } else {
      alert(`Navigating to ${section} section`);
    }
  };

  const toggleMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsMenuOpen(!isMenuOpen);
  };

  const handleMenuClick = (e, menuItem) => {
    e.preventDefault();
    e.stopPropagation();
    setIsMenuOpen(false);
    if (menuItem === 'Post a Job') {
      if (onNavigate) {
        onNavigate('post-job');
      } else {
        window.location.hash = '#post-job';
      }
    } else if (menuItem === 'Login') {
      if (onShowLogin) {
        onShowLogin();
      }
    } else if (menuItem === 'Sign Up') {
      if (onShowSignUp) {
        onShowSignUp();
      }
    } else if (menuItem === 'Profile') {
      if (onNavigate) {
        onNavigate('profile');
      } else {
        window.location.hash = '#profile';
      }
    } else if (menuItem === 'Notifications') {
      alert('Notifications coming soon! 🔔');
    } else if (menuItem === 'Settings') {
      alert('Settings coming soon! ⚙️');
    } else if (menuItem === 'Push Job Online') {
      alert('Push Job Online feature coming soon! 📤');
    } else if (menuItem === 'Good Job Count') {
      alert('Good Job Count feature coming soon! ⭐');
    } else if (menuItem === 'Resume') {
      alert('Resume feature coming soon! 📄');
    } else if (menuItem === 'Consultancy') {
      alert('Consultancy feature coming soon! 💼');
    } else if (menuItem === 'Contact Us') {
      alert('Contact Us feature coming soon! 📧');
    } else if (menuItem === 'Logout') {
      if (onLogout) {
        onLogout();
      }
    }
  };

  // Subscribe to online users count
  useEffect(() => {
    const unsubscribe = subscribeToOnlineUsers((count) => {
      setOnlineUsersCount(count);
    });
    return unsubscribe;
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-left">
          <div className="logo" onClick={handleLogoClick} onKeyDown={handleLogoKeyDown} role="button" tabIndex={0}>
            <div className="logo-icon-circle">
              <i className="bi bi-briefcase-fill"></i>
            </div>
            <span className="logo-text">Talantium</span>
          </div>
          <nav className="nav-links">
            <a href="#home" className="nav-link" onClick={(e) => handleNavClick(e, 'Home')}>Home</a>
            <a href="#messages" className="nav-link nav-link-with-badge" onClick={(e) => handleNavClick(e, 'Messages')}>
              Messages
              <span className="nav-badge-dot"></span>
            </a>
            <a href="#about" className="nav-link" onClick={(e) => handleNavClick(e, 'About us')}>About us</a>
            <a href="#jobs" className="nav-link active" onClick={(e) => { e.preventDefault(); if (onNavigate) { onNavigate('dashboard'); } else { window.location.hash = ''; } }}>
              Jobs
            </a>
            <a href="#community" className="nav-link" onClick={(e) => handleNavClick(e, 'Community')}>Community</a>
          </nav>
        </div>
        <div className="header-right">
          <button className="header-icon-btn" onClick={(e) => handleMenuClick(e, 'Settings')} aria-label="Settings">
            <i className="bi bi-gear-fill"></i>
          </button>
          <button className="header-icon-btn" onClick={(e) => handleMenuClick(e, 'Notifications')} aria-label="Notifications">
            <i className="bi bi-bell-fill"></i>
          </button>
          <button className="header-avatar-btn" onClick={toggleMenu} aria-label="User menu">
            <div className="header-avatar">
              {user && user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
          </button>
          <div className="burger-menu-container" ref={menuRef}>
            <button 
              className={`burger-menu-button ${isMenuOpen ? 'active' : ''}`}
              onClick={toggleMenu}
              aria-label="Menu"
              aria-expanded={isMenuOpen}
            >
              <span className="burger-line"></span>
              <span className="burger-line"></span>
              <span className="burger-line"></span>
            </button>
            
            {isMenuOpen && (
              <div className="burger-menu-dropdown">
                <div className="menu-online-users">
                  <div className="menu-online-header">
                    <i className="bi bi-people-fill"></i>
                    <span>Online Users</span>
                  </div>
                  <div className="menu-online-count">
                    <i className="bi bi-circle-fill menu-online-dot"></i>
                    <span className="menu-online-number">{onlineUsersCount.toLocaleString()}</span>
                    <span className="menu-online-text">users online now</span>
                  </div>
                </div>
                <div className="menu-divider"></div>
                <button 
                  className="menu-item menu-item-highlight"
                  onClick={(e) => handleMenuClick(e, 'Post a Job')}
                >
                  <i className="bi bi-briefcase-fill"></i>
                  <span>Post a Job</span>
                </button>
                <button 
                  className="menu-item"
                  onClick={(e) => handleMenuClick(e, 'Push Job Online')}
                >
                  <i className="bi bi-upload"></i>
                  <span>Push Job Online</span>
                </button>
                <button 
                  className="menu-item"
                  onClick={(e) => handleMenuClick(e, 'Good Job Count')}
                >
                  <i className="bi bi-star-fill"></i>
                  <span>Good Job Count</span>
                </button>
                <button 
                  className="menu-item"
                  onClick={(e) => handleMenuClick(e, 'Resume')}
                >
                  <i className="bi bi-file-earmark-text-fill"></i>
                  <span>Resume</span>
                </button>
                <button 
                  className="menu-item"
                  onClick={(e) => handleMenuClick(e, 'Contact Us')}
                >
                  <i className="bi bi-envelope-fill"></i>
                  <span>Contact Us</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
