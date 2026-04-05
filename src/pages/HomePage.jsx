import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';
import { useRealtime } from '../context/RealtimeContext';
import StoriesBar from '../components/stories/StoriesBar';
import CreatePost from '../components/feed/CreatePost';
import PostCard from '../components/feed/PostCard';
import RightSidebar from '../components/layout/RightSidebar';

export default function HomePage() {
  const { user } = useAuth();
  const { newPosts, setNewPosts, emit } = useRealtime();
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

  useEffect(() => {
    if (newPosts.length > 0) {
      setPosts(prev => [...newPosts, ...prev]);
      setNewPosts([]);
    }
  }, [newPosts, setNewPosts]);

  const handlePost = async (postData) => {
    const { data, error } = await supabase
      .from('posts')
      .insert({
        user_id: user.id,
        content: postData.content,
        media_url: postData.media
      })
      .select('*, user:profiles(*)')
      .single();
    if (data) {
      setPosts(prev => [data, ...prev]);
      emit('new_post', data);
    }
  };

  if (loading) return <div className="loading">Loading feed...</div>;

  return (
    <div style={{ display: 'flex', gap: '24px', padding: '24px 24px 24px 0', minHeight: '100vh' }}>
      <div style={{ flex: 1, maxWidth: '640px', minWidth: 0 }}>
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
