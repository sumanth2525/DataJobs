// Sample conversation data
export const sampleConversations = [
  {
    id: 1,
    name: 'Sarah Johnson',
    company: 'Amazon',
    avatar: 'SJ',
    lastMessage: 'Thank you for your interest! When can you start?',
    timestamp: new Date(Date.now() - 5 * 60000).toISOString(), // 5 minutes ago
    unreadCount: 2,
    isOnline: true,
    jobTitle: 'Senior Data Engineer',
    messages: [
      {
        id: 1,
        text: 'Hi! I saw your application for the Senior Data Engineer position. Your profile looks great!',
        sender: 'them',
        timestamp: new Date(Date.now() - 2 * 60 * 60000).toISOString(),
      },
      {
        id: 2,
        text: 'Thank you! I\'m very interested in this role.',
        sender: 'me',
        timestamp: new Date(Date.now() - 90 * 60000).toISOString(),
      },
      {
        id: 3,
        text: 'Great! Can you tell me about your experience with Spark and Airflow?',
        sender: 'them',
        timestamp: new Date(Date.now() - 60 * 60000).toISOString(),
      },
      {
        id: 4,
        text: 'I have 3+ years of experience with both. I\'ve built several ETL pipelines using Spark and orchestrated workflows with Airflow.',
        sender: 'me',
        timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
      },
      {
        id: 5,
        text: 'Thank you for your interest! When can you start?',
        sender: 'them',
        timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
      },
    ]
  },
  {
    id: 2,
    name: 'Michael Chen',
    company: 'Google',
    avatar: 'MC',
    lastMessage: 'Perfect! I\'ll send you the interview details.',
    timestamp: new Date(Date.now() - 15 * 60000).toISOString(), // 15 minutes ago
    unreadCount: 0,
    isOnline: true,
    jobTitle: 'Junior Data Analyst',
    messages: [
      {
        id: 1,
        text: 'Hello! We\'d like to schedule an interview for the Data Analyst position.',
        sender: 'them',
        timestamp: new Date(Date.now() - 3 * 60 * 60000).toISOString(),
      },
      {
        id: 2,
        text: 'That sounds great! What times work for you?',
        sender: 'me',
        timestamp: new Date(Date.now() - 2 * 60 * 60000).toISOString(),
      },
      {
        id: 3,
        text: 'How about this Friday at 2 PM?',
        sender: 'them',
        timestamp: new Date(Date.now() - 60 * 60000).toISOString(),
      },
      {
        id: 4,
        text: 'Friday at 2 PM works perfectly for me!',
        sender: 'me',
        timestamp: new Date(Date.now() - 20 * 60000).toISOString(),
      },
      {
        id: 5,
        text: 'Perfect! I\'ll send you the interview details.',
        sender: 'them',
        timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
      },
    ]
  },
  {
    id: 3,
    name: 'Emily Rodriguez',
    company: 'Microsoft',
    avatar: 'ER',
    lastMessage: 'Looking forward to working with you!',
    timestamp: new Date(Date.now() - 2 * 60 * 60000).toISOString(), // 2 hours ago
    unreadCount: 0,
    isOnline: false,
    jobTitle: 'Senior Data Scientist',
    messages: [
      {
        id: 1,
        text: 'Congratulations! We\'d like to offer you the Senior Data Scientist position.',
        sender: 'them',
        timestamp: new Date(Date.now() - 5 * 60 * 60000).toISOString(),
      },
      {
        id: 2,
        text: 'That\'s amazing news! Thank you so much!',
        sender: 'me',
        timestamp: new Date(Date.now() - 4 * 60 * 60000).toISOString(),
      },
      {
        id: 3,
        text: 'We\'ll send the official offer letter by email. Do you have any questions?',
        sender: 'them',
        timestamp: new Date(Date.now() - 3 * 60 * 60000).toISOString(),
      },
      {
        id: 4,
        text: 'Looking forward to working with you!',
        sender: 'them',
        timestamp: new Date(Date.now() - 2 * 60 * 60000).toISOString(),
      },
    ]
  },
  {
    id: 4,
    name: 'David Kim',
    company: 'Meta',
    avatar: 'DK',
    lastMessage: 'I\'ll review your portfolio and get back to you.',
    timestamp: new Date(Date.now() - 4 * 60 * 60000).toISOString(), // 4 hours ago
    unreadCount: 1,
    isOnline: false,
    jobTitle: 'Data Analyst',
    messages: [
      {
        id: 1,
        text: 'Hi! I applied for the Data Analyst position. I have experience with SQL and Python.',
        sender: 'me',
        timestamp: new Date(Date.now() - 6 * 60 * 60000).toISOString(),
      },
      {
        id: 2,
        text: 'Thanks for applying! Can you share your portfolio or GitHub?',
        sender: 'them',
        timestamp: new Date(Date.now() - 5 * 60 * 60000).toISOString(),
      },
      {
        id: 3,
        text: 'Sure! Here\'s my GitHub: github.com/myportfolio',
        sender: 'me',
        timestamp: new Date(Date.now() - 4 * 60 * 60000).toISOString(),
      },
      {
        id: 4,
        text: 'I\'ll review your portfolio and get back to you.',
        sender: 'them',
        timestamp: new Date(Date.now() - 4 * 60 * 60000).toISOString(),
      },
    ]
  },
];
