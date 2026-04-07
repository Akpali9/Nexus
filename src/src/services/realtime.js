import { MOCK_USERS, MOCK_LIVE_STREAMS } from '../store/appStore';

class RealtimeService {
  constructor() {
    this.listeners = new Map();
    this.intervals = [];
    this.simulateEvents();
  }

  on(event, callback) {
    if (!this.listeners.has(event)) this.listeners.set(event, []);
    this.listeners.get(event).push(callback);
    return () => this.off(event, callback);
  }

  off(event, callback) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const idx = callbacks.indexOf(callback);
      if (idx !== -1) callbacks.splice(idx, 1);
    }
  }

  emit(event, data) {
    const callbacks = this.listeners.get(event);
    if (callbacks) callbacks.forEach(cb => cb(data));
  }

  simulateEvents() {
    // New post every 15s
    this.intervals.push(setInterval(() => {
      const randomUser = MOCK_USERS[Math.floor(Math.random() * MOCK_USERS.length)];
      const newPost = {
        id: Date.now().toString(),
        user: randomUser,
        content: `Just dropped something new! 🔥 ${Math.random().toString(36).substring(7)}`,
        likes: Math.floor(Math.random() * 200),
        comments: Math.floor(Math.random() * 30),
        shares: Math.floor(Math.random() * 15),
        time: 'just now',
        tags: ['realtime', 'new'],
      };
      this.emit('new_post', newPost);
    }, 15000));

    // New private message every 8s
    this.intervals.push(setInterval(() => {
      const randomUser = MOCK_USERS[Math.floor(Math.random() * MOCK_USERS.length)];
      const newMsg = {
        id: Date.now().toString(),
        conversationId: randomUser.id,
        role: 'other',
        content: `Hey! ${['How are you?', 'Check this out!', '🔥🔥🔥', 'What do you think?'][Math.floor(Math.random() * 4)]}`,
        time: 'now',
        initials: randomUser.initials,
        user: randomUser,
      };
      this.emit('new_message', newMsg);
    }, 8000));

    // New notification every 12s
    const notifTypes = ['like', 'follow', 'comment', 'gift', 'live'];
    this.intervals.push(setInterval(() => {
      const type = notifTypes[Math.floor(Math.random() * notifTypes.length)];
      const randomUser = MOCK_USERS[Math.floor(Math.random() * MOCK_USERS.length)];
      let target = '';
      if (type === 'like') target = '"Your latest post"';
      if (type === 'comment') target = '"Awesome content!"';
      if (type === 'gift') target = '🎁 Super Star × 1';
      if (type === 'live') target = 'Just went live!';
      const newNotif = {
        id: Date.now().toString(),
        type,
        user: randomUser,
        content: type === 'like' ? 'liked your post' :
                 type === 'follow' ? 'started following you' :
                 type === 'comment' ? 'commented on your post' :
                 type === 'gift' ? 'sent you a gift' : 'went live',
        target,
        time: 'now',
        read: false,
      };
      this.emit('new_notification', newNotif);
    }, 12000));

    // Live viewer count update every 3s
    this.intervals.push(setInterval(() => {
      MOCK_LIVE_STREAMS.forEach(stream => {
        const delta = Math.floor(Math.random() * 15) - 5;
        const newViewers = Math.max(0, stream.viewers + delta);
        stream.viewers = newViewers;
        this.emit('live_viewers_update', { streamId: stream.id, viewers: newViewers });
      });
    }, 3000));

    // Live chat message every 4s
    this.intervals.push(setInterval(() => {
      const randomUser = MOCK_USERS[Math.floor(Math.random() * MOCK_USERS.length)];
      const chatMsg = {
        id: Date.now().toString(),
        user: randomUser.username,
        msg: ['🔥🔥', 'Amazing!', '👏👏', 'This is lit', 'More please!', 'Loving this vibe'][Math.floor(Math.random() * 6)],
        color: `hsl(${Math.floor(Math.random() * 360)}, 70%, 60%)`,
        time: Date.now(),
      };
      this.emit('live_chat_message', chatMsg);
    }, 4000));

    // New group message every 10s
    const joinedGroupIds = ['1', '2', '5'];
    this.intervals.push(setInterval(() => {
      const randomGroupId = joinedGroupIds[Math.floor(Math.random() * joinedGroupIds.length)];
      const randomUser = MOCK_USERS[Math.floor(Math.random() * MOCK_USERS.length)];
      const groupMsg = {
        id: Date.now().toString(),
        groupId: randomGroupId,
        user: randomUser,
        content: `Just saw this! ${['🚀', '💡', '🎉', '🤔'][Math.floor(Math.random() * 4)]}`,
        time: 'now',
      };
      this.emit('new_group_message', groupMsg);
    }, 10000));

    // Analytics update every 20s
    this.intervals.push(setInterval(() => {
      const newStats = {
        views: Math.floor(Math.random() * 500) + 48000,
        likes: Math.floor(Math.random() * 300) + 11200,
        followers: Math.floor(Math.random() * 20) + 340,
        engagement: (Math.random() * 2 + 6.5).toFixed(1),
      };
      this.emit('analytics_update', newStats);
    }, 20000));

    // Gift income simulation for Monetize page (every 45s)
    this.intervals.push(setInterval(() => {
      const giftAmount = Math.floor(Math.random() * 50) + 5;
      this.emit('new_gift', { amount: giftAmount });
    }, 45000));
  }

  destroy() {
    this.intervals.forEach(clearInterval);
    this.listeners.clear();
  }
}

export const realtime = new RealtimeService();
