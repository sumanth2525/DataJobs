import axios from 'axios';
import { jobsAPI, authAPI, usersAPI, messagesAPI } from '../../lib/api';

// Mock axios
jest.mock('axios');
const mockedAxios = axios;

describe('API Client', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('jobsAPI', () => {
    test('getAll should fetch jobs without filters', async () => {
      const mockJobs = [{ id: 1, title: 'Test Job' }];
      mockedAxios.create.mockReturnValue({
        get: jest.fn().mockResolvedValue({ data: { success: true, data: mockJobs } }),
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() }
        }
      });

      const result = await jobsAPI.getAll();

      expect(result.success).toBe(true);
    });

    test('getAll should fetch jobs with filters', async () => {
      const mockResponse = { data: { success: true, data: [] } };
      const mockGet = jest.fn().mockResolvedValue(mockResponse);
      
      mockedAxios.create.mockReturnValue({
        get: mockGet,
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() }
        }
      });

      await jobsAPI.getAll({ search: 'data scientist', location: 'Remote' });
      
      expect(mockGet).toHaveBeenCalled();
    });

    test('getById should fetch single job', async () => {
      const mockJob = { id: 1, title: 'Test Job' };
      const mockGet = jest.fn().mockResolvedValue({ 
        data: { success: true, data: mockJob } 
      });
      
      mockedAxios.create.mockReturnValue({
        get: mockGet,
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() }
        }
      });

      const result = await jobsAPI.getById(1);
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockJob);
    });

    test('create should post new job', async () => {
      const newJob = { company: 'Test', title: 'Job', link: 'http://test.com' };
      const mockPost = jest.fn().mockResolvedValue({ 
        data: { success: true, data: { id: 1, ...newJob } } 
      });
      
      mockedAxios.create.mockReturnValue({
        post: mockPost,
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() }
        }
      });

      const result = await jobsAPI.create(newJob);
      
      expect(result.success).toBe(true);
    });

    test('update should update job', async () => {
      const updates = { title: 'Updated Title' };
      const mockPut = jest.fn().mockResolvedValue({ 
        data: { success: true, data: { id: 1, ...updates } } 
      });
      
      mockedAxios.create.mockReturnValue({
        put: mockPut,
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() }
        }
      });

      const result = await jobsAPI.update(1, updates);
      
      expect(result.success).toBe(true);
    });

    test('delete should delete job', async () => {
      const mockDelete = jest.fn().mockResolvedValue({ 
        data: { success: true } 
      });
      
      mockedAxios.create.mockReturnValue({
        delete: mockDelete,
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() }
        }
      });

      const result = await jobsAPI.delete(1);
      
      expect(result.success).toBe(true);
    });
  });

  describe('authAPI', () => {
    test('register should register new user and store token', async () => {
      const userData = { email: 'test@test.com', password: 'password123' };
      const mockResponse = {
        data: {
          success: true,
          data: {
            user: { id: '1', email: 'test@test.com' },
            session: { access_token: 'token123' }
          }
        }
      };
      
      const mockPost = jest.fn().mockResolvedValue(mockResponse);
      mockedAxios.create.mockReturnValue({
        post: mockPost,
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() }
        }
      });

      const result = await authAPI.register(userData);
      
      expect(result.success).toBe(true);
      expect(localStorage.setItem).toHaveBeenCalledWith('auth_token', 'token123');
    });

    test('login should login user and store token', async () => {
      const credentials = { email: 'test@test.com', password: 'password123' };
      const mockResponse = {
        data: {
          success: true,
          data: {
            user: { id: '1', email: 'test@test.com' },
            session: { access_token: 'token123' }
          }
        }
      };
      
      const mockPost = jest.fn().mockResolvedValue(mockResponse);
      mockedAxios.create.mockReturnValue({
        post: mockPost,
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() }
        }
      });

      const result = await authAPI.login(credentials);
      
      expect(result.success).toBe(true);
      expect(localStorage.setItem).toHaveBeenCalledWith('auth_token', 'token123');
    });

    test('logout should clear tokens', () => {
      localStorage.setItem('auth_token', 'token123');
      localStorage.setItem('user', '{}');
      
      authAPI.logout();
      
      expect(localStorage.removeItem).toHaveBeenCalledWith('auth_token');
      expect(localStorage.removeItem).toHaveBeenCalledWith('user');
    });
  });

  describe('usersAPI', () => {
    test('getOnlineCount should fetch online users count', async () => {
      const mockResponse = { data: { success: true, count: 1500 } };
      const mockGet = jest.fn().mockResolvedValue(mockResponse);
      
      mockedAxios.create.mockReturnValue({
        get: mockGet,
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() }
        }
      });

      const result = await usersAPI.getOnlineCount();
      
      expect(result.success).toBe(true);
      expect(result.count).toBe(1500);
    });
  });

  describe('messagesAPI', () => {
    test('getAll should fetch messages for user', async () => {
      const mockMessages = [{ id: 1, content: 'Hello' }];
      const mockGet = jest.fn().mockResolvedValue({ 
        data: { success: true, data: mockMessages } 
      });
      
      mockedAxios.create.mockReturnValue({
        get: mockGet,
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() }
        }
      });

      const result = await messagesAPI.getAll('user123');
      
      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
    });

    test('send should send message', async () => {
      const messageData = {
        sender_id: '123',
        receiver_id: '456',
        content: 'Hello'
      };
      
      const mockPost = jest.fn().mockResolvedValue({ 
        data: { success: true, data: { id: 1, ...messageData } } 
      });
      
      mockedAxios.create.mockReturnValue({
        post: mockPost,
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() }
        }
      });

      const result = await messagesAPI.send(messageData);
      
      expect(result.success).toBe(true);
    });
  });
});
