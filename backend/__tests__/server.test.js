const request = require('supertest');

// Mock Supabase before importing server
const mockSupabaseInstance = {
  from: jest.fn(() => mockSupabaseInstance),
  select: jest.fn(() => mockSupabaseInstance),
  insert: jest.fn(() => mockSupabaseInstance),
  update: jest.fn(() => mockSupabaseInstance),
  delete: jest.fn(() => mockSupabaseInstance),
  eq: jest.fn(() => mockSupabaseInstance),
  ilike: jest.fn(() => mockSupabaseInstance),
  or: jest.fn(() => mockSupabaseInstance),
  contains: jest.fn(() => mockSupabaseInstance),
  order: jest.fn(() => mockSupabaseInstance),
  single: jest.fn(() => mockSupabaseInstance),
  auth: {
    signUp: jest.fn(),
    signInWithPassword: jest.fn(),
    getUser: jest.fn()
  }
};

jest.mock('@supabase/supabase-js', () => {
  return {
    createClient: jest.fn(() => mockSupabaseInstance)
  };
});

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test_service_role_key';
process.env.PORT = '5000';

// Import app after mocks are set up
const app = require('../server');

describe('Server Health Check', () => {
  test('GET /api/health should return OK status', async () => {
    const response = await request(app)
      .get('/api/health')
      .expect(200);
    
    expect(response.body).toHaveProperty('status', 'OK');
    expect(response.body).toHaveProperty('message', 'Server is running');
  });
});

describe('Jobs API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('GET /api/jobs should return jobs list', async () => {
    const mockJobs = [
      {
        id: 1,
        company: 'Test Corp',
        title: 'Test Job',
        location: 'Remote',
        salary: '$100,000',
        tags: ['Full time'],
        link: 'https://example.com',
        created_at: new Date().toISOString()
      }
    ];

    mockSupabaseInstance.from.mockReturnValue(mockSupabaseInstance);
    mockSupabaseInstance.select.mockReturnValue(mockSupabaseInstance);
    mockSupabaseInstance.order.mockResolvedValue({ data: mockJobs, error: null });

    const response = await request(app)
      .get('/api/jobs')
      .expect(200);

    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('data');
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  test('GET /api/jobs with search filter', async () => {
    const mockJobs = [
      {
        id: 1,
        company: 'Data Corp',
        title: 'Data Scientist',
        location: 'Remote',
        salary: '$120,000',
        tags: ['Full time'],
        link: 'https://example.com',
        created_at: new Date().toISOString()
      }
    ];

    mockSupabaseInstance.from.mockReturnValue(mockSupabaseInstance);
    mockSupabaseInstance.select.mockReturnValue(mockSupabaseInstance);
    mockSupabaseInstance.or.mockReturnValue(mockSupabaseInstance);
    mockSupabaseInstance.order.mockResolvedValue({ data: mockJobs, error: null });

    const response = await request(app)
      .get('/api/jobs?search=data')
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(mockSupabaseInstance.or).toHaveBeenCalled();
  });

  test('GET /api/jobs/:id should return single job', async () => {
    const mockJob = {
      id: 1,
      company: 'Test Corp',
      title: 'Test Job',
      location: 'Remote',
      salary: '$100,000',
      tags: ['Full time'],
      link: 'https://example.com',
      created_at: new Date().toISOString()
    };

    mockSupabaseInstance.from.mockReturnValue(mockSupabaseInstance);
    mockSupabaseInstance.select.mockReturnValue(mockSupabaseInstance);
    mockSupabaseInstance.eq.mockReturnValue(mockSupabaseInstance);
    mockSupabaseInstance.single.mockResolvedValue({ data: mockJob, error: null });

    const response = await request(app)
      .get('/api/jobs/1')
      .expect(200);

    expect(response.body).toHaveProperty('success', true);
    expect(response.body.data).toHaveProperty('id', 1);
    expect(response.body.data).toHaveProperty('company', 'Test Corp');
  });

  test('GET /api/jobs/:id should return 404 for non-existent job', async () => {
    mockSupabaseInstance.from.mockReturnValue(mockSupabaseInstance);
    mockSupabaseInstance.select.mockReturnValue(mockSupabaseInstance);
    mockSupabaseInstance.eq.mockReturnValue(mockSupabaseInstance);
    mockSupabaseInstance.single.mockResolvedValue({ data: null, error: null });

    const response = await request(app)
      .get('/api/jobs/999')
      .expect(404);

    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('error', 'Job not found');
  });

  test('POST /api/jobs should create new job', async () => {
    const newJob = {
      company: 'New Corp',
      title: 'New Job',
      location: 'Remote',
      salary: '$100,000',
      workLocation: 'Remote',
      experience: 'Senior',
      workingSchedule: 'Full time',
      employmentType: 'Full day',
      tags: [],
      description: 'Test description',
      link: 'https://example.com/job'
    };

    const createdJob = {
      id: 1,
      ...newJob,
      company_logo: 'N',
      tags: ['Full time', 'Senior level', 'Distant', 'Full day'],
      created_at: new Date().toISOString()
    };

    mockSupabaseInstance.from.mockReturnValue(mockSupabaseInstance);
    mockSupabaseInstance.insert.mockReturnValue(mockSupabaseInstance);
    mockSupabaseInstance.select.mockReturnValue(mockSupabaseInstance);
    mockSupabaseInstance.single.mockResolvedValue({ data: createdJob, error: null });

    const response = await request(app)
      .post('/api/jobs')
      .send(newJob)
      .expect(201);

    expect(response.body).toHaveProperty('success', true);
    expect(response.body.data).toHaveProperty('company', 'New Corp');
    expect(response.body.data).toHaveProperty('title', 'New Job');
  });

  test('POST /api/jobs should return 400 for missing required fields', async () => {
    const incompleteJob = {
      company: 'Test Corp'
      // Missing title and link
    };

    const response = await request(app)
      .post('/api/jobs')
      .send(incompleteJob)
      .expect(400);

    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('error');
  });

  test('PUT /api/jobs/:id should update job', async () => {
    const updates = {
      title: 'Updated Job Title',
      salary: '$150,000'
    };

    const updatedJob = {
      id: 1,
      company: 'Test Corp',
      title: 'Updated Job Title',
      location: 'Remote',
      salary: '$150,000',
      tags: ['Full time'],
      link: 'https://example.com',
      created_at: new Date().toISOString()
    };

    mockSupabaseInstance.from.mockReturnValue(mockSupabaseInstance);
    mockSupabaseInstance.update.mockReturnValue(mockSupabaseInstance);
    mockSupabaseInstance.eq.mockReturnValue(mockSupabaseInstance);
    mockSupabaseInstance.select.mockReturnValue(mockSupabaseInstance);
    mockSupabaseInstance.single.mockResolvedValue({ data: updatedJob, error: null });

    const response = await request(app)
      .put('/api/jobs/1')
      .send(updates)
      .expect(200);

    expect(response.body).toHaveProperty('success', true);
    expect(response.body.data).toHaveProperty('title', 'Updated Job Title');
    expect(response.body.data).toHaveProperty('salary', '$150,000');
  });

  test('DELETE /api/jobs/:id should delete job', async () => {
    mockSupabaseInstance.from.mockReturnValue(mockSupabaseInstance);
    mockSupabaseInstance.delete.mockReturnValue(mockSupabaseInstance);
    mockSupabaseInstance.eq.mockResolvedValue({ error: null });

    const response = await request(app)
      .delete('/api/jobs/1')
      .expect(200);

    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('message', 'Job deleted successfully');
  });
});

describe('Authentication API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('POST /api/auth/register should register new user', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User'
    };

    const mockUser = {
      id: '123',
      email: 'test@example.com',
      user_metadata: { name: 'Test User' }
    };

    mockSupabaseInstance.auth.signUp.mockResolvedValue({
      data: { user: mockUser },
      error: null
    });

    const response = await request(app)
      .post('/api/auth/register')
      .send(userData)
      .expect(201);

    expect(response.body).toHaveProperty('success', true);
    expect(response.body.data).toHaveProperty('user');
  });

  test('POST /api/auth/register should return 400 for invalid password', async () => {
    const userData = {
      email: 'test@example.com',
      password: '123' // Too short
    };

    const response = await request(app)
      .post('/api/auth/register')
      .send(userData)
      .expect(400);

    expect(response.body).toHaveProperty('success', false);
    expect(response.body.error).toContain('Password');
  });

  test('POST /api/auth/login should login user', async () => {
    const credentials = {
      email: 'test@example.com',
      password: 'password123'
    };

    const mockUser = {
      id: '123',
      email: 'test@example.com'
    };

    const mockSession = {
      access_token: 'mock_token',
      refresh_token: 'mock_refresh'
    };

    mockSupabaseInstance.auth.signInWithPassword.mockResolvedValue({
      data: { user: mockUser, session: mockSession },
      error: null
    });

    const response = await request(app)
      .post('/api/auth/login')
      .send(credentials)
      .expect(200);

    expect(response.body).toHaveProperty('success', true);
    expect(response.body.data).toHaveProperty('user');
    expect(response.body.data).toHaveProperty('session');
  });

  test('POST /api/auth/login should return 401 for invalid credentials', async () => {
    mockSupabaseInstance.auth.signInWithPassword.mockResolvedValue({
      data: null,
      error: { message: 'Invalid credentials' }
    });

    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'wrong@example.com',
        password: 'wrongpassword'
      })
      .expect(401);

    expect(response.body).toHaveProperty('success', false);
  });

  test('GET /api/auth/user should return user with valid token', async () => {
    const mockUser = {
      id: '123',
      email: 'test@example.com'
    };

    mockSupabaseInstance.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    });

    const response = await request(app)
      .get('/api/auth/user')
      .set('Authorization', 'Bearer valid_token')
      .expect(200);

    expect(response.body).toHaveProperty('success', true);
    expect(response.body.data).toHaveProperty('id', '123');
  });

  test('GET /api/auth/user should return 401 without token', async () => {
    const response = await request(app)
      .get('/api/auth/user')
      .expect(401);

    expect(response.body).toHaveProperty('success', false);
  });
});

describe('Online Users API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('GET /api/users/online should return online count', async () => {
    mockSupabaseInstance.from.mockReturnValue(mockSupabaseInstance);
    mockSupabaseInstance.select.mockReturnValue(mockSupabaseInstance);
    mockSupabaseInstance.single.mockResolvedValue({
      data: { count: 1500 },
      error: null
    });

    const response = await request(app)
      .get('/api/users/online')
      .expect(200);

    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('count');
    expect(typeof response.body.count).toBe('number');
  });

  test('GET /api/users/online should return fallback count on error', async () => {
    mockSupabaseInstance.from.mockReturnValue(mockSupabaseInstance);
    mockSupabaseInstance.select.mockReturnValue(mockSupabaseInstance);
    mockSupabaseInstance.single.mockResolvedValue({
      data: null,
      error: { code: 'PGRST116' } // No rows
    });

    const response = await request(app)
      .get('/api/users/online')
      .expect(200);

    expect(response.body).toHaveProperty('success', true);
    expect(response.body.count).toBe(1247); // Fallback
  });
});

describe('Messages API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('GET /api/messages should return messages for user', async () => {
    const mockMessages = [
      {
        id: 1,
        sender_id: '123',
        receiver_id: '456',
        content: 'Hello',
        created_at: new Date().toISOString()
      }
    ];

    mockSupabaseInstance.from.mockReturnValue(mockSupabaseInstance);
    mockSupabaseInstance.select.mockReturnValue(mockSupabaseInstance);
    mockSupabaseInstance.or.mockReturnValue(mockSupabaseInstance);
    mockSupabaseInstance.order.mockResolvedValue({ data: mockMessages, error: null });

    const response = await request(app)
      .get('/api/messages?userId=123')
      .expect(200);

    expect(response.body).toHaveProperty('success', true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  test('GET /api/messages should return 400 without userId', async () => {
    const response = await request(app)
      .get('/api/messages')
      .expect(400);

    expect(response.body).toHaveProperty('success', false);
  });

  test('POST /api/messages should send message', async () => {
    const messageData = {
      sender_id: '123',
      receiver_id: '456',
      content: 'Test message'
    };

    const createdMessage = {
      id: 1,
      ...messageData,
      created_at: new Date().toISOString()
    };

    mockSupabaseInstance.from.mockReturnValue(mockSupabaseInstance);
    mockSupabaseInstance.insert.mockReturnValue(mockSupabaseInstance);
    mockSupabaseInstance.select.mockReturnValue(mockSupabaseInstance);
    mockSupabaseInstance.single.mockResolvedValue({ data: createdMessage, error: null });

    const response = await request(app)
      .post('/api/messages')
      .send(messageData)
      .expect(201);

    expect(response.body).toHaveProperty('success', true);
    expect(response.body.data).toHaveProperty('content', 'Test message');
  });

  test('POST /api/messages should return 400 for missing fields', async () => {
    const response = await request(app)
      .post('/api/messages')
      .send({
        sender_id: '123'
        // Missing receiver_id and content
      })
      .expect(400);

    expect(response.body).toHaveProperty('success', false);
  });
});
