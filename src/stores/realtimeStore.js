import { create } from 'zustand';
import { supabase } from '../services/supabase';

export const useRealtimeStore = create((set, get) => ({
  newPosts: [],
  newMessages: [],
  newNotifications: [],
  liveViewers: {},
  liveChatMessages: [],
  groupMessages: {},

  addNewPost: (post) => set((s) => ({ newPosts: [post, ...s.newPosts] })),
  clearNewPosts: () => set({ newPosts: [] }),

  addNewMessage: (msg) => set((s) => ({ newMessages: [...s.newMessages, msg] })),
  clearNewMessages: () => set({ newMessages: [] }),

  addNewNotification: (notif) => set((s) => ({ newNotifications: [notif, ...s.newNotifications] })),
  clearNewNotifications: () => set({ newNotifications: [] }),

  updateLiveViewers: (streamId, viewers) =>
    set((s) => ({ liveViewers: { ...s.liveViewers, [streamId]: viewers } })),

  addLiveChatMessage: (msg) => set((s) => ({ liveChatMessages: [...s.liveChatMessages, msg] })),
  clearLiveChat: () => set({ liveChatMessages: [] }),

  addGroupMessage: (groupId, msg) =>
    set((s) => ({
      groupMessages: {
        ...s.groupMessages,
        [groupId]: [...(s.groupMessages[groupId] || []), msg],
      },
    })),
}));

let subscriptionsInitialized = false;

export const initRealtimeSubscriptions = (userId) => {
  if (subscriptionsInitialized) return;
  subscriptionsInitialized = true;

  // New posts
  supabase
    .channel('public:posts')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, (payload) => {
      if (payload.new.user_id !== userId) {
        useRealtimeStore.getState().addNewPost(payload.new);
      }
    })
    .subscribe();

  // New messages — only if user is participant
  supabase
    .channel('public:messages')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, async (payload) => {
      if (payload.new.sender_id === userId) return; // skip own messages
      const { data: parts } = await supabase
        .from('conversation_participants')
        .select('user_id')
        .eq('conversation_id', payload.new.conversation_id);
      if (parts?.some((p) => p.user_id === userId)) {
        useRealtimeStore.getState().addNewMessage(payload.new);
      }
    })
    .subscribe();

  // Notifications for this user
  supabase
    .channel('public:notifications')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, (payload) => {
      if (payload.new.user_id === userId) {
        useRealtimeStore.getState().addNewNotification(payload.new);
      }
    })
    .subscribe();

  // Live stream viewer counts
  supabase
    .channel('public:live_streams')
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'live_streams' }, (payload) => {
      useRealtimeStore.getState().updateLiveViewers(payload.new.id, payload.new.viewer_count);
    })
    .subscribe();

  // Live stream chat
  supabase
    .channel('public:stream_chat')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'stream_chat' }, (payload) => {
      useRealtimeStore.getState().addLiveChatMessage(payload.new);
    })
    .subscribe();
};
