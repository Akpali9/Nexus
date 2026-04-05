import { useState, useEffect } from 'react';
import StoriesBar from '../components/stories/StoriesBar';
import PostCard from '../components/feed/PostCard';
import CreatePost from '../components/feed/CreatePost';
import RightSidebar from '../components/layout/RightSidebar';
import { MOCK_POSTS } from '../store/appStore';
import { useRealtime } from '../context/RealtimeContext';

export default function HomePage() {
  const { newPosts, setNewPosts } = useRealtime();
  const [posts, setPosts] = useState(MOCK_POSTS);

  useEffect(() => {
    if (newPosts.length > 0) {
      setPosts(prev => [...newPosts, ...prev]);
      setNewPosts([]);
    }
  }, [newPosts, setNewPosts]);

  const handlePost = (newPost) => {
    setPosts(prev => [newPost, ...prev]);
    // Broadcast to others (simulated)
    const { realtime } = require('../services/realtime');
    realtime.emit('new_post', newPost);
  };

  return (
    <div style={{ display: 'flex', gap: 24, padding: '24px 24px 24px 0', minHeight: '100vh' }}>
      <div style={{ flex: 1, maxWidth: 640, minWidth: 0 }}>
        <StoriesBar />
        <CreatePost onPost={handlePost} />
        {posts.map(post => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
      <RightSidebar />
    </div>
  );
}
