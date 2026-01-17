// Utility to simulate online users count
// In a real app, this would connect to a WebSocket or polling API

let onlineUsersCount = 1247; // Initial count
let subscribers = [];

// Simulate real-time updates
const updateCount = () => {
  // Randomly increase or decrease by 1-5 users
  const change = Math.floor(Math.random() * 10) - 5;
  onlineUsersCount = Math.max(100, onlineUsersCount + change);
  
  // Notify all subscribers
  subscribers.forEach(callback => callback(onlineUsersCount));
};

// Start updating every 3-5 seconds
setInterval(updateCount, 3000 + Math.random() * 2000);

export const subscribeToOnlineUsers = (callback) => {
  subscribers.push(callback);
  // Immediately call with current count
  callback(onlineUsersCount);
  
  // Return unsubscribe function
  return () => {
    subscribers = subscribers.filter(cb => cb !== callback);
  };
};

export const getOnlineUsersCount = () => onlineUsersCount;
