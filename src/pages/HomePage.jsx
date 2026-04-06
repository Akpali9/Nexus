import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useAuthStore } from '../stores/authStore';
import { useRealtimeStore } from '../stores/realtimeStore';
import StoriesBar from '../components/stories/StoriesBar';
import CreatePost from '../components/feed/CreatePost';
import PostCard from '../components/feed/PostCard';
import RightSidebar from '../components/layout/RightSidebar';
import Sidebar from '../components/layout/Sidebar';

export default function HomePage() {
  const { user } = useAuthStore();
  const { newPosts, clearNewPosts } = useRealtimeStore();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchPosts = async () => {
      const { data } = await supabase
        .from('posts')
        .select('*, user:profiles(*)')
        .order('created_at', { ascending: false })
        .limit(20);
      if (data) setPosts(data);
      setLoading(false);
    };
    fetchPosts();
  }, [user]);

  // Merge real-time new posts into feed
  useEffect(() => {
    if (newPosts.length > 0) {
      // Fetch full post data with profile join
      const fetchNewPosts = async () => {
        const ids = newPosts.map(p => p.id);
        const { data } = await supabase
          .from('posts')
          .select('*, user:profiles(*)')
          .in('id', ids);
        if (data) setPosts(prev => [...data, ...prev]);
        clearNewPosts();
      };
      fetchNewPosts();
    }
  }, [newPosts, clearNewPosts]);

  const handlePost = async (postData) => {
    const { data } = await supabase
      .from('posts')
      .insert({
        user_id: user.id,
        content: postData.content,
        media_urls: postData.media ? [postData.media] : [],
      })
      .select('*, user:profiles(*)')
      .single();
    if (data) setPosts(prev => [data, ...prev]);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ flex: 1, marginLeft: 'var(--sidebar-width)', display: 'flex', gap: '24px', padding: '24px', maxWidth: '1200px' }}>
        <div style={{ flex: 1, maxWidth: '640px', minWidth: 0 }}>
          <StoriesBar />
          <CreatePost onPost={handlePost} />
          {loading ? (
            <div className="loading">Loading feed...</div>
          ) : (
            posts.map(post => <PostCard key={post.id} post={post} />)
          )}
        </div>
        <RightSidebar />
      </main>
    </div>
  );
}
