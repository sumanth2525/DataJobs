import React, { useState, useEffect, useRef } from 'react';
import { sampleConversations } from '../data/messageData';
import './Messages.css';

const Messages = ({ onNavigate }) => {
  const [conversations, setConversations] = useState(sampleConversations);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedConversation?.messages]);

  // Focus input when conversation is selected
  useEffect(() => {
    if (selectedConversation && inputRef.current) {
      inputRef.current.focus();
    }
  }, [selectedConversation]);

  const handleConversationClick = (conversation) => {
    setSelectedConversation(conversation);
    // Mark messages as read
    setConversations(prev => prev.map(conv => 
      conv.id === conversation.id 
        ? { ...conv, unreadCount: 0 }
        : conv
    ));
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedConversation) return;

    const newMessage = {
      id: selectedConversation.messages.length + 1,
      text: messageInput.trim(),
      sender: 'me',
      timestamp: new Date().toISOString(),
    };

    // Add message to conversation
    setConversations(prev => prev.map(conv => 
      conv.id === selectedConversation.id
        ? {
            ...conv,
            messages: [...conv.messages, newMessage],
            lastMessage: newMessage.text,
            timestamp: newMessage.timestamp,
          }
        : conv
    ));

    // Update selected conversation
    setSelectedConversation(prev => ({
      ...prev,
      messages: [...prev.messages, newMessage],
      lastMessage: newMessage.text,
      timestamp: newMessage.timestamp,
    }));

    setMessageInput('');
    setIsTyping(true);

    // Simulate typing indicator and auto-reply
    setTimeout(() => {
      setIsTyping(false);
      const autoReply = {
        id: selectedConversation.messages.length + 2,
        text: 'Thanks for your message! I\'ll get back to you soon.',
        sender: 'them',
        timestamp: new Date().toISOString(),
      };

      setConversations(prev => prev.map(conv => 
        conv.id === selectedConversation.id
          ? {
              ...conv,
              messages: [...conv.messages, autoReply],
              lastMessage: autoReply.text,
              timestamp: autoReply.timestamp,
            }
          : conv
      ));

      if (selectedConversation) {
        setSelectedConversation(prev => ({
          ...prev,
          messages: [...prev.messages, autoReply],
          lastMessage: autoReply.text,
          timestamp: autoReply.timestamp,
        }));
      }
    }, 2000);
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now - time) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const sortedConversations = [...conversations].sort((a, b) => 
    new Date(b.timestamp) - new Date(a.timestamp)
  );

  return (
    <div className="messages-container">
      <div className="messages-header">
        <button 
          className="back-button"
          onClick={() => onNavigate('dashboard')}
          aria-label="Back to dashboard"
        >
          <i className="bi bi-arrow-left"></i>
        </button>
        <h1 className="messages-title">Messages</h1>
        <div className="messages-header-actions">
          <button className="header-action-button" aria-label="Search">
            <i className="bi bi-search"></i>
          </button>
          <button className="header-action-button" aria-label="More options">
            <i className="bi bi-three-dots"></i>
          </button>
        </div>
      </div>

      <div className="messages-content">
        {/* Conversations List */}
        <div className={`conversations-list ${selectedConversation ? 'hidden-mobile' : ''}`}>
          <div className="conversations-search">
            <i className="bi bi-search"></i>
            <input 
              type="text" 
              placeholder="Search conversations..."
              className="conversations-search-input"
            />
          </div>
          
          <div className="conversations-items">
            {sortedConversations.map(conversation => (
              <div
                key={conversation.id}
                className={`conversation-item ${selectedConversation?.id === conversation.id ? 'active' : ''}`}
                onClick={() => handleConversationClick(conversation)}
              >
                <div className="conversation-avatar-wrapper">
                  <div className="conversation-avatar">
                    {conversation.avatar}
                  </div>
                  {conversation.isOnline && (
                    <div className="online-indicator"></div>
                  )}
                </div>
                <div className="conversation-info">
                  <div className="conversation-header">
                    <h3 className="conversation-name">{conversation.name}</h3>
                    <span className="conversation-time">{getTimeAgo(conversation.timestamp)}</span>
                  </div>
                  <div className="conversation-details">
                    <span className="conversation-company">{conversation.company}</span>
                    <span className="conversation-job">• {conversation.jobTitle}</span>
                  </div>
                  <div className="conversation-footer">
                    <p className="conversation-preview">{conversation.lastMessage}</p>
                    {conversation.unreadCount > 0 && (
                      <span className="unread-badge">{conversation.unreadCount}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Interface */}
        <div className={`chat-interface ${!selectedConversation ? 'hidden-mobile' : ''}`}>
          {selectedConversation ? (
            <>
              <div className="chat-header">
                <button 
                  className="back-to-list-button"
                  onClick={() => setSelectedConversation(null)}
                  aria-label="Back to conversations"
                >
                  <i className="bi bi-arrow-left"></i>
                </button>
                <div className="chat-header-info">
                  <div className="chat-avatar-wrapper">
                    <div className="chat-avatar">
                      {selectedConversation.avatar}
                    </div>
                    {selectedConversation.isOnline && (
                      <div className="chat-online-indicator"></div>
                    )}
                  </div>
                  <div className="chat-header-text">
                    <h2 className="chat-name">{selectedConversation.name}</h2>
                    <p className="chat-status">
                      {selectedConversation.isOnline ? 'Online' : 'Offline'} • {selectedConversation.company}
                    </p>
                  </div>
                </div>
                <div className="chat-header-actions">
                  <button className="chat-action-button" aria-label="Call">
                    <i className="bi bi-telephone"></i>
                  </button>
                  <button className="chat-action-button" aria-label="Video call">
                    <i className="bi bi-camera-video"></i>
                  </button>
                  <button className="chat-action-button" aria-label="More options">
                    <i className="bi bi-three-dots"></i>
                  </button>
                </div>
              </div>

              <div className="chat-messages">
                {selectedConversation.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`message-bubble ${message.sender === 'me' ? 'sent' : 'received'}`}
                  >
                    <div className="message-content">
                      <p className="message-text">{message.text}</p>
                      <span className="message-time">{formatMessageTime(message.timestamp)}</span>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="message-bubble received typing-indicator">
                    <div className="typing-dots">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <form className="chat-input-form" onSubmit={handleSendMessage}>
                <button 
                  type="button" 
                  className="chat-attach-button"
                  aria-label="Attach file"
                >
                  <i className="bi bi-paperclip"></i>
                </button>
                <input
                  ref={inputRef}
                  type="text"
                  className="chat-input"
                  placeholder="Type a message..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                />
                <button 
                  type="submit" 
                  className="chat-send-button"
                  disabled={!messageInput.trim()}
                  aria-label="Send message"
                >
                  <i className="bi bi-send-fill"></i>
                </button>
              </form>
            </>
          ) : (
            <div className="no-conversation-selected">
              <i className="bi bi-chat-dots"></i>
              <h2>Select a conversation</h2>
              <p>Choose a conversation from the list to start messaging</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
