import React, { useState } from 'react';
import './SkillFilters.css';

const SkillFilters = ({ selectedSkills = [], onSkillChange }) => {
  const defaultSkills = [
    'Data Analyst',
    'Data Engineer',
    'ETL Developer',
    'Power BI Developer',
    'Business/BI Analyst',
    'Data Scientist',
    'Database Administrator',
    'Machine Learning Engineer',
    'Data Architect',
    'BI Developer'
  ];

  const [showAll, setShowAll] = useState(false);
  const visibleSkills = showAll ? defaultSkills : defaultSkills.slice(0, 7);
  const remainingCount = defaultSkills.length - 7;

  const handleSkillClick = (skill) => {
    if (onSkillChange) {
      const newSkills = selectedSkills.includes(skill)
        ? selectedSkills.filter(s => s !== skill)
        : [...selectedSkills, skill];
      onSkillChange(newSkills);
    }
  };

  return (
    <div className="skill-filters">
      <div className="skill-filters-list">
        {visibleSkills.map(skill => (
          <button
            key={skill}
            className={`skill-pill ${selectedSkills.includes(skill) ? 'active' : ''}`}
            onClick={() => handleSkillClick(skill)}
          >
            {skill}
          </button>
        ))}
        {!showAll && remainingCount > 0 && (
          <button
            className="skill-pill-more"
            onClick={() => setShowAll(true)}
          >
            +{remainingCount}
          </button>
        )}
      </div>
      {selectedSkills.length > 0 && (
        <button
          className="edit-filters-btn"
          onClick={() => onSkillChange && onSkillChange([])}
        >
          <i className="bi bi-x-circle"></i>
          Clear ({selectedSkills.length})
        </button>
      )}
    </div>
  );
};

export default SkillFilters;
