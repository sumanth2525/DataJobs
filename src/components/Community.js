import React, { useState } from 'react';
import { sampleUsers, samplePosts, suggestedConnections } from '../data/communityData';
import './Community.css';

const Community = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState('feed');
  const [posts, setPosts] = useState(samplePosts);
  const [users, setUsers] = useState(sampleUsers);
  const [suggestions, setSuggestions] = useState(suggestedConnections);
  const [newPostContent, setNewPostContent] = useState('');

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now - time) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const handleLike = (postId) => {
    setPosts(prev => prev.map(post => 
      post.id === postId
        ? {
            ...post,
            isLiked: !post.isLiked,
            likes: post.isLiked ? post.likes - 1 : post.likes + 1,
          }
        : post
    ));
  };

  const handleConnect = (userId) => {
    setUsers(prev => prev.map(user => 
      user.id === userId
        ? { ...user, isConnected: true }
        : user
    ));
    setSuggestions(prev => prev.filter(user => user.id !== userId));
  };

  const handleDisconnect = (userId) => {
    setUsers(prev => prev.map(user => 
      user.id === userId
        ? { ...user, isConnected: false }
        : user
    ));
  };

  const handleShare = (postId) => {
    // In a real app, this would open a share dialog
    alert('Post shared!');
  };

  const handlePostSubmit = (e) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;

    const newPost = {
      id: posts.length + 1,
      author: {
        id: 0,
        name: 'You',
        title: 'Data Professional',
        company: 'DataJobPortal',
        avatar: 'ME',
      },
      timestamp: new Date().toISOString(),
      content: newPostContent.trim(),
      type: 'post',
      likes: 0,
      comments: 0,
      shares: 0,
      isLiked: false,
    };

    setPosts([newPost, ...posts]);
    setNewPostContent('');
  };

  const connectedUsers = users.filter(user => user.isConnected);
  const jobPosts = posts.filter(post => post.type === 'job');

  return (
    <div className="community-container">
      <div className="community-header">
        <button 
          className="back-button"
          onClick={() => onNavigate('dashboard')}
          aria-label="Back to dashboard"
        >
          <i className="bi bi-arrow-left"></i>
        </button>
        <h1 className="community-title">Community</h1>
        <div className="community-header-actions">
          <button className="header-action-button" aria-label="Notifications">
            <i className="bi bi-bell"></i>
          </button>
          <button className="header-action-button" aria-label="Search">
            <i className="bi bi-search"></i>
          </button>
        </div>
      </div>

      <div className="community-tabs">
        <button
          className={`community-tab ${activeTab === 'feed' ? 'active' : ''}`}
          onClick={() => setActiveTab('feed')}
        >
          <i className="bi bi-house-door"></i>
          <span>Feed</span>
        </button>
        <button
          className={`community-tab ${activeTab === 'connections' ? 'active' : ''}`}
          onClick={() => setActiveTab('connections')}
        >
          <i className="bi bi-people"></i>
          <span>Connections</span>
          {connectedUsers.length > 0 && (
            <span className="tab-badge">{connectedUsers.length}</span>
          )}
        </button>
        <button
          className={`community-tab ${activeTab === 'jobs' ? 'active' : ''}`}
          onClick={() => setActiveTab('jobs')}
        >
          <i className="bi bi-briefcase"></i>
          <span>Jobs</span>
          {jobPosts.length > 0 && (
            <span className="tab-badge">{jobPosts.length}</span>
          )}
        </button>
      </div>

      <div className="community-content">
        {activeTab === 'feed' && (
          <div className="feed-container">
            <div className="create-post-card">
              <div className="create-post-header">
                <div className="create-post-avatar">ME</div>
                <form className="create-post-form" onSubmit={handlePostSubmit}>
                  <input
                    type="text"
                    className="create-post-input"
                    placeholder="Share your thoughts, job opportunities, or insights..."
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                  />
                  <button type="submit" className="create-post-button" disabled={!newPostContent.trim()}>
                    <i className="bi bi-send-fill"></i>
                    Post
                  </button>
                </form>
              </div>
            </div>

            <div className="posts-list">
              {posts.map(post => (
                <div key={post.id} className="post-card">
                  <div className="post-header">
                    <div className="post-author">
                      <div className="post-avatar">{post.author.avatar}</div>
                      <div className="post-author-info">
                        <h3 className="post-author-name">{post.author.name}</h3>
                        <p className="post-author-title">
                          {post.author.title} • {post.author.company}
                        </p>
                        <span className="post-time">{getTimeAgo(post.timestamp)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="post-content">
                    <p>{post.content}</p>
                  </div>

                  {post.type === 'job' && post.jobDetails && (
                    <div className="job-card-embed">
                      <div className="job-embed-header">
                        <i className="bi bi-briefcase-fill"></i>
                        <div>
                          <h4>{post.jobDetails.title}</h4>
                          <p>{post.jobDetails.company} • {post.jobDetails.location}</p>
                        </div>
                      </div>
                      <div className="job-embed-details">
                        <span className="job-salary">{post.jobDetails.salary}</span>
                        <div className="job-tags">
                          {post.jobDetails.tags.map((tag, idx) => (
                            <span key={idx} className="job-tag">{tag}</span>
                          ))}
                        </div>
                      </div>
                      <button className="apply-job-button">
                        <i className="bi bi-arrow-right"></i>
                        View Job
                      </button>
                    </div>
                  )}

                  <div className="post-actions">
                    <button
                      className={`post-action-button ${post.isLiked ? 'liked' : ''}`}
                      onClick={() => handleLike(post.id)}
                    >
                      <i className={`bi ${post.isLiked ? 'bi-heart-fill' : 'bi-heart'}`}></i>
                      <span>{post.likes}</span>
                    </button>
                    <button className="post-action-button">
                      <i className="bi bi-chat"></i>
                      <span>{post.comments}</span>
                    </button>
                    <button className="post-action-button" onClick={() => handleShare(post.id)}>
                      <i className="bi bi-share"></i>
                      <span>{post.shares}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'connections' && (
          <div className="connections-container">
            <div className="connections-section">
              <h2 className="section-title">Your Connections</h2>
              <div className="connections-grid">
                {connectedUsers.map(user => (
                  <div key={user.id} className="connection-card">
                    <div className="connection-avatar">{user.avatar}</div>
                    <h3 className="connection-name">{user.name}</h3>
                    <p className="connection-title">{user.title}</p>
                    <p className="connection-company">{user.company}</p>
                    <p className="connection-location">
                      <i className="bi bi-geo-alt"></i> {user.location}
                    </p>
                    <div className="connection-stats">
                      <span>{user.connections.toLocaleString()} connections</span>
                      {user.mutualConnections > 0 && (
                        <span>{user.mutualConnections} mutual</span>
                      )}
                    </div>
                    <button
                      className="disconnect-button"
                      onClick={() => handleDisconnect(user.id)}
                    >
                      <i className="bi bi-person-dash"></i>
                      Disconnect
                    </button>
                  </div>
                ))}
                {connectedUsers.length === 0 && (
                  <div className="empty-state">
                    <i className="bi bi-people"></i>
                    <p>No connections yet. Start connecting with professionals!</p>
                  </div>
                )}
              </div>
            </div>

            <div className="connections-section">
              <h2 className="section-title">Suggested Connections</h2>
              <div className="connections-grid">
                {suggestions.map(user => (
                  <div key={user.id} className="connection-card">
                    <div className="connection-avatar">{user.avatar}</div>
                    <h3 className="connection-name">{user.name}</h3>
                    <p className="connection-title">{user.title}</p>
                    <p className="connection-company">{user.company}</p>
                    <p className="connection-location">
                      <i className="bi bi-geo-alt"></i> {user.location}
                    </p>
                    <div className="connection-stats">
                      <span>{user.connections.toLocaleString()} connections</span>
                      {user.mutualConnections > 0 && (
                        <span>{user.mutualConnections} mutual</span>
                      )}
                    </div>
                    <button
                      className="connect-button"
                      onClick={() => handleConnect(user.id)}
                    >
                      <i className="bi bi-person-plus"></i>
                      Connect
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'jobs' && (
          <div className="jobs-container">
            <h2 className="section-title">Job Opportunities from Community</h2>
            <div className="jobs-list">
              {jobPosts.map(post => (
                <div key={post.id} className="community-job-card">
                  <div className="community-job-header">
                    <div className="community-job-author">
                      <div className="community-job-avatar">{post.author.avatar}</div>
                      <div>
                        <h3>{post.author.name}</h3>
                        <p>{post.author.title} • {post.author.company}</p>
                        <span className="job-post-time">{getTimeAgo(post.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="community-job-content">
                    <h2 className="community-job-title">{post.jobDetails.title}</h2>
                    <div className="community-job-info">
                      <span><i className="bi bi-building"></i> {post.jobDetails.company}</span>
                      <span><i className="bi bi-geo-alt"></i> {post.jobDetails.location}</span>
                      <span><i className="bi bi-cash"></i> {post.jobDetails.salary}</span>
                    </div>
                    <div className="community-job-tags">
                      {post.jobDetails.tags.map((tag, idx) => (
                        <span key={idx} className="community-job-tag">{tag}</span>
                      ))}
                    </div>
                    <p className="community-job-description">{post.content}</p>
                  </div>
                  <div className="community-job-actions">
                    <button className="community-apply-button">
                      <i className="bi bi-arrow-right"></i>
                      Apply Now
                    </button>
                    <div className="community-job-engagement">
                      <span><i className="bi bi-heart"></i> {post.likes}</span>
                      <span><i className="bi bi-chat"></i> {post.comments}</span>
                      <span><i className="bi bi-share"></i> {post.shares}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Community;
