// Helper to create timestamp (days ago)
const getTimestamp = (daysAgo) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString();
};

// Helper to format date
const formatDate = (daysAgo) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
};

// Arrays for generating varied mock data
const companies = [
  'Amazon', 'Google', 'Microsoft', 'Meta', 'Netflix', 'Apple', 'Tesla', 'IBM', 'Oracle',
  'Salesforce', 'Adobe', 'Intuit', 'PayPal', 'Spotify', 'Uber', 'Airbnb', 'LinkedIn', 'Twitter',
  'Zoom', 'Slack', 'Dropbox', 'Shopify', 'Square', 'Stripe', 'Atlassian', 'MongoDB', 'Snowflake',
  'Databricks', 'Palantir', 'Tableau', 'Splunk', 'Elastic', 'Confluent', 'Twilio', 'Okta', 'Zscaler',
  'CrowdStrike', 'Datadog', 'New Relic', 'PagerDuty', 'GitHub', 'GitLab', 'Docker', 'Red Hat',
  'VMware', 'Cisco', 'Dell', 'HP', 'Lenovo', 'Intel', 'NVIDIA', 'AMD', 'Qualcomm', 'Broadcom',
  'Accenture', 'Deloitte', 'PwC', 'EY', 'KPMG', 'Capgemini', 'TCS', 'Infosys', 'Wipro', 'Cognizant',
  'JPMorgan', 'Goldman Sachs', 'Morgan Stanley', 'Bank of America', 'Citigroup', 'Wells Fargo', 'Fidelity',
  'BlackRock', 'Vanguard', 'State Street', 'American Express', 'Visa', 'Mastercard', 'Discover',
  'Bloomberg', 'Reuters', 'S&P Global', 'Moody\'s', 'Morningstar', 'FactSet', 'IHS Markit',
  'McKinsey', 'Boston Consulting', 'Bain & Company', 'Oliver Wyman', 'A.T. Kearney', 'Roland Berger',
  'Amazon Web Services', 'Google Cloud', 'Microsoft Azure', 'IBM Cloud', 'Oracle Cloud', 'Alibaba Cloud'
];

const jobTitles = [
  'Data Engineer', 'Data Scientist', 'Data Analyst', 'Senior Data Engineer', 'Senior Data Scientist',
  'Junior Data Analyst', 'Machine Learning Engineer', 'AI Engineer', 'Data Architect', 'Business Intelligence Analyst',
  'Analytics Engineer', 'Data Warehouse Engineer', 'ETL Developer', 'Big Data Engineer', 'Data Quality Engineer',
  'Research Scientist', 'Applied Scientist', 'Statistician', 'Quantitative Analyst', 'Data Product Manager',
  'MLOps Engineer', 'Deep Learning Engineer', 'NLP Engineer', 'Computer Vision Engineer', 'Recommendation Systems Engineer',
  'Database Administrator', 'Database Developer', 'Data Modeler', 'Data Governance Specialist', 'Data Privacy Analyst',
  'Marketing Analyst', 'Product Analyst', 'Financial Analyst', 'Operations Analyst', 'Risk Analyst',
  'Business Analyst', 'Systems Analyst', 'Reporting Analyst', 'Insights Analyst', 'Customer Analytics Specialist'
];

const locations = [
  'San Francisco, CA', 'New York, NY', 'California, CA', 'Seattle, WA', 'Austin, TX',
  'Boston, MA', 'Chicago, IL', 'Denver, CO', 'Miami, FL', 'Atlanta, GA',
  'Portland, OR', 'Phoenix, AZ', 'Las Vegas, NV', 'Remote', 'Hybrid Remote',
  'Los Angeles, CA', 'San Diego, CA', 'San Jose, CA', 'Washington, DC', 'Philadelphia, PA',
  'Dallas, TX', 'Houston, TX', 'Nashville, TN', 'Charlotte, NC', 'Raleigh, NC',
  'Minneapolis, MN', 'Detroit, MI', 'Indianapolis, IN', 'Columbus, OH', 'Milwaukee, WI'
];

const tagCombinations = [
  ['Full time', 'Senior level', 'Remote'],
  ['Full time', 'Junior level', 'Remote'],
  ['Full time', 'Middle level', 'Remote'],
  ['Part time', 'Middle level', 'Remote'],
  ['Full time', 'Senior level', 'Full Day'],
  ['Full time', 'Junior level', 'Flexible schedule'],
  ['Full time', 'Middle level', 'Shift work'],
  ['Internship', 'Junior level', 'Remote'],
  ['Full time', 'Senior level', 'Project work'],
  ['Full time', 'Middle level', 'Distant work'],
  ['Part time', 'Junior level', 'Remote'],
  ['Full time', 'Senior level', 'Shift method'],
  ['Full time', 'Middle level', 'Project work', 'Remote'],
  ['Full time', 'Senior level', 'Full Day', 'Flexible schedule'],
  ['Full time', 'Junior level', 'Remote', 'Project work']
];

const salaryRanges = [
  '$800/hr', '$850/hr', '$900/hr', '$950/hr', '$1000/hr', '$1050/hr', '$1100/hr', '$1120/hr',
  '$1150/hr', '$1180/hr', '$1200/hr', '$1220/hr', '$1250/hr', '$1280/hr', '$1300/hr', '$1320/hr',
  '$1350/hr', '$1380/hr', '$1400/hr', '$1420/hr', '$1450/hr', '$1500/hr', '$1550/hr', '$1600/hr'
];

// Generate a random element from an array
const randomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Generate random number between min and max
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Generate 100 mock jobs
const generateMockJobs = () => {
  const jobs = [];
  const usedCompanyJobPairs = new Set();

  for (let i = 1; i <= 100; i++) {
    let company, title, pairKey;
    
    // Ensure variety in company-job combinations
    do {
      company = randomElement(companies);
      title = randomElement(jobTitles);
      pairKey = `${company}-${title}`;
    } while (usedCompanyJobPairs.has(pairKey) && i <= 50);
    
    usedCompanyJobPairs.add(pairKey);
    
    const daysAgo = randomInt(0, 30);
    const companyLogo = company.charAt(0).toUpperCase();
    
    jobs.push({
      id: i,
      date: formatDate(daysAgo),
      timestamp: getTimestamp(daysAgo),
      company: company,
      companyLogo: companyLogo,
      title: title,
      tags: [...randomElement(tagCombinations)],
      salary: randomElement(salaryRanges),
      location: randomElement(locations)
    });
  }

  return jobs;
};

export const sampleJobs = generateMockJobs();
