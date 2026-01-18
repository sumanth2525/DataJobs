import React, { useState } from 'react';
import { jobsAPI } from '../lib/api';
import { parseJobUrl } from '../utils/jobUrlParser';
import './PostJob.css';

const PostJob = ({ onNavigate, onJobPosted }) => {
  const [formData, setFormData] = useState({
    company: '',
    title: '',
    location: '',
    salary: '',
    workLocation: 'Remote',
    experience: 'Middle',
    workingSchedule: 'Full time',
    employmentType: 'Full Day',
    description: '',
    link: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear errors when user types
    if (error) setError('');
  };

  const handleFetchJobDetails = async () => {
    const url = formData.link?.trim();
    if (!url) {
      setError('Please enter a job URL first');
      return;
    }

    setIsFetching(true);
    setError('');
    
    try {
      const extractedData = await parseJobUrl(url);
      
      if (extractedData?.error) {
        setError(extractedData.error);
        setIsFetching(false);
        return;
      }

      // Auto-fill form with extracted data (only if fields are empty)
      setFormData(prev => ({
        ...prev,
        company: extractedData.company || prev.company,
        title: extractedData.title || prev.title,
        location: extractedData.location || prev.location,
        salary: extractedData.salary || prev.salary,
        description: extractedData.description || prev.description,
        workLocation: extractedData.workLocation || prev.workLocation,
        experience: extractedData.experience || prev.experience,
        workingSchedule: extractedData.workingSchedule || prev.workingSchedule,
        employmentType: extractedData.employmentType || prev.employmentType,
        link: url // Ensure URL is set
      }));

      if (extractedData.company || extractedData.title) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError('Could not automatically extract job details. Please fill the form manually.');
      }
    } catch (error) {
      setError('Error fetching job details. Please fill the form manually.');
    } finally {
      setIsFetching(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Validation
    if (!formData.company || !formData.title || !formData.link) {
      setError('Company, Job Title, and Application Link are required');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await jobsAPI.create(formData);
      
      if (response.success) {
        setSuccess(true);
        // Reset form
        setFormData({
          company: '',
          title: '',
          location: '',
          salary: '',
          workLocation: 'Remote',
          experience: 'Middle',
          workingSchedule: 'Full time',
          employmentType: 'Full Day',
          description: '',
          link: ''
        });
        
        // Notify parent to refresh jobs
        if (onJobPosted) {
          onJobPosted();
        }
        
        // Show success message
        setTimeout(() => {
          setSuccess(false);
          // Navigate back to dashboard
          if (onNavigate) {
            onNavigate('dashboard');
          } else {
            window.location.hash = '';
          }
        }, 2000);
      } else {
        setError(response.error || 'Failed to post job');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to post job. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="post-job-page">
      <div className="post-job-container">
        <div className="post-job-header">
          <button 
            className="back-button"
            onClick={() => {
              if (onNavigate) {
                onNavigate('dashboard');
              } else {
                window.location.hash = '';
              }
            }}
            aria-label="Back to dashboard"
          >
            <i className="bi bi-arrow-left"></i>
            <span>Back</span>
          </button>
          <h1>Post a Job</h1>
          <p>Share your job opening with thousands of data professionals</p>
        </div>

        {success && (
          <div className="success-message">
            <i className="bi bi-check-circle-fill"></i>
            <span>Job posted successfully! Redirecting to dashboard...</span>
          </div>
        )}

        {error && (
          <div className="error-message">
            <i className="bi bi-exclamation-circle-fill"></i>
            <span>{error}</span>
          </div>
        )}

        <form className="post-job-form" onSubmit={handleSubmit}>
          <div className="form-section">
            <h2>Job Details</h2>
            
            <div className="form-group">
              <label htmlFor="company">Company Name *</label>
              <input
                type="text"
                id="company"
                name="company"
                value={formData.company}
                onChange={handleChange}
                placeholder="e.g., Google, Amazon, Microsoft"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="title">Job Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Senior Data Engineer, Data Scientist"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="location">Location</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g., San Francisco, CA"
                />
              </div>

              <div className="form-group">
                <label htmlFor="salary">Salary</label>
                <input
                  type="text"
                  id="salary"
                  name="salary"
                  value={formData.salary}
                  onChange={handleChange}
                  placeholder="e.g., $120k-180k/year"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="link">Application Link *</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="url"
                  id="link"
                  name="link"
                  value={formData.link}
                  onChange={handleChange}
                  placeholder="https://company.com/careers/job"
                  required
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  onClick={handleFetchJobDetails}
                  disabled={isFetching || !formData.link?.trim()}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: isFetching || !formData.link?.trim() ? 'not-allowed' : 'pointer',
                    opacity: isFetching || !formData.link?.trim() ? 0.6 : 1,
                    whiteSpace: 'nowrap'
                  }}
                  title="Fetch job details using ChatGPT"
                >
                  {isFetching ? (
                    <>
                      <i className="bi bi-hourglass-split"></i>
                      <span> Fetching...</span>
                    </>
                  ) : (
                    <>
                      <i className="bi bi-magic"></i>
                      <span> Auto-fill</span>
                    </>
                  )}
                </button>
              </div>
              <small style={{ color: '#666', marginTop: '4px', display: 'block' }}>
                Paste a job URL and click "Auto-fill" to automatically extract job details using AI.
                <br />
                <strong>Note:</strong> Configure your OpenAI API key in <code>backend/.env</code> file: <code>OPENAI_API_KEY=your-api-key-here</code>
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="description">Job Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="5"
                placeholder="Describe the role, requirements, and benefits..."
              />
            </div>
          </div>

          <div className="form-section">
            <h2>Job Requirements</h2>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="workLocation">Work Location</label>
                <select
                  id="workLocation"
                  name="workLocation"
                  value={formData.workLocation}
                  onChange={handleChange}
                >
                  <option value="Remote">Remote</option>
                  <option value="On-site">On-site</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="experience">Experience Level</label>
                <select
                  id="experience"
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                >
                  <option value="Junior">Junior</option>
                  <option value="Middle">Middle</option>
                  <option value="Senior">Senior</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="workingSchedule">Working Schedule</label>
                <select
                  id="workingSchedule"
                  name="workingSchedule"
                  value={formData.workingSchedule}
                  onChange={handleChange}
                >
                  <option value="Full time">Full time</option>
                  <option value="Part time">Part time</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="employmentType">Employment Type</label>
                <select
                  id="employmentType"
                  name="employmentType"
                  value={formData.employmentType}
                  onChange={handleChange}
                >
                  <option value="Full Day">Full Day</option>
                  <option value="Shift work">Shift work</option>
                  <option value="Flexible schedule">Flexible schedule</option>
                  <option value="Project work">Project work</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={() => {
                if (onNavigate) {
                  onNavigate('dashboard');
                } else {
                  window.location.hash = '';
                }
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <i className="bi bi-hourglass-split"></i>
                  <span>Posting...</span>
                </>
              ) : (
                <>
                  <i className="bi bi-check-circle"></i>
                  <span>Post Job</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostJob;
