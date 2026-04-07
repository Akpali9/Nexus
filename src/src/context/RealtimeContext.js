import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from './AuthContext';

const RealtimeContext = createContext();

export const useRealtime = () => useContext(RealtimeContext);

export const RealtimeProvider = ({ children }) => {
  const { user } = useAuth();
  const [newPosts, setNewPosts] = useState([]);
  const [newMessages, setNewMessages] = useState([]);
  const [newNotifications, setNewNotifications] = useState([]);
  const [liveViewers, setLiveViewers] = useState({});
  const [liveChatMessages, setLiveChatMessages] = useState([]);
  const [groupMessages, setGroupMessages] = useState({});

  useEffect(() => {
    if (!user) return;

    // 1. New posts
    const postsSub = supabase
      .channel('posts-channel')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, payload => {
        setNewPosts(prev => [payload.new, ...prev]);
      })
      .subscribe();

    // 2. New messages (private)
    const messagesSub = supabase
      .channel('messages-channel')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, async payload => {
        // Check if the current user is a participant of this conversation
        const { data: participants } = await supabase
          .from('conversation_participants')
          .select('user_id')
          .eq('conversation_id', payload.new.conversation_id);
        if (participants?.some(p => p.user_id === user.id)) {
          setNewMessages(prev => [...prev, payload.new]);
        }
      })
      .subscribe();

    // 3. New notifications
    const notifSub = supabase
      .channel('notifications-channel')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, payload => {
        if (payload.new.user_id === user.id) {
          setNewNotifications(prev => [payload.new, ...prev]);
        }
      })
      .subscribe();

    // 4. Live viewers update
    const liveViewersSub = supabase
      .channel('live-streams-channel')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'live_streams' }, payload => {
        setLiveViewers(prev => ({ ...prev, [payload.new.id]: payload.new.viewers }));
      })
      .subscribe();

    // 5. Live chat messages
    const liveChatSub = supabase
      .channel('live-chat-channel')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'live_chat_messages' }, payload => {
        setLiveChatMessages(prev => [...prev, payload.new]);
      })
      .subscribe();

    // 6. Group messages
    const groupMsgSub = supabase
      .channel('group-messages-channel')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'group_messages' }, payload => {
        setGroupMessages(prev => ({
          ...prev,
          [payload.new.group_id]: [...(prev[payload.new.group_id] || []), payload.new]
        }));
      })
      .subscribe();

    return () => {
      postsSub.unsubscribe();
      messagesSub.unsubscribe();
      notifSub.unsubscribe();
      liveViewersSub.unsubscribe();
      liveChatSub.unsubscribe();
      groupMsgSub.unsubscribe();
    };
  }, [user]);

  const emit = (event, data) => {
    switch (event) {
      case 'new_post':
        supabase.from('posts').insert(data);
        break;
      case 'new_message':
        supabase.from('messages').insert(data);
        break;
      case 'new_notification':
        supabase.from('notifications').insert(data);
        break;
      case 'live_chat_message':
        supabase.from('live_chat_messages').insert(data);
        break;
      case 'new_group_message':
        supabase.from('group_messages').insert(data);
        break;
      default:
        console.warn('Unknown event', event);
    }
  };

  const value = {
    newPosts, setNewPosts,
    newMessages, setNewMessages,
    newNotifications, setNewNotifications,
    liveViewers, liveChatMessages,
    groupMessages,
    emit,
  };

  return <RealtimeContext.Provider value={value}>{children}</RealtimeContext.Provider>;
};
