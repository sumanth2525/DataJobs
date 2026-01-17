import { getTimeAgo } from '../../utils/timeUtils';

describe('timeUtils', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-01-15T12:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('returns "just now" for very recent time', () => {
    const recentTime = new Date('2024-01-15T11:59:55Z').toISOString();
    expect(getTimeAgo(recentTime)).toBe('just now');
  });

  test('returns minutes ago for recent time', () => {
    const fiveMinutesAgo = new Date('2024-01-15T11:55:00Z').toISOString();
    expect(getTimeAgo(fiveMinutesAgo)).toBe('5 minutes ago');
  });

  test('returns hours ago for older time', () => {
    const twoHoursAgo = new Date('2024-01-15T10:00:00Z').toISOString();
    expect(getTimeAgo(twoHoursAgo)).toBe('2 hours ago');
  });

  test('returns days ago for very old time', () => {
    const threeDaysAgo = new Date('2024-01-12T12:00:00Z').toISOString();
    expect(getTimeAgo(threeDaysAgo)).toBe('3 days ago');
  });

  test('handles invalid date gracefully', () => {
    expect(getTimeAgo('invalid-date')).toBe('just now');
    expect(getTimeAgo(null)).toBe('just now');
    expect(getTimeAgo(undefined)).toBe('just now');
  });
});
