import React, { createContext, useContext, useEffect, useState } from 'react';
import { realtime } from '../services/realtime';

const RealtimeContext = createContext();

export const useRealtime = () => useContext(RealtimeContext);

export const RealtimeProvider = ({ children }) => {
  const [newPosts, setNewPosts] = useState([]);
  const [newMessages, setNewMessages] = useState([]);
  const [newNotifications, setNewNotifications] = useState([]);
  const [liveViewers, setLiveViewers] = useState({});
  const [liveChatMsgs, setLiveChatMsgs] = useState([]);
  const [groupMessages, setGroupMessages] = useState({});
  const [analytics, setAnalytics] = useState({});
  const [newGift, setNewGift] = useState(null);

  useEffect(() => {
    const unsubPost = realtime.on('new_post', post => setNewPosts(prev => [post, ...prev]));
    const unsubMsg = realtime.on('new_message', msg => setNewMessages(prev => [...prev, msg]));
    const unsubNotif = realtime.on('new_notification', notif => setNewNotifications(prev => [notif, ...prev]));
    const unsubViewers = realtime.on('live_viewers_update', ({ streamId, viewers }) =>
      setLiveViewers(prev => ({ ...prev, [streamId]: viewers })));
    const unsubChat = realtime.on('live_chat_message', msg => setLiveChatMsgs(prev => [...prev, msg]));
    const unsubGroupMsg = realtime.on('new_group_message', msg =>
      setGroupMessages(prev => ({ ...prev, [msg.groupId]: [...(prev[msg.groupId] || []), msg] })));
    const unsubAnalytics = realtime.on('analytics_update', stats => setAnalytics(stats));
    const unsubGift = realtime.on('new_gift', gift => setNewGift(gift));

    return () => {
      unsubPost(); unsubMsg(); unsubNotif(); unsubViewers(); unsubChat(); unsubGroupMsg(); unsubAnalytics(); unsubGift();
    };
  }, []);

  const value = {
    newPosts, setNewPosts,
    newMessages, setNewMessages,
    newNotifications, setNewNotifications,
    liveViewers, liveChatMsgs,
    groupMessages,
    analytics,
    newGift, setNewGift,
    emit: (event, data) => realtime.emit(event, data),
  };

  return <RealtimeContext.Provider value={value}>{children}</RealtimeContext.Provider>;
};
