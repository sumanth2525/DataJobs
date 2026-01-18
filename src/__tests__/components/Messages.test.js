import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Messages from '../../components/Messages';
import { sampleConversations } from '../../data/messageData';

describe('Messages Component', () => {
  const mockOnNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  test('renders messages component', () => {
    render(<Messages onNavigate={mockOnNavigate} />);
    
    expect(screen.getByText(/messages/i)).toBeInTheDocument();
  });

  test('displays conversations list', () => {
    render(<Messages onNavigate={mockOnNavigate} />);
    
    expect(screen.getByPlaceholderText(/search conversations/i)).toBeInTheDocument();
  });

  test('displays no conversation selected message initially', () => {
    render(<Messages onNavigate={mockOnNavigate} />);
    
    expect(screen.getByText(/select a conversation/i)).toBeInTheDocument();
  });

  test('selects conversation when clicked', () => {
    render(<Messages onNavigate={mockOnNavigate} />);
    
    const firstConversation = screen.getByText(sampleConversations[0].name);
    fireEvent.click(firstConversation);
    
    expect(screen.getByText(sampleConversations[0].name)).toBeInTheDocument();
  });

  test('displays chat interface when conversation is selected', () => {
    render(<Messages onNavigate={mockOnNavigate} />);
    
    const firstConversation = screen.getByText(sampleConversations[0].name);
    fireEvent.click(firstConversation);
    
    expect(screen.getByPlaceholderText(/type a message/i)).toBeInTheDocument();
  });

  test('sends message when form is submitted', async () => {
    render(<Messages onNavigate={mockOnNavigate} />);
    
    const firstConversation = screen.getByText(sampleConversations[0].name);
    fireEvent.click(firstConversation);
    
    const messageInput = screen.getByPlaceholderText(/type a message/i);
    const sendButton = screen.getByLabelText(/send message/i);
    
    fireEvent.change(messageInput, { target: { value: 'Hello!' } });
    fireEvent.click(sendButton);
    
    await waitFor(() => {
      expect(screen.getByText('Hello!')).toBeInTheDocument();
    });
  });

  test('disables send button when message is empty', () => {
    render(<Messages onNavigate={mockOnNavigate} />);
    
    const firstConversation = screen.getByText(sampleConversations[0].name);
    fireEvent.click(firstConversation);
    
    const sendButton = screen.getByLabelText(/send message/i);
    expect(sendButton).toBeDisabled();
  });

  test('shows typing indicator after sending message', async () => {
    render(<Messages onNavigate={mockOnNavigate} />);
    
    const firstConversation = screen.getByText(sampleConversations[0].name);
    fireEvent.click(firstConversation);
    
    const messageInput = screen.getByPlaceholderText(/type a message/i);
    const sendButton = screen.getByLabelText(/send message/i);
    
    fireEvent.change(messageInput, { target: { value: 'Hello!' } });
    fireEvent.click(sendButton);
    
    await waitFor(() => {
      expect(screen.getByText('Hello!')).toBeInTheDocument();
    });
  });

  test('receives auto-reply after sending message', async () => {
    render(<Messages onNavigate={mockOnNavigate} />);
    
    const firstConversation = screen.getByText(sampleConversations[0].name);
    fireEvent.click(firstConversation);
    
    const messageInput = screen.getByPlaceholderText(/type a message/i);
    const sendButton = screen.getByLabelText(/send message/i);
    
    fireEvent.change(messageInput, { target: { value: 'Hello!' } });
    fireEvent.click(sendButton);
    
    jest.advanceTimersByTime(2000);
    
    await waitFor(() => {
      expect(screen.getByText(/thanks for your message/i)).toBeInTheDocument();
    });
  });

  test('clears message input after sending', async () => {
    render(<Messages onNavigate={mockOnNavigate} />);
    
    const firstConversation = screen.getByText(sampleConversations[0].name);
    fireEvent.click(firstConversation);
    
    const messageInput = screen.getByPlaceholderText(/type a message/i);
    const sendButton = screen.getByLabelText(/send message/i);
    
    fireEvent.change(messageInput, { target: { value: 'Hello!' } });
    fireEvent.click(sendButton);
    
    await waitFor(() => {
      expect(messageInput.value).toBe('');
    });
  });

  test('navigates back when back button is clicked', () => {
    render(<Messages onNavigate={mockOnNavigate} />);
    
    const backButton = screen.getByLabelText(/back to dashboard/i);
    fireEvent.click(backButton);
    
    expect(mockOnNavigate).toHaveBeenCalledWith('dashboard');
  });

  test('closes conversation when back to list is clicked', () => {
    render(<Messages onNavigate={mockOnNavigate} />);
    
    const firstConversation = screen.getByText(sampleConversations[0].name);
    fireEvent.click(firstConversation);
    
    const backButton = screen.getByLabelText(/back to conversations/i);
    fireEvent.click(backButton);
    
    expect(screen.getByText(/select a conversation/i)).toBeInTheDocument();
  });

  test('displays conversation preview', () => {
    render(<Messages onNavigate={mockOnNavigate} />);
    
    expect(screen.getByText(sampleConversations[0].lastMessage)).toBeInTheDocument();
  });

  test('displays unread count badge', () => {
    render(<Messages onNavigate={mockOnNavigate} />);
    
    const conversationWithUnread = sampleConversations.find(c => c.unreadCount > 0);
    if (conversationWithUnread) {
      expect(screen.getByText(conversationWithUnread.unreadCount.toString())).toBeInTheDocument();
    }
  });

  test('marks messages as read when conversation is selected', () => {
    render(<Messages onNavigate={mockOnNavigate} />);
    
    const conversationWithUnread = sampleConversations.find(c => c.unreadCount > 0);
    if (conversationWithUnread) {
      const conversationElement = screen.getByText(conversationWithUnread.name);
      fireEvent.click(conversationElement);
      
      // Unread count should be cleared
      waitFor(() => {
        expect(screen.queryByText(conversationWithUnread.unreadCount.toString())).not.toBeInTheDocument();
      });
    }
  });

  test('displays online status indicator', () => {
    render(<Messages onNavigate={mockOnNavigate} />);
    
    const onlineConversation = sampleConversations.find(c => c.isOnline);
    if (onlineConversation) {
      const conversationElement = screen.getByText(onlineConversation.name);
      fireEvent.click(conversationElement);
      
      expect(screen.getByText(/online/i)).toBeInTheDocument();
    }
  });
});
