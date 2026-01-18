import { getTimeAgo, formatDate } from '../../utils/timeUtils';

describe('timeUtils', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-01-15T12:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('getTimeAgo', () => {
    test('returns "Just now" for very recent time', () => {
      const now = new Date();
      expect(getTimeAgo(now.toISOString())).toBe('Just now');
    });

    test('returns minutes ago for recent time', () => {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      expect(getTimeAgo(fiveMinutesAgo.toISOString())).toBe('5m ago');
    });

    test('returns hours ago for older time', () => {
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
      expect(getTimeAgo(twoHoursAgo.toISOString())).toBe('2h ago');
    });

    test('returns days ago for very old time', () => {
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
      expect(getTimeAgo(threeDaysAgo.toISOString())).toBe('3d ago');
    });

    test('handles invalid date string', () => {
      expect(getTimeAgo('invalid')).toBe('Invalid date');
    });

    test('handles null input', () => {
      expect(getTimeAgo(null)).toBe('Invalid date');
    });
  });

  describe('formatDate', () => {
    test('formats date correctly', () => {
      const date = new Date('2024-01-15T12:00:00Z');
      const formatted = formatDate(date.toISOString());
      
      expect(formatted).toContain('Jan');
      expect(formatted).toContain('15');
      expect(formatted).toContain('2024');
    });

    test('handles different date formats', () => {
      const date = new Date('2024-12-25T00:00:00Z');
      const formatted = formatDate(date.toISOString());
      
      expect(formatted).toContain('Dec');
      expect(formatted).toContain('25');
    });
  });

});
