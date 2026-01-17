// Helper to create timestamp (days ago)
const getTimestamp = (daysAgo) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString();
};

export const sampleJobs = [
  {
    id: 1,
    date: '20 May 2023',
    timestamp: getTimestamp(5),
    company: 'Amazon',
    companyLogo: 'a',
    title: 'Senior Data Engineer',
    tags: ['Full time', 'Senior level', 'Remote', 'Project work'],
    salary: '$1250/hr',
    location: 'San Francisco, CA'
  },
  {
    id: 2,
    date: '4 Feb 2023',
    timestamp: getTimestamp(3),
    company: 'Google',
    companyLogo: 'G',
    title: 'Junior Data Analyst',
    tags: ['Full time', 'Junior level', 'Remote', 'Project work', 'Flexible schedule'],
    salary: '$1100/hr',
    location: 'California, CA'
  },
  {
    id: 3,
    date: '29 Jan 2023',
    timestamp: getTimestamp(7),
    company: 'Microsoft',
    companyLogo: 'M',
    title: 'Senior Data Scientist',
    tags: ['Full time', 'Senior level', 'Full Day', 'Shift work', 'Shift method'],
    salary: '$1300/hr',
    location: 'New York, NY'
  },
  {
    id: 4,
    date: '19 Apr 2023',
    timestamp: getTimestamp(2),
    company: 'Meta',
    companyLogo: 'f',
    title: 'Data Analyst',
    tags: ['Full time', 'Middle level', 'Remote', 'Project work'],
    salary: '$1120/hr',
    location: 'California, CA'
  },
  {
    id: 5,
    date: '3 Apr 2023',
    timestamp: getTimestamp(1),
    company: 'Netflix',
    companyLogo: 'N',
    title: 'Data Engineer',
    tags: ['Full time', 'Senior level'],
    salary: '$1300/hr',
    location: 'New York, NY'
  },
  {
    id: 6,
    date: '18 Jan 2023',
    timestamp: getTimestamp(10),
    company: 'Apple',
    companyLogo: '🍎',
    title: 'Data Architect',
    tags: ['Full time', 'Remote'],
    salary: '$1140/hr',
    location: 'San Francisco, CA'
  },
  {
    id: 7,
    date: '15 Jun 2023',
    timestamp: getTimestamp(4),
    company: 'Tesla',
    companyLogo: 'T',
    title: 'Machine Learning Engineer',
    tags: ['Full time', 'Senior level', 'Remote'],
    salary: '$1400/hr',
    location: 'California, CA'
  },
  {
    id: 8,
    date: '22 May 2023',
    timestamp: getTimestamp(6),
    company: 'IBM',
    companyLogo: 'IBM',
    title: 'Business Intelligence Analyst',
    tags: ['Full time', 'Middle level', 'Remote', 'Flexible schedule'],
    salary: '$1200/hr',
    location: 'New York, NY'
  },
  {
    id: 9,
    date: '10 Apr 2023',
    timestamp: getTimestamp(8),
    company: 'Oracle',
    companyLogo: 'O',
    title: 'Database Administrator',
    tags: ['Full time', 'Senior level', 'Full Day'],
    salary: '$1350/hr',
    location: 'San Francisco, CA'
  }
];
