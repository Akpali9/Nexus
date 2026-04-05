import { create } from 'zustand';
import { supabase } from '../services/supabase';

export const useRealtimeStore = create((set, get) => ({
  newPosts: [],
  newMessages: [],
  newNotifications: [],
  liveViewers: {},
  liveChatMessages: [],
  groupMessages: {},
  analytics: {},

  // Actions to merge incoming real-time data
  addNewPost: (post) => set((state) => ({ newPosts: [post, ...state.newPosts] })),
  clearNewPosts: () => set({ newPosts: [] }),
  addNewMessage: (msg) => set((state) => ({ newMessages: [...state.newMessages, msg] })),
  clearNewMessages: () => set({ newMessages: [] }),
  addNewNotification: (notif) => set((state) => ({ newNotifications: [notif, ...state.newNotifications] })),
  clearNewNotifications: () => set({ newNotifications: [] }),
  updateLiveViewers: (streamId, viewers) =>
    set((state) => ({ liveViewers: { ...state.liveViewers, [streamId]: viewers } })),
  addLiveChatMessage: (msg) => set((state) => ({ liveChatMessages: [...state.liveChatMessages, msg] })),
  addGroupMessage: (groupId, msg) =>
    set((state) => ({
      groupMessages: {
        ...state.groupMessages,
        [groupId]: [...(state.groupMessages[groupId] || []), msg],
      },
    })),
  updateAnalytics: (stats) => set({ analytics: stats }),

  // Emit function (inserts into Supabase, which triggers real-time)
  emit: async (event, data) => {
    switch (event) {
      case 'new_post':
        await supabase.from('posts').insert(data);
        break;
      case 'new_message':
        await supabase.from('messages').insert(data);
        break;
      case 'new_notification':
        await supabase.from('notifications').insert(data);
        break;
      case 'live_chat_message':
        await supabase.from('live_chat_messages').insert(data);
        break;
      case 'new_group_message':
        await supabase.from('group_messages').insert(data);
        break;
      default:
        console.warn('Unknown event', event);
    }
  },
}));

// Set up all real-time subscriptions once
let subscriptionsInitialized = false;
export const initRealtimeSubscriptions = (userId) => {
  if (subscriptionsInitialized) return;
  subscriptionsInitialized = true;

  // 1. Posts
  supabase
    .channel('public:posts')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, (payload) => {
      useRealtimeStore.getState().addNewPost(payload.new);
    })
    .subscribe();

  // 2. Messages (only those where current user is participant)
  supabase
    .channel('public:messages')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, async (payload) => {
      const { data: participants } = await supabase
        .from('conversation_participants')
        .select('user_id')
        .eq('conversation_id', payload.new.conversation_id);
      if (participants?.some((p) => p.user_id === userId)) {
        useRealtimeStore.getState().addNewMessage(payload.new);
      }
    })
    .subscribe();

  // 3. Notifications
  supabase
    .channel('public:notifications')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, (payload) => {
      if (payload.new.user_id === userId) {
        useRealtimeStore.getState().addNewNotification(payload.new);
      }
    })
    .subscribe();

  // 4. Live streams (viewer updates)
  supabase
    .channel('public:live_streams')
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'live_streams' }, (payload) => {
      useRealtimeStore.getState().updateLiveViewers(payload.new.id, payload.new.viewers);
    })
    .subscribe();

  // 5. Live chat messages
  supabase
    .channel('public:live_chat_messages')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'live_chat_messages' }, (payload) => {
      useRealtimeStore.getState().addLiveChatMessage(payload.new);
    })
    .subscribe();

  // 6. Group messages
  supabase
    .channel('public:group_messages')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'group_messages' }, (payload) => {
      useRealtimeStore.getState().addGroupMessage(payload.new.group_id, payload.new);
    })
    .subscribe();
};
