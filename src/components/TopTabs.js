import React from 'react';
import './TopTabs.css';

const TopTabs = ({ activeTab = 'recommended', onTabChange, stats = {} }) => {
  const tabs = [
    { id: 'recommended', label: 'Recommended', count: null },
    { id: 'liked', label: 'Liked', count: stats.liked || 0 },
    { id: 'applied', label: 'Applied', count: stats.applied || 0 },
    { id: 'external', label: 'External', count: stats.external || 0 }
  ];

  return (
    <div className="top-tabs">
      {tabs.map(tab => (
        <button
          key={tab.id}
          className={`tab-item ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => onTabChange && onTabChange(tab.id)}
        >
          {tab.id === 'recommended' && activeTab === 'recommended' && (
            <span className="tab-breadcrumb">JOBS</span>
          )}
          <span className="tab-label">{tab.label}</span>
          {tab.count !== null && tab.count > 0 && (
            <span className="tab-count">{tab.count}</span>
          )}
        </button>
      ))}
    </div>
  );
};

export default TopTabs;
