import React, { useState, useEffect, useMemo } from 'react';
import adminStats from '../utils/adminStats';
import './AdminDashboard.css';

// StatCard component for displaying metrics
const StatCard = ({ title, value, subtitle, icon }) => {
  return (
    <div className="stat-card">
      <div className="stat-header">
        <div className="stat-icon">{icon}</div>
        <div className="stat-info">
          <div className="stat-title">{title}</div>
          <div className="stat-value">{value?.toLocaleString() || '0'}</div>
          {subtitle && <div className="stat-subtitle">{subtitle}</div>}
        </div>
      </div>
    </div>
  );
};

const AdminDashboard = ({ onNavigate }) => {
  const [stats, setStats] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [timeRange, setTimeRange] = useState('24h');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTable, setSelectedTable] = useState('all');
  const [isExporting, setIsExporting] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState(new Date());

  useEffect(() => {
    loadStats();
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      loadStats();
      setRefreshKey(prev => prev + 1);
      setLastRefreshTime(new Date());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const loadStats = () => {
    const analytics = adminStats.getAnalyticsSummary();
    setStats(analytics);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPercentageChange = (current, previous) => {
    if (!previous || previous === 0) return current > 0 ? '+100%' : '0%';
    const change = ((current - previous) / previous) * 100;
    return `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
  };

  const exportData = (format = 'json') => {
    setIsExporting(true);
    try {
      const allStats = adminStats.getStats();
      const analytics = adminStats.getAnalyticsSummary();
      
      if (format === 'json') {
        const dataStr = JSON.stringify({ stats: allStats, analytics }, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `admin-stats-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
      } else if (format === 'csv') {
        // Export jobs as CSV
        const jobs = allStats.jobsPosted || [];
        const headers = ['ID', 'Company', 'Title', 'Location', 'Salary', 'Posted By', 'Posted At'];
        const csvRows = [
          headers.join(','),
          ...jobs.map(job => [
            job.id,
            `"${job.company}"`,
            `"${job.title}"`,
            `"${job.location || ''}"`,
            `"${job.salary || ''}"`,
            `"${job.postedBy}"`,
            job.postedAt
          ].join(','))
        ];
        const csvContent = csvRows.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `jobs-export-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      alert('Error exporting data: ' + error.message);
    } finally {
      setIsExporting(false);
    }
  };

  const filteredTopPosters = useMemo(() => {
    if (!stats || !searchQuery) return stats?.topPosters || [];
    const query = searchQuery.toLowerCase();
    return stats.topPosters.filter(poster => 
      poster.user.toLowerCase().includes(query)
    );
  }, [stats, searchQuery]);

  const filteredJobsByCompany = useMemo(() => {
    if (!stats || !searchQuery) return adminStats.getJobsByCompany();
    const query = searchQuery.toLowerCase();
    const allJobs = adminStats.getJobsByCompany();
    return allJobs.filter(item => 
      item.company.toLowerCase().includes(query)
    );
  }, [stats, searchQuery]);

  const filteredTopEndpoints = useMemo(() => {
    if (!stats || !searchQuery) return stats?.topEndpoints || [];
    const query = searchQuery.toLowerCase();
    return stats.topEndpoints.filter(endpoint => 
      endpoint.endpoint.toLowerCase().includes(query)
    );
  }, [stats, searchQuery]);

  const hourlyData = useMemo(() => {
    const stats = adminStats.getStats();
    const now = new Date();
    const jobs = stats.jobsPosted || [];
    const apiCalls = stats.apiCalls || [];
    
    if (timeRange === '24h') {
      return adminStats.getHourlyActivity(24);
    } else if (timeRange === '7d') {
      // Aggregate by day for 7 days
      const dailyData = [];
      for (let i = 6; i >= 0; i--) {
        const dayStart = new Date(now);
        dayStart.setDate(dayStart.getDate() - i);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(dayStart);
        dayEnd.setHours(23, 59, 59, 999);
        
        const jobsInDay = jobs.filter(j => {
          const jobTime = new Date(j.postedAt);
          return jobTime >= dayStart && jobTime <= dayEnd;
        }).length;

        const apiCallsInDay = apiCalls.filter(a => {
          const callTime = new Date(a.timestamp);
          return callTime >= dayStart && callTime <= dayEnd;
        }).length;

        dailyData.push({
          hour: dayStart.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
          jobs: jobsInDay,
          apiCalls: apiCallsInDay
        });
      }
      return dailyData;
    } else {
      // Aggregate by week for 30 days (4-5 weeks)
      const weeklyData = [];
      for (let i = 3; i >= 0; i--) {
        const weekStart = new Date(now);
        weekStart.setDate(weekStart.getDate() - (i * 7 + 6));
        weekStart.setHours(0, 0, 0, 0);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);
        
        const jobsInWeek = jobs.filter(j => {
          const jobTime = new Date(j.postedAt);
          return jobTime >= weekStart && jobTime <= weekEnd;
        }).length;

        const apiCallsInWeek = apiCalls.filter(a => {
          const callTime = new Date(a.timestamp);
          return callTime >= weekStart && callTime <= weekEnd;
        }).length;

        weeklyData.push({
          hour: `Week ${4 - i} (${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`,
          jobs: jobsInWeek,
          apiCalls: apiCallsInWeek
        });
      }
      return weeklyData;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRange, refreshKey]);

  // Loading state check - all hooks must be called before any conditional returns
  if (!stats) {
    return (
      <div className="admin-dashboard">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-dashboard-header">
        <div className="header-left">
          <button 
            className="back-button" 
            onClick={() => {
              window.location.hash = '';
              if (onNavigate) onNavigate('dashboard');
            }}
          >
            ← Back to Portal
          </button>
          <h1>
            <i className="bi bi-speedometer2"></i>
            Admin Dashboard
          </h1>
          <p className="dashboard-subtitle">Real-time analytics and monitoring</p>
        </div>
        <div className="header-right">
          <div className="export-buttons">
            <button 
              className="export-btn"
              onClick={() => exportData('json')}
              disabled={isExporting}
              title="Export as JSON"
            >
              <i className="bi bi-download"></i>
              {isExporting ? 'Exporting...' : 'Export JSON'}
            </button>
            <button 
              className="export-btn"
              onClick={() => exportData('csv')}
              disabled={isExporting}
              title="Export as CSV"
            >
              <i className="bi bi-file-earmark-spreadsheet"></i>
              Export CSV
            </button>
          </div>
          <button 
            className="refresh-btn"
            onClick={() => {
              loadStats();
              setRefreshKey(prev => prev + 1);
              setLastRefreshTime(new Date());
            }}
          >
            <i className="bi bi-arrow-clockwise"></i>
            Refresh
          </button>
          <div className="last-updated">
            <i className="bi bi-clock"></i>
            Last updated: {lastRefreshTime.toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="metrics-grid">
        <StatCard
          title="Total Jobs Posted"
          value={stats.totalJobs}
          subtitle={`${stats.jobsLast24h} in last 24h`}
          icon="📊"
        />
        <StatCard
          title="Total API Calls"
          value={stats.totalAPICalls}
          subtitle={`${stats.apiCallsLast24h} in last 24h`}
          icon="🔌"
        />
        <StatCard
          title="Unique Users"
          value={stats.uniqueUsers}
          subtitle={`${stats.activeUsersLast24h} active today`}
          icon="👥"
        />
        <StatCard
          title="Page Views"
          value={stats.totalPageViews}
          subtitle={`${stats.pageViewsLast24h} in last 24h`}
          icon="👁️"
        />
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        <div className="chart-card">
          <div className="chart-header">
            <h3 className="chart-title">
              <i className="bi bi-bar-chart"></i>
              Activity Over Time
            </h3>
            <div className="time-range-selector">
              <button 
                className={`time-range-btn ${timeRange === '24h' ? 'active' : ''}`}
                onClick={() => setTimeRange('24h')}
              >
                24H
              </button>
              <button 
                className={`time-range-btn ${timeRange === '7d' ? 'active' : ''}`}
                onClick={() => setTimeRange('7d')}
              >
                7D
              </button>
              <button 
                className={`time-range-btn ${timeRange === '30d' ? 'active' : ''}`}
                onClick={() => setTimeRange('30d')}
              >
                30D
              </button>
            </div>
          </div>
          <div className="activity-chart">
            {hourlyData.length > 0 ? (
              hourlyData.map((data, index) => {
                const maxJobs = Math.max(...hourlyData.map(d => d.jobs), 1);
                const maxApiCalls = Math.max(...hourlyData.map(d => d.apiCalls), 1);
                const maxValue = Math.max(maxJobs, maxApiCalls, 1);
                
                return (
                  <div key={index} className="chart-bar-container">
                    <div className="chart-bars">
                      <div 
                        className="chart-bar jobs-bar"
                        style={{ height: `${Math.max((data.jobs / maxValue) * 100, 5)}%` }}
                        title={`${data.hour}: ${data.jobs} jobs posted`}
                      >
                        {data.jobs > 0 && (
                          <span className="chart-bar-value">{data.jobs}</span>
                        )}
                      </div>
                      <div 
                        className="chart-bar api-bar"
                        style={{ height: `${Math.max((data.apiCalls / maxValue) * 100, 5)}%` }}
                        title={`${data.hour}: ${data.apiCalls} API calls`}
                      >
                        {data.apiCalls > 0 && (
                          <span className="chart-bar-value">{data.apiCalls}</span>
                        )}
                      </div>
                    </div>
                    <div className="chart-label" title={data.hour}>
                      {timeRange === '24h' ? data.hour : timeRange === '7d' ? data.hour.split(',')[0] : `W${index + 1}`}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="chart-no-data">
                <i className="bi bi-inbox"></i>
                <p>No activity data available for this time period</p>
              </div>
            )}
          </div>
          <div className="chart-legend">
            <div className="legend-item">
              <span className="legend-color jobs-color"></span>
              <span>Jobs Posted</span>
            </div>
            <div className="legend-item">
              <span className="legend-color api-color"></span>
              <span>API Calls</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="search-filter-bar">
        <div className="search-input-wrapper">
          <i className="bi bi-search"></i>
          <input
            type="text"
            className="search-input"
            placeholder="Search tables (users, companies, endpoints)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button 
              className="clear-search-btn"
              onClick={() => setSearchQuery('')}
              title="Clear search"
            >
              <i className="bi bi-x"></i>
            </button>
          )}
        </div>
        <div className="table-filter-tabs">
          <button 
            className={`filter-tab ${selectedTable === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedTable('all')}
          >
            All Tables
          </button>
          <button 
            className={`filter-tab ${selectedTable === 'posters' ? 'active' : ''}`}
            onClick={() => setSelectedTable('posters')}
          >
            Top Posters
          </button>
          <button 
            className={`filter-tab ${selectedTable === 'companies' ? 'active' : ''}`}
            onClick={() => setSelectedTable('companies')}
          >
            Companies
          </button>
          <button 
            className={`filter-tab ${selectedTable === 'endpoints' ? 'active' : ''}`}
            onClick={() => setSelectedTable('endpoints')}
          >
            Endpoints
          </button>
        </div>
      </div>

      {/* Detailed Tables */}
      <div className="tables-section">
        {(selectedTable === 'all' || selectedTable === 'posters') && (
          <div className="table-card">
            <div className="table-header">
              <h3 className="table-title">
                <i className="bi bi-briefcase"></i>
                Top Job Posters
                <span className="table-count">({filteredTopPosters.length})</span>
              </h3>
            </div>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>User/Company</th>
                    <th>Jobs Posted</th>
                    <th>Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTopPosters.length > 0 ? (
                    filteredTopPosters.map((poster, index) => (
                      <tr key={index}>
                        <td className="rank-cell">#{index + 1}</td>
                        <td className="user-cell">{poster.user}</td>
                        <td className="count-cell">{poster.count}</td>
                        <td className="percentage-cell">
                          <div className="percentage-bar-container">
                            <div 
                              className="percentage-bar"
                              style={{ width: `${(poster.count / stats.totalJobs) * 100}%` }}
                            ></div>
                            <span>{((poster.count / stats.totalJobs) * 100).toFixed(1)}%</span>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="no-data">No data available</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {(selectedTable === 'all' || selectedTable === 'companies') && (
          <div className="table-card">
            <div className="table-header">
              <h3 className="table-title">
                <i className="bi bi-building"></i>
                Jobs by Company
                <span className="table-count">({filteredJobsByCompany.length})</span>
              </h3>
            </div>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Company</th>
                    <th>Jobs Posted</th>
                    <th>Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredJobsByCompany.length > 0 ? (
                    filteredJobsByCompany.slice(0, 10).map((item, index) => (
                      <tr key={index}>
                        <td className="company-cell">{item.company}</td>
                        <td className="count-cell">{item.count}</td>
                        <td className="percentage-cell">
                          <div className="percentage-bar-container">
                            <div 
                              className="percentage-bar"
                              style={{ width: `${(item.count / stats.totalJobs) * 100}%` }}
                            ></div>
                            <span>{((item.count / stats.totalJobs) * 100).toFixed(1)}%</span>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="no-data">No data available</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {(selectedTable === 'all' || selectedTable === 'endpoints') && (
          <div className="table-card">
            <div className="table-header">
              <h3 className="table-title">
                <i className="bi bi-code-slash"></i>
                Most Used API Endpoints
                <span className="table-count">({filteredTopEndpoints.length})</span>
              </h3>
            </div>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Endpoint</th>
                    <th>Calls</th>
                    <th>Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTopEndpoints.length > 0 ? (
                    filteredTopEndpoints.map((endpoint, index) => (
                      <tr key={index}>
                        <td className="endpoint-cell">
                          <code>{endpoint.endpoint}</code>
                        </td>
                        <td className="count-cell">{endpoint.count}</td>
                        <td className="percentage-cell">
                          <div className="percentage-bar-container">
                            <div 
                              className="percentage-bar"
                              style={{ width: `${(endpoint.count / stats.totalAPICalls) * 100}%` }}
                            ></div>
                            <span>{((endpoint.count / stats.totalAPICalls) * 100).toFixed(1)}%</span>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="no-data">No data available</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="activity-section">
        <div className="activity-card">
          <h3 className="activity-title">
            <i className="bi bi-clock-history"></i>
            Recent Job Postings
          </h3>
          <div className="activity-list">
            {stats.recentJobs.length > 0 ? (
              stats.recentJobs.map((job, index) => (
                <div key={index} className="activity-item">
                  <div className="activity-icon">📝</div>
                  <div className="activity-content">
                    <div className="activity-main">
                      <strong>{job.title}</strong> at <strong>{job.company}</strong>
                    </div>
                    <div className="activity-meta">
                      Posted by {job.postedBy} • {formatDate(job.postedAt)}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-activity">No recent job postings</div>
            )}
          </div>
        </div>

        <div className="activity-card">
          <h3 className="activity-title">
            <i className="bi bi-activity"></i>
            Recent API Calls
          </h3>
          <div className="activity-list">
            {stats.recentAPICalls.length > 0 ? (
              stats.recentAPICalls.slice(0, 10).map((call, index) => (
                <div key={index} className="activity-item">
                  <div className={`activity-icon ${call.status >= 200 && call.status < 300 ? 'success' : 'error'}`}>
                    {call.status >= 200 && call.status < 300 ? '✅' : '❌'}
                  </div>
                  <div className="activity-content">
                    <div className="activity-main">
                      <code>{call.method}</code> <strong>{call.endpoint}</strong>
                    </div>
                    <div className="activity-meta">
                      Status: {call.status} • {formatDate(call.timestamp)}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-activity">No recent API calls</div>
            )}
          </div>
        </div>
      </div>

      {/* Time Period Stats */}
      <div className="period-stats">
        <div className="period-card">
          <h4>Last 24 Hours</h4>
          <div className="period-metrics">
            <div className="period-metric">
              <span className="metric-label">Jobs:</span>
              <span className="metric-value">{stats.jobsLast24h}</span>
            </div>
            <div className="period-metric">
              <span className="metric-label">API Calls:</span>
              <span className="metric-value">{stats.apiCallsLast24h}</span>
            </div>
            <div className="period-metric">
              <span className="metric-label">Page Views:</span>
              <span className="metric-value">{stats.pageViewsLast24h}</span>
            </div>
          </div>
        </div>

        <div className="period-card">
          <h4>Last 7 Days</h4>
          <div className="period-metrics">
            <div className="period-metric">
              <span className="metric-label">Jobs:</span>
              <span className="metric-value">{stats.jobsLast7d}</span>
            </div>
            <div className="period-metric">
              <span className="metric-label">API Calls:</span>
              <span className="metric-value">{stats.apiCallsLast7d}</span>
            </div>
          </div>
        </div>

        <div className="period-card">
          <h4>Last 30 Days</h4>
          <div className="period-metrics">
            <div className="period-metric">
              <span className="metric-label">Jobs:</span>
              <span className="metric-value">{stats.jobsLast30d}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;