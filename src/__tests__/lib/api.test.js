// Mock axios before any imports
jest.mock('axios', () => {
  const mockAxiosInstance = {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() }
    }
  };
  return {
    __esModule: true,
    default: {
      create: jest.fn(() => mockAxiosInstance)
    }
  };
});

jest.mock('../../utils/adminStats', () => ({
  default: {
    trackAPICall: jest.fn()
  }
}));

describe('API Client', () => {
  let jobsAPI, authAPI;
  let mockAxiosInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    
    // Get fresh mocks
    const axios = require('axios').default;
    mockAxiosInstance = axios.create();
    
    // Import API after mocks are set up
    const api = require('../../lib/api');
    jobsAPI = api.jobsAPI;
    authAPI = api.authAPI;
  });

  describe('jobsAPI', () => {
    test('gets all jobs without filters', async () => {
      const mockJobs = [{ id: 1, title: 'Data Scientist' }];
      mockAxiosInstance.get.mockResolvedValue({ data: mockJobs });
      
      const result = await jobsAPI.getAll();
      expect(result).toEqual(mockJobs);
    });

    test('gets job by ID', async () => {
      const mockJob = { id: 1, title: 'Data Scientist' };
      mockAxiosInstance.get.mockResolvedValue({ data: mockJob });
      
      const result = await jobsAPI.getById(1);
      expect(result).toEqual(mockJob);
    });

    test('creates new job', async () => {
      const newJob = { title: 'Data Scientist', company: 'Tech Corp' };
      mockAxiosInstance.post.mockResolvedValue({ data: { ...newJob, id: 1 } });
      
      await jobsAPI.create(newJob);
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/jobs', newJob);
    });

    test('updates job', async () => {
      const updatedJob = { id: 1, title: 'Senior Data Scientist' };
      mockAxiosInstance.put.mockResolvedValue({ data: updatedJob });
      
      await jobsAPI.update(1, updatedJob);
      expect(mockAxiosInstance.put).toHaveBeenCalledWith('/jobs/1', updatedJob);
    });

    test('deletes job', async () => {
      mockAxiosInstance.delete.mockResolvedValue({ data: { success: true } });
      
      await jobsAPI.delete(1);
      expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/jobs/1');
    });
  });

  describe('authAPI', () => {
    test('registers new user', async () => {
      const userData = { email: 'test@example.com', password: 'password123' };
      mockAxiosInstance.post.mockResolvedValue({ data: { user: userData, token: 'token123' } });
      
      await authAPI.register(userData);
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/auth/register', userData);
    });

    test('logs in user', async () => {
      const credentials = { email: 'test@example.com', password: 'password123' };
      mockAxiosInstance.post.mockResolvedValue({ data: { user: {}, token: 'token123' } });
      
      await authAPI.login(credentials);
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/auth/login', credentials);
    });
  });
});
