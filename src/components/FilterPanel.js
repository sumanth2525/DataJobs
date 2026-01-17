import React from 'react';
import './FilterPanel.css';

const FilterPanel = ({ filters, onFilterChange, isOpen, onClose, onClear }) => {
  if (!isOpen) return null;

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

  return (
    <div className="filter-panel-overlay" onClick={onClose}>
      <div className="filter-panel" onClick={(e) => e.stopPropagation()}>
        <div className="filter-panel-header">
          <h3>
            <i className="bi bi-funnel-fill"></i>
            Filters
          </h3>
          <button className="filter-panel-close" onClick={onClose}>
            <i className="bi bi-x-lg"></i>
          </button>
        </div>
        
        <div className="filter-panel-content">
          <div className="filter-section">
            <h4 className="filter-section-title">Search Jobs</h4>
            <input
              type="text"
              className="filter-panel-search"
              placeholder="Search by job title, company, or tags..."
              value={filters.search}
              onChange={(e) => onFilterChange('search', e.target.value)}
            />
          </div>

          <div className="filter-section">
            <h4 className="filter-section-title">Work Location</h4>
            <select
              className="filter-panel-select"
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
              className="filter-panel-select"
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
            <div className="salary-filter-wrapper">
              <div className="salary-display">
                <span>${filters.salaryRange[0].toLocaleString()} - ${filters.salaryRange[1].toLocaleString()}</span>
              </div>
              <div className="salary-inputs">
                <input
                  type="range"
                  className="salary-slider"
                  min="1000"
                  max="100000"
                  step="1000"
                  value={filters.salaryRange[0]}
                  onChange={(e) => onFilterChange('salaryRange', [parseInt(e.target.value), filters.salaryRange[1]])}
                />
                <input
                  type="range"
                  className="salary-slider"
                  min="1000"
                  max="100000"
                  step="1000"
                  value={filters.salaryRange[1]}
                  onChange={(e) => onFilterChange('salaryRange', [filters.salaryRange[0], parseInt(e.target.value)])}
                />
              </div>
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
        
        <div className="filter-panel-footer">
          <button className="clear-filters-btn" onClick={onClear}>
            Clear All Filters
          </button>
          <button className="apply-filters-btn" onClick={onClose}>
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;
