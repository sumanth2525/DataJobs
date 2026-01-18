import React, { useState } from 'react';
import './MobileNav.css';

const MobileNav = ({ onNavigate }) => {
  const [activeItem, setActiveItem] = useState('find-job');

  const handleNavClick = (e, item) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveItem(item);
    if (item === 'hiring' && onNavigate) {
      onNavigate('admin');
    } else {
      // console.log(`Navigating to: ${item}`); // Removed by Issue Fixer Agent
      // Show feedback for navigation
      const navItem = e.currentTarget;
      navItem.style.transform = 'scale(0.95)';
      setTimeout(() => {
        navItem.style.transform = '';
      }, 150);
      
      // In a real app, this would navigate to the section
      if (item === 'messages') {
        if (onNavigate) {
          onNavigate('messages');
        } else {
          window.location.hash = '#messages';
        }
      } else if (item === 'community') {
        if (onNavigate) {
          onNavigate('community');
        } else {
          window.location.hash = '#community';
        }
      } else if (item === 'profile') {
        if (onNavigate) {
          onNavigate('profile');
        } else {
          window.location.hash = '#profile';
        }
      }
    }
  };

  return (
    <nav className="mobile-nav">
      <a 
        href="#find-job" 
        className={`mobile-nav-item ${activeItem === 'find-job' ? 'active' : ''}`}
        onClick={(e) => handleNavClick(e, 'find-job')}
      >
        <i className="bi bi-search mobile-nav-icon"></i>
        <span className="mobile-nav-label">Find Job</span>
      </a>
      <a 
        href="#messages" 
        className={`mobile-nav-item ${activeItem === 'messages' ? 'active' : ''}`}
        onClick={(e) => handleNavClick(e, 'messages')}
      >
        <i className="bi bi-chat-dots mobile-nav-icon"></i>
        <span className="mobile-nav-label">Messages</span>
      </a>
      <a 
        href="#community" 
        className={`mobile-nav-item ${activeItem === 'community' ? 'active' : ''}`}
        onClick={(e) => handleNavClick(e, 'community')}
      >
        <i className="bi bi-people mobile-nav-icon"></i>
        <span className="mobile-nav-label">Community</span>
      </a>
      <a 
        href="#profile" 
        className={`mobile-nav-item ${activeItem === 'profile' ? 'active' : ''}`}
        onClick={(e) => handleNavClick(e, 'profile')}
      >
        <i className="bi bi-person-fill mobile-nav-icon"></i>
        <span className="mobile-nav-label">Profile</span>
      </a>
    </nav>
  );
};

export default MobileNav;
