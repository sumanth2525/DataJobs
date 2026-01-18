import React, { useState, useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';
import './App.css';
import Dashboard from './components/Dashboard';
import PostJob from './components/PostJob';
import Messages from './components/Messages';
import Community from './components/Community';
import Profile from './components/Profile';
import Login from './components/Login';
import SignUp from './components/SignUp';
import { sampleJobs } from './data/jobData';
import { jobsAPI, adzunaAPI, serpAPI } from './lib/api';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [jobs, setJobs] = useState(sampleJobs);
  const [isLoadingJobs, setIsLoadingJobs] = useState(true);
  const [user, setUser] = useState(null); // null when not logged in
  const [showLogin, setShowLogin] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);

  // Check URL hash on mount and when it changes
  useEffect(() => {
    const checkHash = () => {
      const hash = window.location.hash;
      let page = 'dashboard';
      
      if (hash === '#post-job') {
        page = 'post-job';
      } else if (hash === '#messages') {
        page = 'messages';
      } else if (hash === '#community') {
        page = 'community';
      } else if (hash === '#profile') {
        page = 'profile';
      }
      
      setCurrentPage(page);
    };

    checkHash();
    window.addEventListener('hashchange', checkHash);
    return () => window.removeEventListener('hashchange', checkHash);
  }, []);

  const handleNavigate = (page) => {
    if (page === 'post-job') {
      window.location.hash = '#post-job';
    } else if (page === 'messages') {
      window.location.hash = '#messages';
    } else if (page === 'community') {
      window.location.hash = '#community';
    } else if (page === 'profile') {
      window.location.hash = '#profile';
    } else {
      window.location.hash = '';
    }
    setCurrentPage(page);
  };

  const handleJobPosted = async () => {
    // Refresh jobs from API after posting
    try {
      const response = await jobsAPI.getAll();
      if (response && response.success && response.data && Array.isArray(response.data)) {
        const transformedJobs = response.data.map(job => ({
          id: job.id,
          company: job.company,
          companyLogo: job.company_logo || job.company?.charAt(0).toUpperCase() || '?',
          title: job.title,
          location: job.location,
          salary: job.salary,
          tags: job.tags || [],
          link: job.link,
          description: job.description,
          timestamp: job.created_at,
          date: job.created_at 
            ? new Date(job.created_at).toLocaleDateString('en-US', { 
                day: 'numeric', 
                month: 'short', 
                year: 'numeric' 
              })
            : new Date().toLocaleDateString('en-US', { 
                day: 'numeric', 
                month: 'short', 
                year: 'numeric' 
              })
        }));
        setJobs(transformedJobs);
        console.log('Jobs refreshed after posting:', transformedJobs.length);
      }
    } catch (error) {
      console.error('Error refreshing jobs:', error);
    }
  };

  const handleLogin = (userData) => {
    setUser(userData);
    setShowLogin(false);
    // Store in localStorage for persistence
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleSignUp = (userData) => {
    setUser(userData);
    setShowSignUp(false);
    // Store in localStorage for persistence
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    window.location.hash = '';
    setCurrentPage('dashboard');
  };

  // Check for existing session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('user');
      }
    }
  }, []);

  // Fetch jobs from API on mount (Database + Adzuna API)
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setIsLoadingJobs(true);
        console.log('Fetching jobs from API...');
        
        // Fetch from database, Adzuna API, and SerpAPI in parallel
        const [dbResponse, adzunaResponse, serpResponse] = await Promise.allSettled([
          jobsAPI.getAll(),
          adzunaAPI.getDataRoles({ location: '', page: 1, results_per_page: 50 }).catch(err => {
            console.warn('Adzuna API error:', err);
            return { success: false, data: [] };
          }),
          serpAPI.getDataRoles({ location: '', num: 50 }).catch(err => {
            console.warn('SerpAPI error:', err);
            return { success: false, data: [] };
          })
        ]);
        
        // Process database jobs
        let dbJobs = [];
        if (dbResponse.status === 'fulfilled' && dbResponse.value?.success && dbResponse.value?.data) {
          console.log(`Fetched ${dbResponse.value.data.length} jobs from database`);
          dbJobs = dbResponse.value.data.map(job => ({
            id: job.id,
            company: job.company,
            companyLogo: job.company_logo || job.company?.charAt(0).toUpperCase() || '?',
            title: job.title,
            location: job.location,
            salary: job.salary,
            tags: job.tags || [],
            link: job.link,
            description: job.description,
            timestamp: job.created_at,
            date: job.created_at 
              ? new Date(job.created_at).toLocaleDateString('en-US', { 
                  day: 'numeric', 
                  month: 'short', 
                  year: 'numeric' 
                })
              : new Date().toLocaleDateString('en-US', { 
                  day: 'numeric', 
                  month: 'short', 
                  year: 'numeric' 
                })
          }));
        }
        
        // Process Adzuna jobs
        let adzunaJobs = [];
        if (adzunaResponse.status === 'fulfilled' && adzunaResponse.value?.success && adzunaResponse.value?.data) {
          console.log(`Fetched ${adzunaResponse.value.data.length} jobs from Adzuna API`);
          adzunaJobs = adzunaResponse.value.data.map(job => ({
            id: job.id,
            company: job.company,
            companyLogo: job.company_logo || job.company?.charAt(0).toUpperCase() || '?',
            title: job.title,
            location: job.location,
            salary: job.salary,
            tags: job.tags || [],
            link: job.link,
            description: job.description,
            timestamp: job.created_at,
            date: job.created_at 
              ? new Date(job.created_at).toLocaleDateString('en-US', { 
                  day: 'numeric', 
                  month: 'short', 
                  year: 'numeric' 
                })
              : new Date().toLocaleDateString('en-US', { 
                  day: 'numeric', 
                  month: 'short', 
                  year: 'numeric' 
                })
          }));
        } else if (adzunaResponse.status === 'rejected') {
          console.warn('Adzuna API request failed. This is okay if API keys are not configured.');
        }

        // Process SerpAPI (Google Jobs) jobs
        let serpJobs = [];
        if (serpResponse.status === 'fulfilled' && serpResponse.value?.success && serpResponse.value?.data) {
          console.log(`Fetched ${serpResponse.value.data.length} jobs from SerpAPI (Google Jobs)`);
          serpJobs = serpResponse.value.data.map(job => ({
            id: job.id,
            company: job.company,
            companyLogo: job.company_logo || job.company?.charAt(0).toUpperCase() || '?',
            title: job.title,
            location: job.location,
            salary: job.salary,
            tags: job.tags || [],
            link: job.link,
            description: job.description,
            timestamp: job.created_at,
            date: job.created_at 
              ? new Date(job.created_at).toLocaleDateString('en-US', { 
                  day: 'numeric', 
                  month: 'short', 
                  year: 'numeric' 
                })
              : new Date().toLocaleDateString('en-US', { 
                  day: 'numeric', 
                  month: 'short', 
                  year: 'numeric' 
                })
          }));
        } else if (serpResponse.status === 'rejected') {
          console.warn('SerpAPI request failed. This is okay if API keys are not configured.');
        }
        
        // Combine jobs (database jobs first, then Adzuna jobs, then SerpAPI jobs)
        const allJobs = [...dbJobs, ...adzunaJobs, ...serpJobs];
        
        // Remove duplicates based on title + company combination
        const uniqueJobs = Array.from(
          new Map(allJobs.map(job => [`${job.title}-${job.company}`, job])).values()
        );
        
        console.log(`Total unique jobs: ${uniqueJobs.length} (${dbJobs.length} from DB, ${adzunaJobs.length} from Adzuna, ${serpJobs.length} from SerpAPI)`);

        // Save jobs from external APIs to database
        const externalJobsToSave = [...adzunaJobs, ...serpJobs];
        if (externalJobsToSave.length > 0) {
          try {
            // Prepare jobs for database insertion
            const jobsForDB = externalJobsToSave.map(job => ({
              company: job.company,
              title: job.title,
              location: job.location || 'Not specified',
              salary: job.salary || 'Not specified',
              company_logo: job.companyLogo || job.company?.charAt(0).toUpperCase() || '?',
              tags: Array.isArray(job.tags) ? job.tags : [],
              link: job.link || '#',
              description: job.description || '',
              workLocation: job.workLocation || 'Remote',
              experience: job.experience || 'Middle',
              workingSchedule: job.workingSchedule || 'Full time',
              employmentType: job.employmentType || 'Full Day',
              created_at: job.timestamp || new Date().toISOString()
            })).filter(job => job.link && job.link !== '#'); // Filter out jobs without valid links

            if (jobsForDB.length > 0) {
              const saveResponse = await jobsAPI.bulkCreate(jobsForDB);
              if (saveResponse.success) {
                console.log(`Saved ${saveResponse.inserted} new jobs to database (${saveResponse.skipped} duplicates skipped)`);
              }
            }
          } catch (saveError) {
            console.warn('Failed to save external jobs to database:', saveError);
            // Don't fail the entire job fetch if save fails
          }
        }
        
        if (uniqueJobs.length > 0) {
          setJobs(uniqueJobs);
        } else {
          // If no jobs from APIs, use sample jobs as fallback
          console.warn('No jobs from APIs. Using sample jobs as fallback:', sampleJobs.length);
          setJobs(sampleJobs);
        }
      } catch (error) {
        console.error('Error fetching jobs:', error);
        console.error('Error details:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });
        
        // Use sample jobs as fallback
        console.warn('Using sample jobs as fallback due to error');
        setJobs(sampleJobs);
      } finally {
        setIsLoadingJobs(false);
      }
    };

    fetchJobs();
  }, []);

  return (
    <div className="App">
      {currentPage === 'dashboard' && (
        <Dashboard 
          jobs={jobs} 
          setJobs={setJobs} 
          onNavigate={handleNavigate}
          user={user}
          onShowLogin={() => setShowLogin(true)}
          onShowSignUp={() => setShowSignUp(true)}
          onLogout={handleLogout}
        />
      )}
      {currentPage === 'post-job' && (
        <PostJob 
          onNavigate={handleNavigate}
          onJobPosted={handleJobPosted}
        />
      )}
      {currentPage === 'messages' && (
        <Messages onNavigate={handleNavigate} />
      )}
      {currentPage === 'community' && (
        <Community onNavigate={handleNavigate} />
      )}
      {currentPage === 'profile' && (
        <Profile onNavigate={handleNavigate} />
      )}
      
      {/* Auth Modals */}
      {showLogin && (
        <Login
          onLogin={handleLogin}
          onSwitchToSignUp={() => {
            setShowLogin(false);
            setShowSignUp(true);
          }}
          onClose={() => setShowLogin(false)}
        />
      )}
      {showSignUp && (
        <SignUp
          onSignUp={handleSignUp}
          onSwitchToLogin={() => {
            setShowSignUp(false);
            setShowLogin(true);
          }}
          onClose={() => setShowSignUp(false)}
        />
      )}
      <Analytics />
    </div>
  );
}

export default App;
