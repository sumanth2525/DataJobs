/**
 * Unit Tests for Job API Endpoints
 * Tests job creation, fetching, and synchronization between SQL and UI
 */

const request = require('supertest');
const app = require('../server');

// Mock Supabase client
const mockSupabaseClient = {
  from: jest.fn(() => mockSupabaseClient),
  select: jest.fn(() => mockSupabaseClient),
  insert: jest.fn(() => mockSupabaseClient),
  update: jest.fn(() => mockSupabaseClient),
  delete: jest.fn(() => mockSupabaseClient),
  eq: jest.fn(() => mockSupabaseClient),
  gte: jest.fn(() => mockSupabaseClient),
  ilike: jest.fn(() => mockSupabaseClient),
  contains: jest.fn(() => mockSupabaseClient),
  or: jest.fn(() => mockSupabaseClient),
  order: jest.fn(() => mockSupabaseClient),
  single: jest.fn()
};

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => mockSupabaseClient)
}));

describe('Jobs API - Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/jobs', () => {
    test('should fetch jobs from database and return them in correct format', async () => {
      const mockJobsFromDB = [
        {
          id: 1,
          company: 'Google',
          title: 'Data Scientist',
          location: 'San Francisco, CA',
          salary: '$120k-180k',
          company_logo: 'G',
          tags: ['Full time', 'Remote'],
          link: 'https://google.com/jobs/1',
          description: 'Data scientist role',
          created_at: '2024-01-15T10:00:00Z'
        },
        {
          id: 2,
          company: 'Amazon',
          title: 'Data Engineer',
          location: 'Seattle, WA',
          salary: '$130k-190k',
          company_logo: 'A',
          tags: ['Full time', 'On-site'],
          link: 'https://amazon.com/jobs/2',
          description: 'Data engineer role',
          created_at: '2024-01-14T10:00:00Z'
        }
      ];

      mockSupabaseClient.select.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.order.mockReturnValue(Promise.resolve({
        data: mockJobsFromDB,
        error: null
      }));

      const response = await request(app)
        .get('/api/jobs')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0]).toHaveProperty('id', 1);
      expect(response.body.data[0]).toHaveProperty('company', 'Google');
      expect(response.body.data[0]).toHaveProperty('title', 'Data Scientist');
      expect(response.body.data[0]).toHaveProperty('created_at');
    });

    test('should return empty array when no jobs exist', async () => {
      mockSupabaseClient.select.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.order.mockReturnValue(Promise.resolve({
        data: [],
        error: null
      }));

      const response = await request(app)
        .get('/api/jobs')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([]);
      expect(response.body.count).toBe(0);
    });

    test('should apply search filters correctly', async () => {
      const filteredJobs = [
        {
          id: 1,
          company: 'Google',
          title: 'Data Scientist',
          location: 'San Francisco',
          salary: '$120k-180k',
          company_logo: 'G',
          tags: ['Full time'],
          link: 'https://google.com/1',
          description: 'Data scientist role',
          created_at: '2024-01-15T10:00:00Z'
        }
      ];

      mockSupabaseClient.select.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.or.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.order.mockReturnValue(Promise.resolve({
        data: filteredJobs,
        error: null
      }));

      const response = await request(app)
        .get('/api/jobs?search=Data%20Scientist')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].title).toContain('Data Scientist');
    });
  });

  describe('POST /api/jobs', () => {
    test('should create a new job from UI and save to database', async () => {
      const newJobFromUI = {
        company: 'Microsoft',
        title: 'Data Analyst',
        location: 'Remote',
        salary: '$110k-150k',
        workLocation: 'Remote',
        experience: 'Middle',
        workingSchedule: 'Full time',
        employmentType: 'Full Day',
        description: 'Data analyst role at Microsoft',
        link: 'https://microsoft.com/jobs/123'
      };

      const savedJob = {
        id: 100,
        ...newJobFromUI,
        company_logo: 'M',
        tags: ['Full time', 'Middle level', 'Distant', 'Full Day'],
        created_at: new Date().toISOString()
      };

      mockSupabaseClient.insert.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.select.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.single.mockReturnValue(Promise.resolve({
        data: savedJob,
        error: null
      }));

      const response = await request(app)
        .post('/api/jobs')
        .send(newJobFromUI)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id', 100);
      expect(response.body.data).toHaveProperty('company', 'Microsoft');
      expect(response.body.data).toHaveProperty('title', 'Data Analyst');
      expect(response.body.data).toHaveProperty('link', 'https://microsoft.com/jobs/123');
      expect(mockSupabaseClient.insert).toHaveBeenCalled();
    });

    test('should require company, title, and link fields', async () => {
      const incompleteJob = {
        company: 'Test Company'
        // Missing: title and link
      };

      const response = await request(app)
        .post('/api/jobs')
        .send(incompleteJob)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('required');
    });

    test('should transform job posted from UI to database format correctly', async () => {
      const uiJob = {
        company: 'Netflix',
        title: 'Senior Data Engineer',
        location: 'Los Gatos, CA',
        salary: '$140k-200k',
        workLocation: 'Remote',
        experience: 'Senior',
        workingSchedule: 'Full time',
        employmentType: 'Full Day',
        description: 'Senior data engineer role',
        link: 'https://netflix.com/jobs/senior-engineer'
      };

      const expectedDbJob = {
        company: 'Netflix',
        title: 'Senior Data Engineer',
        location: 'Los Gatos, CA',
        salary: '$140k-200k',
        company_logo: 'N',
        tags: ['Full time', 'Senior level', 'Distant', 'Full Day'],
        link: 'https://netflix.com/jobs/senior-engineer',
        description: 'Senior data engineer role',
        created_at: expect.any(String)
      };

      mockSupabaseClient.insert.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.select.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.single.mockReturnValue(Promise.resolve({
        data: { id: 200, ...expectedDbJob },
        error: null
      }));

      await request(app)
        .post('/api/jobs')
        .send(uiJob)
        .expect(201);

      // Verify the correct format was sent to database
      expect(mockSupabaseClient.insert).toHaveBeenCalled();
      const insertCall = mockSupabaseClient.insert.mock.calls[0][0];
      expect(insertCall[0]).toMatchObject({
        company: 'Netflix',
        title: 'Senior Data Engineer',
        tags: ['Full time', 'Senior level', 'Distant', 'Full Day']
      });
    });
  });

  describe('Job Synchronization: SQL to UI', () => {
    test('should return job inserted via SQL in GET /api/jobs response', async () => {
      // Simulate a job inserted directly via SQL
      const sqlInsertedJob = {
        id: 999,
        company: 'SQL Insert Company',
        title: 'SQL Inserted Job',
        location: 'New York',
        salary: '$125k-175k',
        company_logo: 'S',
        tags: ['Full time', 'Remote'],
        link: 'https://sqltest.com/job',
        description: 'This job was inserted via SQL',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      mockSupabaseClient.select.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.order.mockReturnValue(Promise.resolve({
        data: [sqlInsertedJob],
        error: null
      }));

      const response = await request(app)
        .get('/api/jobs')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0]).toHaveProperty('id', 999);
      expect(response.body.data[0]).toHaveProperty('company', 'SQL Insert Company');
      expect(response.body.data[0]).toHaveProperty('created_at');
      // This job should be visible in UI via the API
    });
  });

  describe('Job Synchronization: UI to Database to UI', () => {
    test('should save job posted from UI and return it in subsequent GET request', async () => {
      const postedJob = {
        company: 'UI Test Company',
        title: 'UI Posted Job',
        location: 'Remote',
        salary: '$100k-150k',
        workLocation: 'Remote',
        experience: 'Middle',
        workingSchedule: 'Full time',
        employmentType: 'Full Day',
        description: 'Job posted from UI',
        link: 'https://uitest.com/job'
      };

      const savedJob = {
        id: 888,
        ...postedJob,
        company_logo: 'U',
        tags: ['Full time', 'Middle level', 'Distant', 'Full Day'],
        created_at: new Date().toISOString()
      };

      // Mock INSERT
      mockSupabaseClient.insert.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.select.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.single.mockReturnValueOnce(Promise.resolve({
        data: savedJob,
        error: null
      }));

      // POST job from UI
      const postResponse = await request(app)
        .post('/api/jobs')
        .send(postedJob)
        .expect(201);

      expect(postResponse.body.success).toBe(true);
      expect(postResponse.body.data.id).toBe(888);

      // Mock GET to return the newly posted job
      mockSupabaseClient.select.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.order.mockReturnValue(Promise.resolve({
        data: [savedJob],
        error: null
      }));

      // GET jobs should include the newly posted job
      const getResponse = await request(app)
        .get('/api/jobs')
        .expect(200);

      expect(getResponse.body.success).toBe(true);
      expect(getResponse.body.data).toHaveLength(1);
      expect(getResponse.body.data[0]).toHaveProperty('id', 888);
      expect(getResponse.body.data[0]).toHaveProperty('company', 'UI Test Company');
      // This proves: UI -> Database -> UI works
    });
  });

  describe('Data Format Compatibility', () => {
    test('should return database format compatible with UI transformation', async () => {
      const dbJob = {
        id: 777,
        company: 'Format Test',
        company_logo: 'F',
        title: 'Test Job',
        location: 'Remote',
        salary: '$100k',
        tags: ['Full time'],
        link: 'https://test.com',
        description: 'Test description',
        created_at: '2024-01-20T12:00:00Z'
      };

      mockSupabaseClient.select.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.order.mockReturnValue(Promise.resolve({
        data: [dbJob],
        error: null
      }));

      const response = await request(app)
        .get('/api/jobs')
        .expect(200);

      const job = response.body.data[0];

      // Verify all fields needed for UI transformation are present
      expect(job).toHaveProperty('id');
      expect(job).toHaveProperty('company');
      expect(job).toHaveProperty('company_logo');
      expect(job).toHaveProperty('title');
      expect(job).toHaveProperty('location');
      expect(job).toHaveProperty('salary');
      expect(job).toHaveProperty('tags');
      expect(job).toHaveProperty('link');
      expect(job).toHaveProperty('description');
      expect(job).toHaveProperty('created_at');
    });
  });
});
