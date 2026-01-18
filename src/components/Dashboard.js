import React, { useState, useMemo, useEffect } from 'react';
import Header from './Header';
import SearchFilterBar from './SearchFilterBar';
import JobListings from './JobListings';
import FiltersSidebar from './FiltersSidebar';
import MobileNav from './MobileNav';
import MobileFilterDrawer from './MobileFilterDrawer';
import MobileHome from './MobileHome';
import FilterPanel from './FilterPanel';
import { sampleJobs } from '../data/jobData';
import { jobsAPI } from '../lib/api';
import './Dashboard.css';

const Dashboard = ({ jobs: propJobs, setJobs: propSetJobs, onNavigate, user, onShowLogin, onShowSignUp, onLogout }) => {
  const [localJobs] = useState(sampleJobs);
  const jobs = propJobs || localJobs;
  const [filters, setFilters] = useState({
    search: '',
    workLocation: '',
    experience: '',
    salaryRange: [2500, 10000],
    workingSchedule: [],
    employmentType: [],
    workStyle: [],
    timeFilter: ''
  });
  const [appliedFilters, setAppliedFilters] = useState({
    search: '',
    workLocation: '',
    experience: '',
    salaryRange: [2500, 10000],
    workingSchedule: [],
    employmentType: [],
    workStyle: []
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

  const handleRemoveFilter = (filterName) => {
    // Remove filter from both filters and appliedFilters
    const updatedFilters = { ...filters };
    const updatedAppliedFilters = { ...appliedFilters };
    
    if (Array.isArray(updatedFilters[filterName])) {
      updatedFilters[filterName] = [];
      updatedAppliedFilters[filterName] = [];
    } else {
      updatedFilters[filterName] = '';
      updatedAppliedFilters[filterName] = '';
    }
    
    setFilters(updatedFilters);
    setAppliedFilters(updatedAppliedFilters);
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      search: '',
      workLocation: '',
      experience: '',
      salaryRange: [2500, 10000],
      workingSchedule: [],
      employmentType: [],
      workStyle: [],
      timeFilter: ''
    };
    setFilters(clearedFilters);
    setAppliedFilters(clearedFilters);
    setIsFilterPanelOpen(false);
    setIsFilterDrawerOpen(false);
  };

  // Handle time-based sorting - refetch jobs from API when filter changes
  const handleSortChange = async (sortValue) => {
    setTimeFilter(sortValue);
    // Also update the timeFilter in filters
    setFilters(prev => ({ ...prev, timeFilter: sortValue }));
    
    // If timeFilter is a time-based filter (not salary sort), refetch from API
    if (sortValue === 'Latest' || sortValue === 'Last 24 hours' || sortValue === 'Today' || sortValue === 'Last week' || sortValue === 'Last month') {
      try {
        // Fetch jobs with timeFilter from backend
        const response = await jobsAPI.getAll({ timeFilter: sortValue });
        
        if (response && response.success && response.data && Array.isArray(response.data)) {
          // Transform database format to UI format
          const transformedJobs = response.data.map(job => ({
            id: job.id,
            company: job.company,
            companyLogo: job.company_logo || job.company?.charAt(0).toUpperCase() || '?',
            title: job.title,
            location: job.location,
            salary: job.salary,
            tags: job.tags || [],
            link: job.link,
            description: job.description,
            timestamp: job.created_at,
            date: job.created_at 
              ? new Date(job.created_at).toLocaleDateString('en-US', { 
                  day: 'numeric', 
                  month: 'short', 
                  year: 'numeric' 
                })
              : new Date().toLocaleDateString('en-US', { 
                  day: 'numeric', 
                  month: 'short', 
                  year: 'numeric' 
                })
          }));
          
          // Update jobs state if setJobs is available (from App.js)
          if (propSetJobs) {
            propSetJobs(transformedJobs);
          }
        }
      } catch (error) {
        console.error('Error fetching jobs with timeFilter:', error);
        // Fall back to client-side filtering if API call fails
      }
    }
  };

  // Filter and sort jobs based on applied filters
  // Note: Time-based filtering is handled by backend API when timeFilter changes
  // This useMemo only handles client-side filtering for other filters (search, location, etc.)
  // and sorting by salary (which is not a time-based filter)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const filteredJobs = useMemo(() => {
    let filtered = [...jobs];

    // Time-based filtering is now handled by backend API
    // Jobs are already filtered by backend when refetched with timeFilter parameter
    // No need to filter by time here - backend does it correctly

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

    // Working schedule filter (array of checkboxes)
    if (appliedFilters.workingSchedule && appliedFilters.workingSchedule.length > 0) {
      filtered = filtered.filter(job => 
        appliedFilters.workingSchedule.some(schedule =>
          job.tags.some(tag => tag.toLowerCase().includes(schedule.toLowerCase()) || tag.toLowerCase() === schedule.toLowerCase())
        )
      );
    }

    // Employment type filter (array of checkboxes)
    if (appliedFilters.employmentType && appliedFilters.employmentType.length > 0) {
      filtered = filtered.filter(job => 
        appliedFilters.employmentType.some(type =>
          job.tags.some(tag => tag.toLowerCase().includes(type.toLowerCase()) || tag.toLowerCase() === type.toLowerCase())
        )
      );
    }

    // Work style filter (array of checkboxes)
    if (appliedFilters.workStyle && appliedFilters.workStyle.length > 0) {
      filtered = filtered.filter(job => 
        appliedFilters.workStyle.some(style =>
          job.tags.some(tag => tag.toLowerCase().includes(style.toLowerCase()) || tag.toLowerCase() === style.toLowerCase())
        )
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

  // Show MobileHome on mobile, regular Dashboard on desktop
  if (isMobile) {
    return (
      <div className="dashboard">
        <MobileHome 
          jobs={filteredJobs}
          user={user}
          onNavigate={onNavigate}
          onFilterClick={() => setIsFilterDrawerOpen(true)}
        />
        <MobileNav onNavigate={onNavigate} currentPage="home" />
        <MobileFilterDrawer 
          filters={filters}
          onFilterChange={handleFilterChange}
          isOpen={isFilterDrawerOpen}
          onClose={handleApplyFilters}
          onClear={handleClearFilters}
        />
      </div>
    );
  }

  return (
    <div className="dashboard">
      <Header 
        onNavigate={onNavigate} 
        user={user}
        onShowLogin={onShowLogin}
        onShowSignUp={onShowSignUp}
        onLogout={onLogout}
      />
      
      {/* Two-Column Layout: Filters Sidebar + Main Content */}
      <div className="dashboard-layout">
        {/* Left Sidebar - Filters */}
        <aside className="dashboard-filters-sidebar">
          <FiltersSidebar 
            filters={filters}
            onFilterChange={handleFilterChange}
            onClear={handleClearFilters}
          />
        </aside>

        {/* Main Content Area */}
        <main className="dashboard-main-content">
          <div className="dashboard-content-area">
            {/* Search and Active Filters */}
            <SearchFilterBar 
              filters={filters}
              onFilterChange={handleFilterChange}
              appliedFilters={appliedFilters}
              onRemoveFilter={handleRemoveFilter}
            />

            {/* Job Listings */}
            <JobListings 
              jobs={filteredJobs} 
              onFilterClick={handleFilterClick}
              onSortChange={handleSortChange}
              currentSort={timeFilter}
            />
          </div>
        </main>
      </div>

      {/* Mobile Components */}
      <MobileNav onNavigate={onNavigate} currentPage="home" />
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
