import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const TABLES = {
  PROFILES: 'profiles',
  POSTS: 'posts',
  STORIES: 'stories',
  COMMENTS: 'comments',
  LIKES: 'likes',
  FOLLOWS: 'follows',
  MESSAGES: 'messages',
  CONVERSATIONS: 'conversations',
  LIVE_STREAMS: 'live_streams',
  GROUPS: 'groups',
  GROUP_MEMBERS: 'group_members',
  NOTIFICATIONS: 'notifications',
  PAYMENTS: 'payments',
  SUBSCRIPTIONS: 'subscriptions',
}

export const STORAGE = {
  AVATARS: 'avatars',
  POSTS: 'post-media',
  STORIES: 'stories',
}
