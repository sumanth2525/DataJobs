import React, { useState } from 'react';
import { parseJobUrl, detectJobBoard } from '../utils/jobUrlParser';
import './Admin.css';

const Admin = ({ onJobPost, onNavigate }) => {
  const [formData, setFormData] = useState({
    company: '',
    title: '',
    location: '',
    salary: '',
    workLocation: 'Remote',
    experience: 'Middle',
    workingSchedule: 'Full time',
    employmentType: 'Full day',
    tags: [],
    description: '',
    link: ''
  });

  const [tagInput, setTagInput] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [jobUrl, setJobUrl] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  const [fetchError, setFetchError] = useState('');
  const [fetchSuccess, setFetchSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleFetchJobDetails = async () => {
    if (!jobUrl.trim()) {
      setFetchError('Please enter a job URL');
      return;
    }

    setIsFetching(true);
    setFetchError('');
    setFetchSuccess(false);

    try {
      const extractedData = await parseJobUrl(jobUrl.trim());
      
      if (extractedData.error) {
        setFetchError(extractedData.error);
        setIsFetching(false);
        return;
      }

      // Auto-fill form with extracted data
      setFormData(prev => ({
        ...prev,
        company: extractedData.company || prev.company,
        title: extractedData.title || prev.title,
        location: extractedData.location || prev.location,
        salary: extractedData.salary || prev.salary,
        description: extractedData.description || prev.description,
        link: extractedData.link || prev.link,
        workLocation: extractedData.workLocation || prev.workLocation,
        experience: extractedData.experience || prev.experience,
        workingSchedule: extractedData.workingSchedule || prev.workingSchedule,
        employmentType: extractedData.employmentType || prev.employmentType,
        tags: extractedData.tags.length > 0 ? extractedData.tags : prev.tags
      }));

      setFetchSuccess(true);
      setTimeout(() => setFetchSuccess(false), 3000);
      
      // If we got basic info, show success message
      if (extractedData.company || extractedData.title) {
        const jobBoard = detectJobBoard(jobUrl);
        const message = jobBoard 
          ? `Job details extracted from ${jobBoard}! Please review and complete any missing fields.`
          : 'Job details extracted! Please review and complete any missing fields.';
        alert(message);
      } else {
        setFetchError('Could not automatically extract job details. Please fill the form manually.');
      }
    } catch (error) {
      setFetchError('Error fetching job details. Please fill the form manually.');
      console.error('Error parsing job URL:', error);
    } finally {
      setIsFetching(false);
    }
  };

  const handleUrlPaste = async (e) => {
    const url = e.target.value;
    setJobUrl(url);
    
    // Auto-detect and try to extract if it looks like a valid job URL
    if (url && url.startsWith('http')) {
      const jobBoard = detectJobBoard(url);
      if (jobBoard) {
        // Auto-fetch after a short delay
        setTimeout(() => {
          handleFetchJobDetails();
        }, 1000);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.company || !formData.title || !formData.link) {
      alert('Please fill in all required fields (Company, Title, and Job Link)');
      return;
    }

    const newJob = {
      id: Date.now(), // Simple ID generation
      company: formData.company,
      title: formData.title,
      location: formData.location || 'Not specified',
      salary: formData.salary || 'Not specified',
      companyLogo: formData.company.charAt(0).toUpperCase(),
      tags: [
        formData.workingSchedule,
        formData.experience + ' level',
        formData.workLocation === 'Remote' ? 'Distant' : formData.workLocation,
        formData.employmentType,
        ...formData.tags
      ].filter(Boolean),
      link: formData.link,
      description: formData.description,
      timestamp: new Date().toISOString(),
      date: new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      })
    };

    if (onJobPost) {
      onJobPost(newJob);
    }

    // Reset form
    setFormData({
      company: '',
      title: '',
      location: '',
      salary: '',
      workLocation: 'Remote',
      experience: 'Middle',
      workingSchedule: 'Full time',
      employmentType: 'Full day',
      tags: [],
      description: '',
      link: ''
    });
    setTagInput('');
    setSubmitted(true);
    
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="admin-page">
      <div className="admin-container">
        <div className="admin-header">
          <div className="admin-header-top">
            <button className="back-button" onClick={() => {
              window.location.hash = '';
              if (onNavigate) onNavigate('dashboard');
            }}>
              ← Back to Job Portal
            </button>
          </div>
          <h1>
            <i className="bi bi-file-earmark-plus-fill" style={{marginRight: '8px'}}></i>
            Post a New Job
          </h1>
          <p>Fill in the details below to post a new job listing</p>
          <div className="company-link-info">
            <p className="link-label">
              <i className="bi bi-link-45deg" style={{marginRight: '6px'}}></i>
              Company Post Job Link:
            </p>
            <div className="link-display">
              <code>{window.location.origin}/#post-job</code>
              <button 
                className="copy-link-btn" 
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/#post-job`);
                  alert('Link copied to clipboard! Share this with companies to post jobs.');
                }}
              >
                <i className="bi bi-clipboard-check" style={{marginRight: '6px'}}></i>
                Copy Link
              </button>
            </div>
            <small>Share this link with companies. Jobs posted here will appear on the main job portal.</small>
          </div>
        </div>

        {submitted && (
          <div className="success-message">
            ✅ Job posted successfully! Applicants can now see it.
          </div>
        )}

        <form className="admin-form" onSubmit={handleSubmit}>
          <div className="form-section">
            <h3>
              <i className="bi bi-link-45deg" style={{marginRight: '8px'}}></i>
              Quick Post from URL
            </h3>
            
            <div className="url-fetch-section">
              <div className="url-input-wrapper">
                <input
                  type="url"
                  className="job-url-input"
                  placeholder="Paste job posting URL (LinkedIn, Indeed, Glassdoor, etc.)"
                  value={jobUrl}
                  onChange={handleUrlPaste}
                  onPaste={handleUrlPaste}
                />
                <button
                  type="button"
                  className="fetch-job-btn"
                  onClick={handleFetchJobDetails}
                  disabled={isFetching || !jobUrl.trim()}
                >
                  {isFetching ? (
                    <>
                      <i className="bi bi-arrow-repeat" style={{animation: 'spin 1s linear infinite', marginRight: '6px'}}></i>
                      Fetching...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-download" style={{marginRight: '6px'}}></i>
                      Fetch Job Details
                    </>
                  )}
                </button>
              </div>
              
              {fetchError && (
                <div className="fetch-error">
                  <i className="bi bi-exclamation-triangle"></i>
                  {fetchError}
                </div>
              )}
              
              {fetchSuccess && (
                <div className="fetch-success">
                  <i className="bi bi-check-circle"></i>
                  Job details fetched! Please review and complete the form.
                </div>
              )}
              
              <small className="url-help-text">
                <i className="bi bi-info-circle"></i>
                Paste a job posting URL and click "Fetch Job Details" to automatically fill the form. 
                Supported: LinkedIn, Indeed, Glassdoor, and other major job boards.
              </small>
            </div>
          </div>

          <div className="form-section">
            <h3>Job Information</h3>
            
            <div className="form-row">
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
                  placeholder="e.g., Senior Data Scientist"
                  required
                />
              </div>
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
                  placeholder="e.g., $1200/hr or $100k-150k"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="link">Job Application Link *</label>
              <input
                type="url"
                id="link"
                name="link"
                value={formData.link}
                onChange={handleChange}
                placeholder="https://company.com/careers/job-id"
                required
              />
              <small>This is where applicants will apply. If you pasted a URL above, it should be auto-filled.</small>
            </div>

            <div className="form-group">
              <label htmlFor="description">Job Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Brief description of the role..."
                rows="4"
              />
            </div>
          </div>

          <div className="form-section">
            <h3>Job Details</h3>
            
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
                  <option value="New York, NY">New York, NY</option>
                  <option value="California, CA">California, CA</option>
                  <option value="San Francisco, CA">San Francisco, CA</option>
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
                  <option value="Internship">Internship</option>
                  <option value="Project work">Project work</option>
                  <option value="Volunteering">Volunteering</option>
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
                  <option value="Full day">Full day</option>
                  <option value="Flexible schedule">Flexible schedule</option>
                  <option value="Shift work">Shift work</option>
                  <option value="Remote work">Remote work</option>
                  <option value="Shift method">Shift method</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="tags">Additional Tags</label>
              <div className="tag-input-group">
                <input
                  type="text"
                  id="tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  placeholder="Type and press Enter to add tags"
                />
                <button type="button" onClick={handleAddTag} className="add-tag-btn">
                  Add Tag
                </button>
              </div>
              {formData.tags.length > 0 && (
                <div className="tags-display">
                  {formData.tags.map((tag, index) => (
                    <span key={index} className="tag-item">
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="tag-remove"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="submit-btn">
              📤 Post Job
            </button>
            <button type="button" className="reset-btn" onClick={() => window.location.reload()}>
              Reset Form
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Admin;
