import { useState, useEffect, useCallback } from 'react';
import { Search, TrendingUp, X, Users } from 'lucide-react';
import { supabase } from '../services/supabase';
import { useAuthStore } from '../stores/authStore';
import Sidebar from '../components/layout/Sidebar';
import PostCard from '../components/feed/PostCard';

export default function ExplorePage() {
  const { user } = useAuthStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ users: [], posts: [] });
  const [searching, setSearching] = useState(false);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [followingIds, setFollowingIds] = useState(new Set());

  useEffect(() => {
    if (!user) return;
    Promise.all([
      supabase.from('profiles').select('*').neq('id', user.id).order('follower_count', { ascending: false }).limit(12),
      supabase.from('follows').select('following_id').eq('follower_id', user.id),
    ]).then(([{ data: users }, { data: follows }]) => {
      if (users) setSuggestedUsers(users);
      if (follows) setFollowingIds(new Set(follows.map(f => f.following_id)));
    });
  }, [user]);

  const handleSearch = useCallback(async (q) => {
    setQuery(q);
    if (!q.trim()) { setSearching(false); return; }
    setSearching(true);
    const [{ data: users }, { data: posts }] = await Promise.all([
      supabase.from('profiles').select('*').or(`username.ilike.%${q}%,display_name.ilike.%${q}%`).limit(6),
      supabase.from('posts').select('*, user:profiles(*)').ilike('content', `%${q}%`).order('created_at', { ascending: false }).limit(10),
    ]);
    setResults({ users: users || [], posts: posts || [] });
  }, []);

  const toggleFollow = async (targetId) => {
    if (!user) return;
    if (followingIds.has(targetId)) {
      await supabase.from('follows').delete().eq('follower_id', user.id).eq('following_id', targetId);
      setFollowingIds(prev => { const s = new Set(prev); s.delete(targetId); return s; });
    } else {
      await supabase.from('follows').insert({ follower_id: user.id, following_id: targetId });
      setFollowingIds(prev => new Set([...prev, targetId]));
      // Notify
      if (targetId !== user.id) {
        await supabase.from('notifications').insert({ user_id: targetId, actor_id: user.id, type: 'follow', content: 'started following you' });
      }
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ flex: 1, marginLeft: 'var(--sidebar-width)', padding: '24px', maxWidth: 800 }}>
        {/* Search bar */}
        <div style={{ position: 'relative', marginBottom: 24 }}>
          <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            className="input-field"
            placeholder="Search people, posts..."
            value={query}
            onChange={e => handleSearch(e.target.value)}
            style={{ paddingLeft: 48, paddingRight: 44, borderRadius: 999, fontSize: 15 }}
            autoFocus
          />
          {query && (
            <button onClick={() => handleSearch('')} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'var(--bg-hover)', border: 'none', borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)' }}>
              <X size={13} />
            </button>
          )}
        </div>

        {!searching ? (
          <>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Users size={18} style={{ color: 'var(--accent-primary)' }} /> People to Follow
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
              {suggestedUsers.map(u => (
                <div key={u.id} className="card" style={{ padding: 16, textAlign: 'center' }}>
                  <div className="avatar-placeholder" style={{ width: 56, height: 56, fontSize: 20, margin: '0 auto 10px' }}>{u.display_name?.[0]}</div>
                  <p style={{ fontWeight: 600, fontSize: 14 }}>{u.display_name}</p>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>@{u.username}</p>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 12 }}>{u.follower_count?.toLocaleString()} followers</p>
                  {u.bio && <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12, lineHeight: 1.4 }}>{u.bio.slice(0, 60)}{u.bio.length > 60 ? '...' : ''}</p>}
                  <button
                    onClick={() => toggleFollow(u.id)}
                    className={followingIds.has(u.id) ? 'btn-ghost' : 'btn-primary'}
                    style={{ width: '100%', justifyContent: 'center', fontSize: 13 }}
                  >
                    {followingIds.has(u.id) ? 'Following' : 'Follow'}
                  </button>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="fade-in">
            {results.users.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 12 }}>People</h3>
                {results.users.map(u => (
                  <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', marginBottom: 8, border: '1px solid var(--border-subtle)' }}>
                    <div className="avatar-placeholder" style={{ width: 44, height: 44 }}>{u.display_name?.[0]}</div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 600 }}>{u.display_name}</p>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>@{u.username} · {u.follower_count?.toLocaleString()} followers</p>
                    </div>
                    <button onClick={() => toggleFollow(u.id)} className={followingIds.has(u.id) ? 'btn-ghost' : 'btn-primary'} style={{ padding: '6px 16px', fontSize: 13 }}>
                      {followingIds.has(u.id) ? 'Following' : 'Follow'}
                    </button>
                  </div>
                ))}
              </div>
            )}
            {results.posts.length > 0 && (
              <div>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 12 }}>Posts</h3>
                {results.posts.map(post => <PostCard key={post.id} post={post} />)}
              </div>
            )}
            {results.users.length === 0 && results.posts.length === 0 && (
              <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
                <Search size={40} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
                <p>No results for "{query}"</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
