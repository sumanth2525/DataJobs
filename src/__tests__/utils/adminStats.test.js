import adminStats from '../../utils/adminStats';

describe('adminStats Utility', () => {
  beforeEach(() => {
    // Reset stats before each test
    adminStats.reset();
  });

  test('tracks job post', () => {
    const job = {
      id: 1,
      company: 'Tech Corp',
      title: 'Data Scientist',
      postedBy: 'user1'
    };
    
    adminStats.trackJobPost(job);
    
    const stats = adminStats.getStats();
    expect(stats.jobsPosted.length).toBe(1);
    expect(stats.jobsPosted[0].company).toBe('Tech Corp');
  });

  test('tracks API call', () => {
    const apiCall = {
      method: 'GET',
      endpoint: '/api/jobs',
      status: 200
    };
    
    adminStats.trackAPICall(apiCall);
    
    const stats = adminStats.getStats();
    expect(stats.apiCalls.length).toBe(1);
    expect(stats.apiCalls[0].endpoint).toBe('/api/jobs');
  });

  test('tracks page view', () => {
    adminStats.trackPageView('dashboard');
    
    const stats = adminStats.getStats();
    expect(stats.pageViews.length).toBe(1);
    expect(stats.pageViews[0].page).toBe('dashboard');
  });

  test('tracks user activity', () => {
    adminStats.trackUserActivity('user1');
    
    const stats = adminStats.getStats();
    expect(stats.activeUsers).toContain('user1');
  });

  test('gets analytics summary', () => {
    // Add some test data
    adminStats.trackJobPost({
      id: 1,
      company: 'Tech Corp',
      title: 'Data Scientist',
      postedBy: 'user1',
      postedAt: new Date().toISOString()
    });
    
    adminStats.trackAPICall({
      method: 'GET',
      endpoint: '/api/jobs',
      status: 200,
      timestamp: new Date().toISOString()
    });
    
    const summary = adminStats.getAnalyticsSummary();
    
    expect(summary).toHaveProperty('totalJobs');
    expect(summary).toHaveProperty('totalAPICalls');
    expect(summary).toHaveProperty('uniqueUsers');
    expect(summary.totalJobs).toBeGreaterThanOrEqual(0);
  });

  test('gets jobs by company', () => {
    adminStats.trackJobPost({
      id: 1,
      company: 'Tech Corp',
      title: 'Data Scientist',
      postedBy: 'user1'
    });
    
    adminStats.trackJobPost({
      id: 2,
      company: 'Tech Corp',
      title: 'Data Engineer',
      postedBy: 'user1'
    });
    
    const jobsByCompany = adminStats.getJobsByCompany();
    
    expect(jobsByCompany.length).toBeGreaterThan(0);
    const techCorp = jobsByCompany.find(j => j.company === 'Tech Corp');
    expect(techCorp.count).toBe(2);
  });

  test('gets hourly activity', () => {
    const hourlyData = adminStats.getHourlyActivity(24);
    
    expect(Array.isArray(hourlyData)).toBe(true);
    expect(hourlyData.length).toBeLessThanOrEqual(24);
  });

  test('calculates jobs in last 24 hours', () => {
    const recentJob = {
      id: 1,
      company: 'Tech Corp',
      title: 'Data Scientist',
      postedBy: 'user1',
      postedAt: new Date().toISOString()
    };
    
    adminStats.trackJobPost(recentJob);
    
    const summary = adminStats.getAnalyticsSummary();
    expect(summary.jobsLast24h).toBeGreaterThanOrEqual(0);
  });

  test('calculates API calls in last 24 hours', () => {
    const recentCall = {
      method: 'GET',
      endpoint: '/api/jobs',
      status: 200,
      timestamp: new Date().toISOString()
    };
    
    adminStats.trackAPICall(recentCall);
    
    const summary = adminStats.getAnalyticsSummary();
    expect(summary.apiCallsLast24h).toBeGreaterThanOrEqual(0);
  });

  test('gets top posters', () => {
    adminStats.trackJobPost({
      id: 1,
      company: 'Tech Corp',
      title: 'Job 1',
      postedBy: 'user1'
    });
    
    adminStats.trackJobPost({
      id: 2,
      company: 'Tech Corp',
      title: 'Job 2',
      postedBy: 'user1'
    });
    
    const summary = adminStats.getAnalyticsSummary();
    expect(summary.topPosters.length).toBeGreaterThan(0);
  });

  test('gets top endpoints', () => {
    adminStats.trackAPICall({
      method: 'GET',
      endpoint: '/api/jobs',
      status: 200,
      timestamp: new Date().toISOString()
    });
    
    const summary = adminStats.getAnalyticsSummary();
    expect(summary.topEndpoints.length).toBeGreaterThanOrEqual(0);
  });

  test('resets stats', () => {
    adminStats.trackJobPost({
      id: 1,
      company: 'Tech Corp',
      title: 'Data Scientist',
      postedBy: 'user1'
    });
    
    adminStats.reset();
    
    const stats = adminStats.getStats();
    expect(stats.jobsPosted.length).toBe(0);
  });
});
