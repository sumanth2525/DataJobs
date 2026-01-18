import React from 'react';
import './FiltersSidebar.css';

const FiltersSidebar = ({ filters, onFilterChange, onClear }) => {
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

  return (
    <div className="filters-sidebar">
      <div className="filters-header">
        <h3 className="filters-title">Filters</h3>
        {onClear && (
          <button className="reset-all-btn" onClick={onClear}>Reset all</button>
        )}
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
        <div className="salary-range-container">
          <div className="salary-inputs">
            <input
              type="number"
              className="salary-input"
              value={filters.salaryRange[0]}
              onChange={(e) => handleSalaryRangeChange('min', e.target.value)}
              min="0"
              max="100000"
            />
            <span className="salary-separator">-</span>
            <input
              type="number"
              className="salary-input"
              value={filters.salaryRange[1]}
              onChange={(e) => handleSalaryRangeChange('max', e.target.value)}
              min="0"
              max="100000"
            />
          </div>
          <div className="salary-slider-wrapper">
            <input
              type="range"
              className="salary-slider"
              min="0"
              max="100000"
              step="1000"
              value={filters.salaryRange[0]}
              onChange={(e) => handleSalaryRangeChange('min', e.target.value)}
            />
            <input
              type="range"
              className="salary-slider"
              min="0"
              max="100000"
              step="1000"
              value={filters.salaryRange[1]}
              onChange={(e) => handleSalaryRangeChange('max', e.target.value)}
            />
          </div>
        </div>
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
  );
};

export default FiltersSidebar;
