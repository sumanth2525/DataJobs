// Supabase client for direct database access (if needed)
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Only create client if keys are provided
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Real-time subscription helper for online users
export const subscribeToOnlineUsers = (callback) => {
  if (!supabase) {
    // Fallback to API if Supabase not configured
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/users/online`);
        const data = await response.json();
        if (data.success) {
          callback(data.count);
        }
      } catch (error) {
        console.error('Error fetching online users:', error);
      }
    }, 3000);
    
    return () => clearInterval(interval);
  }

  const channel = supabase.channel('online-users');
  
  channel
    .on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState();
      const count = Object.keys(state).length;
      callback(count || 1247);
    })
    .on('presence', { event: 'join' }, ({ key, newPresences }) => {
      const state = channel.presenceState();
      callback(Object.keys(state).length);
    })
    .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
      const state = channel.presenceState();
      callback(Object.keys(state).length);
    })
    .subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({
          online_at: new Date().toISOString(),
        });
      }
    });
  
  return () => {
    channel.unsubscribe();
  };
};
