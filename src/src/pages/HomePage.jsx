import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { useAuthStore } from '../stores/authStore';
import { useRealtimeStore } from '../stores/realtimeStore';
import StoriesBar from '../components/stories/StoriesBar';
import CreatePost from '../components/feed/CreatePost';
import PostCard from '../components/feed/PostCard';
import RightSidebar from '../components/layout/RightSidebar';
import Sidebar from '../components/layout/Sidebar';
import { Home, Search, Bell, MessageCircle, Video, Menu } from 'lucide-react';

function useMediaQuery(query) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) setMatches(media.matches);
    const listener = (e) => setMatches(e.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [query, matches]);
  return matches;
}

export default function HomePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const { newPosts, clearNewPosts } = useRealtimeStore();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');

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

  // Delete post from state
  const handlePostDelete = (deletedPostId) => {
    setPosts(prev => prev.filter(post => post.id !== deletedPostId));
  };

  const mobileNavItems = [
    { icon: Home, path: '/', label: 'Home' },
    { icon: Search, path: '/explore', label: 'Explore' },
    { icon: Bell, path: '/notifications', label: 'Notifications' },
    { icon: MessageCircle, path: '/messages', label: 'Messages' },
    { icon: Video, path: '/live', label: 'Live' },
  ];
const handleCommentCountUpdate = (postId, newCount) => {
  setPosts(prev => prev.map(post => 
    post.id === postId ? { ...post, comments_count: newCount } : post
  ));
};
  const isActive = (path) => location.pathname === path;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {!isMobile && <Sidebar inline={false} />}
      
      {isMobile && (
        <div style={{
          position: 'sticky', top: 0, zIndex: 100,
          background: 'var(--bg-secondary)', backdropFilter: 'blur(10px)',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <button onClick={() => setMobileMenuOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <Menu size={24} color="var(--text-primary)" />
          </button>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '20px' }}>
            <span className="gradient-text">Nexus</span>
          </h1>
          <div style={{ width: 24 }} />
        </div>
      )}

      {isMobile && mobileMenuOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)', zIndex: 200, backdropFilter: 'blur(4px)',
        }} onClick={() => setMobileMenuOpen(false)}>
          <div style={{
            width: '260px', height: '100%', background: 'var(--bg-secondary)',
            boxShadow: '2px 0 12px rgba(0,0,0,0.3)',
            transform: mobileMenuOpen ? 'translateX(0)' : 'translateX(-100%)',
            transition: 'transform 0.2s ease',
          }} onClick={(e) => e.stopPropagation()}>
            <Sidebar inline={true} />
          </div>
        </div>
      )}

      <main style={{
        flex: 1,
        marginLeft: !isMobile ? 'var(--sidebar-width, 240px)' : 0,
        padding: isMobile ? '16px' : '24px',
        maxWidth: isMobile ? '100%' : '1200px',
        marginRight: 'auto',
        paddingBottom: isMobile ? '70px' : '24px',
      }}>
        <div style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? '16px' : '24px',
        }}>
          <div style={{
            flex: 1,
            maxWidth: isMobile ? '100%' : '640px',
            minWidth: 0,
            margin: '0 auto',
          }}>
            <StoriesBar />
            <CreatePost onPost={handlePost} />
            {loading ? (
              <div className="loading">Loading feed...</div>
            ) : (
              posts.map(post => <PostCard 
  key={post.id} 
  post={post} 
  onPostDelete={handlePostDelete} 
  onCommentCountUpdate={handleCommentCountUpdate} 
/>)
            )}
          </div>
          {!isMobile && <RightSidebar />}
        </div>

      </main>

      {isMobile && (
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          background: 'var(--bg-secondary)', backdropFilter: 'blur(20px)',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex', justifyContent: 'space-around', padding: '8px 12px',
          zIndex: 99,
        }}>
          {mobileNavItems.map(({ icon: Icon, path }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                padding: '8px', borderRadius: '30px',
                color: isActive(path) ? 'var(--accent-primary)' : 'var(--text-secondary)',
                transition: 'color 0.2s',
              }}
            >
              <Icon size={22} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}