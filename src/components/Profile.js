import React, { useState } from 'react';
import { userProfile, recruiters, contactInfo } from '../data/profileData';
import './Profile.css';

const Profile = ({ onNavigate }) => {
  const [activeSection, setActiveSection] = useState('overview');
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleContactSubmit = (e) => {
    e.preventDefault();
    alert('Thank you for contacting us! We will get back to you soon.');
    setContactForm({ name: '', email: '', subject: '', message: '' });
    setShowContactModal(false);
  };

  const handleEmailClick = (email) => {
    window.location.href = `mailto:${email}`;
  };

  const handlePhoneClick = (phone) => {
    window.location.href = `tel:${phone}`;
  };

  const handleCopyEmail = (email) => {
    navigator.clipboard.writeText(email);
    alert('Email copied to clipboard!');
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <button 
          className="back-button"
          onClick={() => onNavigate('dashboard')}
          aria-label="Back to dashboard"
        >
          <i className="bi bi-arrow-left"></i>
        </button>
        <h1 className="profile-title">Profile</h1>
        <div className="profile-header-actions">
          <button className="header-action-button" aria-label="Notifications">
            <i className="bi bi-bell"></i>
          </button>
          <button className="header-action-button" aria-label="Settings">
            <i className="bi bi-gear"></i>
          </button>
        </div>
      </div>

      <div className="profile-content">
        <div style={{ textAlign: 'center', padding: '80px 20px', color: '#667eea', fontSize: '28px', fontWeight: '600' }}>
          <i className="bi bi-hourglass-split" style={{ fontSize: '48px', marginBottom: '20px', display: 'block', color: '#667eea' }}></i>
          Coming soon
        </div>
        {false && (
        <>
        {/* Profile Header Card */}
        <div className="profile-header-card">
          <div className="profile-cover"></div>
          <div className="profile-info-section">
            <div className="profile-avatar-large">{userProfile.avatar}</div>
            <div className="profile-basic-info">
              <h2 className="profile-name">{userProfile.name}</h2>
              <p className="profile-title-text">{userProfile.title}</p>
              <p className="profile-location">
                <i className="bi bi-geo-alt"></i> {userProfile.location}
              </p>
              <div className="profile-stats">
                <div className="stat-item">
                  <span className="stat-value">{userProfile.stats.applications}</span>
                  <span className="stat-label">Applications</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{userProfile.stats.savedJobs}</span>
                  <span className="stat-label">Saved Jobs</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{userProfile.stats.connections}</span>
                  <span className="stat-label">Connections</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{userProfile.stats.profileViews}</span>
                  <span className="stat-label">Profile Views</span>
                </div>
              </div>
            </div>
            <div className="profile-action-buttons">
              <button className="profile-primary-button">
                <i className="bi bi-pencil-square"></i>
                Edit Profile
              </button>
              <button className="profile-secondary-button">
                <i className="bi bi-share"></i>
                Share Profile
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="profile-tabs">
          <button
            className={`profile-tab ${activeSection === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveSection('overview')}
          >
            <i className="bi bi-person"></i>
            Overview
          </button>
          <button
            className={`profile-tab ${activeSection === 'recruiters' ? 'active' : ''}`}
            onClick={() => setActiveSection('recruiters')}
          >
            <i className="bi bi-briefcase"></i>
            Recruiters
          </button>
          <button
            className={`profile-tab ${activeSection === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveSection('settings')}
          >
            <i className="bi bi-gear"></i>
            Settings
          </button>
        </div>

        {/* Content Sections */}
        <div className="profile-sections">
          {activeSection === 'overview' && (
            <div className="profile-section">
              <div className="section-card">
                <h3 className="section-title">
                  <i className="bi bi-info-circle"></i>
                  About
                </h3>
                <p className="profile-bio">{userProfile.bio}</p>
              </div>

              <div className="section-card">
                <h3 className="section-title">
                  <i className="bi bi-star"></i>
                  Skills
                </h3>
                <div className="skills-list">
                  {userProfile.skills.map((skill, idx) => (
                    <span key={idx} className="skill-tag">{skill}</span>
                  ))}
                </div>
              </div>

              <div className="section-card">
                <h3 className="section-title">
                  <i className="bi bi-briefcase"></i>
                  Experience
                </h3>
                {userProfile.experience.map((exp, idx) => (
                  <div key={idx} className="experience-item">
                    <h4 className="experience-title">{exp.title}</h4>
                    <p className="experience-company">{exp.company}</p>
                    <p className="experience-duration">{exp.duration}</p>
                    <p className="experience-description">{exp.description}</p>
                  </div>
                ))}
              </div>

              <div className="section-card">
                <h3 className="section-title">
                  <i className="bi bi-mortarboard"></i>
                  Education
                </h3>
                {userProfile.education.map((edu, idx) => (
                  <div key={idx} className="education-item">
                    <h4 className="education-degree">{edu.degree}</h4>
                    <p className="education-school">{edu.school}</p>
                    <p className="education-year">{edu.year}</p>
                  </div>
                ))}
              </div>

              <div className="section-card">
                <h3 className="section-title">
                  <i className="bi bi-envelope"></i>
                  Contact Information
                </h3>
                <div className="contact-info-list">
                  <div className="contact-info-item">
                    <i className="bi bi-envelope"></i>
                    <span>{userProfile.email}</span>
                    <button 
                      className="copy-button"
                      onClick={() => handleCopyEmail(userProfile.email)}
                      aria-label="Copy email"
                    >
                      <i className="bi bi-clipboard"></i>
                    </button>
                  </div>
                  <div className="contact-info-item">
                    <i className="bi bi-telephone"></i>
                    <span>{userProfile.phone}</span>
                    <button 
                      className="call-button"
                      onClick={() => handlePhoneClick(userProfile.phone)}
                      aria-label="Call"
                    >
                      <i className="bi bi-telephone-fill"></i>
                    </button>
                  </div>
                </div>
              </div>

              <div className="action-buttons-grid">
                <button className="action-button">
                  <i className="bi bi-file-earmark-text"></i>
                  <span>My Applications</span>
                  <span className="button-badge">{userProfile.stats.applications}</span>
                </button>
                <button className="action-button">
                  <i className="bi bi-bookmark"></i>
                  <span>Saved Jobs</span>
                  <span className="button-badge">{userProfile.stats.savedJobs}</span>
                </button>
                <button className="action-button">
                  <i className="bi bi-people"></i>
                  <span>My Connections</span>
                  <span className="button-badge">{userProfile.stats.connections}</span>
                </button>
                <button className="action-button">
                  <i className="bi bi-download"></i>
                  <span>Download Resume</span>
                </button>
                <button className="action-button">
                  <i className="bi bi-printer"></i>
                  <span>Print Profile</span>
                </button>
                <button 
                  className="action-button contact-us-button"
                  onClick={() => setShowContactModal(true)}
                >
                  <i className="bi bi-envelope-paper"></i>
                  <span>Contact Us</span>
                </button>
              </div>
            </div>
          )}

          {activeSection === 'recruiters' && (
            <div className="profile-section">
              <div className="section-header">
                <h2 className="section-title-large">Recruiters</h2>
                <p className="section-subtitle">Connect with top recruiters in the data industry</p>
              </div>
              <div className="recruiters-grid">
                {recruiters.map(recruiter => (
                  <div key={recruiter.id} className="recruiter-card">
                    <div className="recruiter-avatar">{recruiter.avatar}</div>
                    <h3 className="recruiter-name">{recruiter.name}</h3>
                    <p className="recruiter-title">{recruiter.title}</p>
                    <p className="recruiter-company">{recruiter.company}</p>
                    <p className="recruiter-location">
                      <i className="bi bi-geo-alt"></i> {recruiter.location}
                    </p>
                    <div className="recruiter-specialties">
                      {recruiter.specialties.map((spec, idx) => (
                        <span key={idx} className="specialty-tag">{spec}</span>
                      ))}
                    </div>
                    <div className="recruiter-contact">
                      <button 
                        className="recruiter-email-button"
                        onClick={() => handleEmailClick(recruiter.email)}
                      >
                        <i className="bi bi-envelope"></i>
                        {recruiter.email}
                      </button>
                      <button 
                        className="recruiter-phone-button"
                        onClick={() => handlePhoneClick(recruiter.phone)}
                      >
                        <i className="bi bi-telephone"></i>
                        {recruiter.phone}
                      </button>
                      <button 
                        className="recruiter-copy-button"
                        onClick={() => handleCopyEmail(recruiter.email)}
                        aria-label="Copy email"
                      >
                        <i className="bi bi-clipboard"></i>
                        Copy Email
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'settings' && (
            <div className="profile-section">
              <div className="section-header">
                <h2 className="section-title-large">Settings</h2>
                <p className="section-subtitle">Manage your account and preferences</p>
              </div>
              <div className="settings-grid">
                <button className="settings-button">
                  <i className="bi bi-person"></i>
                  <div className="settings-button-content">
                    <span className="settings-button-title">Edit Profile</span>
                    <span className="settings-button-desc">Update your personal information</span>
                  </div>
                  <i className="bi bi-chevron-right"></i>
                </button>
                <button className="settings-button">
                  <i className="bi bi-bell"></i>
                  <div className="settings-button-content">
                    <span className="settings-button-title">Notifications</span>
                    <span className="settings-button-desc">Manage notification preferences</span>
                  </div>
                  <i className="bi bi-chevron-right"></i>
                </button>
                <button className="settings-button">
                  <i className="bi bi-shield-lock"></i>
                  <div className="settings-button-content">
                    <span className="settings-button-title">Privacy & Security</span>
                    <span className="settings-button-desc">Control your privacy settings</span>
                  </div>
                  <i className="bi bi-chevron-right"></i>
                </button>
                <button className="settings-button">
                  <i className="bi bi-palette"></i>
                  <div className="settings-button-content">
                    <span className="settings-button-title">Appearance</span>
                    <span className="settings-button-desc">Theme and display settings</span>
                  </div>
                  <i className="bi bi-chevron-right"></i>
                </button>
                <button className="settings-button">
                  <i className="bi bi-download"></i>
                  <div className="settings-button-content">
                    <span className="settings-button-title">Export Data</span>
                    <span className="settings-button-desc">Download your account data</span>
                  </div>
                  <i className="bi bi-chevron-right"></i>
                </button>
                <button className="settings-button">
                  <i className="bi bi-question-circle"></i>
                  <div className="settings-button-content">
                    <span className="settings-button-title">Help & Support</span>
                    <span className="settings-button-desc">Get help and contact support</span>
                  </div>
                  <i className="bi bi-chevron-right"></i>
                </button>
                <button className="settings-button">
                  <i className="bi bi-info-circle"></i>
                  <div className="settings-button-content">
                    <span className="settings-button-title">About</span>
                    <span className="settings-button-desc">App version and information</span>
                  </div>
                  <i className="bi bi-chevron-right"></i>
                </button>
                <button className="settings-button danger">
                  <i className="bi bi-box-arrow-right"></i>
                  <div className="settings-button-content">
                    <span className="settings-button-title">Sign Out</span>
                    <span className="settings-button-desc">Sign out of your account</span>
                  </div>
                  <i className="bi bi-chevron-right"></i>
                </button>
              </div>
            </div>
          )}
        </div>
        </>
        )}

      {/* Contact Us Modal */}
      {showContactModal && (
        <div className="modal-overlay" onClick={() => setShowContactModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Contact Us</h2>
              <button 
                className="modal-close"
                onClick={() => setShowContactModal(false)}
                aria-label="Close"
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="contact-info-box">
                <h3>Get in Touch</h3>
                <div className="contact-details">
                  <div className="contact-detail-item">
                    <i className="bi bi-envelope"></i>
                    <div>
                      <strong>Email:</strong>
                      <a href={`mailto:${contactInfo.supportEmail}`}>{contactInfo.supportEmail}</a>
                    </div>
                  </div>
                  <div className="contact-detail-item">
                    <i className="bi bi-telephone"></i>
                    <div>
                      <strong>Phone:</strong>
                      <a href={`tel:${contactInfo.phone}`}>{contactInfo.phone}</a>
                    </div>
                  </div>
                  <div className="contact-detail-item">
                    <i className="bi bi-geo-alt"></i>
                    <div>
                      <strong>Address:</strong>
                      <span>{contactInfo.address}</span>
                    </div>
                  </div>
                  <div className="contact-detail-item">
                    <i className="bi bi-clock"></i>
                    <div>
                      <strong>Hours:</strong>
                      <span>{contactInfo.hours}</span>
                    </div>
                  </div>
                </div>
              </div>
              <form className="contact-form" onSubmit={handleContactSubmit}>
                <div className="form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    value={contactForm.name}
                    onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Subject</label>
                  <input
                    type="text"
                    value={contactForm.subject}
                    onChange={(e) => setContactForm({...contactForm, subject: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Message</label>
                  <textarea
                    value={contactForm.message}
                    onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                    rows="5"
                    required
                  ></textarea>
                </div>
                <div className="form-actions">
                  <button type="button" className="cancel-button" onClick={() => setShowContactModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="submit-button">
                    Send Message
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default Profile;
