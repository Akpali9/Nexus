import { useState, useEffect } from 'react';
import { Search, TrendingUp, Hash, Users, X } from 'lucide-react';
import { supabase } from '../services/supabase';

export default function ExplorePage() {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState({ users: [], posts: [] });
  const [trendingTags, setTrendingTags] = useState([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const fetchTrending = async () => {
      const { data } = await supabase.rpc('get_trending_tags');
      if (data) setTrendingTags(data);
    };
    fetchTrending();
  }, []);

  const handleSearch = async (q) => {
    setQuery(q);
    if (q.length === 0) {
      setSearching(false);
      return;
    }
    setSearching(true);
    // Search users
    const { data: users } = await supabase
      .from('profiles')
      .select('*')
      .or(`username.ilike.%${q}%,display_name.ilike.%${q}%`)
      .limit(5);
    // Search posts
    const { data: posts } = await supabase
      .from('posts')
      .select('*, user:profiles(*)')
      .ilike('content', `%${q}%`)
      .limit(5);
    setSearchResults({ users: users || [], posts: posts || [] });
  };

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ position: 'relative', marginBottom: 20 }}>
        <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input
          className="input-field"
          placeholder="Search people, posts, tags..."
          value={query}
          onChange={e => handleSearch(e.target.value)}
          style={{ paddingLeft: 48, paddingRight: 44, borderRadius: 999, fontSize: 15, padding: '14px 44px 14px 48px' }}
          autoFocus
        />
        {query && (
          <button onClick={() => handleSearch('')} style={{
            position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
            background: 'var(--bg-hover)', border: 'none', borderRadius: '50%',
            width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: 'var(--text-muted)',
          }}>
            <X size={13} />
          </button>
        )}
      </div>

      {!searching ? (
        <>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <TrendingUp size={18} style={{ color: 'var(--accent-primary)' }} /> Trending Now
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
            {trendingTags.map((tag, i) => (
              <div key={tag.name} onClick={() => handleSearch(tag.name)} style={{
                padding: '14px 16px', borderRadius: 'var(--radius-md)',
                background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
                cursor: 'pointer', transition: 'all 150ms',
                borderLeft: `3px solid ${tag.color || '#7c5cfc'}`,
              }}>
                <p style={{ fontWeight: 700, fontSize: 15 }}>#{tag.name}</p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{tag.posts} posts</p>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="fade-in">
          {searchResults.users.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 12 }}>People</h3>
              {searchResults.users.map(user => (
                <div key={user.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', marginBottom: 8 }}>
                  <div className="avatar-placeholder" style={{ width: 48, height: 48 }}>{user.display_name?.[0]}</div>
                  <div>
                    <p style={{ fontWeight: 600 }}>{user.display_name}</p>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>@{user.username}</p>
                  </div>
                  <button className="btn-primary" style={{ marginLeft: 'auto', padding: '6px 16px' }}>Follow</button>
                </div>
              ))}
            </div>
          )}
          {searchResults.posts.length > 0 && (
            <div>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 12 }}>Posts</h3>
              {searchResults.posts.map(post => (
                <div key={post.id} className="card" style={{ padding: '12px 16px', marginBottom: 8 }}>
                  <p>{post.content}</p>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>by {post.user?.display_name}</p>
                </div>
              ))}
            </div>
          )}
          {searchResults.users.length === 0 && searchResults.posts.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
              <p style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>No results for "{query}"</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
