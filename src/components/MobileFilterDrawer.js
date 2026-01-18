import React from 'react';
import './MobileFilterDrawer.css';

const MobileFilterDrawer = ({ filters, onFilterChange, isOpen, onClose, onClear }) => {
  const workingSchedules = [
    'Full-time',
    'Part-time',
    'Internship',
    'W-2'
  ];

  const employmentTypes = [
    'Full-time',
    'Part-time',
    'W-2',
    'Internship'
  ];

  const workStyles = [
    'Office',
    'Hybrid',
    'Remote'
  ];

  const handleCheckboxChange = (filterName, value) => {
    const currentValues = Array.isArray(filters[filterName]) ? filters[filterName] : [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    onFilterChange(filterName, newValues);
  };

  const handleSalaryRangeChange = (type, value) => {
    const newRange = [...filters.salaryRange];
    if (type === 'min') {
      newRange[0] = parseInt(value);
    } else {
      newRange[1] = parseInt(value);
    }
    onFilterChange('salaryRange', newRange);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="mobile-filter-overlay" onClick={onClose}></div>
      <div className="mobile-filter-drawer">
        <div className="mobile-filter-header">
          <h3>Filters</h3>
          <div className="mobile-filter-header-actions">
            {onClear && (
              <button className="reset-all-button" onClick={onClear}>Reset all</button>
            )}
            <button className="close-button" onClick={onClose}>✕</button>
          </div>
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
            <h4 className="filter-section-title">Employment type</h4>
            <div className="checkbox-group">
              {workingSchedules.map((schedule) => (
                <label key={schedule} className="checkbox-label">
                  <input
                    type="checkbox"
                    name="workingSchedule"
                    value={schedule}
                    checked={Array.isArray(filters.workingSchedule) && filters.workingSchedule.includes(schedule)}
                    onChange={() => handleCheckboxChange('workingSchedule', schedule)}
                    className="checkbox-input"
                  />
                  <span className="checkbox-text">{schedule}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="filter-section">
            <h4 className="filter-section-title">Salary range</h4>
            <div className="mobile-salary-wrapper">
              <div className="mobile-salary-inputs">
                <input
                  type="number"
                  className="mobile-salary-input"
                  value={filters.salaryRange[0]}
                  onChange={(e) => handleSalaryRangeChange('min', e.target.value)}
                  min="0"
                  max="100000"
                  placeholder="Min amount"
                />
                <span className="mobile-salary-separator">-</span>
                <input
                  type="number"
                  className="mobile-salary-input"
                  value={filters.salaryRange[1]}
                  onChange={(e) => handleSalaryRangeChange('max', e.target.value)}
                  min="0"
                  max="100000"
                  placeholder="Max amount"
                />
              </div>
            </div>
          </div>

          <div className="filter-section">
            <h4 className="filter-section-title">Latest jobs</h4>
            <select
              className="mobile-filter-select"
              value={filters.timeFilter || ''}
              onChange={(e) => onFilterChange('timeFilter', e.target.value)}
            >
              <option value="">All time</option>
              <option value="Last 24 hours">Last 24 hours</option>
              <option value="Today">Today</option>
              <option value="Last week">Last week</option>
              <option value="Last month">Last month</option>
            </select>
          </div>

          <div className="filter-section">
            <h4 className="filter-section-title">Employment type</h4>
            <div className="checkbox-group">
              {employmentTypes.map((type) => (
                <label key={type} className="checkbox-label">
                  <input
                    type="checkbox"
                    name="employmentType"
                    value={type}
                    checked={Array.isArray(filters.employmentType) && filters.employmentType.includes(type)}
                    onChange={() => handleCheckboxChange('employmentType', type)}
                    className="checkbox-input"
                  />
                  <span className="checkbox-text">{type}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="filter-section">
            <h4 className="filter-section-title">Work style</h4>
            <div className="checkbox-group">
              {workStyles.map((style) => (
                <label key={style} className="checkbox-label">
                  <input
                    type="checkbox"
                    name="workStyle"
                    value={style}
                    checked={Array.isArray(filters.workStyle) && filters.workStyle.includes(style)}
                    onChange={() => handleCheckboxChange('workStyle', style)}
                    className="checkbox-input"
                  />
                  <span className="checkbox-text">{style}</span>
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
