import React, { useState } from 'react';
import './MobileNav.css';

const MobileNav = ({ onNavigate, currentPage = 'home' }) => {
  const handleNavClick = (e, item) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Show feedback for navigation
    const navItem = e.currentTarget;
    navItem.style.transform = 'scale(0.95)';
    setTimeout(() => {
      navItem.style.transform = '';
    }, 150);
    
    // Navigate to the section
    if (item === 'home' || item === 'dashboard') {
      if (onNavigate) {
        onNavigate('dashboard');
      } else {
        window.location.hash = '';
      }
    } else if (item === 'jobs') {
      if (onNavigate) {
        onNavigate('dashboard');
      } else {
        window.location.hash = '';
      }
    } else if (item === 'applies' || item === 'applications') {
      // Navigate to applications/profile or create new page
      if (onNavigate) {
        onNavigate('profile');
      } else {
        window.location.hash = '#profile';
      }
    } else if (item === 'inbox' || item === 'messages') {
      if (onNavigate) {
        onNavigate('messages');
      } else {
        window.location.hash = '#messages';
      }
    } else if (item === 'profile') {
      if (onNavigate) {
        onNavigate('profile');
      } else {
        window.location.hash = '#profile';
      }
    }
  };

  const isActive = (item) => {
    if (item === 'home' && (currentPage === 'dashboard' || currentPage === 'home')) return true;
    if (item === 'jobs' && currentPage === 'dashboard') return true;
    if (item === 'applies' && currentPage === 'profile') return true;
    if (item === 'inbox' && currentPage === 'messages') return true;
    if (item === 'profile' && currentPage === 'profile') return true;
    return false;
  };

  return (
    <nav className="mobile-nav">
      <a 
        href="#home" 
        className={`mobile-nav-item ${isActive('home') ? 'active' : ''}`}
        onClick={(e) => handleNavClick(e, 'home')}
      >
        <i className="bi bi-house-fill mobile-nav-icon"></i>
        <span className="mobile-nav-label">Home</span>
      </a>
      <a 
        href="#jobs" 
        className={`mobile-nav-item ${isActive('jobs') ? 'active' : ''}`}
        onClick={(e) => handleNavClick(e, 'jobs')}
      >
        <i className="bi bi-briefcase-fill mobile-nav-icon"></i>
        <span className="mobile-nav-label">Jobs</span>
      </a>
      <a 
        href="#inbox" 
        className={`mobile-nav-item ${isActive('inbox') ? 'active' : ''}`}
        onClick={(e) => handleNavClick(e, 'inbox')}
      >
        <i className="bi bi-bar-chart-fill mobile-nav-icon"></i>
        <span className="mobile-nav-label">Chart</span>
      </a>
      <a 
        href="#profile" 
        className={`mobile-nav-item ${isActive('profile') ? 'active' : ''}`}
        onClick={(e) => handleNavClick(e, 'profile')}
      >
        <i className="bi bi-person-fill mobile-nav-icon"></i>
        <span className="mobile-nav-label">Profile</span>
      </a>
    </nav>
  );
};

export default MobileNav;
