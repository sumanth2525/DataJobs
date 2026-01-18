import React from 'react';
import './SearchFilterBar.css';

const SearchFilterBar = ({ filters, onFilterChange, appliedFilters, onRemoveFilter }) => {
  // Get active filter labels
  const getActiveFilterPills = () => {
    const pills = [];

    // Work Location
    if (appliedFilters.workLocation) {
      const locationLabels = {
        'new-york': 'United States',
        'california': 'California',
        'remote': 'Remote',
        'san-francisco': 'San Francisco'
      };
      const label = locationLabels[appliedFilters.workLocation] || appliedFilters.workLocation;
      pills.push({ key: 'workLocation', label, value: appliedFilters.workLocation });
    }

    // Experience
    if (appliedFilters.experience) {
      const experienceLabels = {
        'entry': '0-2 years',
        'mid': '3-5 years',
        'senior': '5+ years experience',
        'junior': '1-3 years'
      };
      const label = experienceLabels[appliedFilters.experience] || appliedFilters.experience;
      pills.push({ key: 'experience', label, value: appliedFilters.experience });
    }

    return pills;
  };

  const handleRemoveFilterClick = (filterKey) => {
    if (onRemoveFilter) {
      onRemoveFilter(filterKey);
    } else {
      // Fallback: just update filters if onRemoveFilter not provided
      if (Array.isArray(appliedFilters[filterKey])) {
        onFilterChange(filterKey, []);
      } else {
        onFilterChange(filterKey, '');
      }
    }
  };

  const activeFilterPills = getActiveFilterPills();

  return (
    <div className="search-filter-bar">
      <div className="search-filter-container">
        <div className="search-input-wrapper">
          <i className="bi bi-search search-icon"></i>
          <input
            type="text"
            className="search-input"
            placeholder="UX/UI Designer"
            value={filters.search}
            onChange={(e) => onFilterChange('search', e.target.value)}
          />
        </div>
      </div>
      {activeFilterPills.length > 0 && (
        <div className="active-filters-pills">
          {activeFilterPills.map((pill) => (
            <div key={pill.key} className="active-filter-pill">
              <span className="filter-pill-label">{pill.label}</span>
              <button
                className="filter-pill-remove"
                onClick={() => handleRemoveFilterClick(pill.key)}
                aria-label={`Remove ${pill.label} filter`}
              >
                <i className="bi bi-x"></i>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchFilterBar;
