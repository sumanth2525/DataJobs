import React from 'react';
import './CompanyPostLink.css';

const CompanyPostLink = () => {
  return (
    <div className="company-post-link-banner">
      <div className="banner-content">
        <i className="bi bi-building banner-icon"></i>
        <div className="banner-text">
          <strong>Are you a company?</strong>
          <span>Post your job openings and reach qualified candidates</span>
        </div>
        <a 
          href="#post-job" 
          className="post-job-link-btn"
          onClick={(e) => {
            e.preventDefault();
            window.location.hash = '#post-job';
          }}
        >
          Post a Job
        </a>
      </div>
    </div>
  );
};

export default CompanyPostLink;
