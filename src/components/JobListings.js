import React, { useState } from 'react';
import JobCard from './JobCard';
import './JobListings.css';

const JobListings = ({ jobs, onFilterClick, showFilterButton = true, onSortChange }) => {
  const [sortBy, setSortBy] = useState('Latest');

  const handleSortChange = (e) => {
    const sortValue = e.target.value;
    setSortBy(sortValue);
    if (onSortChange) {
      onSortChange(sortValue);
    }
  };

  const handleFilterClick = () => {
    if (onFilterClick) {
      onFilterClick();
    } else {
      console.log('Filter button clicked');
      alert('Filter options');
    }
  };

  return (
    <div className="job-listings">
      <div className="job-listings-header">
        <div className="job-listings-title-section">
          <h2 className="job-listings-title">Recommended jobs</h2>
          <span className="job-count">{jobs.length}</span>
        </div>
        <div className="job-listings-controls">
          <div className="sort-control">
            <span className="sort-label">Sort by:</span>
            <select className="sort-dropdown" value={sortBy} onChange={handleSortChange}>
              <option value="Latest">Latest</option>
              <option value="Last 24 hours">Last 24 hours</option>
              <option value="Last week">Last week</option>
              <option value="Last month">Last month</option>
              <option value="Salary (High to Low)">Salary (High to Low)</option>
              <option value="Salary (Low to High)">Salary (Low to High)</option>
            </select>
          </div>
          {showFilterButton && (
            <button className="filter-icon-button" onClick={handleFilterClick}>
              <i className="bi bi-funnel-fill"></i>
              <span className="filter-button-text">Filters</span>
            </button>
          )}
        </div>
      </div>
      
      <div className="job-grid">
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>
    </div>
  );
};

export default JobListings;
