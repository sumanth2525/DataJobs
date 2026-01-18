import React, { useState } from 'react';
import './RightSidebar.css';

const RightSidebar = ({ user }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    // Add user message
    const userMessage = { type: 'user', text: message };
    setMessages(prev => [...prev, userMessage]);
    setMessage('');

    // Simulate AI response (can be replaced with actual API call)
    setTimeout(() => {
      const aiResponse = {
        type: 'ai',
        text: 'I can help you find the perfect job! Try asking about job details, salary ranges, or company information.'
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  return (
    <div className="right-sidebar">
      <div className="ai-copilot-header">
        <div className="ai-copilot-title">
          <i className="bi bi-stars"></i>
          <span>Orion</span>
          <span className="ai-copilot-tagline">Your AI Copilot</span>
        </div>
        <button className="quick-guide-btn" title="Quick Guide">
          Quick Guide
        </button>
      </div>

      <div className="ai-copilot-content">
        {messages.length === 0 ? (
          <div className="ai-welcome">
            <div className="welcome-message">
              {user ? (
                <>
                  <h3>Welcome back{user.name ? `, ${user.name.split(' ')[0]}` : ''}!</h3>
                  <p>I'm here to help you find your dream job. Let's get started!</p>
                </>
              ) : (
                <>
                  <h3>Welcome!</h3>
                  <p>I'm your AI assistant. I can help you find the perfect data job!</p>
                </>
              )}
            </div>

            <div className="ai-tasks">
              <h4>Tasks I can assist you with:</h4>
              <div className="task-item">
                <i className="bi bi-search"></i>
                <div>
                  <strong>Adjust current preference</strong>
                  <p>Fine-tune your job search criteria.</p>
                </div>
              </div>
              <div className="task-item">
                <i className="bi bi-sun"></i>
                <div>
                  <strong>Top Match jobs</strong>
                  <p>Explore jobs where you shine as a top candidate.</p>
                </div>
              </div>
              <div className="task-item">
                <i className="bi bi-chat-dots"></i>
                <div>
                  <strong>Ask Orion</strong>
                  <p>Click on 'Ask Orion' to get detailed insights on specific job.</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="ai-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`ai-message ${msg.type}`}>
                <div className="message-avatar">
                  {msg.type === 'user' ? (
                    <i className="bi bi-person-fill"></i>
                  ) : (
                    <i className="bi bi-robot"></i>
                  )}
                </div>
                <div className="message-text">{msg.text}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <form className="ai-input-form" onSubmit={handleSendMessage}>
        <input
          type="text"
          className="ai-input"
          placeholder="Ask me anything..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button type="submit" className="ai-send-btn" disabled={!message.trim()}>
          <i className="bi bi-arrow-up-circle-fill"></i>
        </button>
      </form>
    </div>
  );
};

export default RightSidebar;
