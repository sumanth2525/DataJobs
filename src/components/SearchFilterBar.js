import React from 'react';
import './SearchFilterBar.css';

const SearchFilterBar = ({ filters, onFilterChange, appliedFilters }) => {
  // Count active filters (excluding search)
  const activeFilterCount = [
    appliedFilters.workLocation,
    appliedFilters.experience,
    appliedFilters.workingSchedule,
    appliedFilters.employmentType,
    (appliedFilters.salaryRange && (appliedFilters.salaryRange[0] > 1000 || appliedFilters.salaryRange[1] < 50000))
  ].filter(Boolean).length;

  return (
    <div className="search-filter-bar">
      <div className="search-filter-container">
        <div className="search-input-wrapper">
          <i className="bi bi-search search-icon"></i>
          <input
            type="text"
            className="search-input"
            placeholder="Data Analyst, Data Scientist, Data Engineer..."
            value={filters.search}
            onChange={(e) => onFilterChange('search', e.target.value)}
          />
        </div>
        {activeFilterCount > 0 && (
          <div className="active-filters-badge">
            {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} active
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchFilterBar;
