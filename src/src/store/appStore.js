import { create } from 'zustand'

export const useAppStore = create((set, get) => ({
  // Theme
  theme: 'dark',
  setTheme: (theme) => {
    set({ theme })
    document.documentElement.setAttribute('data-theme', theme === 'dark' ? '' : theme)
    localStorage.setItem('nexus-theme', theme)
  },

  // Auth
  user: null,
  profile: null,
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),

  // UI State
  activeModal: null,
  setActiveModal: (modal) => set({ activeModal: modal }),
  sidebarOpen: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  // Notifications
  notifications: [],
  unreadCount: 3,
  addNotification: (n) => set(s => ({ notifications: [n, ...s.notifications] })),

  // Live Streams
  activeLiveStream: null,
  setActiveLiveStream: (stream) => set({ activeLiveStream: stream }),
  isStreaming: false,
  setIsStreaming: (v) => set({ isStreaming: v }),

  // Chat
  activeConversation: null,
  setActiveConversation: (conv) => set({ activeConversation: conv }),
  conversations: [],
  setConversations: (convs) => set({ conversations: convs }),

  // Feed
  posts: [],
  setPosts: (posts) => set({ posts }),
  addPost: (post) => set(s => ({ posts: [post, ...s.posts] })),

  // Stories
  stories: [],
  setStories: (stories) => set({ stories }),

  // Online users (mock)
  onlineUsers: ['user1', 'user2', 'user3'],
}))

// Mock data for demo
export const MOCK_USERS = [
  { id: '1', username: 'aria_chen', display_name: 'Aria Chen', avatar: null, initials: 'AC', verified: true, premium: true, followers: 48200, following: 312, bio: 'Digital creator & live streamer ✦ Music producer', online: true },
  { id: '2', username: 'dev_marcos', display_name: 'Marcos Silva', avatar: null, initials: 'MS', verified: false, premium: false, followers: 1230, following: 890, bio: 'Full-stack dev building cool stuff', online: true },
  { id: '3', username: 'zara_art', display_name: 'Zara Williams', avatar: null, initials: 'ZW', verified: true, premium: true, followers: 92100, following: 156, bio: 'Visual artist ✦ NFT creator ✦ Streaming weekly', online: false },
  { id: '4', username: 'nx_kai', display_name: 'Kai Nakamura', avatar: null, initials: 'KN', verified: false, premium: true, followers: 7800, following: 2400, bio: 'Gamer & content creator', online: true },
  { id: '5', username: 'luna_beats', display_name: 'Luna Torres', avatar: null, initials: 'LT', verified: true, premium: false, followers: 34500, following: 678, bio: 'Producer • Songwriter • Performer', online: false },
]

export const MOCK_POSTS = [
  {
    id: '1', user: MOCK_USERS[0], content: 'Just dropped a new track 🎵 Been working on this one for weeks — the bassline is finally where I want it. What do you think?',
    media: null, likes: 1842, comments: 234, shares: 89, time: '2m ago', liked: false, tags: ['music', 'producer'],
  },
  {
    id: '2', user: MOCK_USERS[2], content: 'New digital art series dropping this Friday. Each piece is a meditation on urban isolation — 12 works total. Collectors DM me for early access 🎨',
    media: 'art', likes: 3241, comments: 412, shares: 201, time: '18m ago', liked: true, tags: ['art', 'digital', 'NFT'],
  },
  {
    id: '3', user: MOCK_USERS[3], content: 'Live gaming session starting in 30 mins! Playing Elden Ring NG+ — come hang 🎮',
    media: null, likes: 892, comments: 156, shares: 34, time: '1h ago', liked: false, tags: ['gaming', 'live'],
  },
  {
    id: '4', user: MOCK_USERS[1], content: 'Built a real-time collaborative code editor this weekend using WebSockets and CRDT. Open-sourcing it next week. Who wants early access?',
    media: null, likes: 567, comments: 89, shares: 145, time: '3h ago', liked: false, tags: ['dev', 'opensource'],
  },
  {
    id: '5', user: MOCK_USERS[4], content: 'Studio session complete ✓ Six tracks mixed and mastered. Album drops Q2. The title track alone might break the internet fr 🔥',
    media: null, likes: 2104, comments: 301, shares: 112, time: '5h ago', liked: true, tags: ['music', 'album'],
  },
]

export const MOCK_STORIES = [
  { id: '1', user: MOCK_USERS[0], viewed: false, count: 3 },
  { id: '2', user: MOCK_USERS[2], viewed: false, count: 1 },
  { id: '3', user: MOCK_USERS[3], viewed: true, count: 5 },
  { id: '4', user: MOCK_USERS[4], viewed: false, count: 2 },
  { id: '5', user: MOCK_USERS[1], viewed: true, count: 1 },
]

export const MOCK_LIVE_STREAMS = [
  { id: '1', user: MOCK_USERS[0], title: 'Music Production Session 🎵', viewers: 1243, category: 'Music' },
  { id: '2', user: MOCK_USERS[2], title: 'Digital Art Creation', viewers: 892, category: 'Art' },
  { id: '3', user: MOCK_USERS[3], title: 'Elden Ring NG+ Run', viewers: 3401, category: 'Gaming' },
]

export const MOCK_MESSAGES = [
  { id: '1', user: MOCK_USERS[0], lastMsg: 'Hey! Loved the last stream ❤️', time: '2m', unread: 2 },
  { id: '2', user: MOCK_USERS[2], lastMsg: 'Are you coming to the event?', time: '1h', unread: 0 },
  { id: '3', user: MOCK_USERS[3], lastMsg: 'gg! that boss fight was insane', time: '3h', unread: 1 },
  { id: '4', user: MOCK_USERS[4], lastMsg: 'Collab next week?', time: '1d', unread: 0 },
]
