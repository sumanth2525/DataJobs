// Utility to extract job information from URLs
import { jobsAPI } from '../lib/api';

export const parseJobUrl = async (url) => {
  if (!url || !url.trim()) {
    return null;
  }

  try {
    // Basic URL validation
    new URL(url);
  } catch (e) {
    return { error: 'Invalid URL format' };
  }

  const extractedData = {
    link: url,
    company: '',
    title: '',
    location: '',
    salary: '',
    description: '',
    workLocation: 'Remote',
    experience: 'Middle',
    workingSchedule: 'Full time',
    employmentType: 'Full day',
    tags: []
  };

  // Try to extract information from URL patterns
  const urlLower = url.toLowerCase();
  
  // Extract company name from common job board patterns
  const companyPatterns = [
    /linkedin\.com\/company\/([^/?]+)/,
    /indeed\.com\/viewjob\?.*cmp=([^&]+)/,
    /glassdoor\.com\/job\/.*-([^-]+)-/,
    /([a-z]+)\.com\/careers/,
    /([a-z]+)\.com\/jobs/,
    /\/company\/([^/?]+)/,
    /\/at\/([^/?]+)/
  ];

  for (const pattern of companyPatterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      let companyName = match[1]
        .replace(/-/g, ' ')
        .replace(/_/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      extractedData.company = companyName;
      break;
    }
  }

  // Extract job title from URL
  const titlePatterns = [
    /jobs\/([^/?]+)/,
    /job\/([^/?]+)/,
    /careers\/([^/?]+)/,
    /position\/([^/?]+)/,
    /viewjob\?.*jk=([^&]+)/,
    /-([^-]+)-job/,
    /job-posting\/([^/?]+)/
  ];

  for (const pattern of titlePatterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      let title = decodeURIComponent(match[1])
        .replace(/-/g, ' ')
        .replace(/_/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      extractedData.title = title;
      break;
    }
  }

  // Extract location from URL if present
  const locationPatterns = [
    /location=([^&]+)/,
    /loc=([^&]+)/,
    /city=([^&]+)/
  ];

  for (const pattern of locationPatterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      extractedData.location = decodeURIComponent(match[1]).replace(/\+/g, ' ');
      break;
    }
  }

  // Detect work type from URL
  if (urlLower.includes('remote') || urlLower.includes('work-from-home')) {
    extractedData.workLocation = 'Remote';
    extractedData.tags.push('Remote');
  }

  // Detect experience level from title
  const titleLower = extractedData.title.toLowerCase();
  if (titleLower.includes('senior') || titleLower.includes('sr')) {
    extractedData.experience = 'Senior';
  } else if (titleLower.includes('junior') || titleLower.includes('jr') || titleLower.includes('entry')) {
    extractedData.experience = 'Junior';
  }

  // Try to fetch page metadata (this would work with a backend proxy)
  // For now, we'll use a mock approach that can be enhanced
  try {
    // In a real implementation, you'd call a backend API that scrapes the URL
    // For now, we'll return what we can extract from the URL itself
    const response = await fetchJobDetails(url);
    if (response) {
      return { ...extractedData, ...response };
    }
  } catch (error) {
    // Silently fail - user can fill form manually
  }

  return extractedData;
};

// Fetch job details using ChatGPT API
const fetchJobDetails = async (url) => {
  try {
    const response = await jobsAPI.scrapeJob(url);
    if (response.success && response.data) {
      return response.data;
    }
    return null;
  } catch (error) {
    // Silently fail - user can fill form manually
    return null;
  }
};

// Helper to detect if URL is from a known job board
export const detectJobBoard = (url) => {
  const jobBoards = {
    'linkedin': 'LinkedIn',
    'indeed': 'Indeed',
    'glassdoor': 'Glassdoor',
    'monster': 'Monster',
    'ziprecruiter': 'ZipRecruiter',
    'dice': 'Dice',
    'simplyhired': 'SimplyHired'
  };

  const urlLower = url.toLowerCase();
  for (const [key, name] of Object.entries(jobBoards)) {
    if (urlLower.includes(key)) {
      return name;
    }
  }
  return null;
};
