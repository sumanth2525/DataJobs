import React from 'react';
import './FiltersSidebar.css';

const FiltersSidebar = ({ filters, onFilterChange }) => {
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
    <div className="filters-sidebar">
      <h3 className="filters-title">Filters</h3>
      
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
  );
};

export default FiltersSidebar;
