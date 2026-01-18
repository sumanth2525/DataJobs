import React, { useState } from 'react';
import './MobileHome.css';

const MobileHome = ({ jobs = [], user, onNavigate, onFilterClick }) => {
  const [savedJobs, setSavedJobs] = useState(new Set());

  const handleSaveJob = (jobId, e) => {
    e.stopPropagation();
    setSavedJobs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(jobId)) {
        newSet.delete(jobId);
      } else {
        newSet.add(jobId);
      }
      return newSet;
    });
  };

  const handleJobClick = (job) => {
    if (job.link) {
      window.open(job.link, '_blank');
    }
  };

  // Categories data - Only Data-related jobs
  const categories = [
    { icon: 'bi-database', label: 'Data', color: '#4FACFE' },
    { icon: 'bi-cpu', label: 'AI/ML', color: '#667EEA' },
    { icon: 'bi-graph-up', label: 'Analytics', color: '#43E97B' },
    { icon: 'bi-diagram-3', label: 'Data Science', color: '#FA709A' }
  ];

  // Get featured jobs (first 5)
  const featuredJobs = jobs.slice(0, 5);

  // Get recommended jobs (next 8)
  const recommendedJobs = jobs.slice(0, 8);

  return (
    <div className="mobile-home">
      {/* Top Header with Greeting */}
      <header className="mobile-home-header">
        <div className="mobile-home-header-content">
          <div className="mobile-home-greeting">
            <h1 className="mobile-home-greeting-text">Hello 👋</h1>
            <p className="mobile-home-subtext">Let's find your dream job</p>
          </div>
          <div className="mobile-home-avatar">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mobile-home-content">
        {/* Search Bar */}
        <div className="mobile-home-search-wrapper">
          <div className="mobile-home-search-bar" onClick={() => onFilterClick?.()}>
            <i className="bi bi-search mobile-home-search-icon"></i>
            <input
              type="text"
              className="mobile-home-search-input"
              placeholder="Search job title, company, or skills"
              readOnly
            />
            <button className="mobile-home-filter-btn" onClick={(e) => { e.stopPropagation(); onFilterClick?.(); }}>
              <i className="bi bi-funnel-fill"></i>
            </button>
          </div>
        </div>

        {/* Top Recommended Jobs - Horizontal Scroll */}
        <section className="mobile-home-section">
          <h2 className="mobile-home-section-title">Top Recommended Jobs</h2>
          <div className="mobile-home-jobs-scroll">
            {recommendedJobs.map((job) => (
              <div
                key={job.id}
                className="mobile-home-job-card"
                onClick={() => handleJobClick(job)}
              >
                <div className="mobile-home-job-card-header">
                  <div className="mobile-home-job-logo">{job.companyLogo || job.company?.charAt(0).toUpperCase() || '?'}</div>
                  <button
                    className={`mobile-home-job-save ${savedJobs.has(job.id) ? 'saved' : ''}`}
                    onClick={(e) => handleSaveJob(job.id, e)}
                  >
                    <i className={`bi ${savedJobs.has(job.id) ? 'bi-heart-fill' : 'bi-heart'}`}></i>
                  </button>
                </div>
                <div className="mobile-home-job-card-content">
                  <h3 className="mobile-home-job-title">{job.title}</h3>
                  <p className="mobile-home-job-company">{job.company}</p>
                  <div className="mobile-home-job-meta">
                    <span className="mobile-home-job-experience">
                      {job.tags?.[0] || '3+ years'}
                    </span>
                    <span className="mobile-home-job-separator">•</span>
                    <span className="mobile-home-job-type">Remote / Full Time</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Browse by Categories - Grid */}
        <section className="mobile-home-section">
          <h2 className="mobile-home-section-title">Browse by Categories</h2>
          <div className="mobile-home-categories-grid">
            {categories.map((category, index) => (
              <div
                key={index}
                className="mobile-home-category-card"
                onClick={() => {
                  // Navigate to filtered jobs by category
                  onNavigate?.('dashboard');
                }}
              >
                <div className="mobile-home-category-icon" style={{ backgroundColor: `${category.color}15`, color: category.color }}>
                  <i className={`bi ${category.icon}`}></i>
                </div>
                <span className="mobile-home-category-label">{category.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Featured Jobs - Vertical List */}
        <section className="mobile-home-section">
          <h2 className="mobile-home-section-title">Featured Jobs</h2>
          <div className="mobile-home-featured-list">
            {featuredJobs.map((job) => (
              <div
                key={job.id}
                className="mobile-home-featured-item"
                onClick={() => handleJobClick(job)}
              >
                <div className="mobile-home-featured-logo">{job.companyLogo || job.company?.charAt(0).toUpperCase() || '?'}</div>
                <div className="mobile-home-featured-content">
                  <h3 className="mobile-home-featured-title">{job.title}</h3>
                  <p className="mobile-home-featured-company">{job.company}</p>
                  <div className="mobile-home-featured-meta">
                    <span className="mobile-home-featured-type">
                      {job.location?.includes('Remote') ? 'Remote' : 'Full Time'}
                    </span>
                    {job.location && !job.location.includes('Remote') && (
                      <>
                        <span className="mobile-home-featured-separator">•</span>
                        <span className="mobile-home-featured-location">{job.location}</span>
                      </>
                    )}
                    {job.timestamp && (
                      <>
                        <span className="mobile-home-featured-separator">•</span>
                        <span className="mobile-home-featured-time">
                          Posted {new Date(job.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at {new Date(job.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <button
                  className={`mobile-home-featured-bookmark ${savedJobs.has(job.id) ? 'saved' : ''}`}
                  onClick={(e) => handleSaveJob(job.id, e)}
                >
                  <i className={`bi ${savedJobs.has(job.id) ? 'bi-bookmark-fill' : 'bi-bookmark'}`}></i>
                </button>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default MobileHome;
