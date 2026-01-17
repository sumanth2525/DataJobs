import React from 'react';
import { getTimeAgo } from '../utils/timeUtils';
import './JobCard.css';

const JobCard = ({ job }) => {
  const getCardColorClass = (index) => {
    const colors = ['peach', 'green', 'purple', 'blue', 'pink', 'grey'];
    return colors[index % colors.length];
  };

  const handleDetailsClick = () => {
    if (job.link) {
      window.open(job.link, '_blank', 'noopener,noreferrer');
    } else {
      console.log(`Viewing details for: ${job.title} at ${job.company}`);
      alert(`Viewing details for:\n${job.title}\n${job.company}\n${job.location}\n${job.salary}`);
    }
  };

  const handleCardClick = () => {
    // Optional: Make the whole card clickable
    // handleDetailsClick();
  };

  const timeAgo = job.timestamp ? getTimeAgo(job.timestamp) : null;
  const isNew = job.timestamp && (new Date() - new Date(job.timestamp)) < 3600000; // Less than 1 hour old

  return (
    <div className={`job-card job-card-${getCardColorClass(job.id % 6)}`} onClick={handleCardClick}>
      <div className="job-card-header">
        <div className="job-date-wrapper">
          {timeAgo && (
            <span className={`job-time-ago ${isNew ? 'new' : ''}`}>
              {isNew && <i className="bi bi-star-fill" style={{marginRight: '4px'}}></i>}
              Posted {timeAgo}
            </span>
          )}
          <span className="job-date">{job.date}</span>
        </div>
        <div className="company-logo">{job.companyLogo}</div>
      </div>
      
      <div className="job-card-body">
        <h3 className="company-name">{job.company}</h3>
        <h4 className="job-title">{job.title}</h4>
        
        <div className="job-tags">
          {job.tags.map((tag, index) => (
            <span key={index} className="job-tag">{tag}</span>
          ))}
        </div>
        
        <div className="job-details">
          <div className="job-salary">{job.salary}</div>
          <div className="job-location">
            <i className="bi bi-geo-alt-fill" style={{marginRight: '4px'}}></i>
            {job.location}
          </div>
        </div>
      </div>
      
      <button className="job-details-button" onClick={(e) => { e.stopPropagation(); handleDetailsClick(); }}>
        {job.link ? 'Apply Now' : 'Details'}
      </button>
    </div>
  );
};

export default JobCard;
