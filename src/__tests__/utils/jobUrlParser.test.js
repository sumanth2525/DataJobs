import { parseJobUrl, detectJobBoard } from '../../utils/jobUrlParser';

// Mock fetch
global.fetch = jest.fn();

describe('jobUrlParser', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    fetch.mockResolvedValue(null);
  });

  describe('detectJobBoard', () => {
    test('detects LinkedIn URLs', () => {
      const url = 'https://www.linkedin.com/jobs/view/123';
      expect(detectJobBoard(url)).toBe('LinkedIn');
    });

    test('detects Indeed URLs', () => {
      const url = 'https://www.indeed.com/viewjob?jk=123';
      expect(detectJobBoard(url)).toBe('Indeed');
    });

    test('detects Glassdoor URLs', () => {
      const url = 'https://www.glassdoor.com/job-listing/data-scientist';
      expect(detectJobBoard(url)).toBe('Glassdoor');
    });

    test('returns null for unknown URLs', () => {
      const url = 'https://example.com/job';
      expect(detectJobBoard(url)).toBeNull();
    });
  });

  describe('parseJobUrl', () => {
    test('returns error for invalid URL', async () => {
      const result = await parseJobUrl('not-a-url');
      expect(result).toHaveProperty('error');
    });

    test('returns error for empty URL', async () => {
      const result = await parseJobUrl('');
      expect(result).toBeNull();
    });

    test('extracts company from LinkedIn URL', async () => {
      const url = 'https://www.linkedin.com/company/techcorp/jobs';
      const result = await parseJobUrl(url);
      
      expect(result).toHaveProperty('company');
      expect(result.company.toLowerCase()).toContain('techcorp');
    });

    test('extracts job title from URL', async () => {
      const url = 'https://example.com/jobs/data-scientist';
      const result = await parseJobUrl(url);
      
      expect(result).toHaveProperty('title');
      expect(result.title.toLowerCase()).toContain('data scientist');
    });

    test('detects remote work from URL', async () => {
      const url = 'https://example.com/jobs/remote-data-engineer';
      const result = await parseJobUrl(url);
      
      expect(result).toHaveProperty('workLocation', 'Remote');
      expect(result.tags).toContain('Remote');
    });

    test('detects senior level from title', async () => {
      const url = 'https://example.com/jobs/senior-data-analyst';
      const result = await parseJobUrl(url);
      
      expect(result).toHaveProperty('experience', 'Senior');
    });

    test('detects junior level from title', async () => {
      const url = 'https://example.com/jobs/junior-data-analyst';
      const result = await parseJobUrl(url);
      
      expect(result).toHaveProperty('experience', 'Junior');
    });

    test('returns default structure for valid URL', async () => {
      const url = 'https://example.com/job/123';
      const result = await parseJobUrl(url);
      
      expect(result).toHaveProperty('link', url);
      expect(result).toHaveProperty('company');
      expect(result).toHaveProperty('title');
      expect(result).toHaveProperty('tags');
      expect(Array.isArray(result.tags)).toBe(true);
    });
  });
});
