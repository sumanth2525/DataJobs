import React from 'react';
import './PromotionalBanner.css';

const PromotionalBanner = () => {
  const handleLearnMore = () => {
    // console.log('Learn more clicked'); // Removed by Issue Fixer Agent
    // In a real app, this would navigate to an about page or open a modal
    alert('Learn more about DataJobPortal!\n\nWe help you find the best data roles:\n- Data Analysts\n- Data Scientists\n- Data Engineers\n- And more!');
  };

  return (
    <div className="promotional-banner">
      <div className="banner-content">
        <h2 className="banner-title">Get Your Best Data Role with DataJobPortal</h2>
        <button className="banner-button" onClick={handleLearnMore}>Learn more</button>
      </div>
    </div>
  );
};

export default PromotionalBanner;
