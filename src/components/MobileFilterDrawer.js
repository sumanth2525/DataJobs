import React from 'react';
import './MobileFilterDrawer.css';

const MobileFilterDrawer = ({ filters, onFilterChange, isOpen, onClose, onClear }) => {
  const workingSchedules = [
    'Full time',
    'Part time',
    'Internship',
    'Project work',
    'Volunteering'
  ];

  const employmentTypes = [
    'Full day',
    'Flexible schedule',
    'Shift work',
    'Remote work',
    'Shift method'
  ];

  if (!isOpen) return null;

  return (
    <>
      <div className="mobile-filter-overlay" onClick={onClose}></div>
      <div className="mobile-filter-drawer">
        <div className="mobile-filter-header">
          <h3>Filters</h3>
          <button className="close-button" onClick={onClose}>✕</button>
        </div>
        
        <div className="mobile-filter-content">
          <div className="filter-section">
            <h4 className="filter-section-title">Search Jobs</h4>
            <input
              type="text"
              className="mobile-filter-search"
              placeholder="Search by job title, company, or tags..."
              value={filters.search}
              onChange={(e) => onFilterChange('search', e.target.value)}
            />
          </div>

          <div className="filter-section">
            <h4 className="filter-section-title">Work Location</h4>
            <select
              className="mobile-filter-select"
              value={filters.workLocation}
              onChange={(e) => onFilterChange('workLocation', e.target.value)}
            >
              <option value="">All Locations</option>
              <option value="remote">Remote</option>
              <option value="new-york">New York, NY</option>
              <option value="california">California, CA</option>
              <option value="san-francisco">San Francisco, CA</option>
            </select>
          </div>

          <div className="filter-section">
            <h4 className="filter-section-title">Experience Level</h4>
            <select
              className="mobile-filter-select"
              value={filters.experience}
              onChange={(e) => onFilterChange('experience', e.target.value)}
            >
              <option value="">All Levels</option>
              <option value="junior">Junior</option>
              <option value="middle">Middle</option>
              <option value="senior">Senior</option>
            </select>
          </div>

          <div className="filter-section">
            <h4 className="filter-section-title">Salary Range</h4>
            <div className="mobile-salary-wrapper">
              <div className="mobile-salary-display">
                ${filters.salaryRange[0].toLocaleString()} - ${filters.salaryRange[1].toLocaleString()}
              </div>
              <input
                type="range"
                className="mobile-salary-slider"
                min="1000"
                max="100000"
                step="1000"
                value={filters.salaryRange[0]}
                onChange={(e) => onFilterChange('salaryRange', [parseInt(e.target.value), filters.salaryRange[1]])}
              />
              <input
                type="range"
                className="mobile-salary-slider"
                min="1000"
                max="100000"
                step="1000"
                value={filters.salaryRange[1]}
                onChange={(e) => onFilterChange('salaryRange', [filters.salaryRange[0], parseInt(e.target.value)])}
              />
            </div>
          </div>

          <div className="filter-section">
            <h4 className="filter-section-title">Working schedule</h4>
            <div className="radio-group">
              {workingSchedules.map((schedule) => (
                <label key={schedule} className="radio-label">
                  <input
                    type="radio"
                    name="workingSchedule"
                    value={schedule}
                    checked={filters.workingSchedule === schedule}
                    onChange={(e) => onFilterChange('workingSchedule', e.target.value)}
                    className="radio-input"
                  />
                  <span className="radio-text">{schedule}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="filter-section">
            <h4 className="filter-section-title">Employment type</h4>
            <div className="radio-group">
              {employmentTypes.map((type) => (
                <label key={type} className="radio-label">
                  <input
                    type="radio"
                    name="employmentType"
                    value={type}
                    checked={filters.employmentType === type}
                    onChange={(e) => onFilterChange('employmentType', e.target.value)}
                    className="radio-input"
                  />
                  <span className="radio-text">{type}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        
        <div className="mobile-filter-footer">
          <button className="clear-filters-button" onClick={onClear}>
            Clear All
          </button>
          <button className="apply-filters-button" onClick={onClose}>
            Apply Filters
          </button>
        </div>
      </div>
    </>
  );
};

export default MobileFilterDrawer;
