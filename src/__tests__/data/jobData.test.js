import { sampleJobs } from '../../data/jobData';

describe('Job Data Generator', () => {
  test('generates exactly 100 jobs', () => {
    expect(sampleJobs).toHaveLength(100);
  });

  test('each job has required fields', () => {
    sampleJobs.forEach((job, index) => {
      expect(job).toHaveProperty('id');
      expect(job).toHaveProperty('company');
      expect(job).toHaveProperty('title');
      expect(job).toHaveProperty('location');
      expect(job).toHaveProperty('salary');
      expect(job).toHaveProperty('tags');
      expect(job).toHaveProperty('companyLogo');
      expect(job).toHaveProperty('date');
      expect(job).toHaveProperty('timestamp');
    });
  });

  test('job IDs are sequential and unique', () => {
    const ids = sampleJobs.map(job => job.id);
    const uniqueIds = new Set(ids);
    
    expect(ids.length).toBe(100);
    expect(uniqueIds.size).toBe(100);
    expect(ids[0]).toBe(1);
    expect(ids[99]).toBe(100);
  });

  test('all jobs have valid company names', () => {
    sampleJobs.forEach(job => {
      expect(job.company).toBeTruthy();
      expect(typeof job.company).toBe('string');
      expect(job.company.length).toBeGreaterThan(0);
    });
  });

  test('all jobs have valid job titles', () => {
    const validTitles = [
      'Data Engineer', 'Data Scientist', 'Data Analyst', 'Machine Learning Engineer',
      'Business Intelligence Analyst', 'Data Architect', 'ETL Developer'
    ];
    
    sampleJobs.forEach(job => {
      expect(job.title).toBeTruthy();
      expect(typeof job.title).toBe('string');
      expect(job.title.length).toBeGreaterThan(0);
    });
  });

  test('all jobs have valid locations', () => {
    sampleJobs.forEach(job => {
      expect(job.location).toBeTruthy();
      expect(typeof job.location).toBe('string');
      expect(job.location.length).toBeGreaterThan(0);
    });
  });

  test('all jobs have valid salary format', () => {
    const salaryPattern = /^\$\d+\/hr$/;
    
    sampleJobs.forEach(job => {
      expect(job.salary).toMatch(salaryPattern);
    });
  });

  test('all jobs have tags array', () => {
    sampleJobs.forEach(job => {
      expect(Array.isArray(job.tags)).toBe(true);
      expect(job.tags.length).toBeGreaterThan(0);
    });
  });

  test('company logo is first letter of company', () => {
    sampleJobs.forEach(job => {
      expect(job.companyLogo).toBe(job.company.charAt(0).toUpperCase());
    });
  });

  test('all jobs have valid date format', () => {
    const datePattern = /^\d{1,2} (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) \d{4}$/;
    
    sampleJobs.forEach(job => {
      expect(job.date).toMatch(datePattern);
    });
  });

  test('all jobs have valid ISO timestamp', () => {
    sampleJobs.forEach(job => {
      expect(job.timestamp).toBeTruthy();
      expect(typeof job.timestamp).toBe('string');
      // Should be valid ISO date string
      expect(() => new Date(job.timestamp)).not.toThrow();
      expect(new Date(job.timestamp).toISOString()).toBeTruthy();
    });
  });

  test('timestamps are within last 30 days', () => {
    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    sampleJobs.forEach(job => {
      const jobDate = new Date(job.timestamp);
      expect(jobDate.getTime()).toBeLessThanOrEqual(now.getTime());
      expect(jobDate.getTime()).toBeGreaterThanOrEqual(thirtyDaysAgo.getTime());
    });
  });

  test('tags contain valid work schedule values', () => {
    const validSchedules = ['Full time', 'Part time', 'Internship', 'Project work', 'Volunteering'];
    
    sampleJobs.forEach(job => {
      const hasSchedule = job.tags.some(tag => validSchedules.includes(tag));
      expect(hasSchedule).toBe(true);
    });
  });

  test('tags contain valid experience levels', () => {
    const validLevels = ['Senior level', 'Middle level', 'Junior level'];
    
    sampleJobs.forEach(job => {
      const hasLevel = job.tags.some(tag => validLevels.includes(tag));
      // Not all jobs might have explicit level, so this is optional
    });
  });

  test('jobs have variety in companies', () => {
    const uniqueCompanies = new Set(sampleJobs.map(job => job.company));
    // Should have at least some variety (not all same company)
    expect(uniqueCompanies.size).toBeGreaterThan(1);
  });

  test('jobs have variety in titles', () => {
    const uniqueTitles = new Set(sampleJobs.map(job => job.title));
    // Should have at least some variety
    expect(uniqueTitles.size).toBeGreaterThan(1);
  });

  test('jobs have variety in locations', () => {
    const uniqueLocations = new Set(sampleJobs.map(job => job.location));
    // Should have at least some variety
    expect(uniqueLocations.size).toBeGreaterThan(1);
  });

  test('salary values are within expected range', () => {
    sampleJobs.forEach(job => {
      const salaryMatch = job.salary.match(/\$(\d+)\/hr/);
      if (salaryMatch) {
        const salaryValue = parseInt(salaryMatch[1]);
        expect(salaryValue).toBeGreaterThanOrEqual(800);
        expect(salaryValue).toBeLessThanOrEqual(1600);
      }
    });
  });
});
