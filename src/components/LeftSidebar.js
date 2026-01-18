import React from 'react';
import './LeftSidebar.css';

const LeftSidebar = ({ onNavigate, user, currentPage = 'dashboard' }) => {
  const handleNavClick = (page) => {
    if (onNavigate) {
      onNavigate(page);
    } else {
      window.location.hash = `#${page}`;
    }
  };

  return (
    <div className="left-sidebar">
      <nav className="sidebar-nav">
        <div className="nav-section">
          <button 
            className={`nav-item ${currentPage === 'dashboard' ? 'active' : ''}`}
            onClick={() => handleNavClick('dashboard')}
            aria-label="Jobs"
          >
            <i className="bi bi-briefcase-fill"></i>
            <span>Jobs</span>
          </button>

          <button 
            className="nav-item"
            onClick={() => alert('Resume builder coming soon! 📄')}
            aria-label="Resume"
          >
            <i className="bi bi-file-earmark-text"></i>
            <span>Resume</span>
            <span className="nav-badge success">✓</span>
          </button>

          <button 
            className={`nav-item ${currentPage === 'profile' ? 'active' : ''}`}
            onClick={() => handleNavClick('profile')}
            aria-label="Profile"
          >
            <i className="bi bi-person-fill"></i>
            <span>Profile</span>
          </button>

          <button 
            className="nav-item"
            onClick={() => alert('AI Agent coming soon! 🤖')}
            aria-label="AI Agent"
          >
            <i className="bi bi-chat-dots-fill"></i>
            <span>AI Agent</span>
            <span className="nav-badge beta">Beta</span>
          </button>

          <button 
            className="nav-item"
            onClick={() => alert('Coaching coming soon! 🎯')}
            aria-label="Coaching"
          >
            <i className="bi bi-bullseye"></i>
            <span>Coaching</span>
            <span className="nav-badge new">NEW</span>
          </button>
        </div>

        <div className="nav-section nav-section-bottom">
          {/* Refer & Earn Card */}
          <div className="refer-earn-card">
            <div className="refer-earn-icon">
              <i className="bi bi-gift-fill"></i>
            </div>
            <div className="refer-earn-content">
              <h4>Refer & Earn</h4>
              <p>Invite friends or share on LinkedIn to earn rewards!</p>
              <button className="refer-earn-btn">
                Get Started <i className="bi bi-arrow-right"></i>
              </button>
            </div>
          </div>

          <button 
            className="nav-item"
            onClick={() => handleNavClick('messages')}
            aria-label="Messages"
          >
            <i className="bi bi-bell-fill"></i>
            <span>Messages</span>
          </button>

          <button 
            className="nav-item"
            onClick={() => alert('Feedback coming soon! 💬')}
            aria-label="Feedback"
          >
            <i className="bi bi-question-circle-fill"></i>
            <span>Feedback</span>
          </button>

          <button 
            className="nav-item"
            onClick={() => alert('Settings coming soon! ⚙️')}
            aria-label="Settings"
          >
            <i className="bi bi-gear-fill"></i>
            <span>Settings</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default LeftSidebar;
