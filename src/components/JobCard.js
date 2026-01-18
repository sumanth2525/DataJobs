import React, { useState } from 'react';
import { getTimeAgo, formatDate } from '../utils/timeUtils';
import './JobCard.css';

const JobCard = ({ job }) => {
  const [isLiked, setIsLiked] = useState(false);

  const handleDetailsClick = () => {
    if (job.link) {
      window.open(job.link, '_blank', 'noopener,noreferrer');
    } else {
      alert(`Viewing details for:\n${job.title}\n${job.company}\n${job.location}\n${job.salary}`);
    }
  };

  const handleLike = (e) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
  };

  // Format date for display (e.g., "5 September")
  const formatJobDate = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const day = date.getDate();
    const month = date.toLocaleDateString('en-US', { month: 'long' });
    return `${day} ${month}`;
  };

  // Calculate applicants (mock - can be from API)
  const applicants = Math.floor(Math.random() * 200) + 10;

  // Get pastel color class based on job index
  const getCardColorClass = (index) => {
    const colors = ['purple', 'blue', 'green', 'pink', 'grey'];
    return colors[index % colors.length];
  };

  const cardColorClass = getCardColorClass(job.id % 5);
  const formattedDate = formatJobDate(job.timestamp || job.date);

  return (
    <div className={`job-card-wrapper job-card-${cardColorClass}`}>
      <div className="job-card">
        {/* Header: Logo and Heart Icon */}
        <div className="job-card-header">
          {/* Company Logo - Top Left */}
          <div className="job-logo-top">
            <div className="company-logo-square">{job.companyLogo || job.company?.charAt(0).toUpperCase() || '?'}</div>
          </div>

          {/* Heart Icon - Top Right */}
          <button 
            className={`job-like-top-button ${isLiked ? 'active' : ''}`} 
            onClick={handleLike} 
            title="Save job"
          >
            <i className={`bi ${isLiked ? 'bi-heart-fill' : 'bi-heart'}`}></i>
          </button>
        </div>

        {/* Job Content */}
        <div className="job-card-content">
          {/* Job Title */}
          <h2 className="job-title">{job.title}</h2>
          
          {/* Company Name */}
          <h3 className="company-name">{job.company}</h3>

          {/* Job Meta: Tags or Location/Type */}
          <div className="job-meta">
            {job.tags && job.tags.length > 0 ? (
              <div className="job-meta-tags">
                <span className="job-meta-tag">{job.tags[0]}</span>
                <span className="job-meta-separator">•</span>
                <span className="job-meta-tag">
                  {job.location?.includes('Remote') ? 'Remote' : 'Full Time'}
                </span>
              </div>
            ) : (
              <div className="job-location">
                <i className="bi bi-geo-alt-fill"></i>
                <span>{job.location || 'Not specified'}</span>
              </div>
            )}
          </div>

          {/* Action Button */}
          <div className="job-actions-bottom">
            <button className="job-apply-button" onClick={(e) => { e.stopPropagation(); handleDetailsClick(); }}>
              Apply now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobCard;
