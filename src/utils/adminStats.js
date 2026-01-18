// Admin Statistics Tracking Utility
// Tracks jobs posted, API calls, user activity, etc.

class AdminStats {
  constructor() {
    this.storageKey = 'adminStats';
    this.init();
  }

  init() {
    // Initialize stats if they don't exist
    if (!localStorage.getItem(this.storageKey)) {
      const initialStats = {
        jobsPosted: [],
        apiCalls: [],
        users: [],
        pageViews: [],
        jobPostsByUser: {},
        apiCallsByEndpoint: {},
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem(this.storageKey, JSON.stringify(initialStats));
    }
  }

  getStats() {
    try {
      const stats = JSON.parse(localStorage.getItem(this.storageKey) || '{}');
      return stats;
    } catch (e) {
      this.init();
      return this.getStats();
    }
  }

  updateStats(updates) {
    const stats = this.getStats();
    const updated = {
      ...stats,
      ...updates,
      lastUpdated: new Date().toISOString()
    };
    localStorage.setItem(this.storageKey, JSON.stringify(updated));
    return updated;
  }

  // Track job posting
  trackJobPost(jobData, postedBy = 'Anonymous') {
    const stats = this.getStats();
    const jobRecord = {
      id: jobData.id || Date.now(),
      company: jobData.company,
      title: jobData.title,
      postedBy: postedBy,
      postedAt: new Date().toISOString(),
      location: jobData.location,
      salary: jobData.salary
    };

    const jobsPosted = [...(stats.jobsPosted || []), jobRecord];
    
    // Track by user
    const jobPostsByUser = { ...(stats.jobPostsByUser || {}) };
    jobPostsByUser[postedBy] = (jobPostsByUser[postedBy] || 0) + 1;

    this.updateStats({
      jobsPosted,
      jobPostsByUser
    });

    return jobRecord;
  }

  // Track API calls
  trackAPICall(endpoint, method = 'GET', status = 200) {
    const stats = this.getStats();
    const apiCall = {
      endpoint,
      method,
      status,
      timestamp: new Date().toISOString()
    };

    const apiCalls = [...(stats.apiCalls || []), apiCall];
    
    // Track by endpoint
    const apiCallsByEndpoint = { ...(stats.apiCallsByEndpoint || {}) };
    const key = `${method} ${endpoint}`;
    apiCallsByEndpoint[key] = (apiCallsByEndpoint[key] || 0) + 1;

    this.updateStats({
      apiCalls,
      apiCallsByEndpoint
    });

    return apiCall;
  }

  // Track user activity
  trackUserActivity(userId, action, details = {}) {
    const stats = this.getStats();
    const activity = {
      userId,
      action,
      details,
      timestamp: new Date().toISOString()
    };

    const users = [...(stats.users || [])];
    const existingUserIndex = users.findIndex(u => u.userId === userId);
    
    if (existingUserIndex >= 0) {
      users[existingUserIndex].lastActivity = activity.timestamp;
      users[existingUserIndex].activityCount = (users[existingUserIndex].activityCount || 0) + 1;
    } else {
      users.push({
        userId,
        firstSeen: activity.timestamp,
        lastActivity: activity.timestamp,
        activityCount: 1
      });
    }

    this.updateStats({ users });
    return activity;
  }

  // Track page views
  trackPageView(page) {
    const stats = this.getStats();
    const pageView = {
      page,
      timestamp: new Date().toISOString()
    };

    const pageViews = [...(stats.pageViews || []), pageView];
    this.updateStats({ pageViews });
    return pageView;
  }

  // Get analytics summary
  getAnalyticsSummary() {
    const stats = this.getStats();
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const jobsPosted = stats.jobsPosted || [];
    const apiCalls = stats.apiCalls || [];
    const pageViews = stats.pageViews || [];

    return {
      totalJobs: jobsPosted.length,
      jobsLast24h: jobsPosted.filter(j => new Date(j.postedAt) >= last24Hours).length,
      jobsLast7d: jobsPosted.filter(j => new Date(j.postedAt) >= last7Days).length,
      jobsLast30d: jobsPosted.filter(j => new Date(j.postedAt) >= last30Days).length,
      
      totalAPICalls: apiCalls.length,
      apiCallsLast24h: apiCalls.filter(a => new Date(a.timestamp) >= last24Hours).length,
      apiCallsLast7d: apiCalls.filter(a => new Date(a.timestamp) >= last7Days).length,
      
      totalPageViews: pageViews.length,
      pageViewsLast24h: pageViews.filter(p => new Date(p.timestamp) >= last24Hours).length,
      
      uniqueUsers: (stats.users || []).length,
      activeUsersLast24h: (stats.users || []).filter(u => 
        new Date(u.lastActivity) >= last24Hours
      ).length,
      
      jobsByUser: stats.jobPostsByUser || {},
      apiCallsByEndpoint: stats.apiCallsByEndpoint || {},
      
      recentJobs: jobsPosted.slice(-10).reverse(),
      recentAPICalls: apiCalls.slice(-20).reverse(),
      
      topPosters: Object.entries(stats.jobPostsByUser || {})
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([user, count]) => ({ user, count })),
      
      topEndpoints: Object.entries(stats.apiCallsByEndpoint || {})
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([endpoint, count]) => ({ endpoint, count }))
    };
  }

  // Get jobs by company
  getJobsByCompany() {
    const stats = this.getStats();
    const jobs = stats.jobsPosted || [];
    const byCompany = {};

    jobs.forEach(job => {
      byCompany[job.company] = (byCompany[job.company] || 0) + 1;
    });

    return Object.entries(byCompany)
      .sort((a, b) => b[1] - a[1])
      .map(([company, count]) => ({ company, count }));
  }

  // Get hourly activity (for charts)
  getHourlyActivity(hours = 24) {
    const stats = this.getStats();
    const now = new Date();
    const jobs = stats.jobsPosted || [];
    const apiCalls = stats.apiCalls || [];

    const hourlyData = [];
    for (let i = hours - 1; i >= 0; i--) {
      const hourStart = new Date(now.getTime() - i * 60 * 60 * 1000);
      const hourEnd = new Date(hourStart.getTime() + 60 * 60 * 1000);
      
      const jobsInHour = jobs.filter(j => {
        const jobTime = new Date(j.postedAt);
        return jobTime >= hourStart && jobTime < hourEnd;
      }).length;

      const apiCallsInHour = apiCalls.filter(a => {
        const callTime = new Date(a.timestamp);
        return callTime >= hourStart && callTime < hourEnd;
      }).length;

      hourlyData.push({
        hour: hourStart.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        jobs: jobsInHour,
        apiCalls: apiCallsInHour
      });
    }

    return hourlyData;
  }

  // Clear all stats (admin function)
  clearStats() {
    this.init();
    return this.getStats();
  }
}

// Export singleton instance
export const adminStats = new AdminStats();
export default adminStats;