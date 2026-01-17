import React, { useState, useMemo } from 'react';
import Header from './Header';
import SearchFilterBar from './SearchFilterBar';
import JobListings from './JobListings';
import MobileNav from './MobileNav';
import MobileFilterDrawer from './MobileFilterDrawer';
import FilterPanel from './FilterPanel';
import { sampleJobs } from '../data/jobData';
import './Dashboard.css';

const Dashboard = ({ jobs: propJobs, setJobs: propSetJobs, onNavigate, user, onShowLogin, onShowSignUp, onLogout }) => {
  const [localJobs, setLocalJobs] = useState(sampleJobs);
  const jobs = propJobs || localJobs;
  // eslint-disable-next-line no-unused-vars
  const setJobs = propSetJobs || setLocalJobs;
  const [filters, setFilters] = useState({
    search: '',
    workLocation: '',
    experience: '',
    salaryRange: [1000, 50000],
    workingSchedule: '',
    employmentType: ''
  });
  const [appliedFilters, setAppliedFilters] = useState({
    search: '',
    workLocation: '',
    experience: '',
    salaryRange: [1000, 50000],
    workingSchedule: '',
    employmentType: ''
  });
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [timeFilter, setTimeFilter] = useState('Latest');

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const handleFilterClick = () => {
    // On mobile, use drawer; on desktop, use panel
    if (window.innerWidth <= 768) {
      setIsFilterDrawerOpen(true);
    } else {
      setIsFilterPanelOpen(true);
    }
  };

  const handleApplyFilters = () => {
    // Apply all current filters when filter button/panel is closed
    setAppliedFilters({ ...filters });
    setIsFilterPanelOpen(false);
    setIsFilterDrawerOpen(false);
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      search: '',
      workLocation: '',
      experience: '',
      salaryRange: [1000, 50000],
      workingSchedule: '',
      employmentType: ''
    };
    setFilters(clearedFilters);
    setAppliedFilters(clearedFilters);
    setIsFilterPanelOpen(false);
    setIsFilterDrawerOpen(false);
  };

  // Handle time-based sorting
  const handleSortChange = (sortValue) => {
    setTimeFilter(sortValue);
  };

  // Filter and sort jobs based on applied filters
  const filteredJobs = useMemo(() => {
    let filtered = [...jobs];

    // Time-based filtering
    if (timeFilter && timeFilter !== 'Latest') {
      const now = new Date();
      let cutoffDate;

      switch (timeFilter) {
        case 'Last 24 hours':
          cutoffDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case 'Last week':
          cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'Last month':
          cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          cutoffDate = null;
      }

      if (cutoffDate) {
        filtered = filtered.filter(job => {
          if (!job.timestamp && !job.created_at) return false;
          const jobDate = new Date(job.timestamp || job.created_at);
          return jobDate >= cutoffDate;
        });
      }
    }

    // Search filter
    if (appliedFilters.search) {
      const searchLower = appliedFilters.search.toLowerCase();
      filtered = filtered.filter(job => 
        job.title.toLowerCase().includes(searchLower) ||
        job.company.toLowerCase().includes(searchLower) ||
        job.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // Location filter
    if (appliedFilters.workLocation) {
      const locationLower = appliedFilters.workLocation.toLowerCase();
      filtered = filtered.filter(job => {
        const jobLocation = job.location.toLowerCase();
        if (locationLower === 'remote') {
          return job.tags.some(tag => 
            tag.toLowerCase().includes('remote') || 
            tag.toLowerCase().includes('distant')
          );
        } else if (locationLower === 'new-york') {
          return jobLocation.includes('new york');
        } else if (locationLower === 'california') {
          return jobLocation.includes('california');
        } else if (locationLower === 'san-francisco') {
          return jobLocation.includes('san francisco');
        }
        return jobLocation.includes(locationLower);
      });
    }

    // Experience filter
    if (appliedFilters.experience) {
      filtered = filtered.filter(job => 
        job.tags.some(tag => {
          const tagLower = tag.toLowerCase();
          const expLower = appliedFilters.experience.toLowerCase();
          return tagLower.includes(expLower) || tagLower.includes(expLower + ' level');
        })
      );
    }

    // Salary filter - extract numeric value from salary string
    if (appliedFilters.salaryRange) {
      filtered = filtered.filter(job => {
        const salaryStr = job.salary || '';
        // Extract numbers from salary (e.g., "$1200/hr" -> 1200)
        const salaryMatch = salaryStr.match(/\$?(\d+)/);
        if (salaryMatch) {
          const salaryValue = parseInt(salaryMatch[1]);
          // If it's per hour, multiply by 160 (approx monthly hours)
          const monthlySalary = salaryStr.includes('/hr') ? salaryValue * 160 : salaryValue;
          return monthlySalary >= appliedFilters.salaryRange[0] && 
                 monthlySalary <= appliedFilters.salaryRange[1];
        }
        return true; // Include jobs without salary info
      });
    }

    // Working schedule filter
    if (appliedFilters.workingSchedule) {
      filtered = filtered.filter(job => 
        job.tags.includes(appliedFilters.workingSchedule)
      );
    }

    // Employment type filter
    if (appliedFilters.employmentType) {
      filtered = filtered.filter(job => 
        job.tags.includes(appliedFilters.employmentType)
      );
    }

    // Sort jobs based on selected sort option
    filtered.sort((a, b) => {
      if (timeFilter === 'Salary (High to Low)' || timeFilter === 'Salary (Low to High)') {
        // Sort by salary
        const getSalaryValue = (job) => {
          const salaryStr = job.salary || '';
          const salaryMatch = salaryStr.match(/\$?(\d+)/);
          if (salaryMatch) {
            const salaryValue = parseInt(salaryMatch[1]);
            return salaryStr.includes('/hr') ? salaryValue * 160 : salaryValue;
          }
          return 0;
        };

        const salaryA = getSalaryValue(a);
        const salaryB = getSalaryValue(b);

        if (timeFilter === 'Salary (High to Low)') {
          return salaryB - salaryA;
        } else {
          return salaryA - salaryB;
        }
      } else {
        // Sort by date (newest first)
        const dateA = new Date(a.timestamp || a.created_at || 0);
        const dateB = new Date(b.timestamp || b.created_at || 0);
        return dateB - dateA;
      }
    });

    return filtered;
  }, [jobs, appliedFilters, timeFilter]);

  return (
    <div className="dashboard">
      <Header 
        onNavigate={onNavigate} 
        user={user}
        onShowLogin={onShowLogin}
        onShowSignUp={onShowSignUp}
        onLogout={onLogout}
      />
      <SearchFilterBar 
        filters={filters}
        onFilterChange={handleFilterChange}
        appliedFilters={appliedFilters}
      />
      <div className="dashboard-content">
        <JobListings 
          jobs={filteredJobs} 
          onFilterClick={handleFilterClick}
          onSortChange={handleSortChange}
        />
      </div>
      <MobileNav onNavigate={onNavigate} />
      <FilterPanel
        filters={filters}
        onFilterChange={handleFilterChange}
        isOpen={isFilterPanelOpen}
        onClose={handleApplyFilters}
        onClear={handleClearFilters}
      />
      <MobileFilterDrawer 
        filters={filters}
        onFilterChange={handleFilterChange}
        isOpen={isFilterDrawerOpen}
        onClose={handleApplyFilters}
        onClear={handleClearFilters}
      />
    </div>
  );
};

export default Dashboard;
