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
    if (section === 'Hiring' && onNavigate) {
      onNavigate('admin');
    } else {
      console.log(`Navigating to: ${section}`);
      // In a real app, this would navigate to the section or route
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
    console.log(`${menuItem} clicked`);
    // In a real app, this would navigate or open a modal
    if (menuItem === 'Post a Job') {
      if (onNavigate) {
        onNavigate('admin');
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
            <i className="bi bi-graph-up logo-icon"></i>
            <span className="logo-text">DataJobPortal</span>
          </div>
          <nav className="nav-links">
            <a href="#find-job" className="nav-link" onClick={(e) => handleNavClick(e, 'Find Job')}>Find job</a>
            <a href="#messages" className="nav-link" onClick={(e) => handleNavClick(e, 'Messages')}>Messages</a>
            <a href="#community" className="nav-link" onClick={(e) => handleNavClick(e, 'Community')}>Community</a>
            <a href="#faq" className="nav-link" onClick={(e) => handleNavClick(e, 'FAQ')}>FAQ</a>
          </nav>
        </div>
        <div className="header-right">
          <div className="online-users-indicator">
            <i className="bi bi-circle-fill online-dot"></i>
            <span className="online-count">{onlineUsersCount.toLocaleString()}</span>
            <span className="online-label">online</span>
          </div>
          <span className="location">New York, NY</span>
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
                {!user ? (
                  <>
                    <button 
                      className="menu-item menu-item-highlight"
                      onClick={(e) => handleMenuClick(e, 'Login')}
                    >
                      <i className="bi bi-box-arrow-in-right"></i>
                      <span>Login</span>
                    </button>
                    <button 
                      className="menu-item"
                      onClick={(e) => handleMenuClick(e, 'Sign Up')}
                    >
                      <i className="bi bi-person-plus"></i>
                      <span>Sign Up</span>
                    </button>
                    <div className="menu-divider"></div>
                    <button 
                      className="menu-item menu-item-highlight"
                      onClick={(e) => handleMenuClick(e, 'Post a Job')}
                    >
                      <i className="bi bi-briefcase-fill"></i>
                      <span>Post a Job</span>
                    </button>
                  </>
                ) : (
                  <>
                    <div className="menu-user-info">
                      <div className="menu-user-avatar">{user.name ? user.name.charAt(0).toUpperCase() : 'U'}</div>
                      <div className="menu-user-details">
                        <div className="menu-user-name">{user.name || 'User'}</div>
                        <div className="menu-user-email">{user.email || user.loginMethod}</div>
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
                    <div className="menu-divider"></div>
                    <button 
                      className="menu-item"
                      onClick={(e) => handleMenuClick(e, 'Profile')}
                    >
                      <i className="bi bi-person-fill"></i>
                      <span>Profile</span>
                    </button>
                    <button 
                      className="menu-item"
                      onClick={(e) => handleMenuClick(e, 'Notifications')}
                    >
                      <i className="bi bi-bell-fill"></i>
                      <span>Notifications</span>
                    </button>
                    <button 
                      className="menu-item"
                      onClick={(e) => handleMenuClick(e, 'Settings')}
                    >
                      <i className="bi bi-gear-fill"></i>
                      <span>Settings</span>
                    </button>
                    <div className="menu-divider"></div>
                    <button 
                      className="menu-item menu-item-danger"
                      onClick={(e) => handleMenuClick(e, 'Logout')}
                    >
                      <i className="bi bi-box-arrow-right"></i>
                      <span>Logout</span>
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
